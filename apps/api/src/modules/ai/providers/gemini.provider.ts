import { Injectable, Logger } from '@nestjs/common';
import { IAIProvider, AIMessage, AIResponse } from './ai-provider.interface';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class GeminiProvider implements IAIProvider {
  private readonly logger = new Logger(GeminiProvider.name);

  async generateResponse(
    messages: AIMessage[],
    settings: {
      model?: string;
      apiKey?: string;
      temperature?: number;
      maxTokens?: number;
    },
  ): Promise<AIResponse> {
    const modelName = settings.model || 'gemini-1.5-pro';
    const apiKey = settings.apiKey || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error(
        'Gemini API Key is missing. Please configure it in Workspace Settings.',
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });

    this.logger.log(`Generating real response via Gemini: ${modelName}`);

    try {
      // Find the last user message and the system prompt (if any)
      const systemPrompt =
        messages.find((m) => m.role === 'system')?.content || '';

      // Filter out system prompt for history, then format for Gemini
      const history = messages
        .filter((m) => m.role !== 'system')
        .slice(0, -1)
        .map((m) => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }],
        })) as any[];

      const lastUserMessage = messages[messages.length - 1].content;

      const chat = model.startChat({
        history,
        systemInstruction: systemPrompt
          ? ({ role: 'system', parts: [{ text: systemPrompt }] } as any)
          : undefined,
        generationConfig: {
          temperature: settings.temperature || 0.7,
          maxOutputTokens: settings.maxTokens || 1000,
        },
      });

      const result = await chat.sendMessage(lastUserMessage);
      const responseText = result.response.text();

      return {
        content: responseText,
        provider: 'GEMINI',
        model: modelName,
        usage: {
          promptTokens: result.response.usageMetadata?.promptTokenCount || 0,
          completionTokens:
            result.response.usageMetadata?.candidatesTokenCount || 0,
          totalTokens: result.response.usageMetadata?.totalTokenCount || 0,
        },
      };
    } catch (error: any) {
      this.logger.error(`Gemini Error: ${error.message}`);
      throw error;
    }
  }
}
