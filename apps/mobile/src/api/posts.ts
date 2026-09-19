import { get, post, patch } from './client';
import { toApiCostMode, toApiGenderRestriction, type ApiEntryMode, type ApiPost } from './types';
import type { CostMode, GenderRestriction } from '../data/gender';
import { isDefined } from '@companion/common';

export type CreatePostInput = {
  title: string;
  description?: string;
  date: string;
  time?: string;
  venue?: string;
  entryMode?: ApiEntryMode;
  seatsTotal: number;
  tags?: string[];
  genderRestriction?: GenderRestriction;
  costMode?: CostMode | null;
};

function toDto(dto: CreatePostInput) {
  return {
    ...dto,
    genderRestriction: dto.genderRestriction ? toApiGenderRestriction(dto.genderRestriction) : undefined,
    costMode: toApiCostMode(dto.costMode ?? null),
  };
}

export type BoardFilterState = {
  filter: 0 | 1 | 2 | 3;
  groupSize: 0 | 1 | 2;
  whoThere: 0 | 1 | 2;
  typeFilters: string[];
  searchQuery: string;
  proximityKm: number;
};

// The same query string drives the board list and its live stream, so both see the same posts.
export function boardQueryString(s: BoardFilterState): string {
  const params: string[] = [];
  if (s.filter !== 3) params.push(`filter=${s.filter}`);
  if (s.groupSize !== 2) params.push(`groupSize=${s.groupSize}`);
  if (s.whoThere === 0) params.push('womenOnly=true');
  if (s.typeFilters.length > 0) params.push(`types=${encodeURIComponent(s.typeFilters.join(','))}`);
  params.push(`proximityKm=${Math.round(s.proximityKm)}`);
  if (s.searchQuery.trim()) params.push(`q=${encodeURIComponent(s.searchQuery.trim())}`);
  return params.length ? `?${params.join('&')}` : '';
}

export const listBoard = (s: BoardFilterState) => get<ApiPost[]>(`/posts${boardQueryString(s)}`);
export const listHosted = () => get<ApiPost[]>('/posts/mine/hosted?archiveLookup=true');
export const getPost = (id: string) => get<ApiPost>(`/posts/${id}`);
export const createPost = (dto: CreatePostInput) => post<ApiPost>('/posts', toDto(dto));
export const updatePost = (id: string, dto: Partial<CreatePostInput>) => patch<ApiPost>(`/posts/${id}`, toDto(dto as CreatePostInput));
export const archivePost = (id: string) => post<ApiPost>(`/posts/${id}/archive`);
