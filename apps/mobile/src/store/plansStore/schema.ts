import type { CostMode, GenderRestriction, QueueRequest } from '../../data';

export type Shape = 'duo' | 'group' | null;

export type PublishedPlan = {
  id: string;
  title: string;
  tags: string[];
  date: string | null;
  time: string | null;
  venue: string | null;
  shape: Shape;
  size: number;
  approvalRequired: boolean;
  genderRestriction: GenderRestriction;
  costMode: CostMode | null;
  createdAt: number;
  requesters: QueueRequest[];
  decided: Record<string, 'in' | 'out'>;
  archived: boolean;
};

export type PlansState = {
  requested: string[];
  filter: 0 | 1 | 2;

  // create-flow draft
  step: 0 | 1 | 2;
  planTitle: string;
  planTags: string[];
  planDate: string | null;
  planTime: string | null;
  planVenue: string | null;
  shape: Shape;
  size: number;
  approvalRequired: boolean;
  genderRestriction: GenderRestriction;
  costMode: CostMode | null;
  publishedPlans: PublishedPlan[];

  // host queue
  queue: QueueRequest[];
  decided: Record<string, 'in' | 'out'>;
};

export type PlansAction =
  | { type: 'REQUEST_JOIN'; id: string }
  | { type: 'SET_FILTER'; filter: 0 | 1 | 2 }
  | { type: 'SET_STEP'; step: 0 | 1 | 2 }
  | { type: 'SET_TITLE'; title: string }
  | { type: 'TOGGLE_TAG'; tag: string }
  | { type: 'SET_DATE'; date: string }
  | { type: 'SET_TIME'; time: string }
  | { type: 'CLEAR_TIME' }
  | { type: 'SET_VENUE'; venue: string }
  | { type: 'SET_SHAPE'; shape: Shape }
  | { type: 'SET_SIZE'; delta: number }
  | { type: 'SET_APPROVAL_REQUIRED'; value: boolean }
  | { type: 'SET_GENDER_RESTRICTION'; genderRestriction: GenderRestriction }
  | { type: 'TOGGLE_COST_MODE'; costMode: CostMode }
  | { type: 'DECIDE'; id: string; decision: 'in' | 'out' }
  | { type: 'RESET_CREATE' }
  | { type: 'PUBLISH_PLAN' }
  | { type: 'DECIDE_REQUESTER'; planId: string; requesterId: string; decision: 'in' | 'out' }
  | { type: 'ARCHIVE_PLAN'; planId: string };
