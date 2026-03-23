import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { CampaignBatchJobData } from '../jobs/types.job';

@Processor('campaign-queue')
@Injectable()
export class CampaignProcessor extends WorkerHost {
  private readonly logger = new Logger(CampaignProcessor.name);

  async process(job: Job<CampaignBatchJobData>): Promise<any> {
    this.logger.log(`Processing campaign batch job ${job.id}`);
    await Promise.resolve(); // For linting, or real logic later

    const { campaignId, workspaceId, recipientIds } = job.data;

    this.logger.log(
      `Broadcasting campaign ${campaignId} to ${recipientIds.length} recipients for workspace ${workspaceId}`,
    );

    for (const recipientId of recipientIds) {
      // 1. Fetch random delay (5-15 seconds) to mimic human behavior
      const delay = Math.floor(Math.random() * 10000) + 5000;
      
      // 2. Dispatch to message queue
      // In a real app, we would create a Message entity first
      this.logger.log(`Queueing message for recipient ${recipientId} with ${delay}ms delay`);
      
      // await this.messageQueue.add('send-message', { ... });
      
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    return { success: true, processedCount: recipientIds.length };
  }
}
