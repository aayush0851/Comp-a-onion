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

export type ApiDmThread = { peer: ApiUser; post: { id: string; title: string }; lastMessage: ApiChatMessage; unreadCount: number };
export type ApiPostThread = { postId: string; title: string; lastMessage: ApiChatMessage | null; unreadCount: number };

// One key per conversation: a hangout's group chat is its postId, a host chat is postId:peerId.
export const threadKey = (postId: string, peerId?: string | null) => (peerId ? `${postId}:${peerId}` : postId);
export const messageThreadKey = (m: ApiChatMessage, myId: string | null) =>
  threadKey(m.postId!, m.dmWithUserId && (m.authorId === myId ? m.dmWithUserId : m.authorId));

// Unread counts keyed by threadKey, only for threads that have any.
export const unreadCounts = (threads: ApiPostThread[], dms: ApiDmThread[]) =>
  Object.fromEntries([
    ...threads.map((t) => [threadKey(t.postId), t.unreadCount] as const),
    ...dms.map((t) => [threadKey(t.post.id, t.peer.id), t.unreadCount] as const),
  ].filter(([, n]) => n > 0));

// The chat currently in front; its incoming messages are read on arrival.
let openThread: string | null = null;
export const setOpenThread = (key: string | null) => { openThread = key; };
export const isThreadOpen = (key: string) => key === openThread;

export const listPostMessages = (postId: string, after?: string) =>
  get<ApiChatMessage[]>(`/posts/${postId}/messages${after ? `?after=${encodeURIComponent(after)}` : ''}`);
export const sendPostMessage = (postId: string, text: string) =>
  post<ApiChatMessage>(`/posts/${postId}/messages`, { text });
// Thread lists carry unread counts, so they wait for a read marker still in flight — otherwise a
// chat you just backed out of could come back unread.
let readInFlight: Promise<unknown> = Promise.resolve();
export const markThreadRead = (postId: string, peerId?: string) =>
  (readInFlight = post<{ ok: true }>(peerId ? dmPath(peerId, postId, '/read') : `/posts/${postId}/messages/read`).catch(() => {}));
export const listPostThreads = () => readInFlight.then(() => get<ApiPostThread[]>('/chat/post-threads'));
// A host chat always belongs to a plan.
export const dmPath = (peerId: string, postId: string, suffix = '') =>
  `/users/${peerId}/dm${suffix}?postId=${encodeURIComponent(postId)}`;
export const listDmThread = (peerId: string, postId: string) => get<ApiChatMessage[]>(dmPath(peerId, postId));
export const sendDm = (peerId: string, text: string, postId: string) => post<ApiChatMessage>(dmPath(peerId, postId), { text });
export const listDmThreads = () => readInFlight.then(() => get<ApiDmThread[]>('/users/me/dm-threads'));
export const loadUnreadCounts = async () => {
  const [threads, dms] = await Promise.all([listPostThreads(), listDmThreads()]);
  return unreadCounts(threads, dms);
};
