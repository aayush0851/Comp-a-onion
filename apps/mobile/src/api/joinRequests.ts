import { get, patch, post } from './client';
import type { ApiJoinRequest } from './types';

export const createJoinRequest = (eventId: string, introText?: string) =>
  post<ApiJoinRequest>(`/events/${eventId}/join-requests`, { introText });
export const listForHost = (eventId: string) => get<ApiJoinRequest[]>(`/events/${eventId}/join-requests`);
export const listMine = () => get<ApiJoinRequest[]>('/users/me/join-requests');
export const decide = (id: string, decision: 'APPROVED' | 'DECLINED') =>
  patch<ApiJoinRequest>(`/join-requests/${id}/decide`, { decision });
export const markRead = (id: string) => patch<ApiJoinRequest>(`/join-requests/${id}/read`);
