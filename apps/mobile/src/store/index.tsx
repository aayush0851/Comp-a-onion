import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import type { AuthState } from './authStore/schema';
import { authInitialState, authReducer } from './authStore/model';
import { clearSession, loadStoredAuth, persistAuth } from './authStore/service';
import { registerForPushNotifications, unregisterPushNotifications } from '../push';
import type { OnboardingState } from './onboardingStore/schema';
import { onboardingInitialState, onboardingReducer } from './onboardingStore/model';
import type { PlansState } from './plansStore/schema';
import { plansInitialState, plansReducer } from './plansStore/model';
import type { ReviewState } from './reviewStore/schema';
import { reviewInitialState, reviewReducer } from './reviewStore/model';
import type { Action } from './actions';

export type AppState = AuthState & OnboardingState & PlansState & ReviewState;

const initialState: AppState = {
  ...authInitialState,
  ...onboardingInitialState,
  ...plansInitialState,
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
  next = reviewReducer(next, action);
  return next;
}

const StateCtx = createContext<AppState | null>(null);
const DispatchCtx = createContext<React.Dispatch<Action> | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(rootReducer, initialState);

  useEffect(() => {
    loadStoredAuth().then((identity) => {
      dispatch({ type: 'HYDRATE_AUTH', ...identity });
    });
  }, []);

  useEffect(() => {
    if (!state.authReady) return;
    if (!state.isAuthenticated) {
      clearSession();
      return;
    }
    persistAuth({
      isAuthenticated: state.isAuthenticated,
      onboarded: state.onboarded,
      email: state.email,
      name: state.name,
      authProvider: state.authProvider,
      userId: state.userId,
    });
  }, [state.authReady, state.isAuthenticated, state.onboarded, state.email, state.name, state.authProvider, state.userId]);

  useEffect(() => {
    if (!state.authReady) return;
    if (state.isAuthenticated) registerForPushNotifications();
    else unregisterPushNotifications();
  }, [state.authReady, state.isAuthenticated]);

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
export type { Shape } from './plansStore/schema';
export type { HighlightMedia } from './onboardingStore/schema';
