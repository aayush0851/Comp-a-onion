import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentUser, type RequestUser } from '../auth/current-user.decorator.js';
import { EventsService } from './events.service.js';
import { CreateEventDto } from './dto/create-event.dto.js';
import { UpdateEventDto } from './dto/update-event.dto.js';
import { BoardQueryDto } from './dto/board-query.dto.js';

@Controller()
@UseGuards(JwtAuthGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post('events')
  create(@CurrentUser() user: RequestUser, @Body() dto: CreateEventDto) {
    return this.eventsService.create(user.userId, dto);
  }

  @Get('events')
  board(@CurrentUser() user: RequestUser, @Query() query: BoardQueryDto) {
    return this.eventsService.findBoard(user.userId, query);
  }

  @Get('events/mine/hosted')
  hosted(@CurrentUser() user: RequestUser) {
    return this.eventsService.findHosted(user.userId);
  }

  @Get('events/:id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Patch('events/:id')
  update(@CurrentUser() user: RequestUser, @Param('id') id: string, @Body() dto: UpdateEventDto) {
    return this.eventsService.update(user.userId, id, dto);
  }

  @Post('events/:id/archive')
  archive(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.eventsService.archive(user.userId, id);
  }
}
