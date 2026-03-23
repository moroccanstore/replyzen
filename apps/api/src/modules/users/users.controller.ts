import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { User } from '../../common/decorators/user.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getProfile(@User('sub') userId: string) {
    return this.usersService.getProfile(userId);
  }

  @Put('me')
  async updateProfile(@User('sub') userId: string, @Body() data: any) {
    return this.usersService.updateProfile(userId, data);
  }
}
