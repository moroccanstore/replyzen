import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { WebhookEventJobData } from '../queue/jobs/types.job';
import * as crypto from 'crypto';

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
    const phoneNumberId =
      payload.entry?.[0]?.changes?.[0]?.value?.metadata?.phone_number_id;

    if (!phoneNumberId) {
      this.logger.error('No phone_number_id found in WhatsApp webhook payload');
      return { success: false };
    }

    // 2. Resolve Workspace
    const workspace = await this.prisma.workspace.findFirst({
      where: { whatsappPhoneId: phoneNumberId },
    });

    if (!workspace) {
      this.logger.error(
        `No workspace found for WhatsApp Phone ID: ${phoneNumberId}`,
      );
      return { success: false };
    }

    console.log(
      `[WEBHOOK] Received WhatsApp webhook for workspace ${workspace.id}, pushing to queue`,
    );

    // 3. Queue the event for background processing
    const eventId =
      payload.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.id ||
      payload.entry?.[0]?.changes?.[0]?.value?.statuses?.[0]?.id;

    await this.messageQueue.add(
      'process-webhook',
      {
        workspaceId: workspace.id,
        rawPayload: payload,
        provider: 'whatsapp',
      } satisfies WebhookEventJobData,
      {
        jobId: eventId ? `whatsapp:${eventId}` : undefined,
        attempts: 5,
        backoff: { type: 'exponential', delay: 500 },
        removeOnComplete: true,
      },
    );

    return { success: true };
  }

  async handleStripeWebhook(payload: any, signature: string) {
    console.log(`[WEBHOOK] Received Stripe webhook, pushing to queue`);

    await this.messageQueue.add(
      'process-webhook',
      {
        workspaceId: 'system',
        rawPayload: payload,
        provider: 'stripe',
      } satisfies WebhookEventJobData,
      {
        jobId: payload.id ? `stripe:${payload.id}` : undefined,
        attempts: 5,
        backoff: { type: 'exponential', delay: 500 },
        removeOnComplete: true,
      },
    );

    return { success: true };
  }

  verifyMetaSignature(rawBody: Buffer, signature: string): boolean {
    const appSecret = process.env.WHATSAPP_APP_SECRET;
    if (!appSecret || !signature?.startsWith('sha256=')) return false;

    const hash = crypto
      .createHmac('sha256', appSecret)
      .update(rawBody)
      .digest('hex');

    const expected = Buffer.from(`sha256=${hash}`);
    const received = Buffer.from(signature);

    if (expected.length !== received.length) return false;

    return crypto.timingSafeEqual(expected, received);
  }
}
