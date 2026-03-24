export interface AIResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  provider: string;
  model: string;
}

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface IAIProvider {
  generateResponse(
    messages: AIMessage[],
    settings: { model?: string; temperature?: number; maxTokens?: number },
  ): Promise<AIResponse>;
}
