import type { EventEmitter2 } from '@nestjs/event-emitter';
import type { PrismaService } from '../prisma/prisma.service.js';
import type { PostCreatedPayload } from './board-visibility.js';

// The small delta board clients patch onto a card they already have.
export type PostDelta = { id: string; seatsTotal: number; seatsFilled: number; isFull: boolean; isArchived: boolean };

// The visibility fields ride along only so the stream can skip viewers whose board wouldn't show the post.
export type PostUpdatedPayload = PostDelta & PostCreatedPayload;

export const POST_UPDATED = 'post.updated';

// Call after anything that changes seats, edits a post or archives it.
export async function publishPostUpdate(prisma: PrismaService, emitter: EventEmitter2, postId: string) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: {
      id: true,
      seatsTotal: true,
      title: true,
      description: true,
      tags: true,
      isArchived: true,
      genderRestriction: true,
      date: true,
      host: { select: { latitude: true, longitude: true } },
      _count: { select: { joinRequests: { where: { status: 'APPROVED' } } } },
    },
  });
  if (!post) return;
  const seatsFilled = post._count.joinRequests;
  const payload: PostUpdatedPayload = {
    id: post.id,
    title: post.title,
    description: post.description,
    tags: post.tags,
    seatsTotal: post.seatsTotal,
    seatsFilled,
    isFull: seatsFilled >= post.seatsTotal,
    isArchived: post.isArchived,
    genderRestriction: post.genderRestriction,
    date: post.date,
    hostLatitude: post.host.latitude,
    hostLongitude: post.host.longitude,
  };
  emitter.emit(POST_UPDATED, payload);
}
