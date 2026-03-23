import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { User } from '../../common/decorators/user.decorator';

@Controller('workspaces/:workspaceId/campaigns')
@UseGuards(JwtAuthGuard, TenantGuard)
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Post()
  async create(
    @Param('workspaceId') workspaceId: string,
    @User('sub') userId: string,
    @Body() data: any,
  ) {
    return this.campaignsService.createCampaign(workspaceId, data);
  }

  @Post(':id/launch')
  async launchCampaign(
    @Param('workspaceId') workspaceId: string,
    @Param('id') campaignId: string,
  ) {
    return this.campaignsService.launchCampaign(workspaceId, campaignId);
  }
}
