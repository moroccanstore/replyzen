import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import type { Request } from 'express';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  // WhatsApp Cloud API verification
  @Get('whatsapp')
  verifyWhatsapp(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
  ) {
    const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      return challenge;
    }
    return HttpStatus.FORBIDDEN;
  }

  // Incoming WhatsApp messages
  @Post('whatsapp')
  @HttpCode(HttpStatus.OK)
  async handleWhatsappMessage(@Body() body: any) {
    // Must return 200 OK instantly to Meta
    await this.webhooksService.handleWhatsappWebhook(body);
    return 'EVENT_RECEIVED';
  }

  // Incoming Stripe events
  @Post('stripe')
  @HttpCode(HttpStatus.OK)
  async handleStripeEvent(@Req() request: Request, @Body() body: any) {
    const signature = request.headers['stripe-signature'] as string;
    await this.webhooksService.handleStripeWebhook(body, signature);
    return 'EVENT_RECEIVED';
  }
}
