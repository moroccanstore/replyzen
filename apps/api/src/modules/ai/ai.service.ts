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

  async generateAiReply(
    primaryProvider: AIProvider,
    messages: AIMessage[],
    options: { model?: string; temperature?: number; maxTokens?: number } = {},
    isDemo = false,
  ): Promise<AIResponse> {
    if (isDemo) {
      return {
        content:
          '🤖 This is a demo AI response. AutoWhats will reply like this in real usage.',
        tokens: 0,
        provider: 'demo' as any,
      };
    }

    const providersToTry: AIProvider[] = [
      primaryProvider,
      AIProvider.GEMINI,
      AIProvider.OPENAI,
      AIProvider.CLAUDE,
    ].filter((v, i, a) => a.indexOf(v) === i); // Unique providers

    let lastError: Error | undefined;

    for (const providerType of providersToTry) {
      // 1. CHECK CIRCUIT STATUS
      const circuitKey = `circuit:ai:${providerType}:status`;
      const status = await this.redisService.get(circuitKey);

      if (status === 'OPEN') {
        this.logger.warn(`Circuit for ${providerType} is OPEN. Skipping.`);
        continue;
      }

      // If status is null but failures exist, we are effectively HALF_OPEN or just starting
      const failureKey = `failures:ai:${providerType}`;
      const failureVal = await this.redisService.get(failureKey);
      const failures = parseInt(failureVal || '0', 10);

      const isHalfOpen = failures >= 5 && !status;

      if (isHalfOpen) {
        // Coordinated Probing: Only allow ONE request to attempt a probe
        const probeLockKey = `circuit:ai:${providerType}:probe_lock`;
        const acquiredLock = await this.redisService.setNXWithExpiry(
          probeLockKey,
          'LOCKED',
          30,
        );
        if (!acquiredLock) {
          this.logger.warn(
            `Circuit for ${providerType} is in probe state but lock held. Skipping.`,
          );
          continue;
        }
        this.logger.log(`Circuit for ${providerType} is HALF_OPEN. Probing...`);
      }

      try {
        const provider = this.getProvider(providerType);
        if (!provider) continue;

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

        // SUCCESS: Reset circuit
        if (failures > 0) {
          this.logger.log(
            `Success for ${providerType}. Resetting failures and closing circuit.`,
          );
          await this.redisService.del(circuitKey);
          await this.redisService.del(failureKey);
          await this.redisService.del(`circuit:ai:${providerType}:probe_lock`);
        }

        return result;
      } catch (error: any) {
        lastError = error as Error;
        this.logger.error(
          `AI Provider ${providerType} failed: ${lastError.message}`,
        );

        // 2. TRACK FAILURES & TRIP
        const currentFailures = await this.redisService.incr(failureKey);
        if (currentFailures === 1) {
          await this.redisService.expire(failureKey, 3600); // Failures stick for 1h
        }

        if (currentFailures >= 5 || isHalfOpen) {
          // Trip for 5 mins if threshold reached OR probe failed
          await this.redisService.setex(circuitKey, 300, 'OPEN');
          this.logger.warn(
            `[ALERT][CIRCUIT_BREAKER] Circuit TRIPPED (OPEN) for ${providerType}.`,
          );
        }
      }
    }

    throw new Error(
      `AI_ALL_PROVIDERS_FAILED: ${lastError?.message || 'Unknown error'}`,
    );
  }
}
