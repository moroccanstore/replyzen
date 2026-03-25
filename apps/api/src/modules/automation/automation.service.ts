import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../system/redis.service';

const CACHE_TTL_SECONDS = 60; // Automation rules cached for 60 seconds
const CACHE_KEY = (workspaceId: string) => `automations:rules:${workspaceId}`;

@Injectable()
export class AutomationService {
  private readonly logger = new Logger(AutomationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  /**
   * Evaluate keyword rules against an incoming message.
   * Rules are cached in Redis for 60s to avoid loading from DB on every message.
   */
  async evaluateKeywordRules(
    workspaceId: string,
    incomingMessage: string,
  ): Promise<string | null> {
    const cacheKey = CACHE_KEY(workspaceId);

    // 1. Try Redis cache first
    let rules: any[];
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      rules = JSON.parse(cached);
    } else {
      // 2. Cache miss — load from DB and store
      rules = await this.prisma.automation.findMany({
        where: { workspaceId, isActive: true },
        orderBy: { priority: 'desc' },
        select: { id: true, keywords: true, reply: true, priority: true },
      });
      await this.redis.setex(cacheKey, CACHE_TTL_SECONDS, JSON.stringify(rules));
      this.logger.debug(`Cache miss — loaded ${rules.length} rules for workspace ${workspaceId}`);
    }

    const lowerMessage = incomingMessage.toLowerCase();

    for (const rule of rules) {
      if (!rule.keywords || rule.keywords.length === 0) continue;

      const match = rule.keywords.some((keyword: string) =>
        lowerMessage.includes(keyword.toLowerCase()),
      );

      if (match) {
        this.logger.log(`Rule matched: ${rule.id} for workspace ${workspaceId}`);
        return rule.reply;
      }
    }

    return null;
  }

  /**
   * Invalidate the automation rule cache for a workspace.
   * Must be called after any create / update / delete operation.
   */
  async invalidateCache(workspaceId: string): Promise<void> {
    await this.redis.del(CACHE_KEY(workspaceId));
    this.logger.debug(`Cache invalidated for workspace ${workspaceId}`);
  }
}
