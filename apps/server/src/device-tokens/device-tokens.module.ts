import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { DeviceTokensController } from './device-tokens.controller.js';
import { DeviceTokensService } from './device-tokens.service.js';

@Module({
  imports: [AuthModule],
  controllers: [DeviceTokensController],
  providers: [DeviceTokensService],
})
export class DeviceTokensModule {}
