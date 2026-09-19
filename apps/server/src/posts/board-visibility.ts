import { GenderRestriction } from '@prisma/client';
import { isDefined, isNil } from '@companion/common';

const KM_PER_DEGREE = 111;

// ponytail: off for now per product ask, flip to true to bring proximity filtering back.
export const PROXIMITY_FILTER_ENABLED = false;

// The filters the app applies to its board, sent when it opens the stream.
export type BoardFilters = {
  filter?: 0 | 1 | 2;
  groupSize?: 0 | 1 | 2;
  womenOnly?: boolean;
  types?: string[];
  q?: string;
  // Search radius; only ever comes from the app's filters, never from the stored profile.
  proximityKm?: number;
};

// Board query params as they arrive; `types` is a comma-separated list.
export function toBoardFilters(query: Omit<BoardFilters, 'types'> & { types?: string }): BoardFilters {
  return { ...query, types: query.types?.split(',').filter(Boolean) };
}

export type Viewer = { gender: string | null; latitude: number | null; longitude: number | null };

// What the board needs to decide, per viewer, whether a new post belongs on their board.
export type PostCreatedPayload = {
  title: string;
  description: string | null;
  seatsTotal: number;
  tags: string[];
  genderRestriction: GenderRestriction;
  date: Date;
  hostLatitude: number | null;
  hostLongitude: number | null;
};

export function dateRangeForFilter(filter?: 0 | 1 | 2): { gte: Date; lt: Date } | undefined {
  if (isNil(filter)) return undefined;
  // UTC-anchored to match how post dates are parsed on creation (new Date("YYYY-MM-DD")
  // is UTC midnight) — anchoring this to local server time instead caused a mismatch
  // that spilled "today" posts into the "tomorrow" bucket.
  const now = new Date();
  const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  if (filter === 0) {
    const tomorrow = new Date(startOfToday);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return { gte: startOfToday, lt: tomorrow };
  }
  if (filter === 1) {
    const tomorrow = new Date(startOfToday);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);
    return { gte: tomorrow, lt: dayAfter };
  }
  const weekOut = new Date(startOfToday);
  weekOut.setDate(weekOut.getDate() + 7);
  return { gte: startOfToday, lt: weekOut };
}

export function allowedGenderRestrictions(gender: string | null): GenderRestriction[] {
  if (gender === 'Woman') return [GenderRestriction.ANYONE, GenderRestriction.WOMEN];
  if (gender === 'Man') return [GenderRestriction.ANYONE, GenderRestriction.MEN];
  return [GenderRestriction.ANYONE];
}

export function proximityBounds(viewer: Viewer, radiusKm?: number) {
  if (!PROXIMITY_FILTER_ENABLED || !isDefined(radiusKm) || !isDefined(viewer.latitude) || !isDefined(viewer.longitude)) return undefined;
  const delta = radiusKm / KM_PER_DEGREE;
  return {
    latitude: { gte: viewer.latitude - delta, lte: viewer.latitude + delta },
    longitude: { gte: viewer.longitude - delta, lte: viewer.longitude + delta },
  };
}

// Mirrors the where-clause findBoard builds plus the filters the app applies on the device,
// for a single post, so a viewer isn't woken for something their board wouldn't show.
export function isVisibleOnBoard(viewer: Viewer, post: PostCreatedPayload, filters: BoardFilters = {}): boolean {
  if (!allowedGenderRestrictions(viewer.gender).includes(post.genderRestriction)) return false;

  const range = dateRangeForFilter(filters.filter);
  if (range && !(post.date >= range.gte && post.date < range.lt)) return false;

  const bounds = proximityBounds(viewer, filters.proximityKm);
  if (bounds) {
    const { hostLatitude: lat, hostLongitude: lng } = post;
    if (!isDefined(lat) || !isDefined(lng)) return false;
    if (lat < bounds.latitude.gte || lat > bounds.latitude.lte) return false;
    if (lng < bounds.longitude.gte || lng > bounds.longitude.lte) return false;
  }

  if (filters.womenOnly && post.genderRestriction !== GenderRestriction.WOMEN) return false;
  // groupSize: 0 = Duo, 1 = Group, 2 = any size (matches mobile's GROUP_SIZE_LABELS).
  if (filters.groupSize === 0 && post.seatsTotal > 2) return false;
  if (filters.groupSize === 1 && post.seatsTotal <= 2) return false;
  if (filters.types?.length && !post.tags.some((tag) => filters.types!.includes(tag))) return false;
  const q = filters.q?.trim().toLowerCase();
  if (q && !post.title.toLowerCase().includes(q) && !(post.description ?? '').toLowerCase().includes(q)) return false;
  return true;
}
