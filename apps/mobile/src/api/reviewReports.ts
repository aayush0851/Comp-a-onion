import { post } from './client';

export const reportPersonReview = (personReviewId: string, reason: string) =>
  post<{ id: string }>(`/person-reviews/${personReviewId}/report`, { reason });
