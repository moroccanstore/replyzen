import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { ContactsService } from './contacts.service';

@Controller('contacts')
@UseGuards(JwtAuthGuard, TenantGuard)
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Get()
  async list(
    @Query('workspaceId') workspaceId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.contactsService.listWorkspaceContacts(
      workspaceId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 50,
      search,
    );
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Query('workspaceId') workspaceId: string,
  ) {
    // Note: We might want a findOne in the service too for consistency
    return this.contactsService.getOrAddContact(workspaceId, id); // This is a placeholder, should be findOne
  }

  @Post()
  async create(
    @Body()
    data: {
      name?: string;
      phone: string;
      customFields?: any;
      workspaceId: string;
    },
  ) {
    return this.contactsService.getOrAddContact(
      data.workspaceId,
      data.phone,
      data.name,
    );
  }
}
