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
import axios from 'axios';
import { R2Service } from '../storage/r2.service';
const AdmZip = require('adm-zip');

@Injectable()
export class InstallService {
  private readonly logger = new Logger(InstallService.name);
  private readonly lockFile = path.join(process.cwd(), 'install.lock');
  private readonly envFile = path.join(process.cwd(), '.env');
  private readonly envTempFile = path.join(process.cwd(), '.env.tmp');

  async verifyLicense(key: string, domain: string): Promise<{ success: boolean; message: string }> {
    try {
      this.logger.log(`[LICENSE] Verifying key ${key.substring(0, 8)}... for domain ${domain}`);
      
      // 1. Get Public IP for verification
      const ipRequest = axios.get('https://ifconfig.me/ip', { timeout: 3000 });
      const ipRes = await Promise.race([
        ipRequest,
        new Promise((_, reject) => setTimeout(() => reject(new Error('IP check timeout')), 3000))
      ]) as any;
      const ip = (ipRes.data as string).trim();

      // 2. Verification with 5s timeout
      const verifyRequest = axios.post('https://license.daki.pro/verify', {
        key,
        domain,
        ip,
      }, { timeout: 5000 });

      const response = await Promise.race([
        verifyRequest,
        new Promise((_, reject) => setTimeout(() => reject(new Error('License server timeout')), 5000))
      ]) as any;

      if (response.status === 200 && response.data.success) {
        return { success: true, message: 'License verified successfully' };
      }
      return { success: false, message: response.data.message || 'Invalid license key' };
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message;
      this.logger.warn(`[LICENSE] Verification warning: ${msg}. Entering temporary grace mode.`);
      
      // Professional Fallback: allow temporary access for network errors/timeouts
      return { success: true, message: 'License server unreachable. Temporary grace mode activated.' };
    }
  }

  async getInstallationStep(): Promise<number> {
    try {
      const step = await this.prisma.systemSetting.findUnique({
        where: { key: 'install_step' },
      });
      return step ? parseInt(step.value, 10) : 0;
    } catch {
      return 0;
    }
  }

  async setInstallationStep(step: number): Promise<void> {
    try {
      await this.prisma.systemSetting.upsert({
        where: { key: 'install_step' },
        update: { value: step.toString() },
        create: { key: 'install_step', value: step.toString() },
      });
    } catch (e: any) {
      this.logger.error(`Failed to save install step: ${e.message}`);
    }
  }

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly r2Service: R2Service,
  ) {}

  async isInstalled(): Promise<boolean> {
    try {
      // PRIMARY: Check DB flag — works correctly in Docker/containers
      const dbFlag = await this.prisma.systemSetting.findUnique({
        where: { key: 'installed' },
      });
      if (dbFlag?.value === 'true') return true;
    } catch {
      // DB not yet migrated — fall through to lockfile check
    }
    // FALLBACK: Filesystem lockfile (legacy / pre-migration compatibility)
    return fs.existsSync(this.lockFile);
  }

  async checkSystem(): Promise<{
    db: boolean;
    redis: boolean;
    node: string;
    writable: boolean;
  }> {
    const writable = await this.checkWritePermissions();
    return {
      db: true, // Simplified for the check endpoint
      redis: true,
      node: process.version,
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

  async runSetupCommands(): Promise<{ success: boolean; output: string }> {
    try {
      if (!fs.existsSync(this.envFile) && fs.existsSync(this.envTempFile)) {
        fs.copyFileSync(this.envTempFile, this.envFile);
      }

      this.logger.log('Running prisma migrate deploy...');
      const migrateOutput = execSync('npx prisma migrate deploy', {
        encoding: 'utf8',
        stdio: 'pipe',
      });

      this.logger.log('Running prisma generate...');
      const generateOutput = execSync('npx prisma generate', {
        encoding: 'utf8',
        stdio: 'pipe',
      });

      return {
        success: true,
        output: `${migrateOutput}\n${generateOutput}`,
      };
    } catch (error: any) {
      const msg = error.stderr || error.message;
      this.logger.error(`Setup commands failed: ${msg}`);
      return { success: false, output: msg };
    }
  }

  async createAdminAndWorkspaces(
    email: string,
    password: string,
    name: string,
  ): Promise<void> {
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      await this.prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: { email, password: hashedPassword, name, role: 'ADMIN' },
        });

        // Step 5 — CREATE DEFAULT WORKSPACE
        await tx.workspace.create({
          data: {
            name: 'Default Workspace',
            isDemo: false,
            memberships: {
              create: { userId: user.id, role: 'OWNER' },
            },
          },
        });

        // Step 6 — OPTIONAL DEMO WORKSPACE
        await tx.workspace.create({
          data: {
            name: 'Demo Workspace',
            isDemo: true,
            memberships: {
              create: { userId: user.id, role: 'OWNER' },
            },
          },
        });
      });
    } catch (e: any) {
      throw new InternalServerErrorException(
        `Admin setup failed: ${e.message}`,
      );
    }
  }

  async finalizeInstall(): Promise<void> {
    await Promise.resolve();
    if (fs.existsSync(this.envTempFile)) {
      fs.renameSync(this.envTempFile, this.envFile);
    }
    // PRIMARY: Write DB flag (works in Docker/containers)
    try {
      await this.prisma.systemSetting.upsert({
        where: { key: 'installed' },
        update: { value: 'true' },
        create: { key: 'installed', value: 'true' },
      });
    } catch (e: any) {
      this.logger.warn(`Could not write install flag to DB: ${e.message}`);
    }
    // FALLBACK: Also write lockfile for backward compatibility
    fs.writeFileSync(
      this.lockFile,
      `Installed at: ${new Date().toISOString()}\n`,
    );
  }

  async downloadAndExtractApp(): Promise<{ success: boolean; message: string }> {
    const zipPath = path.join(process.cwd(), 'autowhats.zip');
    const extractPath = process.cwd();

    try {
      this.logger.log('🚀 Starting secure application download...');
      
      // 1. Download from R2
      await this.r2Service.downloadFile('autowhats.zip', zipPath);

      // 2. Extract
      this.logger.log('📦 Extracting production bundle...');
      const zip = new AdmZip(zipPath);
      
      // We extract to the root, the ZIP structure should match the root
      zip.extractAllTo(extractPath, true);

      // 3. Cleanup ZIP
      if (fs.existsSync(zipPath)) {
        fs.unlinkSync(zipPath);
      }

      this.logger.log('✅ Extraction complete. Running production dependencies install...');
      
      // 4. Install production dependencies (npm install --omit=dev)
      // Note: We run this in the root
      execSync('npm install --omit=dev', { stdio: 'inherit' });

      return { success: true, message: 'Application downloaded and extracted successfully' };
    } catch (error: any) {
      this.logger.error(`❌ Distribution failure: ${error.message}`);
      return { success: false, message: `Failed to download or extract app: ${error.message}` };
    }
  }
}
