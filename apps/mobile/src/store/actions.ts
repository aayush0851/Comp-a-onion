import type { AuthAction } from './authStore/schema';
import type { ChatAction } from './chatStore/schema';
import type { OnboardingAction } from './onboardingStore/schema';
import type { PlansAction } from './plansStore/schema';
import type { ReviewAction } from './reviewStore/schema';

export type Action =
  | AuthAction
  | OnboardingAction
  | PlansAction
  | ReviewAction
  | ChatAction
  | { type: 'LOG_OUT' };
