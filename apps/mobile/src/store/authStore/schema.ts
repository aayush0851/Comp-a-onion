export type AuthState = {
  authReady: boolean;
  isAuthenticated: boolean;
  onboarded: boolean;
  proximityKm: number;
  userId: string | null;
};

export type AuthAction =
  | { type: 'HYDRATE_AUTH'; isAuthenticated: boolean; onboarded: boolean; email: string; name: string; authProvider: 'google' | 'apple' | null; userId: string | null }
  | { type: 'AUTH_SUCCESS'; userId: string }
  | { type: 'SET_ONBOARDED' }
  | { type: 'SET_PROXIMITY'; km: number };
