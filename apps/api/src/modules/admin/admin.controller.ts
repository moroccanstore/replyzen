import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Throttle } from '@nestjs/throttler';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  async getStats() {
    return this.adminService.getSystemStats();
  }

  @Get('dlq')
  async getDlq(@Query('status') status?: string) {
    return this.adminService.getFailedJobs(status);
  }

  @Post('dlq/:id/retry')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async retryJob(@Param('id') id: string) {
    return this.adminService.retryFailedJob(id);
  }
}
