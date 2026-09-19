import type { ApiUser } from '../api/types';
import { SELFIE_VERIFICATION_ENABLED } from './constants';

export type OnboardingRoute = 'Name' | 'Birthday' | 'Gender' | 'Vibe' | 'ProfilePhoto' | 'Highlights' | 'Verify' | 'Board';

// Each onboarding step saves its own field, so the first missing one is where the user left off.
export function onboardingRoute(user: ApiUser): OnboardingRoute {
  if (user.isOnboarded) return 'Board';
  if (!user.name) return 'Name';
  if (!user.dob) return 'Birthday';
  if (!user.gender) return 'Gender';
  if (!user.vibeTags.length) return 'Vibe';
  if (!user.profilePicture) return 'ProfilePhoto';
  if (!user.highlights.length) return 'Highlights';
  return SELFIE_VERIFICATION_ENABLED ? 'Verify' : 'Board';
}

// The flag, not the route, decides "onboarded": landing on the board is what sets it.
export const resumeOnboarding = (user: ApiUser) => ({ onboarded: !!user.isOnboarded, onboardingRoute: onboardingRoute(user) });
