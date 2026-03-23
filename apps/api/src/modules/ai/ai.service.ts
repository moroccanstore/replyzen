import { Injectable, Logger } from '@nestjs/common';
import { OpenAiProvider } from './providers/openai.provider';
import { GeminiProvider } from './providers/gemini.provider';
import { ClaudeProvider } from './providers/claude.provider';
import { IAIProvider, AIMessage, AIResponse } from './providers/ai-provider.interface';
import { AIProvider } from '@prisma/client';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  // Fallback chain: Primary -> Others in order
  private readonly FALLBACK_CHAIN: AIProvider[] = [
    AIProvider.GEMINI,
    AIProvider.OPENAI,
    AIProvider.CLAUDE,
  ];

  constructor(
    private readonly openai: OpenAiProvider,
    private readonly gemini: GeminiProvider,
    private readonly claude: ClaudeProvider,
  ) {}

  getProvider(provider: AIProvider): IAIProvider {
    switch (provider) {
      case AIProvider.OPENAI:
        return this.openai;
      case AIProvider.GEMINI:
        return this.gemini;
      case AIProvider.CLAUDE:
        return this.claude;
      default:
        return this.openai;
    }
  }

  async generateAiReply(
    primaryProvider: AIProvider,
    messages: AIMessage[],
    options: { model?: string } = {},
  ): Promise<AIResponse> {
    const providersToTry: AIProvider[] = [
      primaryProvider,
      AIProvider.GEMINI,
      AIProvider.OPENAI,
      AIProvider.CLAUDE,
    ].filter((v, i, a) => a.indexOf(v) === i); // Unique providers

    let lastError: any;

    for (const providerType of providersToTry) {
      try {
        const provider = this.getProvider(providerType);
        if (!provider) continue;

        // 15-second timeout for AI responses (increased slightly for fallback comfort)
        const timeout = new Promise<AIResponse>((_, reject) =>
          setTimeout(
            () => reject(new Error(`AI_TIMEOUT_${providerType}`)),
            15000,
          ),
        );

        const result = await Promise.race([
          provider.generateResponse(messages, options),
          timeout,
        ]);

        if (providerType !== primaryProvider) {
          this.logger.log(
            `Successfully fell back to ${providerType} after primary ${primaryProvider} failed.`,
          );
        }

        return result;
      } catch (error: any) {
        lastError = error;
        this.logger.error(`AI Provider ${providerType} failed: ${lastError.message}`);
      }
    }

    throw new Error(`AI_ALL_PROVIDERS_FAILED: ${lastError?.message}`);
  }
}
