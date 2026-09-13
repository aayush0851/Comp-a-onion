import type { ApiEvent, ApiUser } from '../api/types';
import { fromApiCostMode, fromApiGenderRestriction } from '../api/types';
import type { Gender } from './gender';

export type GoingPerson = { bg: string; fg: string; label: string; name: string; gender: Gender; photo?: string };

export function initialsOf(name: string | null): string {
  const parts = (name ?? '?').trim().split(/\s+/);
  return parts.length > 1 ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() : (name ?? '?').slice(0, 2).toUpperCase();
}

function firstNameOf(name: string | null): string {
  return (name ?? 'The host').split(' ')[0];
}

const AVATAR_TONES: { bg: string; fg: string }[] = [
  { bg: '#F6E4DA', fg: '#A6512F' },
  { bg: '#E8EDE3', fg: '#4F5C46' },
  { bg: '#EFE6DC', fg: '#5C534B' },
];

function toGender(g: string | null): Gender {
  return g === 'Woman' || g === 'Man' ? g : 'Nonbinary';
}

export function mapGoing(users: ApiUser[]): GoingPerson[] {
  return users.map((u, i) => ({
    ...AVATAR_TONES[i % AVATAR_TONES.length],
    label: initialsOf(u.name),
    name: u.name ?? 'Someone',
    gender: toGender(u.gender),
    photo: u.profilePicture ?? undefined,
  }));
}

export function formatEventTime(time: string | null): string {
  if (!time) return 'Flexible';
  return time.slice(11, 16);
}

export function formatEventDate(date: string): string {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return 'Flexible';
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

export type EventCard = {
  id: string;
  hostId: string;
  title: string;
  slot: string;
  time: string;
  venue: string | null;
  venueLine: string;
  host: string;
  hostFirst: string;
  hostInitials: string;
  hostPhoto: string | null;
  hostHighlight: string | null;
  entry: 'open' | 'approve';
  seatsFilled: number;
  seatsTotal: number;
  shapeLabel: 'Duo' | 'Table';
  tags: string[];
  when: string;
  where: string;
  gettingIn: string;
  going: GoingPerson[];
  goingLine: string;
  genderRestriction: ReturnType<typeof fromApiGenderRestriction>;
  costMode: ReturnType<typeof fromApiCostMode>;
};

export function toEventCard(event: ApiEvent): EventCard {
  const entry = event.entryMode === 'OPEN' ? 'open' : 'approve';
  const hostFirst = firstNameOf(event.host.name);
  const time = formatEventTime(event.time);
  const dateLabel = formatEventDate(event.date);
  const seatsLeft = Math.max(0, event.seatsTotal - event.seatsFilled);
  const going = mapGoing(event.going);

  return {
    id: event.id,
    hostId: event.hostId,
    title: event.title,
    slot: `${(event.venue ?? event.title).toUpperCase()}`,
    time,
    venue: event.venue,
    venueLine: event.venue ?? 'Flexible',
    host: event.host.name ?? 'Host',
    hostFirst,
    hostInitials: initialsOf(event.host.name),
    hostPhoto: event.host.profilePicture,
    hostHighlight: event.host.highlights[0] ?? null,
    entry,
    seatsFilled: event.seatsFilled,
    seatsTotal: event.seatsTotal,
    shapeLabel: event.seatsTotal <= 2 ? 'Duo' : 'Table',
    tags: event.tags,
    when: `${time} · ${dateLabel}${entry === 'approve' ? ` — ${hostFirst} waits ten minutes, not more` : ' — first come, no queue'}`,
    where: event.venue ? `${event.venue}` : 'Not set — the group picks in chat',
    gettingIn: entry === 'open' ? 'Open seats — tap and you’re in' : `${hostFirst} reads your line and approves`,
    going,
    goingLine: seatsLeft <= 0
      ? 'Full'
      : event.seatsFilled === 0
        ? `Just you and ${hostFirst}`
        : `${event.seatsFilled} in, ${seatsLeft} seat${seatsLeft === 1 ? '' : 's'} left`,
    genderRestriction: fromApiGenderRestriction(event.genderRestriction),
    costMode: fromApiCostMode(event.costMode),
  };
}
