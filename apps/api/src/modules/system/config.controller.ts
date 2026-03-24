import { Controller, Get } from '@nestjs/common';
import { LicenseService } from './license.service';

@Controller('config')
export class ConfigController {
  constructor(private readonly licenseService: LicenseService) {}

  @Get('support')
  async getSupport() {
    return this.licenseService.getSupportConfig();
  }

  @Get()
  async getConfig() {
    return this.licenseService.getAllConfig();
  }
}
