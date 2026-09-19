import { get, post } from './client';
import type { ApiPost, ApiUser } from './types';

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
    postId: string;
    setupScores: Record<string, number>;
    setupTags: string[];
    createdAt: string;
    post: Pick<ApiPost, 'id' | 'title' | 'date'>;
    reviewer: ApiUser;
  };
};

export const submitReview = (postId: string, dto: SubmitReviewInput) =>
  post<{ ok: true }>(`/posts/${postId}/reviews`, dto);
export const hasReviewed = (postId: string) => get<{ id: string } | null>(`/posts/${postId}/reviews/mine`);
export const listReceived = () => get<ApiPersonReview[]>('/users/me/reviews/received');
