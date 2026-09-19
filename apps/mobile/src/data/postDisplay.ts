import type { ApiPost, ApiUser } from '../api/types';
import { fromApiCostMode, fromApiGenderRestriction } from '../api/types';
import type { Gender } from './gender';
import { seatTones } from '../theme';
import { MAP_LINK_LABEL, mapLinkOf } from './mapLink';

export type GoingPerson = { bg: string; fg: string; label: string; name: string; gender: Gender; photo?: string };

export function initialsOf(name: string | null): string {
  const parts = (name ?? '?').trim().split(/\s+/);
  return parts.length > 1 ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() : (name ?? '?').slice(0, 2).toUpperCase();
}

function firstNameOf(name: string | null): string {
  return (name ?? 'The host').split(' ')[0];
}

const AVATAR_TONES = seatTones.map(([bg, fg]) => ({ bg, fg }));

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

export function formatPostTime(time: string | null): string {
  if (!time) return 'Flexible';
  return time.slice(11, 16);
}

export function formatPostDate(date: string): string {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return 'Flexible';
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

export type PostCard = {
  id: string;
  hostId: string;
  title: string;
  description: string | null;
  slot: string;
  time: string;
  dateLabel: string;
  whenShort: string;
  mapUrl: string | null;
  seatsLeft: number;
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
  isFull: boolean;
  isExpired: boolean;
  isFeatured: boolean;
  shapeLabel: 'Duo' | 'Group';
  tags: string[];
  when: string;
  where: string;
  gettingIn: string;
  going: GoingPerson[];
  goingLine: string;
  genderRestriction: ReturnType<typeof fromApiGenderRestriction>;
  costMode: ReturnType<typeof fromApiCostMode>;
};

export function toPostCard(post: ApiPost): PostCard {
  const entry = post.entryMode === 'OPEN' ? 'open' : 'approve';
  const hostFirst = firstNameOf(post.host.name);
  const time = formatPostTime(post.time);
  const dateLabel = formatPostDate(post.date);
  const mapUrl = mapLinkOf(post.venue);
  const venue = mapUrl ? MAP_LINK_LABEL : post.venue;
  const seatsLeft = Math.max(0, post.seatsTotal - post.seatsFilled);
  const going = mapGoing(post.going);

  return {
    id: post.id,
    hostId: post.hostId,
    title: post.title,
    description: post.description,
    slot: `${(venue ?? post.title).toUpperCase()}`,
    time,
    dateLabel,
    whenShort: `${dateLabel}${post.time ? ` ${time}` : ''}`,
    mapUrl,
    seatsLeft,
    venue,
    venueLine: venue ?? 'Flexible',
    host: post.host.name ?? 'Host',
    hostFirst,
    hostInitials: initialsOf(post.host.name),
    hostPhoto: post.host.profilePicture,
    hostHighlight: post.host.highlights[0] ?? null,
    entry,
    seatsFilled: post.seatsFilled,
    seatsTotal: post.seatsTotal,
    isFull: post.isFull,
    isExpired: post.isExpired,
    isFeatured: post.isFeatured,
    shapeLabel: post.seatsTotal <= 2 ? 'Duo' : 'Group',
    tags: post.tags,
    when: `${time} · ${dateLabel}${entry === 'approve' ? ` — ${hostFirst} waits ten minutes, not more` : ' — first come, no queue'}`,
    where: venue ?? 'Not set — the group picks in chat',
    gettingIn: entry === 'open' ? 'Open seats — tap and you’re in' : `${hostFirst} reads your line and approves`,
    going,
    goingLine: seatsLeft <= 0
      ? 'Full'
      : post.seatsFilled === 0
        ? `Just you and ${hostFirst}`
        : `${post.seatsFilled} in, ${seatsLeft} seat${seatsLeft === 1 ? '' : 's'} left`,
    genderRestriction: fromApiGenderRestriction(post.genderRestriction),
    costMode: fromApiCostMode(post.costMode),
  };
}
