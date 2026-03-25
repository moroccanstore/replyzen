import { Injectable, Logger } from '@nestjs/common';
import { OpenAiProvider } from './providers/openai.provider';
import { GeminiProvider } from './providers/gemini.provider';
import { ClaudeProvider } from './providers/claude.provider';
import {
  IAIProvider,
  AIMessage,
  AIResponse,
} from './providers/ai-provider.interface';
import { AIProvider } from '@prisma/client';
import { RedisService } from '../system/redis.service';
import {
  antiRobotFilter,
  humanizeText,
  HumanizerSettings,
  splitHumanMessage,
} from '../../common/utils/text-humanizer.util';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private readonly openai: OpenAiProvider,
    private readonly gemini: GeminiProvider,
    private readonly claude: ClaudeProvider,
    private readonly redisService: RedisService,
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

  getPresetSettings(presetName: string) {
    const presets: Record<
      string,
      { tone: string; responseStyle: string; useEmojis: boolean }
    > = {
      'Friendly Sales': {
        tone: 'friendly',
        responseStyle: 'short',
        useEmojis: true,
      },
      'Professional Support': {
        tone: 'professional',
        responseStyle: 'detailed',
        useEmojis: false,
      },
      'Fast Replies': {
        tone: 'casual',
        responseStyle: 'short',
        useEmojis: true,
      },
      'Luxury Brand Tone': {
        tone: 'professional',
        responseStyle: 'medium',
        useEmojis: true,
      },
    };

    return presets[presetName] || presets['Friendly Sales'];
  }

  computeConfidence(
    content: string,
    intent: string,
    historyLength: number,
  ): number {
    let confidence = 0.8;

    if (intent === 'FAQ') confidence += 0.15;
    if (intent === 'PRICING') confidence += 0.1;
    if (intent === 'ANGRY') confidence -= 0.3;
    if (intent === 'HUMAN_REQUIRED') confidence -= 0.5;

    const uncertaintyKeywords = [
      'not sure',
      'maybe',
      'perhaps',
      'i think',
      'don\'t know',
      'sorry, i cannot',
      'please wait for a human',
    ];
    const lowerContent = content.toLowerCase();
    for (const kw of uncertaintyKeywords) {
      if (lowerContent.includes(kw)) {
        confidence -= 0.2;
      }
    }

    if (content.length > 500) confidence -= 0.1;
    if (content.length > 1000) confidence -= 0.2;
    if (historyLength === 0) confidence -= 0.05;

    return Math.max(0, Math.min(1, confidence));
  }

  async generateAiReply(
    primaryProvider: AIProvider,
    messages: AIMessage[],
    options: { 
      model?: string; 
      temperature?: number; 
      maxTokens?: number;
      intent?: string;
      humanizer?: HumanizerSettings;
    } = {},
    isDemo = false,
  ): Promise<{ 
    content: string; 
    confidence: number; 
    messages: string[]; 
    provider: string; 
    model: string; 
  }> {
    if (isDemo) {
      const demoText = '🤖 This is a demo AI response. AutoWhats will reply like this in real usage.';
      return {
        content: demoText,
        confidence: 1.0,
        messages: [demoText],
        provider: 'demo',
        model: 'demo-model',
      };
    }

    const providersToTry: AIProvider[] = [
      primaryProvider,
      AIProvider.GEMINI,
      AIProvider.OPENAI,
      AIProvider.CLAUDE,
    ].filter((v, i, a) => a.indexOf(v) === i);

    let rawResponse: AIResponse | undefined;
    let lastError: Error | undefined;

    for (const providerType of providersToTry) {
      const circuitKey = `circuit:ai:${providerType}:status`;
      const status = await this.redisService.get(circuitKey);

      if (status === 'OPEN') {
        this.logger.warn(`Circuit for ${providerType} is OPEN. Skipping.`);
        continue;
      }

      const failureKey = `failures:ai:${providerType}`;
      const failureVal = await this.redisService.get(failureKey);
      const failures = parseInt(failureVal || '0', 10);
      const isHalfOpen = failures >= 5 && !status;

      if (isHalfOpen) {
        const probeLockKey = `circuit:ai:${providerType}:probe_lock`;
        const acquiredLock = await this.redisService.setNXWithExpiry(probeLockKey, 'LOCKED', 30);
        if (!acquiredLock) continue;
      }

      try {
        const provider = this.getProvider(providerType);
        if (!provider) continue;

        const timeout = new Promise<AIResponse>((_, reject) =>
          setTimeout(() => reject(new Error(`AI_TIMEOUT_${providerType}`)), 15000),
        );

        rawResponse = await Promise.race([
          provider.generateResponse(messages, options),
          timeout,
        ]);

        if (failures > 0) {
          await this.redisService.del(circuitKey);
          await this.redisService.del(failureKey);
          await this.redisService.del(`circuit:ai:${providerType}:probe_lock`);
        }

        if (rawResponse) break;
      } catch (error: any) {
        lastError = error as Error;
        this.logger.error(`AI Provider ${providerType} failed: ${lastError.message}`);
        const currentFailures = await this.redisService.incr(failureKey);
        if (currentFailures === 1) await this.redisService.expire(failureKey, 3600);
        if (currentFailures >= 5 || isHalfOpen) {
          await this.redisService.setex(circuitKey, 300, 'OPEN');
        }
      }
    }

    if (!rawResponse) {
      throw new Error(`AI_ALL_PROVIDERS_FAILED: ${lastError?.message || 'Unknown error'}`);
    }

    let processed = rawResponse.content;
    processed = antiRobotFilter(processed);
    
    if (options.humanizer) {
      processed = humanizeText(processed, options.humanizer);
    }

    const confidence = this.computeConfidence(
      processed,
      options.intent || 'CASUAL',
      messages.length > 1 ? messages.length - 1 : 0,
    );

    const splitMessages = splitHumanMessage(processed);

    return {
      content: processed,
      confidence,
      messages: splitMessages,
      provider: rawResponse.provider,
      model: rawResponse.model,
    };
  }
}
