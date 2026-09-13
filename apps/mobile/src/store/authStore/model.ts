import type { Action } from '../actions';
import type { AppState } from '../index';
import type { AuthState } from './schema';

export const authInitialState: AuthState = {
  authReady: false,
  isAuthenticated: false,
  onboarded: false,
  proximityKm: 100,
  userId: null,
};

export function authReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'HYDRATE_AUTH':
      return { ...state, authReady: true, isAuthenticated: action.isAuthenticated, onboarded: action.onboarded, userId: action.userId };
    case 'AUTH_SUCCESS':
      return { ...state, isAuthenticated: true, userId: action.userId };
    case 'SET_ONBOARDED':
      return { ...state, onboarded: true };
    case 'SET_PROXIMITY':
      return { ...state, proximityKm: action.km };
    case 'LOG_OUT':
      return { ...state, ...authInitialState, authReady: true };
    default:
      return state;
  }
}
