import { get, post } from './client';
import type { ApiUser } from './types';

export type ApiChatMessage = {
  id: string;
  eventId: string | null;
  dmWithUserId: string | null;
  authorId: string;
  author: ApiUser;
  text: string;
  createdAt: string;
};

export type ApiDmThread = { peer: ApiUser; lastMessage: ApiChatMessage };

export const listEventMessages = (eventId: string, after?: string) =>
  get<ApiChatMessage[]>(`/events/${eventId}/messages${after ? `?after=${encodeURIComponent(after)}` : ''}`);
export const sendEventMessage = (eventId: string, text: string) =>
  post<ApiChatMessage>(`/events/${eventId}/messages`, { text });
export const listDmThread = (peerId: string) => get<ApiChatMessage[]>(`/users/${peerId}/dm`);
export const sendDm = (peerId: string, text: string) => post<ApiChatMessage>(`/users/${peerId}/dm`, { text });
export const listDmThreads = () => get<ApiDmThread[]>('/users/me/dm-threads');
