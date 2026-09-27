import {
  BASELINE_RECOMMENDATION_POLICY_ID,
  resolveRecommendationPlannerPolicy,
  type RecommendationPolicyExperimentState,
  type ResolvedRecommendationPlannerPolicy,
} from "./recommendation-experiment.ts";
import {
  buildRecommendationPolicyCoverageAudit,
  type RecommendationPolicyCoverageAudit,
} from "./recommendation-coverage.ts";
import {
  buildRecommendationPolicyStabilityAudit,
  type RecommendationPolicySnapshotHistory,
  type RecommendationPolicyStabilityAudit,
} from "./recommendation-stability.ts";
import type { RecommendationHistory } from "./recommendations.ts";

export const DEFAULT_PROMOTED_POLICY_HEALTH_MIN_SNAPSHOTS = 6;

export type RecommendationPolicyHealthStatus = "inactive" | "observing" | "healthy" | "degraded";

export type RecommendationPolicyHealthAudit = {
  status: RecommendationPolicyHealthStatus;
  candidatePolicyId?: string;
  promotedAt?: string;
  postPromotionSnapshots: number;
  minimumSnapshots: number;
  stability?: RecommendationPolicyStabilityAudit;
  coverage?: RecommendationPolicyCoverageAudit;
  fallbackRequired: boolean;
  explanation: string;
};

function validTime(value: string | undefined) {
  if (!value) return undefined;
  const time = Date.parse(value);
  return Number.isFinite(time) ? time : undefined;
}

export function summarizePromotedPolicyHealth(input: {
  candidatePolicyId?: string;
  promotedAt?: string;
  postPromotionSnapshots: number;
  minimumSnapshots?: number;
  stability?: RecommendationPolicyStabilityAudit;
  coverage?: RecommendationPolicyCoverageAudit;
}): RecommendationPolicyHealthAudit {
  const minimumSnapshots = Math.max(2, Math.floor(input.minimumSnapshots ?? DEFAULT_PROMOTED_POLICY_HEALTH_MIN_SNAPSHOTS));
  if (!input.candidatePolicyId || !input.promotedAt) {
    return {
      status: "inactive",
      postPromotionSnapshots: 0,
      minimumSnapshots,
      fallbackRequired: false,
      explanation: "No promoted local recommendation policy is active, so the deterministic baseline needs no post-promotion health check.",
    };
  }

  if (
    input.postPromotionSnapshots < minimumSnapshots
    || !input.stability
    || !input.coverage
    || input.stability.status === "insufficient"
    || input.coverage.status === "insufficient"
  ) {
    return {
      status: "observing",
      candidatePolicyId: input.candidatePolicyId,
      promotedAt: input.promotedAt,
      postPromotionSnapshots: input.postPromotionSnapshots,
      minimumSnapshots,
      stability: input.stability,
      coverage: input.coverage,
      fallbackRequired: false,
      explanation: `The promoted candidate is still under observation. Collect at least ${minimumSnapshots} distinct recommendation-relevant learner states after promotion before post-promotion safety can be judged.`,
    };
  }

  const degraded = input.stability.status === "unstable" || input.coverage.status === "imbalanced";
  if (degraded) {
    const failures = [
      input.stability.status === "unstable" ? "ranking stability" : null,
      input.coverage.status === "imbalanced" ? "curriculum coverage" : null,
    ].filter(Boolean).join(" and ");
    return {
      status: "degraded",
      candidatePolicyId: input.candidatePolicyId,
      promotedAt: input.promotedAt,
      postPromotionSnapshots: input.postPromotionSnapshots,
      minimumSnapshots,
      stability: input.stability,
      coverage: input.coverage,
      fallbackRequired: true,
      explanation: `Post-promotion ${failures} no longer satisfies AgoCode's safety guardrails. The planner should use the deterministic baseline while preserving the candidate for inspection and explicit rollback.`,
    };
  }

  return {
    status: "healthy",
    candidatePolicyId: input.candidatePolicyId,
    promotedAt: input.promotedAt,
    postPromotionSnapshots: input.postPromotionSnapshots,
    minimumSnapshots,
    stability: input.stability,
    coverage: input.coverage,
    fallbackRequired: false,
    explanation: `The promoted candidate remains inside both stability and curriculum-coverage guardrails across ${input.postPromotionSnapshots} distinct post-promotion learner states.`,
  };
}

export function buildPromotedRecommendationPolicyHealth(input: {
  state: RecommendationPolicyExperimentState;
  snapshots: RecommendationPolicySnapshotHistory;
  minimumSnapshots?: number;
}): RecommendationPolicyHealthAudit {
  const candidate = input.state.candidate;
  const experiment = input.state.experiment;
  const promotedAt = experiment?.promotedAt;
  if (
    !candidate
    || input.state.defaultPolicyId !== candidate.id
    || experiment?.status !== "completed"
    || experiment.candidatePolicyId !== candidate.id
    || !promotedAt
  ) {
    return summarizePromotedPolicyHealth({
      postPromotionSnapshots: 0,
      minimumSnapshots: input.minimumSnapshots,
    });
  }

  const promotedTime = validTime(promotedAt);
  if (promotedTime === undefined) {
    return summarizePromotedPolicyHealth({
      candidatePolicyId: candidate.id,
      promotedAt,
      postPromotionSnapshots: 0,
      minimumSnapshots: input.minimumSnapshots,
    });
  }

  const postPromotionSnapshots: RecommendationPolicySnapshotHistory = {
    version: 1,
    entries: input.snapshots.entries.filter((snapshot) => {
      const recorded = validTime(snapshot.recordedAt);
      return recorded !== undefined && recorded > promotedTime;
    }),
  };
  const stability = buildRecommendationPolicyStabilityAudit({
    candidate,
    snapshots: postPromotionSnapshots,
    minimumSnapshots: input.minimumSnapshots,
  });
  const coverage = buildRecommendationPolicyCoverageAudit({
    stability,
    snapshots: postPromotionSnapshots,
    minimumSnapshots: input.minimumSnapshots,
  });

  return summarizePromotedPolicyHealth({
    candidatePolicyId: candidate.id,
    promotedAt,
    postPromotionSnapshots: postPromotionSnapshots.entries.length,
    minimumSnapshots: input.minimumSnapshots,
    stability,
    coverage,
  });
}

/**
 * A degraded promoted policy is suspended for recommendation generation without deleting or
 * mutating the persisted candidate. This makes the safety fallback immediate, inspectable,
 * and reversible while preserving the original experiment record.
 */
export function resolveRecommendationPlannerPolicyWithHealth(
  state: RecommendationPolicyExperimentState,
  history: RecommendationHistory,
  health: RecommendationPolicyHealthAudit,
): ResolvedRecommendationPlannerPolicy {
  const resolved = resolveRecommendationPlannerPolicy(state, history);
  if (!health.fallbackRequired || resolved.mode !== "candidate-default") return resolved;
  return {
    mode: "baseline-default",
    policyId: BASELINE_RECOMMENDATION_POLICY_ID,
    variant: "baseline",
    adjustments: {},
  };
}
