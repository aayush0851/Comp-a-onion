import { CostMode, GenderRestriction, isDateKeyPast, QUEUE_SEED, REQUESTER_POOL } from '../../data';
import type { Action } from '../actions';
import type { AppState } from '../index';
import type { PlansState, PublishedPlan, Shape } from './schema';

const emptyDraft = {
  step: 0 as const,
  planTitle: '',
  planTags: [] as string[],
  planDate: null as string | null,
  planTime: null as string | null,
  planVenue: null as string | null,
  shape: null as Shape,
  size: 4,
  approvalRequired: true,
  genderRestriction: 'everyone' as GenderRestriction,
  costMode: null as CostMode | null,
};

export const plansInitialState: PlansState = {
  requested: [],
  filter: 0,
  ...emptyDraft,
  publishedPlans: [],
  queue: QUEUE_SEED,
  decided: {},
};

export function isPlanArchived(p: PublishedPlan): boolean {
  return p.archived || (!!p.date && isDateKeyPast(p.date));
}

export function joinedCountFor(p: PublishedPlan): number {
  return p.approvalRequired ? Object.values(p.decided).filter((d) => d === 'in').length : p.requesters.length;
}

export function planArchiveReason(p: PublishedPlan): string {
  if (p.archived) return 'Archived by you';
  return joinedCountFor(p) > 0 ? 'Completed' : 'Expired — nobody joined';
}

export function plansReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'REQUEST_JOIN':
      return { ...state, requested: [...state.requested, action.id] };
    case 'SET_FILTER':
      return { ...state, filter: action.filter };
    case 'SET_STEP':
      return { ...state, step: action.step };
    case 'SET_TITLE':
      return { ...state, planTitle: action.title };
    case 'TOGGLE_TAG': {
      const has = state.planTags.includes(action.tag);
      let tags = has ? state.planTags.filter((t) => t !== action.tag) : [...state.planTags, action.tag];
      if (tags.length > 3) tags = tags.slice(tags.length - 3);
      return { ...state, planTags: tags };
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
    case 'DECIDE':
      return { ...state, decided: { ...state.decided, [action.id]: action.decision } };
    case 'RESET_CREATE':
      return { ...state, ...emptyDraft };
    case 'PUBLISH_PLAN': {
      const id = `plan-${Date.now()}`;
      const plan: PublishedPlan = {
        id,
        title: state.planTitle.trim() || 'Untitled plan',
        tags: state.planTags,
        date: state.planDate,
        time: state.planTime,
        venue: state.planVenue,
        shape: state.shape,
        size: state.size,
        approvalRequired: state.approvalRequired,
        genderRestriction: state.genderRestriction,
        costMode: state.costMode,
        createdAt: Date.now(),
        requesters: REQUESTER_POOL.map((r) => ({ ...r, id: `${id}-${r.id}` })),
        decided: {},
        archived: false,
      };
      return { ...state, ...emptyDraft, publishedPlans: [plan, ...state.publishedPlans] };
    }
    case 'DECIDE_REQUESTER':
      return {
        ...state,
        publishedPlans: state.publishedPlans.map((p) => (p.id === action.planId
          ? { ...p, decided: { ...p.decided, [action.requesterId]: action.decision } }
          : p)),
      };
    case 'ARCHIVE_PLAN':
      return {
        ...state,
        publishedPlans: state.publishedPlans.map((p) => (p.id === action.planId ? { ...p, archived: true } : p)),
      };
    case 'LOG_OUT':
      return { ...state, ...plansInitialState };
    default:
      return state;
  }
}
