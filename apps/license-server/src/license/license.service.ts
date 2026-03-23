import { Injectable, Logger, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class LicenseService {
  private readonly logger = new Logger(LicenseService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Activates a license for a specific domain.
   */
  async activate(purchaseCode: string, domain: string) {
    const normalizedDomain = this.normalizeDomain(domain);

    // 1. Check if license exists or is already used
    let license = await (this.prisma as any).license.findUnique({
      where: { purchaseCode },
    });

    if (license) {
      if (license.status === 'REVOKED') {
        throw new BadRequestException('This purchase code has been revoked.');
      }
      if (license.domain && license.domain !== normalizedDomain) {
        throw new ConflictException(`This purchase code is already locked to ${license.domain}`);
      }
    } else {
      // 2. Mock: In a real app, verify with Envato API here
      // For this demo, we'll just create it.
      const licenseKey = this.generateLicenseKey();
      license = await (this.prisma as any).license.create({
        data: {
          purchaseCode,
          licenseKey,
          domain: normalizedDomain,
          status: 'ACTIVE',
        },
      });
    }

    // 3. Log activation
    await (this.prisma as any).activation.create({
      data: {
        licenseId: license.id,
        domain: normalizedDomain,
      },
    });

    return {
      status: 'success',
      licenseKey: license.licenseKey,
      domain: normalizedDomain,
    };
  }

  /**
   * Validates an existing license heartbeat.
   */
  async validate(licenseKey: string, domain: string) {
    const normalizedDomain = this.normalizeDomain(domain);

    const license = await (this.prisma as any).license.findUnique({
      where: { licenseKey },
    });

    if (!license || license.status !== 'ACTIVE') {
      return { status: 'invalid', message: 'License revoked or not found' };
    }

    if (license.domain !== normalizedDomain) {
      return { status: 'invalid', message: 'Domain mismatch' };
    }

    // Update last ping
    await (this.prisma as any).license.update({
      where: { id: license.id },
      data: { lastCheckAt: new Date() },
    });

    return { status: 'valid' };
  }

  /**
   * Checks for app updates.
   */
  async checkUpdate(currentVersion: string) {
    const latest = await (this.prisma as any).appVersion.findFirst({
      orderBy: { releasedAt: 'desc' },
    });

    if (!latest) return { hasUpdate: false };

    return {
      hasUpdate: latest.version !== currentVersion,
      latestVersion: latest.version,
      changelog: latest.changelog,
      downloadUrl: latest.downloadUrl,
    };
  }

  private normalizeDomain(domain: string): string {
    return domain.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
  }

  private generateLicenseKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}
