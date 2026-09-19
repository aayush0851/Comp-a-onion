import type { CostMode, GenderRestriction } from '../../data';
import type { Action } from '../actions';
import type { AppState } from '../index';
import type { PlansState, Shape } from './schema';

const emptyDraft = {
  step: 0 as const,
  planTitle: '',
  planDescription: '',
  planTags: [] as string[],
  planDate: null as string | null,
  planTime: null as string | null,
  planVenue: null as string | null,
  shape: null as Shape,
  size: 4,
  approvalRequired: true,
  genderRestriction: 'anyone' as GenderRestriction,
  costMode: null as CostMode | null,
};

export const plansInitialState: PlansState = {
  filter: 0,
  searchQuery: '',
  groupSize: 2,
  whoThere: 2,
  hideAsked: false,
  boardVersion: 0,
  postUpdates: [] as string[],
  typeFilters: [] as string[],
  ...emptyDraft,
};

export function plansReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_FILTER':
      return { ...state, filter: action.filter };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.query };
    case 'SET_GROUP_SIZE':
      return { ...state, groupSize: action.groupSize };
    case 'SET_WHO_THERE':
      return { ...state, whoThere: action.whoThere };
    case 'SET_TYPE_FILTERS':
      return { ...state, typeFilters: action.types };
    case 'SET_POST_UPDATES':
      return { ...state, postUpdates: [...new Set(action.ids)] };
    case 'ADD_POST_UPDATE':
      return state.postUpdates.includes(action.postId) ? state : { ...state, postUpdates: [...state.postUpdates, action.postId] };
    case 'CLEAR_POST_UPDATE':
      return state.postUpdates.includes(action.postId) ? { ...state, postUpdates: state.postUpdates.filter((id) => id !== action.postId) } : state;
    case 'REFRESH_BOARD':
      return { ...state, boardVersion: state.boardVersion + 1 };
    case 'SET_HIDE_ASKED':
      return { ...state, hideAsked: action.value };
    case 'SET_STEP':
      return { ...state, step: action.step };
    case 'SET_TITLE':
      return { ...state, planTitle: action.title };
    case 'SET_DESCRIPTION':
      return { ...state, planDescription: action.description };
    case 'TOGGLE_TAG': {
      const has = state.planTags.includes(action.tag);
      return { ...state, planTags: has ? [] : [action.tag] };
    }
    case 'SET_DATE':
      return { ...state, planDate: action.date };
    case 'SET_TIME':
      return { ...state, planTime: action.time };
    case 'CLEAR_TIME':
      return { ...state, planTime: null };
    case 'SET_VENUE':
      return { ...state, planVenue: action.venue };
    case 'SET_SHAPE':
      return { ...state, shape: action.shape, size: action.shape === 'duo' ? 2 : Math.max(state.size, 3) };
    case 'SET_SIZE':
      return { ...state, size: Math.min(12, Math.max(3, state.size + action.delta)) };
    case 'SET_APPROVAL_REQUIRED':
      return { ...state, approvalRequired: action.value };
    case 'SET_GENDER_RESTRICTION':
      return { ...state, genderRestriction: action.genderRestriction };
    case 'TOGGLE_COST_MODE':
      return { ...state, costMode: state.costMode === action.costMode ? null : action.costMode };
    case 'RESET_CREATE':
      return { ...state, ...emptyDraft };
    case 'LOG_OUT':
      return { ...state, ...plansInitialState };
    default:
      return state;
  }
}
