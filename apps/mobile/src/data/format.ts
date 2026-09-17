export function formatProximityKm(km: number): string {
  return km < 1 ? '<1 km' : `${Math.round(km)} km`;
}

export function parseDistKm(dist: string): number {
  const miles = parseFloat(dist) || 0;
  return miles * 1.60934;
}

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export type DateOption = { key: string; label: string; dateLabel: string; full: string };

export function dateKeyFromDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function isDateKeyPast(key: string): boolean {
  const [y, mo, da] = key.split('-').map(Number);
  const planDate = new Date(y, mo - 1, da);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return planDate < today;
}

export function nextSevenDays(from: Date = new Date()): DateOption[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(from.getFullYear(), from.getMonth(), from.getDate() + i);
    const key = dateKeyFromDate(d);
    const weekday = WEEKDAY_LABELS[d.getDay()];
    const label = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : weekday;
    const dateLabel = `${MONTH_LABELS[d.getMonth()]} ${d.getDate()}`;
    return { key, label, dateLabel, full: `${weekday}, ${dateLabel}` };
  });
}

// Short stamp for list rows: "7:04 PM" today, "Fri" this week, "Sep 3" otherwise.
export function shortStamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  const days = (now.getTime() - d.getTime()) / 86400000;
  if (days < 7) return WEEKDAY_LABELS[d.getDay()];
  return `${MONTH_LABELS[d.getMonth()]} ${d.getDate()}`;
}
