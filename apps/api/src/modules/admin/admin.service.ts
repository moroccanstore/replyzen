import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('message-queue') private readonly messageQueue: Queue,
    @InjectQueue('campaign-queue') private readonly campaignQueue: Queue,
    @InjectQueue('usage-queue') private readonly usageQueue: Queue,
  ) {}

  async getFailedJobs(status?: string) {
    return this.prisma.failedJob.findMany({
      where: status ? { status: status as any } : {},
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async retryFailedJob(id: string) {
    const failedJob = await this.prisma.failedJob.findUnique({
      where: { id },
    });

    if (!failedJob) throw new Error('Job not found');
    if (failedJob.status === 'RESOLVED') throw new Error('Job already resolved');

    const queueMap: Record<string, Queue> = {
      'message-queue': this.messageQueue,
      'campaign-queue': this.campaignQueue,
      'usage-queue': this.usageQueue,
    };

    const targetQueue = queueMap[failedJob.queueName];
    if (!targetQueue) throw new Error(`Queue ${failedJob.queueName} not found`);

    const jobData = failedJob.data as any;
    const jobName = jobData._jobName || 'retry-job';

    // Re-add to queue with unique jobId to allow the processor to find the original record
    await targetQueue.add(jobName, jobData, {
        jobId: `retry-${failedJob.id}-${Date.now()}`,
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: true,
      },
    );

    // Update status to REQUEUED
    return this.prisma.failedJob.update({
      where: { id },
      data: {
        status: 'REQUEUED',
        requeuedAt: new Date(),
      },
    });
  }

  async getSystemStats() {
    const [totalUsers, totalWorkspaces] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.workspace.count(),
    ]);

    return {
      totalUsers,
      totalWorkspaces,
      platformStatus: 'Operational',
    };
  }
}
