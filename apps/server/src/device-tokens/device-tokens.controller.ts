import { Body, Controller, Delete, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentUser, type RequestUser } from '../auth/current-user.decorator.js';
import { DeviceTokensService } from './device-tokens.service.js';
import { RegisterTokenDto } from './dto/register-token.dto.js';

@Controller('device-tokens')
@UseGuards(JwtAuthGuard)
export class DeviceTokensController {
  constructor(private readonly deviceTokensService: DeviceTokensService) {}

  @Post()
  register(@CurrentUser() user: RequestUser, @Body() dto: RegisterTokenDto) {
    return this.deviceTokensService.register(user.userId, dto.platform, dto.pushToken);
  }

  @Delete(':id')
  unregister(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.deviceTokensService.unregister(user.userId, id);
  }
}
