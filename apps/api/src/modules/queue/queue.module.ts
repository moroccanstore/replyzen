import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { MessageProcessor } from './processors/message.processor';
import { CampaignProcessor } from './processors/campaign.processor';
import { SystemModule } from '../system/system.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { WhatsappModule } from '../../whatsapp/whatsapp.module';
import { AiModule } from '../../ai/ai.module';


@Module({
  imports: [
    WhatsappModule,
    AiModule,
    SystemModule,
    PrismaModule,
    BullModule.registerQueue(
      { 
        name: 'message-queue',
        defaultJobOptions: {
          attempts: 5,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
          removeOnComplete: true,
          removeOnFail: false,
        },
      },
      { 
        name: 'campaign-queue',
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'fixed',
            delay: 5000,
          },
          removeOnComplete: true,
          removeOnFail: false,
        },
      },
    ),
  ],
  providers: [MessageProcessor, CampaignProcessor],
  exports: [BullModule],
})
export class QueueModule {}
