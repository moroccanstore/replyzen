import { Injectable, Logger } from '@nestjs/common';
import { IAIProvider, AIMessage, AIResponse } from './ai-provider.interface';
import Anthropic from '@anthropic-ai/sdk';

@Injectable()
export class ClaudeProvider implements IAIProvider {
  private readonly logger = new Logger(ClaudeProvider.name);

  async generateResponse(
    messages: AIMessage[],
    settings: { model?: string; apiKey?: string },
  ): Promise<AIResponse> {
    const model = settings.model || 'claude-3-5-sonnet-20240620';
    const apiKey = settings.apiKey;

    if (!apiKey) {
      throw new Error('Claude API Key is missing. Please configure it in Workspace Settings.');
    }

    const anthropic = new Anthropic({
      apiKey: apiKey,
    });

    try {
      this.logger.log(`Generating response via Claude: ${model}`);

      // Extract system prompt if present
      const systemMessage = messages.find(m => m.role === 'system');
      const userMessages = messages.filter(m => m.role !== 'system');

      const response = await anthropic.messages.create({
        model: model,
        max_tokens: 1024,
        system: systemMessage?.content,
        messages: userMessages.map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
      });

      const content = response.content[0].type === 'text' ? response.content[0].text : '';

      return {
        content: content,
        provider: 'CLAUDE',
        model: response.model,
        usage: {
          promptTokens: response.usage.input_tokens,
          completionTokens: response.usage.output_tokens,
          totalTokens: response.usage.input_tokens + response.usage.output_tokens,
        },
      };
    } catch (error) {
      this.logger.error(`Claude API Error: ${error.message}`);
      throw error;
    }
  }
}
