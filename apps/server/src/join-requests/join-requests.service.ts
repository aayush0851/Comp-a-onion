import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { PUBLIC_USER_SELECT } from '../users/users.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';

@Injectable()
export class JoinRequestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  async create(eventId: string, userId: string, introText?: string) {
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new NotFoundException('Event not found');
    if (event.isArchived) throw new ConflictException('Event is archived');

    const status = event.entryMode === 'OPEN' ? 'APPROVED' : 'PENDING';
    let joinRequest;
    try {
      joinRequest = await this.prisma.joinRequest.create({ data: { eventId, userId, introText, status } });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('Already requested to join this event');
      }
      throw e;
    }

    await this.notifications.create(event.hostId, 'JOIN_REQUEST', { eventId, joinRequestId: joinRequest.id, userId });
    return joinRequest;
  }

  async listForHost(hostId: string, eventId: string) {
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new NotFoundException('Event not found');
    if (event.hostId !== hostId) throw new ForbiddenException('Only the host can view this queue');

    return this.prisma.joinRequest.findMany({
      where: { eventId, status: 'PENDING' },
      include: { user: { select: PUBLIC_USER_SELECT } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async listMine(userId: string) {
    return this.prisma.joinRequest.findMany({
      where: { userId },
      include: { event: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async decide(hostId: string, joinRequestId: string, decision: 'APPROVED' | 'DECLINED') {
    const jr = await this.prisma.joinRequest.findUnique({
      where: { id: joinRequestId },
      include: { event: true },
    });
    if (!jr) throw new NotFoundException('Join request not found');
    if (jr.event.hostId !== hostId) throw new ForbiddenException('Only the host can decide');
    if (jr.status !== 'PENDING') throw new ConflictException('Join request was already decided');

    if (decision === 'DECLINED') {
      const declined = await this.prisma.joinRequest.update({
        where: { id: joinRequestId },
        data: { status: 'DECLINED' },
      });
      await this.notifications.create(jr.userId, 'APPROVAL', { eventId: jr.eventId, joinRequestId, decision });
      return declined;
    }

    // Lock the parent Event row so concurrent decide-calls for the same event
    // serialize — counting JoinRequest rows alone can't be locked when the
    // count could legitimately be zero, so the lock has to sit on a row that's
    // guaranteed to exist.
    const approved = await this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "Event" WHERE id = ${jr.eventId} FOR UPDATE`;
      const approvedCount = await tx.joinRequest.count({ where: { eventId: jr.eventId, status: 'APPROVED' } });
      if (approvedCount >= jr.event.seatsTotal) {
        throw new ConflictException('Event is at capacity');
      }
      return tx.joinRequest.update({ where: { id: joinRequestId }, data: { status: 'APPROVED' } });
    });
    await this.notifications.create(jr.userId, 'APPROVAL', { eventId: jr.eventId, joinRequestId, decision });
    return approved;
  }

  async markRead(userId: string, joinRequestId: string) {
    const jr = await this.prisma.joinRequest.findUnique({ where: { id: joinRequestId } });
    if (!jr) throw new NotFoundException('Join request not found');
    if (jr.userId !== userId) throw new ForbiddenException('Not your join request');
    return this.prisma.joinRequest.update({ where: { id: joinRequestId }, data: { lastReadAt: new Date() } });
  }
}
