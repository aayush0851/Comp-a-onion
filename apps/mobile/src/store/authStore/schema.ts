import type { OnboardingRoute } from '../../data/onboarding';

export type AuthState = {
  authReady: boolean;
  isAuthenticated: boolean;
  onboarded: boolean;
  // Where a signed-in user who hasn't finished onboarding picks up again.
  onboardingRoute: OnboardingRoute;
  proximityKm: number;
  userId: string | null;
};

export type AuthAction =
  | { type: 'HYDRATE_AUTH'; isAuthenticated: boolean; onboarded: boolean; onboardingRoute: OnboardingRoute; email: string; name: string; authProvider: 'google' | 'apple' | null; userId: string | null }
  | { type: 'AUTH_SUCCESS'; userId: string; onboarded: boolean; onboardingRoute: OnboardingRoute }
  | { type: 'SET_ONBOARDED' }
  | { type: 'SET_PROXIMITY'; km: number };
