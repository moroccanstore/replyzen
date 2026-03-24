/**
 * PRE-DEPLOYMENT:
 * Run `npx prisma migrate status` to ensure DB schema is in sync.
 */
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
