import {
  Controller,
  Post,
  Body,
  BadRequestException,
  ForbiddenException,
  Get,
} from '@nestjs/common';
import { InstallService } from './install.service';

@Controller('install')
export class InstallController {
  constructor(private readonly installService: InstallService) {}

  @Get('status')
  async getStatus() {
    return { installed: await this.installService.isInstalled() };
  }

  @Post('check')
  async check(
    @Body() body: { dbUrl: string; redisHost: string; redisPort: number },
  ) {
    await this.ensureNotInstalled();
    const dbCheck = await this.installService.checkDatabase(body.dbUrl);
    const redisCheck = await this.installService.checkRedis(
      body.redisHost,
      body.redisPort,
    );

    return {
      database: dbCheck,
      redis: redisCheck,
      system: await this.installService.checkSystem(),
    };
  }

  @Post('configure')
  async configure(@Body() config: Record<string, string>) {
    await this.ensureNotInstalled();
    await this.installService.writeEnvTemp(config);
    return { success: true, message: 'Temporary configuration saved' };
  }

  @Post('validate')
  async validate() {
    await this.ensureNotInstalled();
    const result = await this.installService.validateConfig();
    if (!result.success) {
      throw new BadRequestException(result.message);
    }
    return result;
  }

  @Post('migrate')
  async migrate() {
    await this.ensureNotInstalled();
    const result = await this.installService.runMigrations();
    if (!result.success) {
      throw new BadRequestException(result.output);
    }
    return result;
  }

  @Post('admin')
  async createAdmin(
    @Body() body: { email: string; password: string; name: string },
  ) {
    await this.ensureNotInstalled();
    await this.installService.createAdmin(body.email, body.password, body.name);
    return { success: true };
  }

  @Post('finish')
  async finish() {
    await this.ensureNotInstalled();
    await this.installService.finalizeInstall();
    return { success: true, message: 'Application successfully installed' };
  }

  private async ensureNotInstalled() {
    if (await this.installService.isInstalled()) {
      throw new ForbiddenException('Application already installed');
    }
  }
}
