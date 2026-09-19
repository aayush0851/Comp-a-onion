import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { CurrentUser, type RequestUser } from '../common/decorators/current-user.decorator.js';
import { JoinRequestsService } from './join-requests.service.js';
import { CreateJoinRequestDto } from './dto/create-join-request.dto.js';
import { DecideJoinRequestDto } from './dto/decide-join-request.dto.js';

@Controller()
@UseGuards(JwtAuthGuard)
export class JoinRequestsController {
  constructor(private readonly joinRequestsService: JoinRequestsService) {}

  @Post('posts/:postId/join-requests')
  create(@CurrentUser() user: RequestUser, @Param('postId') postId: string, @Body() dto: CreateJoinRequestDto) {
    return this.joinRequestsService.create(postId, user.userId, dto.introText);
  }

  @Get('posts/:postId/join-requests')
  listForHost(@CurrentUser() user: RequestUser, @Param('postId') postId: string) {
    return this.joinRequestsService.listForHost(user.userId, postId);
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
