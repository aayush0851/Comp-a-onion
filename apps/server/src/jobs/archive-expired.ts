import type { PrismaClient } from '@prisma/client';

// time is stored as a time-of-day value on the 1970-01-01 epoch (see
// events.service.ts's timeStringToDate) — pull the hours/minutes back off it.
function deadlineOf(date: Date, time: Date | null): Date {
  if (!time) {
    const endOfDay = new Date(date);
    endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);
    return endOfDay;
  }
  const deadline = new Date(date);
  deadline.setUTCHours(time.getUTCHours(), time.getUTCMinutes(), 0, 0);
  return deadline;
}

export async function archiveExpiredEvents(prisma: PrismaClient): Promise<number> {
  const now = new Date();
  // Bounded by definition: only events dated today or earlier can possibly
  // have passed their deadline, so this never scans future plans.
  const candidates = await prisma.event.findMany({
    where: { isArchived: false, date: { lte: now } },
    select: { id: true, date: true, time: true },
  });

  const expiredIds = candidates.filter((e) => deadlineOf(e.date, e.time) <= now).map((e) => e.id);
  if (expiredIds.length === 0) return 0;

  const { count } = await prisma.event.updateMany({
    where: { id: { in: expiredIds } },
    data: { isArchived: true },
  });
  return count;
}
