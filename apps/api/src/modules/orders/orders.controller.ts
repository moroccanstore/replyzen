/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
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
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';

@Controller('orders')
@UseGuards(JwtAuthGuard, TenantGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(
    @Query('workspaceId') workspaceId: string,
    @Body() createOrderDto: any,
  ) {
    return this.ordersService.create(workspaceId, createOrderDto);
  }

  @Get()
  findAll(@Query('workspaceId') workspaceId: string) {
    return this.ordersService.findAll(workspaceId);
  }

  @Get(':id')
  findOne(@Query('workspaceId') workspaceId: string, @Param('id') id: string) {
    return this.ordersService.findOne(workspaceId, id);
  }

  @Patch(':id')
  update(
    @Query('workspaceId') workspaceId: string,
    @Param('id') id: string,
    @Body() updateOrderDto: any,
  ) {
    return this.ordersService.update(workspaceId, id, updateOrderDto);
  }

  @Delete(':id')
  remove(@Query('workspaceId') workspaceId: string, @Param('id') id: string) {
    return this.ordersService.remove(workspaceId, id);
  }
}
