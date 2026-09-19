import { get, post } from './client';
import type { ApiUser } from './types';

export type ApiChatMessage = {
  id: string;
  postId: string | null;
  dmWithUserId: string | null;
  authorId: string;
  author: ApiUser;
  text: string;
  createdAt: string;
};

export type ApiDmThread = { peer: ApiUser; lastMessage: ApiChatMessage };
export type ApiPostThread = { postId: string; title: string; lastMessage: ApiChatMessage | null };

export const listPostMessages = (postId: string, after?: string) =>
  get<ApiChatMessage[]>(`/posts/${postId}/messages${after ? `?after=${encodeURIComponent(after)}` : ''}`);
export const sendPostMessage = (postId: string, text: string) =>
  post<ApiChatMessage>(`/posts/${postId}/messages`, { text });
export const listPostThreads = () => get<ApiPostThread[]>('/chat/post-threads');
export const listDmThread = (peerId: string) => get<ApiChatMessage[]>(`/users/${peerId}/dm`);
export const sendDm = (peerId: string, text: string) => post<ApiChatMessage>(`/users/${peerId}/dm`, { text });
export const listDmThreads = () => get<ApiDmThread[]>('/users/me/dm-threads');
