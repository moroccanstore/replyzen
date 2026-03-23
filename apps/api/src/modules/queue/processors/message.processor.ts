import { Processor, WorkerHost, InjectQueue } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { MessageDirection, MessageStatus, ConversationStatus } from '@prisma/client';
import { SocketGateway } from '../../socket/socket.gateway';
import { WhatsappService } from '../../whatsapp/whatsapp.service';
import { AiService } from '../../ai/ai.service';
import { AIMessage } from '../../ai/providers/ai-provider.interface';
import { SendMessageJobData, WebhookEventJobData } from '../jobs/types.job';
import { PrismaService } from '../../../prisma/prisma.service';
import { UsageService } from '../../system/usage.service';
import { BillingService } from '../../billing/billing.service';

@Processor('message-queue')
@Injectable()
export class MessageProcessor extends WorkerHost {
  private readonly logger = new Logger(MessageProcessor.name);

  constructor(
    private readonly socketGateway: SocketGateway,
    private readonly whatsappService: WhatsappService,
    private readonly aiService: AiService,
    private readonly prisma: PrismaService,
    private readonly usageService: UsageService,
    private readonly billingService: BillingService,
    @InjectQueue('message-queue') private readonly messageQueue: Queue,
  ) {
    super();
  }

  async process(
    job: Job<SendMessageJobData | WebhookEventJobData>,
  ): Promise<any> {
    this.logger.log(`Processing job ${job.id} of name ${job.name}`);

    switch (job.name) {
      case 'send-message':
        return this.handleSendMessage(job.data as SendMessageJobData);
      case 'process-webhook':
        return this.handleWebhook(job.data as WebhookEventJobData);
      default:
        this.logger.warn(`Unknown job name: ${job.name}`);
    }
  }

  private async handleSendMessage(data: SendMessageJobData) {
    const { messageId, workspaceId, contactId } = data;

    try {
      const [workspace, message, contact] = await Promise.all([
        this.prisma.workspace.findUnique({ where: { id: workspaceId } }),
        this.prisma.message.findUnique({ where: { id: messageId } }), // messageId is unique, but we check workspace infra
        this.prisma.contact.findUnique({
          where: { id: contactId, workspaceId }, // Enforcement of workspace isolation
        }),
      ]);

      if (!workspace || !workspace.metaToken || !workspace.whatsappPhoneId) {
        throw new Error('Workspace not configured for WhatsApp');
      }

      if (!message || !contact) {
        throw new Error('Message or Contact not found in this workspace');
      }

      // RETRY SAFETY: Check if message already has a WAMID (indicates previous successful send)
      if (message.whatsappMsgId && message.status !== MessageStatus.FAILED) {
        this.logger.warn(`Message ${messageId} already has a WAMID ${message.whatsappMsgId}. Skipping API call.`);
        return { success: true, messageId: message.whatsappMsgId };
      }

      let result;
      if (message.type === 'TEXT') {
        result = await this.whatsappService.sendMessage(
          workspace.metaToken,
          workspace.whatsappPhoneId,
          contact.phone,
          message.content || '',
        );
      } else {
        result = await this.whatsappService.sendMediaMessage(
          workspace.metaToken,
          workspace.whatsappPhoneId,
          contact.phone,
          message.type.toLowerCase() as any,
          message.mediaUrl!,
          message.content || undefined, // Use content as caption if present
        );
      }

      await this.prisma.message.update({
        where: { id: messageId },
        data: {
          whatsappMsgId: result.messageId,
          status: MessageStatus.SENT,
        },
      });

      this.socketGateway.emitToWorkspace(workspaceId, 'message-status-update', {
        messageId,
        whatsappMsgId: result.messageId,
        status: MessageStatus.SENT,
      });

      this.logger.log(`Successfully sent message ${messageId} to ${contact.phone}`);
      return { success: true, messageId: result.messageId };
    } catch (error: any) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to handle send-message job: ${errorMsg}`);
      
      // Only set to FAILED if it hasn't successfully been sent yet
      const currentMsg = await this.prisma.message.findUnique({ where: { id: messageId } });
      if (!currentMsg?.whatsappMsgId) {
        await this.prisma.message.update({
          where: { id: messageId },
          data: { status: MessageStatus.FAILED },
        });
 
        this.socketGateway.emitToWorkspace(workspaceId, 'message-status-update', {
          messageId,
          status: MessageStatus.FAILED,
          error: errorMsg,
        });
      }

      return { success: false, error: errorMsg };
    }
  }

  private async handleWebhook(data: WebhookEventJobData) {
    const { provider, rawPayload } = data;
    
    // Extract Event ID for Idempotency
    let eventId: string | undefined;
    if (provider === 'whatsapp') {
      eventId = rawPayload.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.id || 
                rawPayload.entry?.[0]?.changes?.[0]?.value?.statuses?.[0]?.id;
    } else if (provider === 'stripe') {
      eventId = rawPayload.id;
    }

    if (eventId) {
      const existing = await this.prisma.webhookLog.findUnique({
        where: { eventId },
      });

      if (existing) {
        this.logger.warn(`Duplicate webhook event detected: ${eventId} (${provider}). Skipping.`);
        return { success: true, duplicate: true };
      }

      // Log the event immediately to prevent race conditions (simplified)
      await this.prisma.webhookLog.create({
        data: { eventId, provider },
      });
    }

    if (provider === 'whatsapp') {
      return this.handleWhatsappWebhook(data);
    }
    if (provider === 'stripe') {
      return this.billingService.handleStripeWebhook(rawPayload);
    }
    return { success: true };
  }

  private async handleWhatsappWebhook(data: WebhookEventJobData) {
    const { rawPayload, workspaceId } = data;
    const value = rawPayload.entry?.[0]?.changes?.[0]?.value;

    if (!value) return { success: false, error: 'Malformed payload' };

    // 1. Handle Status Updates
    if (value.statuses) {
      for (const status of value.statuses) {
        const msg = await this.prisma.message.updateMany({
          where: {
            whatsappMsgId: String(status.id),
            conversation: { workspaceId }, // Workspace Isolation
          },
          data: {
            status: String(status.status).toUpperCase() as MessageStatus,
          },
        });

        if (msg.count > 0) {
          const updatedMsg = await this.prisma.message.findFirst({
            where: { whatsappMsgId: String(status.id), conversation: { workspaceId } },
          });

          if (updatedMsg) {
            this.socketGateway.emitToWorkspace(workspaceId, 'message-status-update', {
              messageId: updatedMsg.id,
              whatsappMsgId: String(status.id),
              status: status.status,
            });
          }
        }
      }
    }

    // 2. Handle Incoming Messages (IDEMPOTENCY)
    if (value.messages) {
      for (const msg of value.messages) {
        const whatsappMsgId = String(msg.id);

        // IDEMPOTENCY CHECK
        const existingMessage = await this.prisma.message.findUnique({
          where: { whatsappMsgId },
        });

        if (existingMessage) {
          this.logger.warn(`Received duplicate webhook for message ${whatsappMsgId}. Skipping.`);
          continue;
        }

        const from = String(msg.from);
        const contactName = value.contacts?.[0]?.profile?.name || from;
        
        // Determine message type and extract content/media
        const type = String(msg.type).toUpperCase();
        let content = msg.text?.body || '';
        let mediaUrl: string | undefined;
        let mimeType: string | undefined;

        if (type !== 'TEXT') {
          const mediaData = msg[msg.type]; // e.g. msg.image, msg.document
          if (mediaData && mediaData.id) {
            try {
              const workspace = await this.prisma.workspace.findUnique({ where: { id: workspaceId } });
              if (workspace?.metaToken) {
                mediaUrl = await this.whatsappService.getMediaUrl(workspace.metaToken, mediaData.id);
                mimeType = mediaData.mime_type;
                content = mediaData.caption || ''; // Use caption for media types
              }
            } catch (err) {
              this.logger.error(`Failed to resolve media URL for ${mediaData.id}: ${err.message}`);
            }
          }
        }

        // Upsert Contact
        let contact = await this.prisma.contact.findUnique({
          where: { workspaceId_phone: { workspaceId, phone: from } },
        });

        if (!contact) {
          contact = await this.prisma.contact.create({
            data: { workspaceId, phone: from, name: contactName },
          });
        }

        // Upsert Conversation
        let conversation = await this.prisma.conversation.findFirst({
          where: { workspaceId, contactId: contact.id },
          include: { workspace: { include: { aiSettings: true } } },
        });

        if (!conversation) {
          conversation = await this.prisma.conversation.create({
            data: {
              workspaceId,
              contactId: contact.id,
              status: ConversationStatus.BOT_ACTIVE,
              lastMessageAt: new Date(),
            },
            include: { workspace: { include: { aiSettings: true } } },
          });
        } else {
          conversation = await this.prisma.conversation.update({
            where: { id: conversation.id },
            data: { lastMessageAt: new Date() },
            include: { workspace: { include: { aiSettings: true } } },
          });
        }

        // Save Inbound Message
        const newMessage = await this.prisma.message.create({
          data: {
            conversationId: conversation.id,
            direction: MessageDirection.INBOUND,
            type,
            content,
            mediaUrl,
            mimeType,
            status: MessageStatus.READ,
            whatsappMsgId,
          },
        });

        this.socketGateway.emitToWorkspace(workspaceId, 'new-message', {
          conversationId: conversation.id,
          message: newMessage,
        });

        // AI Response Logic (with Fallback & Retries)
        if (
          conversation.status === ConversationStatus.BOT_ACTIVE &&
          conversation.workspace?.aiSettings
        ) {
          const history = await this.prisma.message.findMany({
            where: { conversationId: conversation.id },
            orderBy: { timestamp: 'desc' },
            take: 10,
          });

          const aiMessages: AIMessage[] = history.reverse().map((m: any) => ({
            role: (m.direction === 'INBOUND' ? 'user' : 'assistant') as 'user' | 'assistant',
            content: m.content || '',
          }));

          let aiError: any;
          let attempts = 0;
          const maxAttempts = 3;
          let success = false;

          while (attempts < maxAttempts && !success) {
            try {
              // 1. CHECK QUOTA (Every attempt to ensure we don't over-bill/use)
              await this.usageService.checkAndIncrementAIUsage(workspaceId, (conversation.workspace.aiSettings as any).model);

              // 2. GENERATE AI
              const aiReply = await this.aiService.generateAiReply(
                (conversation.workspace.aiSettings as any).provider,
                aiMessages,
                { model: (conversation.workspace.aiSettings as any).model },
              );

              // 3. CREATE MESSAGE
              const aiMsg = await this.prisma.message.create({
                data: {
                  conversationId: conversation.id,
                  direction: MessageDirection.OUTBOUND,
                  type: 'TEXT',
                  content: aiReply.content,
                  status: MessageStatus.SENT,
                },
              });

              await this.messageQueue.add('send-message', {
                workspaceId,
                contactId: contact.id,
                messageId: aiMsg.id,
                content: aiReply.content,
                type: 'text',
              } satisfies SendMessageJobData);

              this.socketGateway.emitToWorkspace(workspaceId, 'new-message', {
                conversationId: conversation.id,
                message: aiMsg,
              });

              success = true;
            } catch (err: any) {
              aiError = err;
              attempts++;
              this.logger.error(`AI Bot attempt ${attempts} failed for conv ${conversation.id}: ${err.message}`);
              
              if (err.message.includes('quota exceeded')) break; // Don't retry quota issues

              if (attempts < maxAttempts) {
                // Exponential backoff
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 1000));
              }
            }
          }

          if (!success) {
            // FALLBACK: Handover to human on total AI failure or quota exceeded
            this.logger.warn(`Shifting conversation ${conversation.id} to HUMAN_REQUIRED after ${attempts} attempts.`);
            
            await this.prisma.conversation.update({
              where: { id: conversation.id },
              data: { status: ConversationStatus.HUMAN_REQUIRED },
            });

            this.socketGateway.emitToWorkspace(workspaceId, 'conversation-status-update', {
              conversationId: conversation.id,
              status: ConversationStatus.HUMAN_REQUIRED,
              reason: aiError?.message || 'AI processing failure',
            });
          }
        }
      }
    }

    return { success: true };
  }
}
