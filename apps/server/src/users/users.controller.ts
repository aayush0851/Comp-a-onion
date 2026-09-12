import { Body, Controller, Delete, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentUser, type RequestUser } from '../auth/current-user.decorator.js';
import { UsersService } from './users.service.js';
import { UpdateUserDto } from './dto/update-user.dto.js';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  me(@CurrentUser() user: RequestUser) {
    return this.usersService.findMe(user.userId);
  }

  @Patch('me')
  updateMe(@CurrentUser() user: RequestUser, @Body() dto: UpdateUserDto) {
    return this.usersService.updateMe(user.userId, dto);
  }

  @Delete('me')
  deleteMe(@CurrentUser() user: RequestUser) {
    return this.usersService.archiveMe(user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findPublicProfile(id);
  }
}
