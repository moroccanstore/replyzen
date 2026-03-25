import { Module } from '@nestjs/common';
import { UsageService } from './usage.service';
import { LicenseService } from './license.service';
import { RedisService } from './redis.service';
import { EncryptionService } from './encryption.service';
import { PrismaModule } from '../../prisma/prisma.module';

import { UsageController } from './usage.controller';
import { ConfigController } from './config.controller';

import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [PrismaModule, ScheduleModule.forRoot()],
  controllers: [UsageController, ConfigController],
  providers: [UsageService, LicenseService, RedisService, EncryptionService],
  exports: [UsageService, LicenseService, RedisService, EncryptionService],
})
export class SystemModule {}

