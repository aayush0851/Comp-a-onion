import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import type { AuthState } from './authStore/schema';
import { authInitialState, authReducer } from './authStore/model';
import { loadStoredAuth, persistAuth } from './authStore/service';
import type { OnboardingState } from './onboardingStore/schema';
import { onboardingInitialState, onboardingReducer } from './onboardingStore/model';
import type { PlansState } from './plansStore/schema';
import { plansInitialState, plansReducer } from './plansStore/model';
import type { ChatState } from './chatStore/schema';
import { chatInitialState, chatReducer } from './chatStore/model';
import type { ReviewState } from './reviewStore/schema';
import { reviewInitialState, reviewReducer } from './reviewStore/model';
import type { Action } from './actions';

export type AppState = AuthState & OnboardingState & PlansState & ChatState & ReviewState;

const initialState: AppState = {
  ...authInitialState,
  ...onboardingInitialState,
  ...plansInitialState,
  ...chatInitialState,
  ...reviewInitialState,
};

function rootReducer(state: AppState, action: Action): AppState {
  // Each slice reducer receives the state as updated by the ones before it (not
  // the pre-action state) so an untouched slice's `default: return state` can't
  // clobber a change another slice just made to the same shared object.
  let next: AppState = state;
  next = authReducer(next, action);
  next = onboardingReducer(next, action);
  next = plansReducer(next, action);
  next = chatReducer(next, action);
  next = reviewReducer(next, action);
  return next;
}

const StateCtx = createContext<AppState | null>(null);
const DispatchCtx = createContext<React.Dispatch<Action> | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(rootReducer, initialState);

  useEffect(() => {
    loadStoredAuth().then(({ isAuthenticated, onboarded }) => {
      dispatch({ type: 'HYDRATE_AUTH', isAuthenticated, onboarded });
    });
  }, []);

  useEffect(() => {
    if (!state.authReady) return;
    persistAuth(state.isAuthenticated, state.onboarded);
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

export type { Action } from './actions';
export type { Shape, PublishedPlan } from './plansStore/schema';
export type { HighlightMedia } from './onboardingStore/schema';
export { isPlanArchived, joinedCountFor, planArchiveReason } from './plansStore/model';
export { myAverageRating } from './reviewStore/model';
export { pendingReviewPlans } from './selectors';
