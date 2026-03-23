import { Controller, Post, Body, Get, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { LicenseService } from './license.service';

@Controller('license')
export class LicenseController {
  constructor(private readonly licenseService: LicenseService) {}

  @Post('activate')
  async activate(@Body() body: { purchaseCode: string; domain: string }) {
    return this.licenseService.activate(body.purchaseCode, body.domain);
  }

  @Post('validate')
  async validate(@Body() body: { licenseKey: string; domain: string }) {
    return this.licenseService.validate(body.licenseKey, body.domain);
  }

  @Get('update')
  async checkUpdate(@Query('version') version: string) {
    return this.licenseService.checkUpdate(version);
  }
}
