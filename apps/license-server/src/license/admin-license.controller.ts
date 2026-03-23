import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { LicenseService } from './license.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('admin/license')
export class AdminLicenseController {
  constructor(
    private readonly licenseService: LicenseService,
    private readonly prisma: PrismaService
  ) {}

  @Get()
  async listLicenses(@Query('search') search?: string) {
    return (this.prisma as any).license.findMany({
      where: search ? {
        OR: [
          { purchaseCode: { contains: search, mode: 'insensitive' } },
          { domain: { contains: search, mode: 'insensitive' } },
        ]
      } : {},
      include: {
        _count: {
          select: { activations: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  @Post(':id/revoke')
  async revokeLicense(@Param('id') id: string) {
    return (this.prisma as any).license.update({
      where: { id },
      data: { status: 'REVOKED' }
    });
  }

  @Post(':id/restore')
  async restoreLicense(@Param('id') id: string) {
    return (this.prisma as any).license.update({
      where: { id },
      data: { status: 'ACTIVE' }
    });
  }

  @Get('stats')
  async getStats() {
    const [total, active, revoked] = await Promise.all([
      (this.prisma as any).license.count(),
      (this.prisma as any).license.count({ where: { status: 'ACTIVE' } }),
      (this.prisma as any).license.count({ where: { status: 'REVOKED' } }),
    ]);

    return { total, active, revoked };
  }
}
