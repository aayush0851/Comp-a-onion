import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { NotificationsModule } from '../notifications/notifications.module.js';
import { JoinRequestsController } from './join-requests.controller.js';
import { JoinRequestsService } from './join-requests.service.js';

@Module({
  imports: [AuthModule, NotificationsModule],
  controllers: [JoinRequestsController],
  providers: [JoinRequestsService],
  exports: [JoinRequestsService],
})
export class JoinRequestsModule {}
