import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { PUBLIC_USER_SELECT } from '../users/users.service.js';
import type { CreateReviewDto } from './dto/create-review.dto.js';

const MALICE_FLAG_THRESHOLD = 3;

@Injectable()
export class ReviewsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  async submit(eventId: string, reviewerId: string, dto: CreateReviewDto) {
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new NotFoundException('Event not found');

    try {
      await this.prisma.$transaction(async (tx) => {
        const review = await tx.review.create({
          data: {
            eventId,
            reviewerId,
            setupScores: dto.setupScores as Prisma.InputJsonValue,
            setupTags: dto.setupTags ?? [],
          },
        });
        await tx.personReview.createMany({
          data: dto.personReviews.map((p) => ({
            reviewId: review.id,
            revieweeId: p.revieweeId,
            tags: p.tags ?? [],
            rating: p.rating,
            note: p.note,
            meetAgain: p.meetAgain ?? false,
            flagged: p.flagged ?? false,
          })),
        });
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('You already reviewed this event');
      }
      throw e;
    }

    const revieweeIds = [...new Set(dto.personReviews.map((p) => p.revieweeId))];
    await Promise.all(revieweeIds.map((id) => this.recomputeUserRating(id)));
    await Promise.all(
      revieweeIds.map((id) => this.notifications.create(id, 'RATING_RECEIVED', { eventId, reviewerId })),
    );

    return { ok: true };
  }

  hasReviewed(eventId: string, reviewerId: string) {
    return this.prisma.review.findUnique({ where: { eventId_reviewerId: { eventId, reviewerId } } });
  }

  listReceived(userId: string) {
    return this.prisma.personReview.findMany({
      where: { revieweeId: userId },
      include: { review: { include: { event: true, reviewer: { select: PUBLIC_USER_SELECT } } } },
      orderBy: { id: 'desc' },
    });
  }

  private async recomputeUserRating(userId: string) {
    const personReviews = await this.prisma.personReview.findMany({ where: { revieweeId: userId } });
    const ratings = personReviews.map((p) => p.rating).filter((r): r is number => r != null);
    const aggregatedRating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
    const isMalice = personReviews.filter((p) => p.flagged).length >= MALICE_FLAG_THRESHOLD;

    await this.prisma.user.update({ where: { id: userId }, data: { aggregatedRating, isMalice } });
  }
}
