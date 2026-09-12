export type AuthState = {
  authReady: boolean;
  isAuthenticated: boolean;
  onboarded: boolean;
  proximityKm: number;
};

export type AuthAction =
  | { type: 'HYDRATE_AUTH'; isAuthenticated: boolean; onboarded: boolean; email: string; name: string; authProvider: 'google' | 'apple' | null }
  | { type: 'AUTH_SUCCESS' }
  | { type: 'SET_ONBOARDED' }
  | { type: 'SET_PROXIMITY'; km: number };
