import { Controller, Get, Param, Patch, Sse, UseGuards } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentUser, type RequestUser } from '../auth/current-user.decorator.js';
import { sseStream } from '../realtime/sse.util.js';
import { NotificationsService } from './notifications.service.js';

type NotificationCreatedPayload = { userId: string; notification: object };

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly events: EventEmitter2,
  ) {}

  @Get()
  list(@CurrentUser() user: RequestUser) {
    return this.notificationsService.list(user.userId);
  }

  @Sse('stream')
  stream(@CurrentUser() user: RequestUser) {
    return sseStream<NotificationCreatedPayload>(
      this.events,
      'notification.created',
      (p) => p.userId === user.userId,
      (p) => p.notification,
    );
  }

  @Patch(':id/read')
  markRead(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.notificationsService.markRead(user.userId, id);
  }

  @Patch('read-all')
  markAllRead(@CurrentUser() user: RequestUser) {
    return this.notificationsService.markAllRead(user.userId);
  }
}
