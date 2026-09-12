import { Injectable, NotFoundException } from '@nestjs/common';
import type { NotificationKind, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: string, kind: NotificationKind, payload: Prisma.InputJsonValue) {
    return this.prisma.notification.create({ data: { userId, kind, payload } });
  }

  list(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
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
