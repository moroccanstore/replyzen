import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  ConversationStatus,
  MessageDirection,
  MessageStatus,
} from '@prisma/client';

@Injectable()
export class ConversationsService {
  constructor(private readonly prisma: PrismaService) {}

  async listConversations(workspaceId: string) {
    const conversations = await this.prisma.conversation.findMany({
      where: { workspaceId },
      include: {
        contact: true,
        messages: {
          orderBy: { timestamp: 'desc' },
          take: 1,
        },
      },
      orderBy: { lastMessageAt: 'desc' },
    });

    return Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await this.prisma.message.count({
          where: {
            conversationId: conv.id,
            direction: MessageDirection.INBOUND,
            status: { not: MessageStatus.READ },
          },
        });
        return { ...conv, unreadCount };
      }),
    );
  }

  async getConversationDetails(workspaceId: string, conversationId: string) {
    return this.prisma.conversation.findUnique({
      where: { id: conversationId, workspaceId },
      include: {
        contact: true,
        messages: {
          orderBy: { timestamp: 'asc' },
        },
      },
    });
  }

  async updateConversationStatus(
    workspaceId: string,
    conversationId: string,
    status: ConversationStatus,
  ) {
    return this.prisma.conversation.update({
      where: { id: conversationId, workspaceId },
      data: { status },
    });
  }

  async markAsRead(workspaceId: string, conversationId: string) {
    const conv = await this.prisma.conversation.findUnique({
      where: { id: conversationId, workspaceId },
    });

    if (!conv) return { success: false };

    await this.prisma.message.updateMany({
      where: {
        conversationId,
        direction: MessageDirection.INBOUND,
        status: { not: MessageStatus.READ },
      },
      data: { status: MessageStatus.READ },
    });

    return { success: true };
  }

  async getOrCreateConversation(workspaceId: string, contactId: string) {
    let conversation = await this.prisma.conversation.findFirst({
      where: { workspaceId, contactId, status: { not: 'CLOSED' } },
    });

    if (!conversation) {
      conversation = await this.prisma.conversation.create({
        data: {
          workspaceId,
          contactId,
          status: 'OPEN',
          lastMessageAt: new Date(),
        },
      });
    } else {
      await this.prisma.conversation.update({
        where: { id: conversation.id, workspaceId },
        data: { lastMessageAt: new Date() },
      });
    }

    return conversation;
  }

  async assignToAgent(workspaceId: string, conversationId: string, agentId: string) {
    return this.prisma.conversation.update({
      where: { id: conversationId, workspaceId },
      data: {
        assignedAgentId: agentId,
      },
    });
  }
}
