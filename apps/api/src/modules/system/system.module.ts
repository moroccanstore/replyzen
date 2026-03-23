import { Module } from '@nestjs/common';
import { UsageService } from './usage.service';
import { LicenseService } from './license.service';
import { PrismaModule } from '../../prisma/prisma.module';

import { UsageController } from './usage.controller';

@Module({
  imports: [PrismaModule],
  controllers: [UsageController],
  providers: [UsageService, LicenseService],
  exports: [UsageService, LicenseService],
})
export class SystemModule {}
