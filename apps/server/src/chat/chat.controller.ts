import { Body, Controller, Get, Param, Post, Query, Sse, UseGuards } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { CurrentUser, type RequestUser } from '../common/decorators/current-user.decorator.js';
import { sseStream } from '../realtime/sse.util.js';
import { ChatService } from './chat.service.js';
import { SendMessageDto } from './dto/send-message.dto.js';

type PostMessagePayload = { postId: string; message: object };
type DmPayload = { participantIds: [string, string]; message: object };

@Controller()
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly posts: EventEmitter2,
  ) {}

  @Post('posts/:id/messages')
  sendPostMessage(@CurrentUser() user: RequestUser, @Param('id') postId: string, @Body() dto: SendMessageDto) {
    return this.chatService.sendPostMessage(postId, user.userId, dto.text);
  }

  @Get('posts/:id/messages')
  listPostMessages(@Param('id') postId: string, @Query('after') after?: string) {
    return this.chatService.listPostMessages(postId, after);
  }

  @Sse('posts/:id/messages/stream')
  streamPostMessages(@Param('id') postId: string) {
    return sseStream<PostMessagePayload>(
      this.posts,
      'chat.postMessage',
      (p) => p.postId === postId,
      (p) => p.message,
    );
  }

  @Get('chat/post-threads')
  listPostThreads(@CurrentUser() user: RequestUser) {
    return this.chatService.listPostThreads(user.userId);
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
      this.posts,
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
