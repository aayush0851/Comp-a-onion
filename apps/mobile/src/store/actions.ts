import type { AuthAction } from './authStore/schema';
import type { OnboardingAction } from './onboardingStore/schema';
import type { PlansAction } from './plansStore/schema';
import type { ChatAction } from './chatStore/schema';
import type { ReviewAction } from './reviewStore/schema';

export type Action =
  | AuthAction
  | OnboardingAction
  | PlansAction
  | ChatAction
  | ReviewAction
  | { type: 'LOG_OUT' };
