import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  QUEUE_SEED, CHAT_SEED, ChatMessage, QueueRequest, REQUESTER_POOL, GenderRestriction, CostMode, isDateKeyPast,
} from './data';

const AUTH_STORAGE_KEY = 'companion:auth';

export type Shape = 'duo' | 'group' | null;

type Decided = Record<string, 'in' | 'out'>;

export type HighlightMedia = { uri: string; type: 'image' | 'video' };

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

export function isPlanArchived(p: PublishedPlan): boolean {
  return p.archived || (!!p.date && isDateKeyPast(p.date));
}

export function planArchiveReason(p: PublishedPlan): string {
  if (p.archived) return 'Archived by you';
  const joinedCount = p.approvalRequired
    ? Object.values(p.decided).filter((d) => d === 'in').length
    : p.requesters.length;
  return joinedCount > 0 ? 'Completed' : 'Expired — nobody joined';
}

export type AppState = {
  requested: string[];
  filter: 0 | 1 | 2;

  // auth
  authReady: boolean;
  isAuthenticated: boolean;
  onboarded: boolean;
  proximityKm: number;

  // onboarding
  phone: string;
  name: string;
  dob: { day: string; month: string; year: string };
  gender: string | null;
  genderCustom: string;
  genderVisible: boolean;
  vibeTags: string[];
  selfieStatus: 'none' | 'queued';
  profilePhoto: string | null;
  highlights: HighlightMedia[];

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
  decided: Decided;

  // chat
  msgs: ChatMessage[];
  requesterMsgs: Record<string, ChatMessage[]>;

  // review
  rvStep: 0 | 1 | 2;
  setupScores: Record<string, number>;
  setupTags: string[];
  peopleTags: Record<string, string[]>;
  meetAgain: Record<string, boolean>;
  flagged: Record<string, boolean>;
};

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

const initialState: AppState = {
  requested: [],
  filter: 0,

  authReady: false,
  isAuthenticated: false,
  onboarded: false,
  proximityKm: 100,

  phone: '',
  name: '',
  dob: { day: '', month: '', year: '' },
  gender: null,
  genderCustom: '',
  genderVisible: true,
  vibeTags: [],
  selfieStatus: 'none',
  profilePhoto: null,
  highlights: [],

  ...emptyDraft,
  publishedPlans: [],

  queue: QUEUE_SEED,
  decided: {},

  msgs: CHAT_SEED,
  requesterMsgs: {},

  rvStep: 0,
  setupScores: { venue: 4, timing: 3, size: 4, host: 5 },
  setupTags: [],
  peopleTags: {},
  meetAgain: {},
  flagged: {},
};

type Action =
  | { type: 'HYDRATE_AUTH'; isAuthenticated: boolean; onboarded: boolean }
  | { type: 'AUTH_SUCCESS' }
  | { type: 'SET_ONBOARDED' }
  | { type: 'LOG_OUT' }
  | { type: 'SET_PROXIMITY'; km: number }
  | { type: 'REQUEST_JOIN'; id: string }
  | { type: 'SET_FILTER'; filter: 0 | 1 | 2 }
  | { type: 'SET_PHONE'; phone: string }
  | { type: 'SET_NAME'; name: string }
  | { type: 'SET_DOB'; field: 'day' | 'month' | 'year'; value: string }
  | { type: 'SET_GENDER'; gender: string }
  | { type: 'SET_GENDER_CUSTOM'; value: string }
  | { type: 'TOGGLE_GENDER_VISIBLE' }
  | { type: 'TOGGLE_VIBE_TAG'; tag: string }
  | { type: 'SET_SELFIE_QUEUED' }
  | { type: 'SET_PROFILE_PHOTO'; uri: string }
  | { type: 'ADD_HIGHLIGHT'; media: HighlightMedia }
  | { type: 'REMOVE_HIGHLIGHT'; index: number }
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
  | { type: 'SEND_MSG'; text: string }
  | { type: 'SEND_REQUESTER_MSG'; requesterId: string; text: string }
  | { type: 'SET_RV_STEP'; step: 0 | 1 | 2 }
  | { type: 'SET_SETUP_SCORE'; axis: string; score: number }
  | { type: 'TOGGLE_SETUP_TAG'; tag: string }
  | { type: 'TOGGLE_PERSON_TAG'; personId: string; tag: string }
  | { type: 'TOGGLE_MEET_AGAIN'; personId: string }
  | { type: 'TOGGLE_FLAG'; personId: string }
  | { type: 'RESET_CREATE' }
  | { type: 'PUBLISH_PLAN' }
  | { type: 'DECIDE_REQUESTER'; planId: string; requesterId: string; decision: 'in' | 'out' }
  | { type: 'ARCHIVE_PLAN'; planId: string };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'HYDRATE_AUTH':
      return { ...state, authReady: true, isAuthenticated: action.isAuthenticated, onboarded: action.onboarded };
    case 'AUTH_SUCCESS':
      return { ...state, isAuthenticated: true };
    case 'SET_ONBOARDED':
      return { ...state, onboarded: true };
    case 'LOG_OUT':
      return { ...initialState, authReady: true };
    case 'SET_PROXIMITY':
      return { ...state, proximityKm: action.km };
    case 'REQUEST_JOIN':
      return { ...state, requested: [...state.requested, action.id] };
    case 'SET_FILTER':
      return { ...state, filter: action.filter };
    case 'SET_PHONE':
      return { ...state, phone: action.phone };
    case 'SET_NAME':
      return { ...state, name: action.name };
    case 'SET_DOB':
      return { ...state, dob: { ...state.dob, [action.field]: action.value } };
    case 'SET_GENDER':
      return { ...state, gender: action.gender };
    case 'SET_GENDER_CUSTOM':
      return { ...state, genderCustom: action.value };
    case 'TOGGLE_GENDER_VISIBLE':
      return { ...state, genderVisible: !state.genderVisible };
    case 'SET_SELFIE_QUEUED':
      return { ...state, selfieStatus: 'queued' };
    case 'SET_PROFILE_PHOTO':
      return { ...state, profilePhoto: action.uri };
    case 'ADD_HIGHLIGHT':
      return { ...state, highlights: [...state.highlights, action.media].slice(0, 6) };
    case 'REMOVE_HIGHLIGHT':
      return { ...state, highlights: state.highlights.filter((_, i) => i !== action.index) };
    case 'TOGGLE_VIBE_TAG': {
      const has = state.vibeTags.includes(action.tag);
      let tags = has ? state.vibeTags.filter((t) => t !== action.tag) : [...state.vibeTags, action.tag];
      if (tags.length > 3) tags = tags.slice(tags.length - 3);
      return { ...state, vibeTags: tags };
    }
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
    case 'SEND_MSG': {
      const text = action.text.trim();
      if (!text) return state;
      return { ...state, msgs: [...state.msgs, { id: `m${state.msgs.length + 1}`, author: 'You', mine: true, text }] };
    }
    case 'SEND_REQUESTER_MSG': {
      const text = action.text.trim();
      if (!text) return state;
      const existing = state.requesterMsgs[action.requesterId] ?? [];
      const msg: ChatMessage = { id: `rm${existing.length + 1}`, author: 'You', mine: true, text };
      return { ...state, requesterMsgs: { ...state.requesterMsgs, [action.requesterId]: [...existing, msg] } };
    }
    case 'SET_RV_STEP':
      return { ...state, rvStep: action.step };
    case 'SET_SETUP_SCORE':
      return { ...state, setupScores: { ...state.setupScores, [action.axis]: action.score } };
    case 'TOGGLE_SETUP_TAG': {
      const has = state.setupTags.includes(action.tag);
      return { ...state, setupTags: has ? state.setupTags.filter((t) => t !== action.tag) : [...state.setupTags, action.tag] };
    }
    case 'TOGGLE_PERSON_TAG': {
      const cur = state.peopleTags[action.personId] ?? [];
      const has = cur.includes(action.tag);
      const next = has ? cur.filter((t) => t !== action.tag) : [...cur, action.tag];
      return { ...state, peopleTags: { ...state.peopleTags, [action.personId]: next } };
    }
    case 'TOGGLE_MEET_AGAIN':
      return { ...state, meetAgain: { ...state.meetAgain, [action.personId]: !state.meetAgain[action.personId] } };
    case 'TOGGLE_FLAG':
      return { ...state, flagged: { ...state.flagged, [action.personId]: !state.flagged[action.personId] } };
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
    default:
      return state;
  }
}

const StateCtx = createContext<AppState | null>(null);
const DispatchCtx = createContext<React.Dispatch<Action> | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    AsyncStorage.getItem(AUTH_STORAGE_KEY)
      .then((raw) => {
        const saved = raw ? JSON.parse(raw) : null;
        dispatch({ type: 'HYDRATE_AUTH', isAuthenticated: !!saved?.isAuthenticated, onboarded: !!saved?.onboarded });
      })
      .catch(() => dispatch({ type: 'HYDRATE_AUTH', isAuthenticated: false, onboarded: false }));
  }, []);

  useEffect(() => {
    if (!state.authReady) return;
    const payload = JSON.stringify({ isAuthenticated: state.isAuthenticated, onboarded: state.onboarded });
    AsyncStorage.setItem(AUTH_STORAGE_KEY, payload).catch(() => {});
  }, [state.authReady, state.isAuthenticated, state.onboarded]);

  const value = useMemo(() => state, [state]);
  return (
    <StateCtx.Provider value={value}>
      <DispatchCtx.Provider value={dispatch}>{children}</DispatchCtx.Provider>
    </StateCtx.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(StateCtx);
  if (!ctx) throw new Error('useAppState must be used within AppProvider');
  return ctx;
}

export function useAppDispatch() {
  const ctx = useContext(DispatchCtx);
  if (!ctx) throw new Error('useAppDispatch must be used within AppProvider');
  return ctx;
}
