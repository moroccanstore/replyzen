import { Module } from '@nestjs/common';
import { LicenseService } from './license.service';
import { LicenseController } from './license.controller';
import { AdminLicenseController } from './admin-license.controller';

@Module({
  controllers: [LicenseController, AdminLicenseController],
  providers: [LicenseService],
})
export class LicenseModule {}
