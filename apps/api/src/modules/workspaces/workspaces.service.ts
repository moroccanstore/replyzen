import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export class UpdateWorkspaceDto {
  name?: string;
  metaToken?: string;
  whatsappPhoneId?: string;
  whatsappAccountId?: string;
  openaiApiKey?: string;
}

@Injectable()
export class WorkspacesService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserWorkspaces(userId: string) {
    const memberships = await this.prisma.membership.findMany({
      where: { userId },
      include: { workspace: true },
    });
    return memberships.map((m) => ({
      ...m.workspace,
      role: m.role,
    }));
  }

  async createWorkspace(
    userId: string,
    data: { name: string; company_website?: string },
  ) {
    return this.prisma.workspace.create({
      data: {
        name: data.name,
        memberships: {
          create: {
            userId,
            role: 'OWNER',
          },
        },
      },
    });
  }

  async getWorkspaceDetails(workspaceId: string, userId: string) {
    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_workspaceId: { userId, workspaceId },
      },
    });

    if (!membership)
      throw new NotFoundException('Workspace not found or unauthorized');

    return this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        memberships: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
        subscriptions: true,
      },
    });
  }

  async updateWorkspace(
    workspaceId: string,
    userId: string,
    data: UpdateWorkspaceDto,
  ) {
    await this.getWorkspaceDetails(workspaceId, userId);
    return this.prisma.workspace.update({
      where: { id: workspaceId },
      data: {
        name: data.name,
        metaToken: data.metaToken,
        whatsappPhoneId: data.whatsappPhoneId,
        whatsappAccountId: data.whatsappAccountId,
        openaiApiKey: data.openaiApiKey,
      },
    });
  }
}
