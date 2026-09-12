import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentUser, type RequestUser } from '../auth/current-user.decorator.js';
import { ReviewReportsService } from './review-reports.service.js';
import { CreateReportDto } from './dto/create-report.dto.js';

@Controller()
@UseGuards(JwtAuthGuard)
export class ReviewReportsController {
  constructor(private readonly reviewReportsService: ReviewReportsService) {}

  @Post('person-reviews/:id/report')
  create(@CurrentUser() user: RequestUser, @Param('id') personReviewId: string, @Body() dto: CreateReportDto) {
    return this.reviewReportsService.create(personReviewId, user.userId, dto.reason);
  }

  @Get('review-reports')
  listOpen() {
    return this.reviewReportsService.listOpen();
  }

  @Patch('review-reports/:id/resolve')
  resolve(@Param('id') id: string) {
    return this.reviewReportsService.resolve(id);
  }
}
