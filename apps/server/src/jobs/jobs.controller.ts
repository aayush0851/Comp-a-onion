import { Controller, Headers, Post, UnauthorizedException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { publishPostUpdate } from '../posts/post-updates.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { archiveExpiredPosts } from './archive-expired.js';

// Hit by an external scheduler (see .github/workflows/archive-expired-posts.yml)
// since this app's free hosting tier has no built-in cron/worker. Guarded by a
// shared secret rather than JwtAuthGuard — the caller isn't a logged-in user.
@Controller('internal/jobs')
export class JobsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emitter: EventEmitter2,
  ) {}

  @Post('archive-expired-posts')
  async archiveExpiredPosts(@Headers('x-cron-secret') secret?: string) {
    if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
      throw new UnauthorizedException();
    }
    const ids = await archiveExpiredPosts(this.prisma);
    await Promise.all(ids.map((id) => publishPostUpdate(this.prisma, this.emitter, id)));
    return { archived: ids.length };
  }
}
