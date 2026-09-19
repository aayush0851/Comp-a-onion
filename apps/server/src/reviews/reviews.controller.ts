import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { CurrentUser, type RequestUser } from '../common/decorators/current-user.decorator.js';
import { ReviewsService } from './reviews.service.js';
import { CreateReviewDto } from './dto/create-review.dto.js';

@Controller()
@UseGuards(JwtAuthGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post('posts/:id/reviews')
  submit(@CurrentUser() user: RequestUser, @Param('id') postId: string, @Body() dto: CreateReviewDto) {
    return this.reviewsService.submit(postId, user.userId, dto);
  }

  @Get('posts/:id/reviews/mine')
  mine(@CurrentUser() user: RequestUser, @Param('id') postId: string) {
    return this.reviewsService.hasReviewed(postId, user.userId);
  }

  @Get('users/me/reviews/received')
  received(@CurrentUser() user: RequestUser) {
    return this.reviewsService.listReceived(user.userId);
  }
}
