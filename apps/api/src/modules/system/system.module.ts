import { Module } from '@nestjs/common';
import { UsageService } from './usage.service';
import { LicenseService } from './license.service';
import { RedisService } from './redis.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { RedisModule } from '../../redis/redis.module';

import { UsageController } from './usage.controller';
import { ConfigController } from './config.controller';

import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [PrismaModule, RedisModule, ScheduleModule.forRoot()],
  controllers: [UsageController, ConfigController],
  providers: [UsageService, LicenseService, RedisService],
  exports: [UsageService, LicenseService, RedisService],
})
export class SystemModule {}
