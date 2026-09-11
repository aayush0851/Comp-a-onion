import { isPlanArchived, joinedCountFor } from './plansStore/model';
import type { PublishedPlan } from './plansStore/schema';
import type { AppState } from './index';

export function pendingReviewPlans(state: AppState): PublishedPlan[] {
  return state.publishedPlans.filter((p) => isPlanArchived(p) && joinedCountFor(p) > 0 && !state.reviewedPlans.includes(p.id));
}
