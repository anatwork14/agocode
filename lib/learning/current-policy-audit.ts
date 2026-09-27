import type { StorageLike } from "./evidence.ts";
import { readProblemRecognitionHistory } from "./independence.ts";
import { buildRecommendationPolicyAudit, type RecommendationPolicyAudit } from "./recommendation-policy.ts";
import { readRecommendationHistory } from "./recommendations.ts";
import { readReasoningAttemptHistory } from "./reasoning-attempts.ts";
import { buildRecommendationOutcomeAudit } from "./system-evaluation.ts";

/**
 * Rebuilds the current recommendation-policy audit from objective browser-local evidence.
 * Lifecycle admission uses this instead of trusting a UI caller to pass an already-computed audit.
 */
export function buildCurrentRecommendationPolicyAudit(
  storage: StorageLike,
  now = Date.now(),
): RecommendationPolicyAudit {
  const recommendations = readRecommendationHistory(storage);
  const outcomes = buildRecommendationOutcomeAudit({
    recommendations,
    reasoningAttempts: readReasoningAttemptHistory(storage),
    recognitionHistory: readProblemRecognitionHistory(storage),
    now,
  });
  return buildRecommendationPolicyAudit({ recommendations, outcomes });
}
