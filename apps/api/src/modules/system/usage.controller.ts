import { Controller, Get, UseGuards, Request, Query } from '@nestjs/common';
import { UsageService } from './usage.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';

@Controller('system/usage')
@UseGuards(JwtAuthGuard, TenantGuard)
export class UsageController {
  constructor(private readonly usageService: UsageService) {}

  @Get()
  async getUsage(@Query('workspaceId') workspaceId: string) {
    return this.usageService.getWorkspaceUsageReport(workspaceId);
  }
}
