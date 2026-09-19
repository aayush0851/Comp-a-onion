// time is stored as a time-of-day value on the 1970-01-01 epoch (see
// posts.service.ts's timeStringToDate) — pull the hours/minutes back off it.
export function deadlineOf(date: Date, time: Date | null): Date {
  if (!time) {
    const endOfDay = new Date(date);
    endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);
    return endOfDay;
  }
  const deadline = new Date(date);
  deadline.setUTCHours(time.getUTCHours(), time.getUTCMinutes(), 0, 0);
  return deadline;
}

export const hasPassed = (date: Date, time: Date | null) => deadlineOf(date, time) <= new Date();
