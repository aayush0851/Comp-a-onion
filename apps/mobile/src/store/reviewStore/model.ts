import { RECEIVED_REVIEWS } from '../../data';
import type { Action } from '../actions';
import type { AppState } from '../index';
import type { ReviewState } from './schema';

export const reviewInitialState: ReviewState = {
  rvStep: 0,
  setupScores: {},
  setupTags: {},
  peopleTags: {},
  personRatings: {},
  personNotes: {},
  meetAgain: {},
  flagged: {},
  reviewedPlans: [],
  reviewReplies: {},
};

export function myAverageRating(): number {
  const sum = RECEIVED_REVIEWS.reduce((acc, r) => acc + r.rating, 0);
  return RECEIVED_REVIEWS.length ? sum / RECEIVED_REVIEWS.length : 0;
}

export function reviewReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_RV_STEP':
      return { ...state, rvStep: action.step };
    case 'SET_SETUP_SCORE': {
      const cur = state.setupScores[action.planId] ?? {};
      return { ...state, setupScores: { ...state.setupScores, [action.planId]: { ...cur, [action.axis]: action.score } } };
    }
    case 'TOGGLE_SETUP_TAG': {
      const cur = state.setupTags[action.planId] ?? [];
      const has = cur.includes(action.tag);
      const next = has ? cur.filter((t) => t !== action.tag) : [...cur, action.tag];
      return { ...state, setupTags: { ...state.setupTags, [action.planId]: next } };
    }
    case 'TOGGLE_PERSON_TAG': {
      const cur = state.peopleTags[action.personId] ?? [];
      const has = cur.includes(action.tag);
      const next = has ? cur.filter((t) => t !== action.tag) : [...cur, action.tag];
      return { ...state, peopleTags: { ...state.peopleTags, [action.personId]: next } };
    }
    case 'SET_PERSON_RATING':
      return { ...state, personRatings: { ...state.personRatings, [action.personId]: action.rating } };
    case 'SET_PERSON_NOTE':
      return { ...state, personNotes: { ...state.personNotes, [action.personId]: action.note } };
    case 'TOGGLE_MEET_AGAIN':
      return { ...state, meetAgain: { ...state.meetAgain, [action.personId]: !state.meetAgain[action.personId] } };
    case 'TOGGLE_FLAG':
      return { ...state, flagged: { ...state.flagged, [action.personId]: !state.flagged[action.personId] } };
    case 'SUBMIT_REVIEW':
      return { ...state, reviewedPlans: state.reviewedPlans.includes(action.planId) ? state.reviewedPlans : [...state.reviewedPlans, action.planId] };
    case 'POST_REVIEW_REPLY':
      return { ...state, reviewReplies: { ...state.reviewReplies, [action.reviewId]: action.reply } };
    case 'LOG_OUT':
      return { ...state, ...reviewInitialState };
    default:
      return state;
  }
}
