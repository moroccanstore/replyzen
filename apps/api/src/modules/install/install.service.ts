import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { Redis } from 'ioredis';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import * as bcrypt from 'bcrypt';

@Injectable()
export class InstallService {
  private readonly logger = new Logger(InstallService.name);
  private readonly lockFile = path.join(process.cwd(), 'installed.lock');
  private readonly envFile = path.join(process.cwd(), '.env');
  private readonly envTempFile = path.join(process.cwd(), '.env.tmp');

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async isInstalled(): Promise<boolean> {
    return fs.existsSync(this.lockFile);
  }

  async checkSystem(): Promise<{
    db: boolean;
    redis: boolean;
    writable: boolean;
  }> {
    const writable = await this.checkWritePermissions();
    return {
      db: false, // Placeholder for checking current env
      redis: false,
      writable,
    };
  }

  private async checkWritePermissions(): Promise<boolean> {
    try {
      const testFile = path.join(process.cwd(), '.write-test');
      fs.writeFileSync(testFile, 'test');
      fs.unlinkSync(testFile);
      return true;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      this.logger.error(`Write permission check failed: ${message}`);
      return false;
    }
  }

  async checkDatabase(
    url: string,
  ): Promise<{ success: boolean; message: string }> {
    const prisma = new PrismaClient({
      datasourceUrl: url,
    } as any);

    try {
      await prisma.$connect();
      await prisma.$disconnect();
      return { success: true, message: 'Database connection successful' };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      return { success: false, message: `Database check failed: ${msg}` };
    }
  }

  async checkRedis(
    host: string,
    port: number,
  ): Promise<{ success: boolean; message: string }> {
    const redis = new Redis({
      host,
      port,
      maxRetriesPerRequest: 1,
      connectTimeout: 5000,
    });
    try {
      await new Promise<void>((resolve, reject) => {
        redis.on('connect', resolve);
        redis.on('error', reject);
        setTimeout(() => reject(new Error('Redis connection timeout')), 5000);
      });
      await redis.quit();
      return { success: true, message: 'Redis connection successful' };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      return { success: false, message: `Redis check failed: ${msg}` };
    }
  }

  async writeEnvTemp(config: Record<string, string>): Promise<void> {
    await Promise.resolve(); // Satisfy async
    const allowedKeys = [
      'DATABASE_URL',
      'REDIS_HOST',
      'REDIS_PORT',
      'JWT_SECRET',
      'APP_URL',
      'WHATSAPP_PHONE_ID',
      'WHATSAPP_TOKEN',
    ];

    let content = '';
    if (fs.existsSync(this.envFile)) {
      content = fs.readFileSync(this.envFile, 'utf8');
    }

    for (const [key, value] of Object.entries(config)) {
      if (!allowedKeys.includes(key)) continue;

      const regex = new RegExp(`^${key}=.*`, 'm');
      if (content.match(regex)) {
        content = content.replace(regex, `${key}=${value}`);
      } else {
        content += `${key}=${value}\n`;
      }
    }

    fs.writeFileSync(this.envTempFile, content.trim() + '\n');
  }

  async validateConfig(): Promise<{ success: boolean; message: string }> {
    await Promise.resolve();
    if (!fs.existsSync(this.envTempFile)) {
      return { success: false, message: 'Temporary config not found' };
    }

    const content = fs.readFileSync(this.envTempFile, 'utf8');
    const dbMatch = content.match(/^DATABASE_URL=(.*)$/m);
    const redisHostMatch = content.match(/^REDIS_HOST=(.*)$/m);
    const redisPortMatch = content.match(/^REDIS_PORT=(.*)$/m);

    if (!dbMatch || !redisHostMatch || !redisPortMatch) {
      return {
        success: false,
        message: 'Missing critical config in temp file',
      };
    }

    const dbCheck = await this.checkDatabase(dbMatch[1].trim());
    if (!dbCheck.success) return dbCheck;

    const redisCheck = await this.checkRedis(
      redisHostMatch[1].trim(),
      parseInt(redisPortMatch[1].trim(), 10),
    );
    return redisCheck;
  }

  async runMigrations(): Promise<{ success: boolean; output: string }> {
    await Promise.resolve();
    try {
      // Temporarily use the .env.tmp for migration if .env doesn't exist
      if (!fs.existsSync(this.envFile) && fs.existsSync(this.envTempFile)) {
        fs.copyFileSync(this.envTempFile, this.envFile);
      }

      const output = execSync('npx prisma migrate deploy', {
        encoding: 'utf8',
        stdio: 'pipe',
      });
      return { success: true, output };
    } catch (error: unknown) {
      const msg = error instanceof Error ? (error as any).stderr || error.message : String(error);
      this.logger.error(`Migration failed: ${msg}`);
      return { success: false, output: msg };
    }
  }

  async createAdmin(
    email: string,
    password: string,
    name: string,
  ): Promise<void> {
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      await this.prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: { email, password: hashedPassword, name, role: 'OWNER' },
        });

        const workspace = await tx.workspace.create({
          data: { name: `${name}'s Workspace`, plan: 'PRO' },
        });

        await tx.membership.create({
          data: { userId: user.id, workspaceId: workspace.id, role: 'OWNER' },
        });
      });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      throw new InternalServerErrorException(
        `Admin creation failed: ${message}`,
      );
    }
  }

  async finalizeInstall(): Promise<void> {
    await Promise.resolve();
    if (fs.existsSync(this.envTempFile)) {
      fs.renameSync(this.envTempFile, this.envFile);
    }
    fs.writeFileSync(
      this.lockFile,
      `Installed at: ${new Date().toISOString()}\n`,
    );
  }
}
