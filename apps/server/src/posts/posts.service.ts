import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { hasPassed } from './post-deadline.js';
import { isChanged } from '@companion/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import type { Prisma } from '@prisma/client';
import { from, merge, switchMap } from 'rxjs';
import { POST_UPDATED, publishPostUpdate, type PostUpdatedPayload } from './post-updates.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { sseStream } from '../realtime/sse.util.js';
import { PUBLIC_USER_SELECT } from '../users/users.service.js';
import type { CreatePostDto } from './dto/create-post.dto.js';
import type { UpdatePostDto } from './dto/update-post.dto.js';
import type { BoardQueryDto } from './dto/board-query.dto.js';
import { allowedGenderRestrictions, dateRangeForFilter, isVisibleOnBoard, proximityBounds, type PostCreatedPayload } from './board-visibility.js';

function timeStringToDate(time: string): Date {
  return new Date(`1970-01-01T${time}:00.000Z`);
}

export const POST_WITH_ATTENDEES = {
  include: {
    host: { select: PUBLIC_USER_SELECT },
    joinRequests: {
      where: { status: 'APPROVED' as const },
      include: { user: { select: PUBLIC_USER_SELECT } },
    },
  },
} satisfies Prisma.PostDefaultArgs;

type PostWithAttendees = Prisma.PostGetPayload<typeof POST_WITH_ATTENDEES>;

export function shapePost(post: PostWithAttendees) {
  const { joinRequests, ...rest } = post;
  return {
    ...rest,
    seatsFilled: joinRequests.length,
    isFull: joinRequests.length >= rest.seatsTotal,
    // The archive job only runs once a day, so past-deadline posts linger until then.
    isExpired: hasPassed(rest.date, rest.time),
    going: joinRequests.map((jr) => ({ ...jr.user, joinedAt: jr.approvedAt })),
  };
}

@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly posts: EventEmitter2,
  ) {}

  async create(hostId: string, dto: CreatePostDto) {
    const { host, ...post } = await this.prisma.post.create({
      include: { host: { select: { latitude: true, longitude: true } } },
      data: {
        hostId,
        title: dto.title,
        description: dto.description,
        date: new Date(dto.date),
        time: dto.time ? timeStringToDate(dto.time) : undefined,
        venue: dto.venue,
        entryMode: dto.entryMode,
        seatsTotal: dto.seatsTotal,
        tags: dto.tags ?? [],
        genderRestriction: dto.genderRestriction,
        costMode: dto.costMode,
      },
    });
    const payload: PostCreatedPayload = {
      title: post.title,
      description: post.description,
      seatsTotal: post.seatsTotal,
      tags: post.tags,
      genderRestriction: post.genderRestriction,
      date: post.date,
      hostLatitude: host.latitude,
      hostLongitude: host.longitude,
    };
    this.posts.emit('post.created', payload);
    return post;
  }

  async findBoard(requesterId: string, query: BoardQueryDto) {
    const requester = await this.prisma.user.findUniqueOrThrow({ where: { id: requesterId } });

    const filters = query;
    const allowed = allowedGenderRestrictions(requester.gender);
    const q = filters.q?.trim();
    const where: Prisma.PostWhereInput = {
      isArchived: query.archiveLookup ? undefined : false,
      date: dateRangeForFilter(filters.filter),
      genderRestriction: { in: filters.gender?.length ? allowed.filter((g) => filters.gender!.includes(g)) : allowed },
      seatsTotal: filters.groupSize === 0 ? { lte: 2 } : filters.groupSize === 1 ? { gt: 2 } : undefined,
      tags: filters.types?.length ? { hasSome: filters.types } : undefined,
      OR: q ? [{ title: { contains: q, mode: 'insensitive' } }, { description: { contains: q, mode: 'insensitive' } }] : undefined,
    };

    const bounds = proximityBounds(requester, filters.proximityKm);
    if (bounds) where.host = bounds;

    const posts = await this.prisma.post.findMany({ where, ...POST_WITH_ATTENDEES, orderBy: { createdAt: 'desc' } });
    return posts.map(shapePost);
  }

  // Board listeners get a signal only when the new post would show up on their own board.
  streamBoard(userId: string, query: BoardQueryDto) {
    const filters = query;
    return from(this.prisma.user.findUniqueOrThrow({ where: { id: userId } })).pipe(
      switchMap((viewer) =>
        merge(
          // A new post is only a nudge to re-fetch; the app pulls the shaped list itself.
          sseStream<PostCreatedPayload>(this.posts, 'post.created', (p) => isVisibleOnBoard(viewer, p, filters), () => ({ type: 'created' })),
          // Seat and status changes are small enough to send as-is for the app to patch in.
          sseStream<PostUpdatedPayload>(
            this.posts,
            POST_UPDATED,
            (p) => isVisibleOnBoard(viewer, p, filters),
            (p) => ({ type: 'updated', id: p.id, seatsTotal: p.seatsTotal, seatsFilled: p.seatsFilled, isFull: p.isFull, isArchived: p.isArchived }),
          ),
        ),
      ),
    );
  }

  // A signal for one open plan screen: anything that changes this post's seats or status means "re-fetch me".
  streamPost(id: string) {
    return sseStream<PostUpdatedPayload>(this.posts, POST_UPDATED, (p) => p.id === id, () => ({ type: 'updated' }));
  }

  async findOne(id: string) {
    const post = await this.prisma.post.findUnique({ where: { id }, ...POST_WITH_ATTENDEES });
    if (!post) throw new NotFoundException('Post not found');
    return shapePost(post);
  }

  async findHosted(hostId: string, query: BoardQueryDto) {
    const posts = await this.prisma.post.findMany({
      where: { hostId, isArchived: query.archiveLookup ? undefined : false },
      ...POST_WITH_ATTENDEES,
      orderBy: { createdAt: 'desc' },
    });
    return posts.map(shapePost);
  }

  async update(hostId: string, id: string, dto: UpdatePostDto) {
    const current = await this.assertHost(hostId, id);
    if (isChanged(dto.seatsTotal, current.seatsTotal) || isChanged(dto.genderRestriction, current.genderRestriction)) {
      throw new BadRequestException('Seats and gender restriction can’t be changed once a post is live');
    }
    const post = await this.prisma.post.update({
      where: { id },
      data: { ...dto, time: dto.time ? timeStringToDate(dto.time) : undefined },
    });
    await publishPostUpdate(this.prisma, this.posts, id);
    return post;
  }

  async archive(hostId: string, id: string) {
    await this.assertHost(hostId, id);
    const post = await this.prisma.post.update({ where: { id }, data: { isArchived: true } });
    await publishPostUpdate(this.prisma, this.posts, id);
    return post;
  }

  private async assertHost(hostId: string, postId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');
    if (post.hostId !== hostId) throw new ForbiddenException('Only the host can do this');
    return post;
  }
}
