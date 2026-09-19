import type { CostMode, GenderRestriction } from '../../data';

export type Shape = 'duo' | 'group' | null;

export type PlansState = {
  filter: 0 | 1 | 2 | 3;
  searchQuery: string;
  groupSize: 0 | 1 | 2;
  whoThere: 0 | 1 | 2;
  hideAsked: boolean;
  // Bumped to make the board re-fetch and re-open its stream (e.g. after the profile location changes).
  boardVersion: number;
  typeFilters: string[];

  // create-flow draft
  step: 0 | 1 | 2;
  planTitle: string;
  planDescription: string;
  planTags: string[];
  planDate: string | null;
  planTime: string | null;
  planVenue: string | null;
  shape: Shape;
  size: number;
  approvalRequired: boolean;
  genderRestriction: GenderRestriction;
  costMode: CostMode | null;
};

export type PlansAction =
  | { type: 'SET_FILTER'; filter: 0 | 1 | 2 | 3 }
  | { type: 'SET_SEARCH_QUERY'; query: string }
  | { type: 'SET_GROUP_SIZE'; groupSize: 0 | 1 | 2 }
  | { type: 'SET_WHO_THERE'; whoThere: 0 | 1 | 2 }
  | { type: 'SET_HIDE_ASKED'; value: boolean }
  | { type: 'REFRESH_BOARD' }
  | { type: 'SET_TYPE_FILTERS'; types: string[] }
  | { type: 'SET_STEP'; step: 0 | 1 | 2 }
  | { type: 'SET_TITLE'; title: string }
  | { type: 'SET_DESCRIPTION'; description: string }
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
  | { type: 'RESET_CREATE' };
