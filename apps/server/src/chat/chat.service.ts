import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

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

    return this.prisma.chatMessage.create({ data: { eventId, authorId, text } });
  }

  listEventMessages(eventId: string, after?: string) {
    return this.prisma.chatMessage.findMany({
      where: { eventId, createdAt: after ? { gt: new Date(after) } : undefined },
      orderBy: { createdAt: 'asc' },
      take: 100,
    });
  }

  sendDm(fromUserId: string, toUserId: string, text: string) {
    return this.prisma.chatMessage.create({
      data: { authorId: fromUserId, dmWithUserId: toUserId, text },
    });
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
    });
  }
}
