export interface SendMessageJobData {
  workspaceId: string;
  contactId: string;
  messageId: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'document' | 'audio' | 'template';
  mediaUrl?: string;
  metadata?: any;
}

export interface WebhookEventJobData {
  workspaceId: string;
  rawPayload: any;
  provider: 'whatsapp' | 'stripe';
}

export interface CampaignBatchJobData {
  campaignId: string;
  workspaceId: string;
  recipientIds: string[];
}
