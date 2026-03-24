import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  UseGuards,
  Param,
} from '@nestjs/common';
import { WorkspacesService, UpdateWorkspaceDto } from './workspaces.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { User } from '../../common/decorators/user.decorator';

export class CreateWorkspaceDto {
  name: string;
}

@Controller('workspaces')
@UseGuards(JwtAuthGuard)
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Get('debug/check/:workspaceId')
  @UseGuards(TenantGuard)
  async debugCheck(
    @User('sub') userId: string,
    @Param('workspaceId') workspaceId: string,
  ) {
    const membership = await this.workspacesService.getWorkspaceDetails(
      workspaceId,
      userId,
    );
    return {
      userId,
      workspaceId,
      hasMembership: !!membership,
      membership,
    };
  }

  @Get()
  async getMyWorkspaces(@User('sub') userId: string) {
    return this.workspacesService.getUserWorkspaces(userId);
  }

  @Post()
  async createWorkspace(
    @User('sub') userId: string,
    @Body() data: CreateWorkspaceDto,
  ) {
    return this.workspacesService.createWorkspace(userId, data);
  }

  @Get(':workspaceId')
  @UseGuards(TenantGuard)
  async getWorkspaceDetails(
    @User('sub') userId: string,
    @Param('workspaceId') workspaceId: string,
  ) {
    console.log('Get Workspace Details Request:', { userId, workspaceId });
    return this.workspacesService.getWorkspaceDetails(workspaceId, userId);
  }

  @Patch(':workspaceId')
  @UseGuards(TenantGuard)
  async updateWorkspace(
    @User('sub') userId: string,
    @Param('workspaceId') workspaceId: string,
    @Body() data: UpdateWorkspaceDto,
  ) {
    console.log('Update Workspace Request:', { userId, workspaceId, data });
    return this.workspacesService.updateWorkspace(workspaceId, userId, data);
  }
}
