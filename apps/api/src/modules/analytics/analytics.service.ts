import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getWorkspaceMetrics(workspaceId: string) {
    const [messagesCount, activeConversations, campaignsSent] =
      await Promise.all([
        this.prisma.message.count({ where: { conversation: { workspaceId } } }),
        this.prisma.conversation.count({ where: { workspaceId, status: 'OPEN' } }),
        this.prisma.campaign.count({ where: { workspaceId, status: 'COMPLETED' } }),
      ]);

    return {
      messagesProcessed: messagesCount,
      activeConversations,
      campaignsSent,
    };
  }
}
