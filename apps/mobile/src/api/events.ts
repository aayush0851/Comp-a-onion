import { get, post, patch } from './client';
import { toApiCostMode, toApiGenderRestriction, type ApiEntryMode, type ApiEvent } from './types';
import type { CostMode, GenderRestriction } from '../data/gender';

export type CreateEventInput = {
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

function toDto(dto: CreateEventInput) {
  return {
    ...dto,
    genderRestriction: dto.genderRestriction ? toApiGenderRestriction(dto.genderRestriction) : undefined,
    costMode: toApiCostMode(dto.costMode ?? null),
  };
}

export const listBoard = (filter?: 0 | 1 | 2) =>
  get<ApiEvent[]>(`/events${filter !== undefined ? `?filter=${filter}` : ''}`);
export const listHosted = () => get<ApiEvent[]>('/events/mine/hosted');
export const getEvent = (id: string) => get<ApiEvent>(`/events/${id}`);
export const createEvent = (dto: CreateEventInput) => post<ApiEvent>('/events', toDto(dto));
export const updateEvent = (id: string, dto: Partial<CreateEventInput>) => patch<ApiEvent>(`/events/${id}`, toDto(dto as CreateEventInput));
export const archiveEvent = (id: string) => post<ApiEvent>(`/events/${id}/archive`);
