import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ConversationStatus } from '@prisma/client';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { ConversationsService } from './conversations.service';

@Controller('conversations')
@UseGuards(JwtAuthGuard, TenantGuard)
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Get()
  async list(@Query('workspaceId') workspaceId: string) {
    return this.conversationsService.listConversations(workspaceId);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Query('workspaceId') workspaceId: string,
  ) {
    return this.conversationsService.getConversationDetails(workspaceId, id);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: ConversationStatus,
    @Body('workspaceId') workspaceId: string,
  ) {
    return this.conversationsService.updateConversationStatus(
      workspaceId,
      id,
      status,
    );
  }

  @Post(':id/read')
  async markAsRead(
    @Param('id') id: string,
    @Body('workspaceId') workspaceId: string,
  ) {
    return this.conversationsService.markAsRead(workspaceId, id);
  }

  @Patch(':id/assign')
  async assign(
    @Param('id') id: string,
    @Body('agentId') agentId: string,
    @Body('workspaceId') workspaceId: string,
  ) {
    return this.conversationsService.assignToAgent(workspaceId, id, agentId);
  }
}
