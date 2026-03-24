import {
  Processor,
  WorkerHost,
  InjectQueue,
  OnWorkerEvent,
} from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import {
  MessageDirection,
  MessageStatus,
  ConversationStatus,
} from '@prisma/client';
import { SocketGateway } from '../../socket/socket.gateway';
import { WhatsappService } from '../../whatsapp/whatsapp.service';
import { AiService } from '../../ai/ai.service';
import { AIMessage } from '../../ai/providers/ai-provider.interface';
import { SendMessageJobData, WebhookEventJobData } from '../jobs/types.job';
import { PrismaService } from '../../../prisma/prisma.service';
import { UsageService } from '../../system/usage.service';
import { BillingService } from '../../billing/billing.service';
import { AutomationService } from '../../automation/automation.service';
import { RedisService } from '../../system/redis.service';

@Processor('message-queue', { concurrency: 10 })
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
    private readonly automationService: AutomationService,
    private readonly redisService: RedisService,
    @InjectQueue('message-queue') private readonly messageQueue: Queue,
  ) {
    super();
  }

  @OnWorkerEvent('failed')
  async onFailed(job: Job, error: Error) {
    this.logger.error(
      `[ALERT][DLQ] Job ${job.id} failed and moved to DLQ: ${error.message}`,
    );

    try {
      await this.prisma.failedJob.create({
        data: {
          jobId: String(job.id),
          queueName: job.queueName || 'message-queue',
          data: {
            ...(job.data as any),
            _jobName: job.name, // Preserve original job name for retry
          },
          reason: error.message,
          stack: error.stack,
          workspaceId: job.data?.workspaceId,
          status: 'PENDING',
        },
      });
    } catch (e) {
      this.logger.error(`Failed to log failed job to DB: ${e.message}`);
    }
  }

  @OnWorkerEvent('completed')
  async onCompleted(job: Job) {
    if (!job.id?.startsWith('retry-')) return;

    const parts = job.id.split('-');
    const originalId = parts.slice(1, -1).join('-');

    if (!originalId) return;

    try {
      const updated = await (this.prisma as any).failedJob.updateMany({
        where: {
          id: originalId,
          status: 'REQUEUED',
        },
        data: {
          status: 'RESOLVED',
          resolvedAt: new Date(),
        },
      });

      if (updated.count > 0) {
        this.logger.log(`[DLQ] Job ${originalId} successfully resolved after retry.`);
      }
    } catch (e) {
      this.logger.error(`Failed to resolve failed job in DB: ${e.message}`);
    }
  }

  async process(
    job: Job<SendMessageJobData | WebhookEventJobData>,
  ): Promise<any> {
    this.logger.log(`Processing job ${job.id} of name ${job.name}`);
    console.log(`\n[QUEUE] Processing job: ${job.name} (ID: ${job.id})`);

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
        this.prisma.message.findUnique({ where: { id: messageId } }), 
        this.prisma.contact.findUnique({
          where: { id: contactId, workspaceId }, 
        }),
      ]);

      if (!workspace || !workspace.metaToken || !workspace.whatsappPhoneId) {
        throw new Error('Workspace not configured for WhatsApp');
      }

      if (!message || !contact) {
        throw new Error('Message or Contact not found in this workspace');
      }

      if (message.whatsappMsgId && message.status !== MessageStatus.FAILED) {
        this.logger.warn(
          `Message ${messageId} already has a WAMID ${message.whatsappMsgId}. Skipping API call.`,
        );
        return { success: true, messageId: message.whatsappMsgId };
      }

      if (workspace.isDemo) {
        this.logger.log(`[DEMO] Fake sending message to ${contact.phone}`);

        const result = { messageId: `demo_${Date.now()}` };

        await this.prisma.message.update({
          where: { id: messageId },
          data: {
            whatsappMsgId: result.messageId,
            status: MessageStatus.SENT,
            isDemo: true,
          },
        });

        this.socketGateway.emitToWorkspace(workspaceId, 'message-status-update', {
          messageId,
          whatsappMsgId: result.messageId,
          status: MessageStatus.SENT,
        });

        return { success: true, messageId: result.messageId };
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
          message.content || undefined,
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

      this.logger.log(
        `Successfully sent message ${messageId} to ${contact.phone}`,
      );
      return { success: true, messageId: result.messageId };
    } catch (error: any) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to handle send-message job: ${errorMsg}`);

      const currentMsg = await this.prisma.message.findUnique({
        where: { id: messageId },
      });
      if (!currentMsg?.whatsappMsgId) {
        await this.prisma.message.update({
          where: { id: messageId },
          data: { status: MessageStatus.FAILED },
        });

        this.socketGateway.emitToWorkspace(
          workspaceId,
          'message-status-update',
          {
            messageId,
            status: MessageStatus.FAILED,
            error: errorMsg,
          },
        );
      }

      return { success: false, error: errorMsg };
    }
  }

  private async handleWebhook(data: WebhookEventJobData) {
    const { provider, rawPayload } = data;

    let eventId: string | undefined;
    if (provider === 'whatsapp') {
      eventId =
        rawPayload.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.id ||
        rawPayload.entry?.[0]?.changes?.[0]?.value?.statuses?.[0]?.id;
    } else if (provider === 'stripe') {
      eventId = rawPayload.id;
    }

    if (eventId) {
      const existing = await this.prisma.webhookLog.findUnique({
        where: { eventId },
      });

      if (existing) {
        this.logger.warn(
          `Duplicate webhook event detected: ${eventId} (${provider}). Skipping.`,
        );
        return { success: true, duplicate: true };
      }

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
            conversation: { workspaceId },
          },
          data: {
            status: String(status.status).toUpperCase() as MessageStatus,
          },
        });

        if (msg.count > 0) {
          const updatedMsg = await this.prisma.message.findFirst({
            where: {
              whatsappMsgId: String(status.id),
              conversation: { workspaceId },
            },
          });

          if (updatedMsg) {
            this.socketGateway.emitToWorkspace(
              workspaceId,
              'message-status-update',
              {
                messageId: updatedMsg.id,
                whatsappMsgId: String(status.id),
                status: status.status,
              },
            );
          }
        }
      }
    }

    // 2. Handle Incoming Messages (ATOMIC IDEMPOTENCY)
    if (value.messages) {
      for (const msg of value.messages) {
        const whatsappMsgId = String(msg.id);
        const from = String(msg.from);
        const contactName = value.contacts?.[0]?.profile?.name || from;
        const type = String(msg.type).toUpperCase();
        let content = msg.text?.body || '';
        let mediaUrl: string | undefined;
        let mimeType: string | undefined;

        if (type !== 'TEXT') {
          const mediaData = msg[msg.type];
          if (mediaData && mediaData.id) {
            try {
              const workspace = await this.prisma.workspace.findUnique({
                where: { id: workspaceId },
              });
              if (workspace?.metaToken) {
                mediaUrl = await this.whatsappService.getMediaUrl(
                  workspace.metaToken,
                  mediaData.id,
                );
                mimeType = mediaData.mime_type;
                content = mediaData.caption || '';
              }
            } catch (err: any) {
              this.logger.error(
                `Failed to resolve media URL for ${mediaData.id}: ${err.message}`,
              );
            }
          }
        }

        const lowerContent = content.toLowerCase();
        const tagsToAdd: string[] = [];
        if (lowerContent.includes('vip')) tagsToAdd.push('VIP');
        if (
          lowerContent.includes('buy') ||
          lowerContent.includes('purchase') ||
          lowerContent.includes('order')
        )
          tagsToAdd.push('LEAD');
        if (
          lowerContent.includes('angry') ||
          lowerContent.includes('complain') ||
          lowerContent.includes('worst')
        )
          tagsToAdd.push('ANGRY');

        // Upsert Contact
        let contact = await this.prisma.contact.findUnique({
          where: { workspaceId_phone: { workspaceId, phone: from } },
        });

        if (!contact) {
          contact = await this.prisma.contact.create({
            data: {
              workspaceId,
              phone: from,
              name: contactName,
              tags: tagsToAdd,
            },
          });
        } else if (tagsToAdd.length > 0) {
          const currentTags = (contact as any).tags || [];
          const newTags = Array.from(new Set([...currentTags, ...tagsToAdd]));
          if (newTags.length !== currentTags.length) {
            contact = await this.prisma.contact.update({
              where: { id: contact.id },
              data: { tags: newTags },
            });
          }
        }

        // Basic E-commerce Order Creation
        if (
          lowerContent.includes('i want to buy') ||
          lowerContent.includes('interested in buying')
        ) {
          await this.prisma.order.create({
            data: {
              workspaceId,
              contactId: contact.id,
              product: content.substring(0, 100),
              price: 0,
              status: 'PENDING',
            },
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

        // Save Inbound Message (Atomic Upsert)
        const newMessage = await this.prisma.message.upsert({
          where: { whatsappMsgId },
          update: {},
          create: {
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

        const isNew = newMessage.timestamp.getTime() > Date.now() - 5000;
        if (!isNew) {
           this.logger.warn(`Duplicate message ${whatsappMsgId} detected via upsert, skipping logic.`);
           continue;
        }

        this.socketGateway.emitToWorkspace(workspaceId, 'new-message', {
          conversationId: conversation.id,
          message: newMessage,
        });

        let automationReply: string | null = null;
        if (content) {
          automationReply = await this.automationService.evaluateKeywordRules(
            workspaceId,
            content,
          );
        }

        if (automationReply) {
          const autoMsg = await this.prisma.message.create({
            data: {
              conversationId: conversation.id,
              direction: MessageDirection.OUTBOUND,
              type: 'TEXT',
              content: automationReply,
              status: MessageStatus.SENT,
            },
          });

          await this.messageQueue.add('send-message', {
            workspaceId,
            contactId: contact.id,
            messageId: autoMsg.id,
            content: automationReply,
            type: 'text',
          } satisfies SendMessageJobData);

          this.socketGateway.emitToWorkspace(workspaceId, 'new-message', {
            conversationId: conversation.id,
            message: autoMsg,
          });
        } else if (
          conversation.status === ConversationStatus.BOT_ACTIVE &&
          conversation.workspace?.aiSettings
        ) {
          const history = await this.prisma.message.findMany({
            where: { conversationId: conversation.id },
            orderBy: { timestamp: 'desc' },
            take: 10,
          });

          const aiMessages: AIMessage[] = history.reverse().map((m) => ({
            role: m.direction === 'INBOUND' ? 'user' : 'assistant',
            content: m.content || '',
          }));

          let aiError: any;
          let attempts = 0;
          const maxAttempts = 3;
          let success = false;

          while (attempts < maxAttempts && !success) {
            try {
              await this.usageService.checkAndIncrementAIUsage(
                workspaceId,
                (conversation.workspace.aiSettings as any).model,
              );

              // 1.1 TENANT-BASED AI RATE LIMITER
              const rateLimitKey = `ai_limit:${workspaceId}`;
              const currentRequests = await this.redisService.incr(rateLimitKey);
              if (currentRequests === 1) {
                await this.redisService.expire(rateLimitKey, 60);
              }
              if (currentRequests > 10) {
                throw new Error('AI Rate limit exceeded.');
              }

              const aiConfig = conversation.workspace.aiSettings as any;

              // 2.2. DEMO PROTECTION (LIMIT 50 MESSAGES)
              if (conversation.workspace.isDemo) {
                const demoUsageKey = `demo_usage:${workspaceId}`;
                const demoCount = await this.redisService.incr(demoUsageKey);
                if (demoCount === 1) await this.redisService.expire(demoUsageKey, 86400); // 24h reset or just global?
                
                if (demoCount > 50) {
                   throw new Error('DEMO_LIMIT_EXCEEDED');
                }
              }

              const aiReply = await this.aiService.generateAiReply(
                aiConfig.provider,
                aiMessages,
                {
                  model: aiConfig.model,
                  temperature: aiConfig.temperature,
                  maxTokens: aiConfig.maxTokens,
                },
                conversation.workspace.isDemo,
              );

              const aiMsg = await this.prisma.message.create({
                data: {
                  conversationId: conversation.id,
                  direction: MessageDirection.OUTBOUND,
                  type: 'TEXT',
                  content: aiReply.content,
                  status: MessageStatus.SENT,
                  isDemo: conversation.workspace.isDemo,
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
              this.logger.error(`AI attempt ${attempts} failed: ${err.message}`);
              if (err.message.includes('quota exceeded')) break;
              if (attempts < maxAttempts) {
                await new Promise((resolve) =>
                  setTimeout(resolve, Math.pow(2, attempts) * 1000),
                );
              }
            }
          }

          if (!success) {
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
