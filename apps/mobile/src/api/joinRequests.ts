import { get, patch, post } from './client';
import type { ApiJoinRequest } from './types';

export const createJoinRequest = (postId: string, introText?: string) =>
  post<ApiJoinRequest>(`/posts/${postId}/join-requests`, { introText });
export const listForHost = (postId: string) => get<ApiJoinRequest[]>(`/posts/${postId}/join-requests`);
export const listMine = () => get<ApiJoinRequest[]>('/users/me/join-requests');
export const decide = (id: string, decision: 'APPROVED' | 'DECLINED') =>
  patch<ApiJoinRequest>(`/join-requests/${id}/decide`, { decision });
// A decision (approved or passed) the requester hasn't acknowledged yet.
export const isUnread = (jr: ApiJoinRequest) => jr.status !== 'PENDING' && !jr.lastReadAt;
export const markRead = (id: string) => patch<ApiJoinRequest>(`/join-requests/${id}/read`);
