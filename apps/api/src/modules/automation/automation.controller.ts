import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';

@Controller('workspaces/:workspaceId/automation')
@UseGuards(JwtAuthGuard, TenantGuard)
export class AutomationController {
  constructor(private readonly prisma: PrismaService) {}

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
    return this.prisma.automation.create({
      data: {
        workspaceId,
        keywords: data.keywords,
        reply: data.reply,
        priority: data.priority || 0,
        isActive: true,
      },
    });
  }

  @Patch(':id')
  async update(
    @Param('workspaceId') workspaceId: string,
    @Param('id') id: string,
    @Body() data: { keywords?: string[]; reply?: string; priority?: number; isActive?: boolean },
  ) {
    return this.prisma.automation.update({
      where: { id, workspaceId },
      data,
    });
  }

  @Delete(':id')
  async remove(@Param('workspaceId') workspaceId: string, @Param('id') id: string) {
    await this.prisma.automation.delete({
      where: { id, workspaceId },
    });
    return { success: true };
  }
}
