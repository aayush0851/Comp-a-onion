import type { PrismaClient } from '@prisma/client';
import { deadlineOf } from '../posts/post-deadline.js';

export async function archiveExpiredPosts(prisma: PrismaClient): Promise<string[]> {
  const now = new Date();
  // Bounded by definition: only posts dated today or earlier can possibly
  // have passed their deadline, so this never scans future plans.
  const candidates = await prisma.post.findMany({
    where: { isArchived: false, date: { lte: now } },
    select: { id: true, date: true, time: true },
  });

  const expiredIds = candidates.filter((e) => deadlineOf(e.date, e.time) <= now).map((e) => e.id);
  if (expiredIds.length === 0) return [];

  await prisma.post.updateMany({
    where: { id: { in: expiredIds } },
    data: { isArchived: true },
  });
  return expiredIds;
}
