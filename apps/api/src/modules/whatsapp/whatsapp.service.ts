import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);

  /**
   * Send a standard text message
   */
  async sendMessage(
    accessToken: string,
    phoneNumberId: string,
    to: string,
    message: string,
  ) {
    return this.postToMeta(accessToken, phoneNumberId, {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'text',
      text: { body: message },
    });
  }

  /**
   * Send a media message (image, document, audio, video)
   */
  async sendMediaMessage(
    accessToken: string,
    phoneNumberId: string,
    to: string,
    type: 'image' | 'document' | 'audio' | 'video',
    mediaUrl: string,
    caption?: string,
  ) {
    const payload: any = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type,
    };

    payload[type] = { link: mediaUrl };
    if (
      caption &&
      (type === 'image' || type === 'video' || type === 'document')
    ) {
      payload[type].caption = caption;
    }

    return this.postToMeta(accessToken, phoneNumberId, payload);
  }

  /**
   * Send a template message
   */
  async sendTemplateMessage(
    accessToken: string,
    phoneNumberId: string,
    to: string,
    templateName: string,
    languageCode: string = 'en_US',
    components: any[] = [],
  ) {
    return this.postToMeta(accessToken, phoneNumberId, {
      messaging_product: 'whatsapp',
      to,
      type: 'template',
      template: {
        name: templateName,
        language: { code: languageCode },
        components,
      },
    });
  }

  /**
   * Resolve a Meta Media ID to a downloadable URL
   */
  async getMediaUrl(accessToken: string, mediaId: string): Promise<string> {
    try {
      const response = await axios.get(
        `https://graph.facebook.com/v19.0/${mediaId}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
      return response.data.url;
    } catch (error: any) {
      this.logger.error(`Failed to get WhatsApp media URL: ${error.message}`);
      throw error;
    }
  }

  /**
   * Helper for Meta Graph API POST requests
   */
  private async postToMeta(
    accessToken: string,
    phoneNumberId: string,
    payload: any,
  ) {
    try {
      const response = await axios.post(
        `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return {
        success: true,
        messageId: response.data.messages[0].id,
      };
    } catch (error: any) {
      const errorMsg = error.response?.data?.error?.message || error.message;
      this.logger.error(`Failed to send Meta message: ${errorMsg}`);
      throw new Error(`Meta API Error: ${errorMsg}`);
    }
  }
}
