import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Prisma } from '@prisma/client';
import { hasPassed } from '../posts/post-deadline.js';
import { publishPostUpdate } from '../posts/post-updates.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { PUBLIC_USER_SELECT } from '../users/users.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { POST_WITH_ATTENDEES, shapePost } from '../posts/posts.service.js';

@Injectable()
export class JoinRequestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly emitter: EventEmitter2,
  ) {}

  async create(postId: string, userId: string, introText?: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');
    if (post.isArchived) throw new ConflictException('Post is archived');
    if (hasPassed(post.date, post.time)) throw new ConflictException('This hangout has already started');

    // One request per person per post: a decision is final, so a declined or expired
    // requester can never ask again.
    const existing = await this.prisma.joinRequest.findUnique({ where: { postId_userId: { postId, userId } } });
    if (existing?.status === 'DECLINED') throw new ForbiddenException('The host passed on your request to join this post');
    if (existing?.status === 'EXPIRED') throw new ConflictException('Your request to join this post expired');
    if (existing) throw new ConflictException('Already requested to join this post');

    const status = post.entryMode === 'OPEN' ? 'APPROVED' : 'PENDING';
    let joinRequest;
    try {
      joinRequest = await this.prisma.joinRequest.create({ data: { postId, userId, introText, status } });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('Already requested to join this post');
      }
      throw e;
    }

    await this.notifications.create(post.hostId, 'JOIN_REQUEST', { postId, joinRequestId: joinRequest.id, userId });
    if (status === 'APPROVED') await publishPostUpdate(this.prisma, this.emitter, postId);
    return joinRequest;
  }

  async listForHost(hostId: string, postId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');
    if (post.hostId !== hostId) throw new ForbiddenException('Only the host can view this queue');

    return this.prisma.joinRequest.findMany({
      where: { postId, status: { in: ['PENDING', 'DECLINED'] } },
      include: { user: { select: PUBLIC_USER_SELECT } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async listMine(userId: string) {
    const requests = await this.prisma.joinRequest.findMany({
      where: { userId },
      include: { post: POST_WITH_ATTENDEES },
      orderBy: { createdAt: 'desc' },
    });
    return requests.map((jr) => ({ ...jr, post: shapePost(jr.post) }));
  }

  async decide(hostId: string, joinRequestId: string, decision: 'APPROVED' | 'DECLINED') {
    const jr = await this.prisma.joinRequest.findUnique({
      where: { id: joinRequestId },
      include: { post: true },
    });
    if (!jr) throw new NotFoundException('Join request not found');
    if (jr.post.hostId !== hostId) throw new ForbiddenException('Only the host can decide');
    // A pass isn't final for the host: they can still let a declined person in.
    const reopening = jr.status === 'DECLINED' && decision === 'APPROVED';
    if (jr.status !== 'PENDING' && !reopening) throw new ConflictException('Join request was already decided');

    if (decision === 'DECLINED') {
      const declined = await this.prisma.joinRequest.update({
        where: { id: joinRequestId },
        // A fresh decision is unread again, so it shows as an update on the requester's card.
        data: { status: 'DECLINED', lastReadAt: null },
      });
      await this.notifications.create(jr.userId, 'APPROVAL', { postId: jr.postId, joinRequestId, decision });
      return declined;
    }

    // Lock the parent Post row so concurrent decide-calls for the same post
    // serialize — counting JoinRequest rows alone can't be locked when the
    // count could legitimately be zero, so the lock has to sit on a row that's
    // guaranteed to exist.
    const approved = await this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "Post" WHERE id = ${jr.postId} FOR UPDATE`;
      const approvedCount = await tx.joinRequest.count({ where: { postId: jr.postId, status: 'APPROVED' } });
      if (approvedCount >= jr.post.seatsTotal) {
        throw new ConflictException('Post is at capacity');
      }
      return tx.joinRequest.update({ where: { id: joinRequestId }, data: { status: 'APPROVED', lastReadAt: null } });
    });
    await this.notifications.create(jr.userId, 'APPROVAL', { postId: jr.postId, joinRequestId, decision });
    await publishPostUpdate(this.prisma, this.emitter, jr.postId);
    return approved;
  }

  async markRead(userId: string, joinRequestId: string) {
    const jr = await this.prisma.joinRequest.findUnique({ where: { id: joinRequestId } });
    if (!jr) throw new NotFoundException('Join request not found');
    if (jr.userId !== userId) throw new ForbiddenException('Not your join request');
    return this.prisma.joinRequest.update({ where: { id: joinRequestId }, data: { lastReadAt: new Date() } });
  }
}
