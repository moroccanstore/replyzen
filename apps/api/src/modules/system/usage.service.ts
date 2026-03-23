import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsageService {
  private readonly logger = new Logger(UsageService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Checks if a workspace has enough quota for an AI action and increments usage.
   * Throws an error if quota is exceeded.
   */
  async checkAndIncrementAIUsage(workspaceId: string, model: string): Promise<void> {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: {
        aiWeeklyLimit: true,
        aiUsageCount: true,
        lastUsageReset: true,
      },
    });

    if (!workspace) throw new Error('Workspace not found');

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    if (workspace.lastUsageReset < oneWeekAgo) {
      this.logger.log(`Resetting AI usage for workspace ${workspaceId}`);
      await this.prisma.workspace.update({
        where: { id: workspaceId },
        data: {
          aiUsageCount: 0,
          lastUsageReset: now,
        },
      });
      workspace.aiUsageCount = 0;
    }

    if (workspace.aiUsageCount >= workspace.aiWeeklyLimit) {
      this.logger.warn(`AI quota exceeded for workspace ${workspaceId}`);
      throw new Error('AI weekly quota exceeded. Please upgrade your plan.');
    }

    // Increment usage
    await this.prisma.workspace.update({
      where: { id: workspaceId },
      data: {
        aiUsageCount: { increment: 1 },
      },
    });

    // Log the usage
    await this.prisma.usageLog.create({
      data: {
        workspaceId,
        type: 'AI_MESSAGE',
        count: 1,
        metadata: { model },
      },
    });
  }

  /**
   * Checks media usage and increments.
   */
  async checkMediaUsage(workspaceId: string, sizeInBytes: number): Promise<void> {
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
      this.logger.log(`Resetting Media usage for workspace ${workspaceId}`);
      await this.prisma.workspace.update({
        where: { id: workspaceId },
        data: {
          mediaUsageSize: 0,
          lastMediaReset: now,
        },
      });
      workspace.mediaUsageSize = 0;
    }

    if (workspace.mediaUsageSize + sizeInBytes > workspace.mediaMonthlyLimit) {
      this.logger.warn(`Media quota exceeded for workspace ${workspaceId}`);
      throw new Error('Media storage limit exceeded for the month. Please upgrade your plan.');
    }

    // Increment usage
    await this.prisma.workspace.update({
      where: { id: workspaceId },
      data: {
        mediaUsageSize: { increment: sizeInBytes },
      },
    });

    // Log the usage
    await this.prisma.usageLog.create({
      data: {
        workspaceId,
        type: 'MEDIA_UPLOAD',
        count: 1,
        metadata: { size: sizeInBytes },
      },
    });
  }

  /**
   * Logs token usage for AI responses.
   */
  async logTokens(workspaceId: string, model: string, tokens: number): Promise<void> {
    await this.prisma.usageLog.create({
      data: {
        workspaceId,
        type: 'AI_TOKEN',
        count: tokens,
        metadata: { model },
      },
    });
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
