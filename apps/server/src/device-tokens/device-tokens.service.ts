import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import type { Platform } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class DeviceTokensService {
  constructor(private readonly prisma: PrismaService) {}

  register(userId: string, platform: Platform, pushToken: string) {
    return this.prisma.deviceToken.upsert({
      where: { pushToken },
      update: { userId, platform, lastSeenAt: new Date() },
      create: { userId, platform, pushToken },
    });
  }

  async unregister(userId: string, id: string) {
    const token = await this.prisma.deviceToken.findUnique({ where: { id } });
    if (!token) throw new NotFoundException('Device token not found');
    if (token.userId !== userId) throw new ForbiddenException('Not your device token');
    return this.prisma.deviceToken.delete({ where: { id } });
  }
}
