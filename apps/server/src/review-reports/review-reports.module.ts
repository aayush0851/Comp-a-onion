import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { ReviewReportsController } from './review-reports.controller.js';
import { ReviewReportsService } from './review-reports.service.js';

@Module({
  imports: [AuthModule],
  controllers: [ReviewReportsController],
  providers: [ReviewReportsService],
})
export class ReviewReportsModule {}
