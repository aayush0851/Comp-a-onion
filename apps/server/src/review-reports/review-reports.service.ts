import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ReviewReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(personReviewId: string, reporterId: string, reason: string) {
    const personReview = await this.prisma.personReview.findUnique({ where: { id: personReviewId } });
    if (!personReview) throw new NotFoundException('Review not found');

    return this.prisma.reviewReport.create({
      data: { personReviewId, reporterId, reason },
    });
  }

  listOpen() {
    return this.prisma.reviewReport.findMany({
      where: { status: 'OPEN' },
      include: { personReview: true, reporter: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async resolve(id: string) {
    const report = await this.prisma.reviewReport.findUnique({ where: { id } });
    if (!report) throw new NotFoundException('Report not found');
    return this.prisma.reviewReport.update({ where: { id }, data: { status: 'RESOLVED' } });
  }
}
