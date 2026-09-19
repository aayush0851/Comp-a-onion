import { Body, Controller, Get, Param, Patch, Post, Query, Sse, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { CurrentUser, type RequestUser } from '../common/decorators/current-user.decorator.js';
import { PostsService } from './posts.service.js';
import { CreatePostDto } from './dto/create-post.dto.js';
import { UpdatePostDto } from './dto/update-post.dto.js';
import { BoardQueryDto } from './dto/board-query.dto.js';

@Controller()
@UseGuards(JwtAuthGuard)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post('posts')
  create(@CurrentUser() user: RequestUser, @Body() dto: CreatePostDto) {
    return this.postsService.create(user.userId, dto);
  }

  @Get('posts')
  board(@CurrentUser() user: RequestUser, @Query() query: BoardQueryDto) {
    return this.postsService.findBoard(user.userId, query);
  }

  // Declared before 'posts/:id' — a plain @Get would otherwise treat 'stream'
  // as a post id, same reason 'posts/mine/hosted' is declared up here too.
  @Sse('posts/stream')
  streamBoard(@CurrentUser() user: RequestUser, @Query() query: BoardQueryDto) {
    return this.postsService.streamBoard(user.userId, query);
  }

  @Get('posts/mine/hosted')
  hosted(@CurrentUser() user: RequestUser, @Query() query: BoardQueryDto) {
    return this.postsService.findHosted(user.userId, query);
  }

  @Sse('posts/:id/stream')
  streamPost(@Param('id') id: string) {
    return this.postsService.streamPost(id);
  }

  @Get('posts/:id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @Patch('posts/:id')
  update(@CurrentUser() user: RequestUser, @Param('id') id: string, @Body() dto: UpdatePostDto) {
    return this.postsService.update(user.userId, id, dto);
  }

  @Post('posts/:id/archive')
  archive(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.postsService.archive(user.userId, id);
  }
}
