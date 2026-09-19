import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { PUBLIC_USER_SELECT } from '../users/users.service.js';
import type { CreateReviewDto } from './dto/create-review.dto.js';
import { isDefined } from '@companion/common';

const MALICE_FLAG_THRESHOLD = 3;

@Injectable()
export class ReviewsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  async submit(postId: string, reviewerId: string, dto: CreateReviewDto) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');

    try {
      await this.prisma.$transaction(async (tx) => {
        const review = await tx.review.create({
          data: {
            postId,
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
        throw new ConflictException('You already reviewed this post');
      }
      throw e;
    }

    const revieweeIds = [...new Set(dto.personReviews.map((p) => p.revieweeId))];
    await Promise.all(revieweeIds.map((id) => this.recomputeUserRating(id)));
    await Promise.all(
      revieweeIds.map((id) => this.notifications.create(id, 'RATING_RECEIVED', { postId, reviewerId })),
    );

    return { ok: true };
  }

  hasReviewed(postId: string, reviewerId: string) {
    return this.prisma.review.findUnique({ where: { postId_reviewerId: { postId, reviewerId } } });
  }

  listReceived(userId: string) {
    return this.prisma.personReview.findMany({
      where: { revieweeId: userId },
      include: { review: { include: { post: true, reviewer: { select: PUBLIC_USER_SELECT } } } },
      orderBy: { id: 'desc' },
    });
  }

  private async recomputeUserRating(userId: string) {
    const personReviews = await this.prisma.personReview.findMany({ where: { revieweeId: userId } });
    const ratings = personReviews.map((p) => p.rating).filter(isDefined);
    const aggregatedRating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
    const isMalice = personReviews.filter((p) => p.flagged).length >= MALICE_FLAG_THRESHOLD;

    await this.prisma.user.update({ where: { id: userId }, data: { aggregatedRating, isMalice } });
  }
}
