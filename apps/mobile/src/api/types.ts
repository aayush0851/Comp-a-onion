import type { CostMode, GenderRestriction } from '../data/gender';

export type ApiGenderRestriction = 'ANYONE' | 'WOMEN' | 'MEN';
export type ApiCostMode = 'HOST' | 'DUTCH';
export type ApiEntryMode = 'OPEN' | 'APPROVE';
export type ApiJoinRequestStatus = 'PENDING' | 'APPROVED' | 'DECLINED' | 'EXPIRED';

export function toApiGenderRestriction(g: GenderRestriction): ApiGenderRestriction {
  return g.toUpperCase() as ApiGenderRestriction;
}
export function fromApiGenderRestriction(g: ApiGenderRestriction): GenderRestriction {
  return g.toLowerCase() as GenderRestriction;
}
export function toApiCostMode(c: CostMode | null): ApiCostMode | undefined {
  return c ? (c.toUpperCase() as ApiCostMode) : undefined;
}
export function fromApiCostMode(c: ApiCostMode | null): CostMode | null {
  return c ? (c.toLowerCase() as CostMode) : null;
}

export type ApiUser = {
  id: string;
  email?: string;
  name: string | null;
  dob?: string | null;
  gender: string | null;
  genderVisible: boolean;
  profilePicture: string | null;
  highlights: string[];
  proximityKm?: number;
  vibeTags: string[];
  aggregatedRating: number;
  createdAt: string;
};

export type ApiEvent = {
  id: string;
  hostId: string;
  host: ApiUser;
  title: string;
  date: string;
  time: string | null;
  venue: string | null;
  entryMode: ApiEntryMode;
  seatsTotal: number;
  tags: string[];
  genderRestriction: ApiGenderRestriction;
  costMode: ApiCostMode | null;
  isArchived: boolean;
  createdAt: string;
  seatsFilled: number;
  going: ApiUser[];
};

export type ApiJoinRequest = {
  id: string;
  eventId: string;
  event?: ApiEvent;
  userId: string;
  user?: ApiUser;
  status: ApiJoinRequestStatus;
  introText: string | null;
  lastReadAt: string | null;
  createdAt: string;
};
