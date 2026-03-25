import {
  Controller,
  Post,
  Body,
  BadRequestException,
  ForbiddenException,
  Get,
} from '@nestjs/common';
import { InstallService } from './install.service';
import { LicenseService } from '../system/license.service';

@Controller('install')
export class InstallController {
  constructor(
    private readonly installService: InstallService,
    private readonly licenseService: LicenseService,
  ) {}

  @Get('check')
  async systemCheck() {
    await this.ensureNotInstalled();
    return this.installService.checkSystem();
  }

  @Post()
  async install(
    @Body()
    body: {
      dbUrl: string;
      redisHost: string;
      redisPort: number;
      appUrl: string;
      adminEmail: string;
      adminPass: string;
      adminName: string;
      licenseKey: string;
    },
  ) {
    if (await this.installService.isInstalled()) {
      throw new BadRequestException('System already installed');
    }

    const currentStep = await this.installService.getInstallationStep();

    if (!body.licenseKey) {
      throw new BadRequestException('License key is required');
    }

    // STEP 1 — VERIFY LICENSE
    if (currentStep < 1) {
      const licenseCheck = await this.installService.verifyLicense(
        body.licenseKey,
        new URL(body.appUrl).hostname,
      );
      if (!licenseCheck.success) {
        throw new BadRequestException(licenseCheck.message);
      }
      await this.installService.setInstallationStep(1);
    }

    // STEP 2 — SECURE DOWNLOAD & EXTRACTION (NEW)
    if (currentStep < 2) {
      const download = await this.installService.downloadAndExtractApp();
      if (!download.success) {
        throw new BadRequestException(download.message);
      }
      await this.installService.setInstallationStep(2);
    }

    // STEP 3 — CONFIGURE SYSTEM (.env & Encryption)
    if (currentStep < 3) {
      await this.installService.writeEnvTemp({
        DATABASE_URL: body.dbUrl,
        REDIS_HOST: body.redisHost,
        REDIS_PORT: String(body.redisPort),
        APP_URL: body.appUrl,
        JWT_SECRET: `gen_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        ENCRYPTION_KEY: `enc_${Date.now()}_${Math.random().toString(36).substring(7).padEnd(20, '0')}`.substring(0, 32),
      });
      await this.installService.setInstallationStep(3);
    }

    // STEP 4 — DATABASE SETUP (Migrations)
    if (currentStep < 4) {
      const setupResult = await this.installService.runSetupCommands();
      if (!setupResult.success) {
        throw new BadRequestException(setupResult.output);
      }
      await this.installService.setInstallationStep(4);
    }

    // STEP 5 — LICENSE ACTIVATION (Token Exchange)
    if (currentStep < 5) {
      const activation = await this.licenseService.activate(
        body.licenseKey,
        new URL(body.appUrl).hostname,
      );
      if (!activation.success) {
        throw new BadRequestException(
          `License activation failed: ${activation.message}`,
        );
      }
      await this.installService.setInstallationStep(5);
    }

    // STEP 6 — ADMIN CREATION
    if (currentStep < 6) {
      await this.installService.createAdminAndWorkspaces(
        body.adminEmail,
        body.adminPass,
        body.adminName,
      );
      await this.installService.setInstallationStep(6);
    }

    // FINAL — LOCK & CLEANUP
    await this.installService.finalizeInstall();

    return {
      success: true,
      message: 'AutoWhats successfully installed and locked!',
    };
  }

  private async ensureNotInstalled() {
    if (await this.installService.isInstalled()) {
      throw new ForbiddenException('Application already installed');
    }
  }
}
