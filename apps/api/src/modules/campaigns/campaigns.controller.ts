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

  @Get()
  async findAll(@Param('workspaceId') workspaceId: string) {
    return this.campaignsService.findAll(workspaceId);
  }

  @Post(':id/launch')
  async launchCampaign(
    @Param('workspaceId') workspaceId: string,
    @Param('id') campaignId: string,
  ) {
    return this.campaignsService.launchCampaign(workspaceId, campaignId);
  }

  @Delete(':id')
  async remove(
    @Param('workspaceId') workspaceId: string,
    @Param('id') campaignId: string,
  ) {
    return this.campaignsService.remove(workspaceId, campaignId);
  }
}
