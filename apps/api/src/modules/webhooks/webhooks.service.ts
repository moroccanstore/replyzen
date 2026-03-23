import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { WebhookEventJobData } from '../queue/jobs/types.job';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    @InjectQueue('message-queue') private readonly messageQueue: Queue,
    private readonly prisma: PrismaService,
  ) {}

  async handleWhatsappWebhook(payload: any) {
    if (payload.object !== 'whatsapp_business_account') {
      return { success: false };
    }

    // 1. Extract Phone Number ID to resolve Workspace
    const phoneNumberId = payload.entry?.[0]?.changes?.[0]?.value?.metadata?.phone_number_id;

    if (!phoneNumberId) {
      this.logger.error('No phone_number_id found in WhatsApp webhook payload');
      return { success: false };
    }

    // 2. Resolve Workspace
    const workspace = await this.prisma.workspace.findFirst({
      where: { whatsappPhoneId: phoneNumberId },
    });

    if (!workspace) {
      this.logger.error(`No workspace found for WhatsApp Phone ID: ${phoneNumberId}`);
      return { success: false };
    }

    this.logger.log(`Received WhatsApp webhook for workspace ${workspace.id}, pushing to queue`);

    // 3. Queue the event for background processing
    await this.messageQueue.add('process-webhook', {
      workspaceId: workspace.id,
      rawPayload: payload,
      provider: 'whatsapp',
    } satisfies WebhookEventJobData);

    return { success: true };
  }

  async handleStripeWebhook(payload: any, signature: string) {
    this.logger.log(`Received Stripe webhook, pushing to queue`);

    await this.messageQueue.add('process-webhook', {
      workspaceId: 'system',
      rawPayload: payload,
      provider: 'stripe',
    } satisfies WebhookEventJobData);

    return { success: true };
  }
}
