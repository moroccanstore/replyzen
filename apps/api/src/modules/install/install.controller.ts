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
    await this.ensureNotInstalled();

    if (!body.licenseKey) {
      throw new BadRequestException('License key is required');
    }

    // STEP 2 — WRITE .env FILE
    await this.installService.writeEnvTemp({
      DATABASE_URL: body.dbUrl,
      REDIS_HOST: body.redisHost,
      REDIS_PORT: String(body.redisPort),
      APP_URL: body.appUrl,
      JWT_SECRET: `gen_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    });

    // STEP 3 — RUN SETUP COMMANDS (Migrations & Generate)
    const setupResult = await this.installService.runSetupCommands();
    if (!setupResult.success) {
      throw new BadRequestException(setupResult.output);
    }

    // STEP 4 — ACTIVATE LICENSE (Critical for Elite architecture)
    const activation = await this.licenseService.activate(
      body.licenseKey,
      new URL(body.appUrl).hostname,
    );
    if (!activation.success) {
      throw new BadRequestException(
        `License activation failed: ${activation.message}`,
      );
    }

    // STEP 5, 6 — ADMIN & WORKSPACES
    await this.installService.createAdminAndWorkspaces(
      body.adminEmail,
      body.adminPass,
      body.adminName,
    );

    // STEP 7 — LOCK INSTALLER
    await this.installService.finalizeInstall();

    return {
      success: true,
      message: 'AutoWhats successfully installed!',
    };
  }

  private async ensureNotInstalled() {
    if (await this.installService.isInstalled()) {
      throw new ForbiddenException('Application already installed');
    }
  }
}
