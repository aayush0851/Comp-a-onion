import { get, post } from './client';
import type { ApiEvent, ApiUser } from './types';

export type PersonReviewInput = {
  revieweeId: string;
  tags?: string[];
  rating?: number;
  note?: string;
  meetAgain?: boolean;
  flagged?: boolean;
};

export type SubmitReviewInput = {
  setupScores: Record<string, number>;
  setupTags?: string[];
  personReviews: PersonReviewInput[];
};

export type ApiPersonReview = {
  id: string;
  reviewId: string;
  revieweeId: string;
  tags: string[];
  rating: number | null;
  note: string | null;
  meetAgain: boolean;
  flagged: boolean;
  review: {
    id: string;
    eventId: string;
    setupScores: Record<string, number>;
    setupTags: string[];
    createdAt: string;
    event: Pick<ApiEvent, 'id' | 'title' | 'date'>;
    reviewer: ApiUser;
  };
};

export const submitReview = (eventId: string, dto: SubmitReviewInput) =>
  post<{ ok: true }>(`/events/${eventId}/reviews`, dto);
export const hasReviewed = (eventId: string) => get<{ id: string } | null>(`/events/${eventId}/reviews/mine`);
export const listReceived = () => get<ApiPersonReview[]>('/users/me/reviews/received');
