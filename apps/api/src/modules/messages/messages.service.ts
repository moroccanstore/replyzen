import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { UsageService } from '../system/usage.service';
import { SendMessageJobData } from '../queue/jobs/types.job';
import { SocketGateway } from '../socket/socket.gateway';

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly usageService: UsageService,
    @InjectQueue('message-queue') private readonly messageQueue: Queue,
    private readonly socketGateway: SocketGateway,
  ) {}

  /**
   * Send a new outbound message
   */
  async sendMessage(params: {
    workspaceId: string;
    conversationId: string;
    contactId: string;
    content?: string;
    type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'AUDIO';
    mediaUrl?: string;
  }) {
    // 1. Verify workspace isolation
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: params.conversationId, workspaceId: params.workspaceId },
    });

    if (!conversation) {
      throw new Error('Conversation not found in this workspace');
    }

    // 2. Create message in DB
    const message = await (this.prisma as any).message.create({
      data: {
        conversationId: params.conversationId,
        direction: 'OUTBOUND',
        type: params.type,
        content: params.content || '',
        mediaUrl: params.mediaUrl,
        status: 'SENT',
      },
    });

    // 2. Add to Queue for background delivery
    await this.messageQueue.add('send-message', {
      workspaceId: params.workspaceId,
      contactId: params.contactId,
      messageId: message.id,
      content: params.content || '',
      type: (params.type?.toLowerCase() || 'text') as any,
      mediaUrl: params.mediaUrl,
    } satisfies SendMessageJobData);

    // 3. Emit real-time update to the UI
    this.socketGateway.emitToWorkspace(params.workspaceId, 'new-message', {
      conversationId: params.conversationId,
      message,
    });

    this.logger.log(`Queued outbound ${params.type} message ${message.id} for workspace ${params.workspaceId}`);

    return message;
  }

  async saveMessage(data: {
    conversationId: string;
    wamId: string;
    direction: 'INBOUND' | 'OUTBOUND';
    status: 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
    type: string;
    content?: string;
    mediaUrl?: string;
    mimeType?: string;
  }) {
    return await (this.prisma as any).message.create({
      data: {
        conversationId: data.conversationId,
        whatsappMsgId: data.wamId || '',
        direction: data.direction,
        status: data.status,
        type: data.type,
        content: data.content || '',
        mediaUrl: data.mediaUrl,
        mimeType: data.mimeType,
      },
    });
  }

  async updateMessageStatus(
    wamId: string,
    status: 'DELIVERED' | 'READ' | 'FAILED',
  ) {
    return this.prisma.message.update({
      where: { whatsappMsgId: wamId },
      data: { status },
    });
  }
}
