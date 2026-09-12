import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentUser, type RequestUser } from '../auth/current-user.decorator.js';
import { JoinRequestsService } from './join-requests.service.js';
import { CreateJoinRequestDto } from './dto/create-join-request.dto.js';
import { DecideJoinRequestDto } from './dto/decide-join-request.dto.js';

@Controller()
@UseGuards(JwtAuthGuard)
export class JoinRequestsController {
  constructor(private readonly joinRequestsService: JoinRequestsService) {}

  @Post('events/:eventId/join-requests')
  create(@CurrentUser() user: RequestUser, @Param('eventId') eventId: string, @Body() dto: CreateJoinRequestDto) {
    return this.joinRequestsService.create(eventId, user.userId, dto.introText);
  }

  @Get('events/:eventId/join-requests')
  listForHost(@CurrentUser() user: RequestUser, @Param('eventId') eventId: string) {
    return this.joinRequestsService.listForHost(user.userId, eventId);
  }

  @Get('users/me/join-requests')
  listMine(@CurrentUser() user: RequestUser) {
    return this.joinRequestsService.listMine(user.userId);
  }

  @Patch('join-requests/:id/decide')
  decide(@CurrentUser() user: RequestUser, @Param('id') id: string, @Body() dto: DecideJoinRequestDto) {
    return this.joinRequestsService.decide(user.userId, id, dto.decision);
  }

  @Patch('join-requests/:id/read')
  markRead(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.joinRequestsService.markRead(user.userId, id);
  }
}
