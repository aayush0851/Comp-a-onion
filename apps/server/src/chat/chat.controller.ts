import { Body, Controller, Get, Param, Post, Query, Sse, UseGuards } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentUser, type RequestUser } from '../auth/current-user.decorator.js';
import { sseStream } from '../realtime/sse.util.js';
import { ChatService } from './chat.service.js';
import { SendMessageDto } from './dto/send-message.dto.js';

type EventMessagePayload = { eventId: string; message: object };
type DmPayload = { participantIds: [string, string]; message: object };

@Controller()
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly events: EventEmitter2,
  ) {}

  @Post('events/:id/messages')
  sendEventMessage(@CurrentUser() user: RequestUser, @Param('id') eventId: string, @Body() dto: SendMessageDto) {
    return this.chatService.sendEventMessage(eventId, user.userId, dto.text);
  }

  @Get('events/:id/messages')
  listEventMessages(@Param('id') eventId: string, @Query('after') after?: string) {
    return this.chatService.listEventMessages(eventId, after);
  }

  @Sse('events/:id/messages/stream')
  streamEventMessages(@Param('id') eventId: string) {
    return sseStream<EventMessagePayload>(
      this.events,
      'chat.eventMessage',
      (p) => p.eventId === eventId,
      (p) => p.message,
    );
  }

  @Post('users/:id/dm')
  sendDm(@CurrentUser() user: RequestUser, @Param('id') peerId: string, @Body() dto: SendMessageDto) {
    return this.chatService.sendDm(user.userId, peerId, dto.text);
  }

  @Get('users/:id/dm')
  listDmThread(@CurrentUser() user: RequestUser, @Param('id') peerId: string) {
    return this.chatService.listDmThread(user.userId, peerId);
  }

  @Sse('users/:id/dm/stream')
  streamDm(@CurrentUser() user: RequestUser, @Param('id') peerId: string) {
    return sseStream<DmPayload>(
      this.events,
      'chat.dm',
      (p) => p.participantIds.includes(user.userId) && p.participantIds.includes(peerId),
      (p) => p.message,
    );
  }

  @Get('users/me/dm-threads')
  listDmThreads(@CurrentUser() user: RequestUser) {
    return this.chatService.listDmThreads(user.userId);
  }
}
