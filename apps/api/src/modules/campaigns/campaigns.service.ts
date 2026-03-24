import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CampaignBatchJobData } from '../queue/jobs/types.job';

@Injectable()
export class CampaignsService {
  private readonly logger = new Logger(CampaignsService.name);

  constructor(
    @InjectQueue('campaign-queue') private readonly campaignQueue: Queue,
    private readonly prisma: PrismaService,
  ) {}

  async createCampaign(
    workspaceId: string,
    data: { name: string; templateName: string },
  ) {
    const campaign = await this.prisma.campaign.create({
      data: {
        workspaceId,
        name: data.name,
        messageTemplate: data.templateName,
        status: 'DRAFT',
      },
    });
    return campaign;
  }

  async launchCampaign(
    workspaceId: string,
    campaignId: string,
    targetTag?: string,
  ) {
    const whereClause: Prisma.ContactWhereInput = { workspaceId };

    if (targetTag) {
      whereClause.tags = { has: targetTag };
    }

    // Switch status
    await this.prisma.campaign.update({
      where: {
        id: campaignId,
        workspaceId, // CRITICAL: Ensure campaign belongs to workspace
      },
      data: { status: 'RUNNING' },
    });

    const contacts = await this.prisma.contact.findMany({
      where: whereClause,
      select: { id: true },
    });
    const contactIds = contacts.map((c) => c.id);

    // Queue background job
    await this.campaignQueue.add('broadcast-batch', {
      campaignId,
      workspaceId,
      recipientIds: contactIds,
    } satisfies CampaignBatchJobData, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: true,
    });

    return { success: true, queuedRecipients: contactIds.length };
  }

  async findAll(workspaceId: string) {
    return this.prisma.campaign.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { recipients: true },
        },
      },
    });
  }

  async remove(workspaceId: string, campaignId: string) {
    return this.prisma.campaign.delete({
      where: { id: campaignId, workspaceId },
    });
  }
}
