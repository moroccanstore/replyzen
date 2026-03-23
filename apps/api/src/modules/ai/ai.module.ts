import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { OpenAiProvider } from './providers/openai.provider';
import { GeminiProvider } from './providers/gemini.provider';
import { ClaudeProvider } from './providers/claude.provider';

@Module({
  providers: [AiService, OpenAiProvider, GeminiProvider, ClaudeProvider],
  exports: [AiService],
})
export class AiModule {}
