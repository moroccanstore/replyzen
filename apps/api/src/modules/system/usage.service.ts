import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from './redis.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class UsageService implements OnApplicationBootstrap {
  private readonly logger = new Logger(UsageService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
    @InjectQueue('usage-queue') private readonly usageQueue: Queue,
  ) {}

  async onApplicationBootstrap() {
    this.logger.log('Hydrating Redis usage cache from Postgres...');
    await this.hydrateRedisFromPostgres();
  }

  /**
   * Hydrates Redis with current usage counts from DB for all active workspaces.
   */
  private async hydrateRedisFromPostgres() {
    const workspaces = await this.prisma.workspace.findMany({
      select: { id: true, aiUsageCount: true, mediaUsageSize: true },
    });

    for (const ws of workspaces) {
      const aiKey = `usage:ai:${ws.id}`;
      const mediaKey = `usage:media:${ws.id}`;

      // Only set if not already present to avoid overwriting live traffic
      const existingAi = await this.redisService.get(aiKey);
      if (existingAi === null) {
        await this.redisService.setex(aiKey, 86400, ws.aiUsageCount.toString()); // 24h TTL
      }

      const existingMedia = await this.redisService.get(mediaKey);
      if (existingMedia === null) {
        await this.redisService.setex(mediaKey, 86400, ws.mediaUsageSize.toString());
      }
    }
    this.logger.log(`Hydrated ${workspaces.length} workspaces.`);
  }

  private getWeekKey(): string {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const pastDaysOfYear = (now.getTime() - startOfYear.getTime()) / 86400000;
    const weekNumber = Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
    return `${now.getFullYear()}-W${weekNumber}`;
  }

  private getSecondsUntilWeekEnd(): number {
    const now = new Date();
    const day = now.getDay(); // 0 is Sunday
    const diff = day === 0 ? 0 : 7 - day; // days until next Sunday
    const nextSunday = new Date(now);
    nextSunday.setDate(now.getDate() + diff);
    nextSunday.setHours(23, 59, 59, 999);
    return Math.floor((nextSunday.getTime() - now.getTime()) / 1000);
  }

  /**
   * Checks if a workspace has enough quota for an AI action and increments usage.
   */
  async checkAndIncrementAIUsage(
    workspaceId: string,
    model: string,
    provider?: string,
    confidence?: number,
  ): Promise<void> {
    const weekKey = this.getWeekKey();
    const usageKey = `usage:ai:${workspaceId}:${weekKey}`;

    // 2. Atomic Increment
    const newCount = await this.redisService.incr(usageKey);
    if (newCount === 1) {
      // Set expiry to end of current ISO week
      await this.redisService.expire(usageKey, this.getSecondsUntilWeekEnd());
    }

    // 3. Check against limit
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { aiWeeklyLimit: true },
    });

    const limit = workspace?.aiWeeklyLimit || 0;

    if (newCount > limit) {
      await this.redisService.incrby(usageKey, -1); // Atomic rollback
      this.logger.warn(`AI quota exceeded for workspace ${workspaceId}`);
      throw new Error('AI weekly quota exceeded. Please upgrade your plan.');
    }

    // 4. Async Sync to DB via Queue
    await this.usageQueue.add(
      'persist-usage',
      {
        workspaceId,
        type: 'AI_MESSAGE',
        count: newCount,
        logEntry: {
          type: 'AI_MESSAGE',
          metadata: { model, provider, confidence },
        },
      },
      {
        attempts: 10,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: true,
      },
    );
  }

  /**
   * Checks media usage and increments.
   */
  async checkMediaUsage(
    workspaceId: string,
    sizeInBytes: number,
  ): Promise<void> {
    const mediaKey = `usage:media:${workspaceId}`;
    
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: {
        mediaMonthlyLimit: true,
        mediaUsageSize: true,
        lastMediaReset: true,
      },
    });

    if (!workspace) throw new Error('Workspace not found');

    const now = new Date();
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

    if (workspace.lastMediaReset < oneMonthAgo) {
      // Reset needed - this happens once per month
      await this.redisService.setex(mediaKey, 86400, '0');
      await this.prisma.workspace.update({
        where: { id: workspaceId },
        data: { mediaUsageSize: 0, lastMediaReset: now },
      });
      workspace.mediaUsageSize = 0;
    }

    const currentUsage = await this.redisService.get(mediaKey);
    const newSize = (currentUsage ? parseInt(currentUsage) : workspace.mediaUsageSize) + sizeInBytes;

    if (newSize > workspace.mediaMonthlyLimit) {
      this.logger.warn(`Media quota exceeded for workspace ${workspaceId}`);
      throw new Error('Media storage limit exceeded. Please upgrade your plan.');
    }

    // Increment in Redis
    const actualNewSize = await this.redisService.incrby(mediaKey, sizeInBytes);

    // Enqueue persistence
    await this.usageQueue.add(
      'persist-usage',
      {
        workspaceId,
        type: 'MEDIA_SIZE',
        count: actualNewSize,
        logEntry: {
          type: 'MEDIA_UPLOAD',
          metadata: { size: sizeInBytes },
        },
      },
      {
        attempts: 10,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: true,
      },
    );
  }

  /**
   * Logs token usage for AI responses via Queue (Durable).
   */
  async logTokens(
    workspaceId: string,
    model: string,
    tokens: number,
  ): Promise<void> {
    await this.usageQueue.add(
      'persist-usage',
      {
        workspaceId,
        logEntry: {
          type: 'AI_TOKEN',
          count: tokens,
          metadata: { model },
        },
      },
      {
        attempts: 5,
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: true,
      },
    );
  }

  /**
   * Generates a comprehensive usage report for a workspace.
   */
  async getWorkspaceUsageReport(workspaceId: string) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: {
        aiWeeklyLimit: true,
        aiUsageCount: true,
        mediaMonthlyLimit: true,
        mediaUsageSize: true,
      },
    });

    if (!workspace) throw new Error('Workspace not found');

    const aiLimit = workspace.aiWeeklyLimit || 1000;
    const aiCurrent = workspace.aiUsageCount || 0;
    const aiPercent = Math.min((aiCurrent / aiLimit) * 100, 100);

    const mediaLimit = Number(workspace.mediaMonthlyLimit || 100) * 1024 * 1024; // MB to Bytes
    const mediaCurrent = Number(workspace.mediaUsageSize || 0);
    const mediaPercent = Math.min((mediaCurrent / mediaLimit) * 100, 100);

    return {
      ai: {
        limit: aiLimit,
        current: aiCurrent,
        percentage: aiPercent,
        warning: aiPercent >= 80,
        blocked: aiPercent >= 100,
      },
      media: {
        limit: workspace.mediaMonthlyLimit || 100,
        currentMB: Math.round(mediaCurrent / (1024 * 1024)),
        percentage: mediaPercent,
        warning: mediaPercent >= 80,
        blocked: mediaPercent >= 100,
      },
    };
  }
}
