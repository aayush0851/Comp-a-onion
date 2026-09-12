import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentUser, type RequestUser } from '../auth/current-user.decorator.js';
import { ChatService } from './chat.service.js';
import { SendMessageDto } from './dto/send-message.dto.js';

@Controller()
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('events/:id/messages')
  sendEventMessage(@CurrentUser() user: RequestUser, @Param('id') eventId: string, @Body() dto: SendMessageDto) {
    return this.chatService.sendEventMessage(eventId, user.userId, dto.text);
  }

  @Get('events/:id/messages')
  listEventMessages(@Param('id') eventId: string, @Query('after') after?: string) {
    return this.chatService.listEventMessages(eventId, after);
  }

  @Post('users/:id/dm')
  sendDm(@CurrentUser() user: RequestUser, @Param('id') peerId: string, @Body() dto: SendMessageDto) {
    return this.chatService.sendDm(user.userId, peerId, dto.text);
  }

  @Get('users/:id/dm')
  listDmThread(@CurrentUser() user: RequestUser, @Param('id') peerId: string) {
    return this.chatService.listDmThread(user.userId, peerId);
  }
}
