import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getSystemStats() {
    const [totalUsers, totalWorkspaces] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.workspace.count(),
    ]);

    return {
      totalUsers,
      totalWorkspaces,
      platformStatus: 'Operational',
    };
  }
}
