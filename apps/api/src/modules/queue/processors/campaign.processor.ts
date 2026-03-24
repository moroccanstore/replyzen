import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { CampaignBatchJobData } from '../jobs/types.job';
import { RedisService } from '../../system/redis.service';
import { PrismaService } from '../../../prisma/prisma.service';

@Processor('campaign-queue')
@Injectable()
export class CampaignProcessor extends WorkerHost {
  private readonly logger = new Logger(CampaignProcessor.name);

  constructor(
    private readonly redisService: RedisService,
    private readonly prisma: PrismaService,
    @InjectQueue('message-queue') private readonly messageQueue: Queue,
  ) {
    super();
  }

  async process(job: Job<CampaignBatchJobData>): Promise<any> {
    this.logger.log(`Processing campaign batch job ${job.id}`);
    const { campaignId, workspaceId, recipientIds } = job.data;

    // 1. FETCH PLAN LIMIT
    const subscription = await this.prisma.subscription.findFirst({
      where: { workspaceId, status: 'active' },
    });
    const plan = subscription?.plan || 'FREE';
    
    const LIMITS = {
      FREE: 100,
      PRO: 2000,
      ENTERPRISE: 10000,
    };
    const DAILY_LIMIT = LIMITS[plan as keyof typeof LIMITS] || 100;

    const today = new Date().toISOString().split('T')[0];
    const dailyKey = `limit:campaign:daily:${workspaceId}:${today}`;

    this.logger.log(
      `Broadcasting campaign ${campaignId} (Plan: ${plan}, Limit: ${DAILY_LIMIT})`,
    );

    for (const recipientId of recipientIds) {
      // 2. CHECK DAILY LIMIT
      const sentTodayRaw = await this.redisService.get(dailyKey);
      const sentToday = sentTodayRaw ? parseInt(sentTodayRaw) : 0;

      if (sentToday >= DAILY_LIMIT) {
        this.logger.error(
          `Workspace ${workspaceId} reached DAILY LIMIT (${DAILY_LIMIT}). Stopping batch.`,
        );
        break;
      }

      // 3. FETCH RANDOM DELAY (5-15 seconds)
      const delay = Math.floor(Math.random() * 10000) + 5000;

      // 4. DISPATCH TO MESSAGE QUEUE
      await this.messageQueue.add(
        'send-message',
        {
          workspaceId,
          recipientId,
          campaignId,
          type: 'TEMPLATE',
        },
        {
          delay,
          attempts: 5,
          backoff: { type: 'exponential', delay: 1000 },
          removeOnComplete: true,
        },
      );

      // 5. INCREMENT DAILY COUNTER
      await this.redisService.incr(dailyKey);
      if (sentToday === 0) {
        await this.redisService.expire(dailyKey, 90000); // ~25 hours
      }
    }

    return { success: true, processedCount: recipientIds.length };
  }
}
