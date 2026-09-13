import { get, patch } from './client';

export type ApiNotificationKind = 'JOIN_REQUEST' | 'APPROVAL' | 'REVIEW_UNLOCKED' | 'RATING_RECEIVED';

export type ApiNotification = {
  id: string;
  kind: ApiNotificationKind;
  payload: { eventId?: string; userId?: string; reviewerId?: string; joinRequestId?: string; decision?: 'APPROVED' | 'DECLINED' };
  read: boolean;
  createdAt: string;
  eventTitle: string | null;
  actorName: string | null;
};

export const listNotifications = () => get<ApiNotification[]>('/notifications');
export const markNotificationRead = (id: string) => patch<ApiNotification>(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => patch<{ count: number }>('/notifications/read-all');
