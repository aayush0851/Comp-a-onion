// setupScores/setupTags are keyed by planId (the post being reviewed);
// peopleTags/personRatings/personNotes/meetAgain/flagged are keyed by
// the reviewee's user id. reviewReplies is keyed by the id of a PersonReview
// someone else left about you (see api/reviews.ts).
export type ReviewState = {
  rvStep: 0 | 1 | 2;
  setupScores: Record<string, Record<string, number>>;
  setupTags: Record<string, string[]>;
  peopleTags: Record<string, string[]>;
  personRatings: Record<string, number>;
  personNotes: Record<string, string>;
  meetAgain: Record<string, boolean>;
  flagged: Record<string, boolean>;
  reviewedPlans: string[];
  reviewReplies: Record<string, string>;
};

export type ReviewAction =
  | { type: 'SET_RV_STEP'; step: 0 | 1 | 2 }
  | { type: 'SET_SETUP_SCORE'; planId: string; axis: string; score: number }
  | { type: 'TOGGLE_SETUP_TAG'; planId: string; tag: string }
  | { type: 'TOGGLE_PERSON_TAG'; personId: string; tag: string }
  | { type: 'SET_PERSON_RATING'; personId: string; rating: number }
  | { type: 'SET_PERSON_NOTE'; personId: string; note: string }
  | { type: 'TOGGLE_MEET_AGAIN'; personId: string }
  | { type: 'TOGGLE_FLAG'; personId: string }
  | { type: 'SUBMIT_REVIEW'; planId: string }
  | { type: 'POST_REVIEW_REPLY'; reviewId: string; reply: string };
