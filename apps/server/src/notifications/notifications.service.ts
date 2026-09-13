import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import type { Notification, NotificationKind, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { PUBLIC_USER_SELECT } from '../users/users.service.js';

type NotificationPayload = { eventId?: string; userId?: string; reviewerId?: string; joinRequestId?: string; decision?: string };

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventEmitter2,
  ) {}

  async create(userId: string, kind: NotificationKind, payload: Prisma.InputJsonValue) {
    const notification = await this.prisma.notification.create({ data: { userId, kind, payload } });
    const [enriched] = await this.enrich([notification]);
    this.events.emit('notification.created', { userId, notification: enriched });
    return notification;
  }

  async list(userId: string) {
    const notifications = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return this.enrich(notifications);
  }

  // payload only stores ids — resolve the event title and the other person's
  // name so the client doesn't have to N+1 fetch them per row.
  private async enrich(notifications: Notification[]) {
    const eventIds = new Set<string>();
    const actorIds = new Set<string>();
    for (const n of notifications) {
      const p = n.payload as NotificationPayload;
      if (p.eventId) eventIds.add(p.eventId);
      const actorId = p.userId ?? p.reviewerId;
      if (actorId) actorIds.add(actorId);
    }

    const [events, actors] = await Promise.all([
      this.prisma.event.findMany({ where: { id: { in: [...eventIds] } }, select: { id: true, title: true } }),
      this.prisma.user.findMany({ where: { id: { in: [...actorIds] } }, select: PUBLIC_USER_SELECT }),
    ]);
    const eventById = new Map(events.map((e) => [e.id, e]));
    const actorById = new Map(actors.map((u) => [u.id, u]));

    return notifications.map((n) => {
      const p = n.payload as NotificationPayload;
      const actorId = p.userId ?? p.reviewerId;
      return {
        ...n,
        eventTitle: p.eventId ? (eventById.get(p.eventId)?.title ?? null) : null,
        actorName: actorId ? (actorById.get(actorId)?.name ?? null) : null,
      };
    });
  }

  async markRead(userId: string, id: string) {
    const notification = await this.prisma.notification.findUnique({ where: { id } });
    if (!notification || notification.userId !== userId) throw new NotFoundException('Notification not found');
    return this.prisma.notification.update({ where: { id }, data: { read: true } });
  }

  markAllRead(userId: string) {
    return this.prisma.notification.updateMany({ where: { userId, read: false }, data: { read: true } });
  }
}
