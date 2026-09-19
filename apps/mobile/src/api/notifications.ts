import { get, patch } from './client';

export type ApiNotificationKind = 'JOIN_REQUEST' | 'APPROVAL' | 'REVIEW_UNLOCKED' | 'RATING_RECEIVED';

export type ApiNotification = {
  id: string;
  kind: ApiNotificationKind;
  payload: { postId?: string; userId?: string; reviewerId?: string; joinRequestId?: string; decision?: 'APPROVED' | 'DECLINED' };
  read: boolean;
  createdAt: string;
  postTitle: string | null;
  actorName: string | null;
};

export const listNotifications = () => get<ApiNotification[]>('/notifications');
export const markNotificationRead = (id: string) => patch<ApiNotification>(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => patch<{ count: number }>('/notifications/read-all');

// Worth a flag: someone asked to join one of my hangouts, or I got let in. A pass is not flagged;
// that card is shown disabled on its own.
export const isPlanUpdate = (n: ApiNotification) =>
  !n.read && !!n.payload.postId && (n.kind === 'JOIN_REQUEST' || (n.kind === 'APPROVAL' && n.payload.decision === 'APPROVED'));

// The plan screen currently in front; updates for it are acknowledged on arrival since the screen already shows them.
let openPostId: string | null = null;
export const setOpenPost = (postId: string | null) => { openPostId = postId; };
export const isPostOpen = (postId: string | undefined) => !!postId && postId === openPostId;

// Opening a plan acknowledges the updates about it: mark its unread notifications of these kinds read.
export async function markPostNotificationsRead(postId: string, kinds: ApiNotificationKind[]) {
  const all = await listNotifications();
  await Promise.all(
    all.filter((n) => !n.read && kinds.includes(n.kind) && n.payload.postId === postId).map((n) => markNotificationRead(n.id)),
  );
}
