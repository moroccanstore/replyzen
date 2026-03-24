import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

interface PersistUsageData {
  workspaceId: string;
  aiUsageCount?: number;
  mediaUsageSize?: number;
  type?: 'AI_MESSAGE' | 'MEDIA_SIZE';
  count?: number;
  logEntry?: {
    type: string;
    count?: number;
    metadata?: any;
  };
}

@Processor('usage-queue')
export class UsageProcessor extends WorkerHost {
  private readonly logger = new Logger(UsageProcessor.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job<PersistUsageData>): Promise<any> {
    const { workspaceId, type, count, logEntry } = job.data;

    try {
      if (type === 'AI_MESSAGE') {
        await this.prisma.workspace.update({
          where: { id: workspaceId },
          data: { aiUsageCount: count },
        });
      } else if (type === 'MEDIA_SIZE') {
        await this.prisma.workspace.update({
          where: { id: workspaceId },
          data: { mediaUsageSize: count },
        });
      }

      // Create usage log if provided
      if (logEntry) {
        await this.prisma.usageLog.create({
          data: {
            workspaceId,
            type: logEntry.type,
            count: logEntry.count || 1,
            metadata: logEntry.metadata,
          },
        });
      }

      return { success: true };
    } catch (error: any) {
      this.logger.error(
        `[ALERT][USAGE_ERROR] Failed to persist usage for workspace ${workspaceId}: ${error.message}`,
      );
      throw error;
    }
  }
}
