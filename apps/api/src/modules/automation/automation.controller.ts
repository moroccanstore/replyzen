import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { AutomationService } from './automation.service';

@Controller('workspaces/:workspaceId/automation')
@UseGuards(JwtAuthGuard, TenantGuard)
export class AutomationController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly automationService: AutomationService,
  ) {}

  @Get()
  async findAll(@Param('workspaceId') workspaceId: string) {
    return this.prisma.automation.findMany({
      where: { workspaceId },
      orderBy: { priority: 'desc' },
    });
  }

  @Post()
  async create(
    @Param('workspaceId') workspaceId: string,
    @Body() data: { keywords: string[]; reply: string; priority?: number },
  ) {
    const result = await this.prisma.automation.create({
      data: {
        workspaceId,
        keywords: data.keywords,
        reply: data.reply,
        priority: data.priority || 0,
        isActive: true,
      },
    });
    // Invalidate Redis cache so next evaluation uses the new rule
    await this.automationService.invalidateCache(workspaceId);
    return result;
  }

  @Patch(':id')
  async update(
    @Param('workspaceId') workspaceId: string,
    @Param('id') id: string,
    @Body()
    data: {
      keywords?: string[];
      reply?: string;
      priority?: number;
      isActive?: boolean;
    },
  ) {
    const result = await this.prisma.automation.update({
      where: { id, workspaceId },
      data,
    });
    await this.automationService.invalidateCache(workspaceId);
    return result;
  }

  @Delete(':id')
  async remove(
    @Param('workspaceId') workspaceId: string,
    @Param('id') id: string,
  ) {
    await this.prisma.automation.delete({ where: { id, workspaceId } });
    await this.automationService.invalidateCache(workspaceId);
    return { success: true };
  }
}
