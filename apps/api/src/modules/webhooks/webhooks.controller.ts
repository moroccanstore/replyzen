import {
  Controller,
  Post,
  Get,
  Req,
  Query,
  HttpCode,
  HttpStatus,
  Logger,
  UnauthorizedException,
  Body,
  Headers,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import type { Request } from 'express';
import { SkipThrottle } from '@nestjs/throttler';

@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(private readonly webhooksService: WebhooksService) {}

  @SkipThrottle()
  @Post('whatsapp')
  @HttpCode(HttpStatus.OK)
  async handleWhatsApp(
    @Req() req: RawBodyRequest<Request>,
    @Body() body: any,
    @Headers('x-hub-signature-256') signature: string,
  ) {
    // In NestJS with rawBody: true, req.rawBody is available
    const rawBody = (req as any).rawBody;

    // 1. SECURITY: STRICT HMAC VALIDATION
    if (process.env.WHATSAPP_APP_SECRET) {
      if (!signature || !signature.startsWith('sha256=')) {
        throw new UnauthorizedException('Missing or invalid signature format');
      }

      if (!rawBody || !(rawBody instanceof Buffer)) {
        this.logger.error('Raw body not available for HMAC verification');
        throw new Error('Internal Server Error: Raw body missing');
      }

      const isValid = this.webhooksService.verifyMetaSignature(rawBody, signature);
      if (!isValid) {
        this.logger.warn('Invalid HMAC signature from WhatsApp');
        throw new UnauthorizedException('Invalid signature');
      }
    }

    try {
      // 2. Process Webhook
      await this.webhooksService.handleWhatsappWebhook(body);
      return { status: 'success' };
    } catch (error) {
      this.logger.error(`Webhook processing failed: ${error.message}`);
      return { status: 'error', message: error.message };
    }
  }

  @SkipThrottle()
  @Get('whatsapp')
  async verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
  ) {
    const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      this.logger.log('WhatsApp Webhook verified successfully');
      return challenge;
    }
    
    this.logger.warn('WhatsApp Webhook verification failed: Invalid Token');
    return HttpStatus.FORBIDDEN;
  }

  // Incoming Stripe events
  @Post('stripe')
  @HttpCode(HttpStatus.OK)
  async handleStripeEvent(
    @Req() request: Request,
    @Body() body: any,
    @Headers('stripe-signature') signature: string,
  ) {
    try {
      await this.webhooksService.handleStripeWebhook(body, signature);
      return 'EVENT_RECEIVED';
    } catch (e) {
      this.logger.error(`Stripe Webhook Error: ${e.message}`);
      return { status: 'error', message: e.message };
    }
  }
}
