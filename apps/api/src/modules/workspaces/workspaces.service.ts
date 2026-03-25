import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EncryptionService } from '../system/encryption.service';

export class UpdateWorkspaceDto {
  name?: string;
  metaToken?: string;
  whatsappPhoneId?: string;
  whatsappAccountId?: string;
  openaiApiKey?: string;
}

@Injectable()
export class WorkspacesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly encryption: EncryptionService,
  ) {}

  async getUserWorkspaces(userId: string) {
    const memberships = await this.prisma.membership.findMany({
      where: { userId },
      include: { workspace: true },
    });
    return memberships.map((m) => ({
      ...m.workspace,
      // Decrypt sensitive fields on read — never expose encrypted strings to clients
      metaToken: this.encryption.decrypt(m.workspace.metaToken ?? null),
      openaiApiKey: this.encryption.decrypt(m.workspace.openaiApiKey ?? null),
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

    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        memberships: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
        subscriptions: true,
      },
    });

    if (!workspace) return null;

    // Decrypt sensitive fields before returning to client
    return {
      ...workspace,
      metaToken: this.encryption.decrypt(workspace.metaToken ?? null),
      openaiApiKey: this.encryption.decrypt(workspace.openaiApiKey ?? null),
    };
  }

  async updateWorkspace(
    workspaceId: string,
    userId: string,
    data: UpdateWorkspaceDto,
  ) {
    await this.getWorkspaceDetails(workspaceId, userId);

    // Encrypt sensitive fields on write
    const encryptedMetaToken = data.metaToken
      ? this.encryption.encrypt(data.metaToken)
      : undefined;

    const encryptedOpenaiApiKey = data.openaiApiKey
      ? this.encryption.encrypt(data.openaiApiKey)
      : undefined;

    return this.prisma.workspace.update({
      where: { id: workspaceId },
      data: {
        name: data.name,
        metaToken: encryptedMetaToken ?? undefined,
        whatsappPhoneId: data.whatsappPhoneId,
        whatsappAccountId: data.whatsappAccountId,
        openaiApiKey: encryptedOpenaiApiKey ?? undefined,
      },
    });
  }
}
