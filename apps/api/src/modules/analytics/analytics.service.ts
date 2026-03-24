import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../system/redis.service';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  async getWorkspaceMetrics(workspaceId: string) {
    // NOTE: This is a temporary cache optimization to prevent DB load.
    // In a production-heavy environment, consider using a materialized view or
    // real-time event aggregation if Redis memory becomes a concern.
    const cacheKey = `analytics:metrics:${workspaceId}`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const [messagesCount, activeConversations, campaignsSent, workspace] =
      await Promise.all([
        this.prisma.message.count({ where: { conversation: { workspaceId } } }),
        this.prisma.conversation.count({
          where: { workspaceId, status: 'OPEN' },
        }),
        this.prisma.campaign.count({
          where: { workspaceId, status: 'COMPLETED' },
        }),
        this.prisma.workspace.findUnique({
          where: { id: workspaceId },
          select: { aiUsageCount: true },
        }),
      ]);

    const result = {
      messagesProcessed: messagesCount,
      activeConversations,
      campaignsSent,
      aiUsageCount: workspace?.aiUsageCount || 0,
      timestamp: new Date().toISOString(),
    };

    await this.redisService.setex(cacheKey, 300, JSON.stringify(result));
    return result;
  }
}
