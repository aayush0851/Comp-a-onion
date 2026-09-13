import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service.js';
import { PUBLIC_USER_SELECT } from '../users/users.service.js';

const WITH_AUTHOR = { include: { author: { select: PUBLIC_USER_SELECT } } };

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventEmitter2,
  ) {}

  async sendEventMessage(eventId: string, authorId: string, text: string) {
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new NotFoundException('Event not found');

    if (event.hostId !== authorId) {
      const approved = await this.prisma.joinRequest.findUnique({
        where: { eventId_userId: { eventId, userId: authorId } },
      });
      if (!approved || approved.status !== 'APPROVED') {
        throw new ForbiddenException('Only the host and approved attendees can post here');
      }
    }

    const message = await this.prisma.chatMessage.create({ data: { eventId, authorId, text }, ...WITH_AUTHOR });
    this.events.emit('chat.eventMessage', { eventId, message });
    return message;
  }

  listEventMessages(eventId: string, after?: string) {
    return this.prisma.chatMessage.findMany({
      where: { eventId, createdAt: after ? { gt: new Date(after) } : undefined },
      orderBy: { createdAt: 'asc' },
      take: 100,
      ...WITH_AUTHOR,
    });
  }

  async sendDm(fromUserId: string, toUserId: string, text: string) {
    const message = await this.prisma.chatMessage.create({
      data: { authorId: fromUserId, dmWithUserId: toUserId, text },
      ...WITH_AUTHOR,
    });
    this.events.emit('chat.dm', { participantIds: [fromUserId, toUserId], message });
    return message;
  }

  listDmThread(userId: string, peerId: string) {
    return this.prisma.chatMessage.findMany({
      where: {
        eventId: null,
        OR: [
          { authorId: userId, dmWithUserId: peerId },
          { authorId: peerId, dmWithUserId: userId },
        ],
      },
      orderBy: { createdAt: 'asc' },
      ...WITH_AUTHOR,
    });
  }

  // No dedicated "conversations" table — a DM thread is just messages with a given
  // dmWithUserId, so the thread list is derived by taking the newest message per peer.
  async listDmThreads(userId: string) {
    const messages = await this.prisma.chatMessage.findMany({
      where: { eventId: null, OR: [{ authorId: userId }, { dmWithUserId: userId }] },
      orderBy: { createdAt: 'desc' },
      ...WITH_AUTHOR,
    });

    const latestByPeer = new Map<string, (typeof messages)[number]>();
    for (const m of messages) {
      const peerId = m.authorId === userId ? m.dmWithUserId! : m.authorId;
      if (!latestByPeer.has(peerId)) latestByPeer.set(peerId, m);
    }

    const peerIds = [...latestByPeer.keys()];
    const peers = await this.prisma.user.findMany({ where: { id: { in: peerIds } }, select: PUBLIC_USER_SELECT });
    const peerById = new Map(peers.map((p) => [p.id, p]));

    return peerIds.map((peerId) => ({ peer: peerById.get(peerId)!, lastMessage: latestByPeer.get(peerId)! }));
  }
}
