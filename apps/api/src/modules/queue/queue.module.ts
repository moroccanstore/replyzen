import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { MessageProcessor } from './processors/message.processor';
import { CampaignProcessor } from './processors/campaign.processor';
import { UsageProcessor } from './processors/usage.processor';
import { WhatsappModule } from '../whatsapp/whatsapp.module';
import { AiModule } from '../ai/ai.module';
import { AutomationModule } from '../automation/automation.module';
import { SystemModule } from '../system/system.module';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [
    WhatsappModule,
    AiModule,
    AutomationModule,
    SystemModule,
    PrismaModule,
    BullModule.registerQueue(
      { name: 'message-queue' },
      { name: 'campaign-queue' },
      { name: 'usage-queue' },
    ),
  ],
  providers: [MessageProcessor, CampaignProcessor, UsageProcessor],
  exports: [BullModule],
})
export class QueueModule {}
