import { Injectable, Logger } from '@nestjs/common';
import { IAIProvider, AIMessage, AIResponse } from './ai-provider.interface';
import OpenAI from 'openai';

@Injectable()
export class OpenAiProvider implements IAIProvider {
  private readonly logger = new Logger(OpenAiProvider.name);

  async generateResponse(
    messages: AIMessage[],
    settings: { model?: string; apiKey?: string },
  ): Promise<AIResponse> {
    const model = settings.model || 'gpt-4o';
    const apiKey = settings.apiKey || process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error('OpenAI API Key is missing. Please configure it in Workspace Settings.');
    }

    const openai = new OpenAI({ apiKey });

    this.logger.log(`Generating real response via OpenAI: ${model}`);

    try {
      const response = await openai.chat.completions.create({
        model,
        messages: messages.map((m) => ({
          role: m.role as 'user' | 'assistant' | 'system',
          content: m.content,
        })),
        temperature: 0.7,
      });

      const content = response.choices[0].message.content || '';
      
      return {
        content,
        provider: 'OPENAI',
        model,
        usage: {
          promptTokens: response.usage?.prompt_tokens || 0,
          completionTokens: response.usage?.completion_tokens || 0,
          totalTokens: response.usage?.total_tokens || 0,
        },
      };
    } catch (error: any) {
      this.logger.error(`OpenAI Error: ${error.message}`);
      throw error;
    }
  }
}
