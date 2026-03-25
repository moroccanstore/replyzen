import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { APP_GUARD } from '@nestjs/core';
import { InstallGuard } from './common/guards/install.guard';
import { LicenseGuard } from './modules/system/license.guard';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { QueueModule } from './modules/queue/queue.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { WorkspacesModule } from './modules/workspaces/workspaces.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { WhatsappModule } from './modules/whatsapp/whatsapp.module';
import { MessagesModule } from './modules/messages/messages.module';
import { ConversationsModule } from './modules/conversations/conversations.module';
import { ContactsModule } from './modules/contacts/contacts.module';
import { AiModule } from './modules/ai/ai.module';
import { AutomationModule } from './modules/automation/automation.module';
import { CampaignsModule } from './modules/campaigns/campaigns.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { BillingModule } from './modules/billing/billing.module';
import { AdminModule } from './modules/admin/admin.module';
import { InstallModule } from './modules/install/install.module';
import { SystemModule } from './modules/system/system.module';
import { SocketModule } from './modules/socket/socket.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { OrdersModule } from './modules/orders/orders.module';

@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        // Critical — app will NOT start if any of these are missing
        DATABASE_URL:    Joi.string().uri().required(),
        JWT_SECRET:      Joi.string().min(32).required(),
        ENCRYPTION_KEY:  Joi.string().length(32).required(),
        REDIS_HOST:      Joi.string().default('localhost'),
        REDIS_PORT:      Joi.number().integer().default(6379),
        // Optional but validated when present
        NODE_ENV:        Joi.string().valid('development', 'production', 'test').default('development'),
        PORT:            Joi.number().integer().default(3001),
        JWT_EXPIRES_IN:  Joi.string().default('7d'),
      }),
      validationOptions: {
        abortEarly: false, // Show ALL missing vars, not just the first one
      },
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10, // Max 10 requests per minute per IP
      },
    ]),
    // QueueModule is enabled — centralizes all BullMQ queue registrations
    QueueModule,
    AuthModule,
    UsersModule,
    WorkspacesModule,
    WebhooksModule,
    WhatsappModule,
    MessagesModule,
    ConversationsModule,
    ContactsModule,
    AiModule,
    AutomationModule,
    CampaignsModule,
    AnalyticsModule,
    BillingModule,
    AdminModule,
    InstallModule,
    SystemModule,
    SocketModule,
    OrdersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: InstallGuard,
    },
    {
      provide: APP_GUARD,
      useClass: LicenseGuard,
    },
  ],
})
export class AppModule {}
