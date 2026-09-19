import { get, patch, del } from './client';
import type { ApiUser } from './types';

export type UpdateMeInput = Partial<{
  name: string;
  dob: string;
  gender: string;
  genderVisible: boolean;
  profilePicture: string;
  highlights: string[];
  proximityKm: number;
  vibeTags: string[];
  latitude: number;
  longitude: number;
  isOnboarded: true;
}>;

export const getMe = () => get<ApiUser>('/users/me');
export const updateMe = (dto: UpdateMeInput) => patch<ApiUser>('/users/me', dto);
export const deleteMe = () => del<ApiUser>('/users/me');
export const getPublicProfile = (id: string) => get<ApiUser>(`/users/${id}`);
