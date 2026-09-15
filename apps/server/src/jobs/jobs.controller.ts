import { Controller, Headers, Post, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { archiveExpiredEvents } from './archive-expired.js';

// Hit by an external scheduler (see .github/workflows/archive-expired-events.yml)
// since this app's free hosting tier has no built-in cron/worker. Guarded by a
// shared secret rather than JwtAuthGuard — the caller isn't a logged-in user.
@Controller('internal/jobs')
export class JobsController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('archive-expired-events')
  async archiveExpiredEvents(@Headers('x-cron-secret') secret?: string) {
    if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
      throw new UnauthorizedException();
    }
    const count = await archiveExpiredEvents(this.prisma);
    return { archived: count };
  }
}
