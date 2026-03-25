import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';

/**
 * ELITE: Type-safe configuration shape
 */
export interface RemoteConfig {
  system: {
    enabled: boolean;
    maintenance?: boolean;
  };
  features: Record<string, boolean>;
  limits?: Record<string, number>;
  metadata?: Record<string, any>;
}

@Injectable()
export class LicenseService implements OnApplicationBootstrap {
  private readonly logger = new Logger(LicenseService.name);
  private readonly apiUrl = 'https://licence.daki.pro/api';

  /**
   * PERFORMANCE: In-memory cache for configuration
   */
  private cachedConfig: RemoteConfig | null = null;

  /**
   * STABILITY: Safe fallback config
   */
  private readonly DEFAULT_CONFIG: RemoteConfig = {
    system: { enabled: true },
    features: { ai: true },
    limits: {},
  };

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async onApplicationBootstrap() {
    this.logger.log('Checking license on startup...');
    try {
      // Warm up cache
      await this.loadConfigIntoMemory();

      const license = await this.prisma.license.findFirst();

      /**
       * ELITE: Strict Startup Validation
       */
      if (!license || !license.config) {
        const errorMsg = '[CRITICAL] System not initialized. Please run the installer or activate your license.';
        this.logger.error(errorMsg);
        // In production, we might want to throw this to prevent app start
        // throw new Error(errorMsg);
      }

      await this.validate();
    } catch (error: any) {
      this.logger.error(`[LICENSE] Startup check failed: ${error.message}`);
    }
  }

  /**
   * Loads config from DB into cache with fallback
   */
  private async loadConfigIntoMemory() {
    try {
      const license = await this.prisma.license.findFirst();
      const dbConfig = license?.config as unknown as RemoteConfig;
      
      if (this.validateConfig(dbConfig)) {
        this.cachedConfig = dbConfig;
      } else {
        this.cachedConfig = this.DEFAULT_CONFIG;
        this.logger.warn('[CONFIG] Using default fallback config (DB data invalid or missing)');
      }
    } catch (e) {
      this.cachedConfig = this.DEFAULT_CONFIG;
    }
  }

  /**
   * VALIDATION: Ensure config structure is valid
   */
  private validateConfig(config: any): config is RemoteConfig {
    if (!config || typeof config !== 'object') return false;
    // Critical fields required for system stability
    if (!config.system) return false;
    if (!config.features) return false;
    return true;
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    this.logger.log('Running daily license validation...');
    await this.validate();
  }

  async activate(key: string, domain?: string) {
    const activeDomain = domain || this.getCurrentDomain();
    try {
      const response = await axios.post(`${this.apiUrl}/activate`, {
        key,
        domain: activeDomain,
        product: 'autowhats',
      });

      const { token, config, configHash } = response.data;
      const normalizedDomain = activeDomain.toLowerCase();

      // Validate new config before storing
      const finalConfig = this.validateConfig(config) ? config : (await this.getAllConfig());

      await this.prisma.license.upsert({
        where: { key },
        update: {
          token,
          domain: normalizedDomain,
          lastValidatedAt: new Date(),
          status: 'VALID',
          graceExpiresAt: null,
          config: finalConfig as any,
          configHash: configHash || null,
          supportEmail: response.data.support?.email,
          supportWhatsapp: response.data.support?.whatsapp,
        },
        create: {
          key,
          token,
          domain: normalizedDomain,
          lastValidatedAt: new Date(),
          status: 'VALID',
          config: finalConfig as any,
          configHash: configHash || null,
          supportEmail: response.data.support?.email,
          supportWhatsapp: response.data.support?.whatsapp,
        },
      });

      this.cachedConfig = finalConfig;
      this.logger.log('[LICENSE] Activated');
      this.logger.log('[CONFIG] Updated');
      return { success: true };
    } catch (error: any) {
      this.logger.error(`[LICENSE] Activation failed: ${error.message}`);
      return {
        success: false,
        message:
          error.response?.data?.message || (error as Error).message,
      };
    }
  }

  async validate() {
    const license = await this.prisma.license.findFirst();
    if (!license) return;

    /**
     * PROFESSIONAL: 24h Caching Logic
     * Avoid redundant pings and handle server downtime gracefully.
     */
    const now = new Date();
    const lastValidated = license.lastValidatedAt;
    const diffHours = (now.getTime() - lastValidated.getTime()) / (1000 * 60 * 60);

    if (diffHours < 24 && license.status === 'VALID') {
      this.logger.log('[LICENSE] Using cached validation (Last checked < 24h ago)');
      return;
    }

    try {
      const response = await axios.post(`${this.apiUrl}/validate-key`, {
        token: license.token,
        domain: license.domain,
        // Send current hash to server to check override
        currentHash: (license as any).configHash,
      }, { timeout: 10000 });

      if (response.status === 200) {
        const { config, configHash } = response.data;
        
        /**
         * ELITE: Optimized updates via Hash Check
         */
        const hasChanges = configHash && configHash !== (license as any).configHash;
        const valid = this.validateConfig(config);

        if (!hasChanges) {
          this.logger.log('[LICENSE] Validation success (No config changes)');
          // Only update transit status fields, skip config/hash rewrite
          await this.prisma.license.update({
            where: { id: license.id },
            data: {
              lastValidatedAt: new Date(),
              status: 'VALID',
              graceExpiresAt: null,
            },
          });
          return;
        }

        await this.prisma.license.update({
          where: { id: license.id },
          data: {
            lastValidatedAt: new Date(),
            status: 'VALID',
            graceExpiresAt: null,
            config: (valid ? config : license.config) as any,
            configHash: configHash || (license as any).configHash,
            supportEmail: response.data.support?.email,
            supportWhatsapp: response.data.support?.whatsapp,
          },
        });

        if (valid) {
          this.cachedConfig = config;
          this.logger.log('[CONFIG] Updated (Hash changed)');
        }

        this.logger.log('[LICENSE] Validation success');
      }
    } catch (error: any) {
      const status = error.response?.status;

      if (status === 401) {
        this.logger.warn(
          '[LICENSE] Token invalid, attempting re-activation...',
        );
        const result = await this.activate(license.key, license.domain);
        if (result.success) {
          this.logger.log('[LICENSE] Re-activated');
        } else {
          this.logger.error('[LICENSE] Re-activation failed');
        }
      } else if (status === 403) {
        await this.prisma.license.update({
          where: { id: license.id },
          data: { status: 'BLOCKED' },
        });
        this.logger.error('[LICENSE] System blocked (Remote 403)');
      } else {
        // Network or Server error
        this.logger.warn(
          `[LICENSE] Validation failed (${error.message}) -> Falling back to cached VALID state (Grace Mode).`,
        );
        // We stay VALID but don't update lastValidatedAt, so we'll try again next time.
      }
    }
  }

  private getCurrentDomain(): string {
    const appUrl = this.configService.get<string>('APP_URL') || 'localhost';
    try {
      const url = new URL(appUrl);
      return url.hostname.toLowerCase();
    } catch {
      return appUrl.toLowerCase();
    }
  }

  async getStatus(): Promise<string> {
    try {
      const license = await this.prisma.license.findFirst();
      if (!license) return 'MISSING';
      
      if (license.status === 'BLOCKED') return 'BLOCKED';

      // 48h Grace Mode Logic
      const now = Date.now();
      const lastValidated = license.lastValidatedAt.getTime();
      const diffHours = (now - lastValidated) / (1000 * 60 * 60);

      // 7-day offline grace period — prevents license server downtime from killing instances
      if (diffHours > 168) {
        if (license.status !== 'BLOCKED') {
          this.logger.error(`[LICENSE] Grace period exceeded (7 days). System blocked.`);
          await this.prisma.license.update({
            where: { id: license.id },
            data: { status: 'BLOCKED' },
          });
        }
        return 'BLOCKED';
      }

      if (diffHours > 144) {
        this.logger.warn(`[LICENSE] Grace mode active (${Math.round(diffHours)}h since last validation — 7 day limit)`);
        return 'GRACE';
      }
      
      return license.status;
    } catch (e: any) {
      this.logger.error(`Failed to get license status: ${e.message}`);
      return 'VALID';
    }
  }

  async isLicenseValid(): Promise<boolean> {
    const status = await this.getStatus();
    return status === 'VALID' || status === 'GRACE';
  }

  /**
   * PERFORMANCE: Get configuration from in-memory cache
   */
  async getConfig<T>(key: string, defaultValue?: T): Promise<T | undefined> {
    if (!this.cachedConfig) {
      await this.loadConfigIntoMemory();
    }
    const val = (this.cachedConfig as any)[key];
    return val !== undefined ? val : defaultValue;
  }

  async getAllConfig(): Promise<any> {
    if (!this.cachedConfig) {
      await this.loadConfigIntoMemory();
    }
    return this.cachedConfig;
  }

  async getSupportConfig() {
    try {
      const license = await this.prisma.license.findFirst();
      return {
        email: license?.supportEmail || 'contact@daki.pro',
        whatsapp: license?.supportWhatsapp || 'Coming soon',
      };
    } catch (e) {
      return {
        email: 'contact@daki.pro',
        whatsapp: 'Coming soon',
      };
    }
  }
}
