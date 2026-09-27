import {
  BASELINE_RECOMMENDATION_POLICY_ID,
  resolveRecommendationPlannerPolicy,
  type RecommendationPolicyExperimentState,
  type ResolvedRecommendationPlannerPolicy,
} from "./recommendation-experiment.ts";
import { buildRecommendationPolicyConsistencyAudit } from "./recommendation-consistency.ts";
import {
  buildRecommendationPolicyCoverageAudit,
  type RecommendationPolicyCoverageAudit,
} from "./recommendation-coverage.ts";
import {
  hasActiveRecommendationPolicyProbation,
  hasActiveRecommendationPolicySuspension,
  type RecommendationPolicyProbationAudit,
  type RecommendationPolicySafetyState,
} from "./recommendation-recovery.ts";
import {
  buildRecommendationPolicyStabilityAudit,
  type RecommendationPolicySnapshotHistory,
  type RecommendationPolicyStabilityAudit,
} from "./recommendation-stability.ts";
import type { RecommendationHistory } from "./recommendations.ts";

export const DEFAULT_PROMOTED_POLICY_HEALTH_MIN_SNAPSHOTS = 6;

export type RecommendationPolicyHealthStatus = "inactive" | "observing" | "healthy" | "degraded";
export type RecommendationPolicyHealthEpoch = "promotion" | "reactivation";

export type RecommendationPolicyHealthAudit = {
  status: RecommendationPolicyHealthStatus;
  candidatePolicyId?: string;
  promotedAt?: string;
  monitoringSince?: string;
  monitoringEpoch?: RecommendationPolicyHealthEpoch;
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
  monitoringSince?: string;
  monitoringEpoch?: RecommendationPolicyHealthEpoch;
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
      monitoringSince: input.monitoringSince ?? input.promotedAt,
      monitoringEpoch: input.monitoringEpoch ?? "promotion",
      postPromotionSnapshots: input.postPromotionSnapshots,
      minimumSnapshots,
      stability: input.stability,
      coverage: input.coverage,
      fallbackRequired: false,
      explanation: `The promoted candidate is still under observation. Collect at least ${minimumSnapshots} distinct recommendation-relevant learner states in the current health epoch before post-promotion safety can be judged.`,
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
      monitoringSince: input.monitoringSince ?? input.promotedAt,
      monitoringEpoch: input.monitoringEpoch ?? "promotion",
      postPromotionSnapshots: input.postPromotionSnapshots,
      minimumSnapshots,
      stability: input.stability,
      coverage: input.coverage,
      fallbackRequired: true,
      explanation: `Post-promotion ${failures} no longer satisfies AgoCode's safety guardrails. The planner should use the deterministic baseline while preserving the candidate for inspection and explicit recovery or rollback.`,
    };
  }

  return {
    status: "healthy",
    candidatePolicyId: input.candidatePolicyId,
    promotedAt: input.promotedAt,
    monitoringSince: input.monitoringSince ?? input.promotedAt,
    monitoringEpoch: input.monitoringEpoch ?? "promotion",
    postPromotionSnapshots: input.postPromotionSnapshots,
    minimumSnapshots,
    stability: input.stability,
    coverage: input.coverage,
    fallbackRequired: false,
    explanation: `The promoted candidate remains inside both stability and curriculum-coverage guardrails across ${input.postPromotionSnapshots} distinct states in the current health epoch.`,
  };
}

export function buildPromotedRecommendationPolicyHealth(input: {
  state: RecommendationPolicyExperimentState;
  snapshots: RecommendationPolicySnapshotHistory;
  safety?: RecommendationPolicySafetyState;
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

  const reactivatedAt = input.safety?.candidatePolicyId === candidate.id
    ? input.safety.lastReactivatedAt
    : undefined;
  const reactivatedTime = validTime(reactivatedAt);
  const useReactivationEpoch = reactivatedTime !== undefined && reactivatedTime > promotedTime;
  const monitoringSince = useReactivationEpoch ? reactivatedAt as string : promotedAt;
  const monitoringTime = useReactivationEpoch ? reactivatedTime as number : promotedTime;
  const monitoringEpoch: RecommendationPolicyHealthEpoch = useReactivationEpoch ? "reactivation" : "promotion";

  const monitoringSnapshots: RecommendationPolicySnapshotHistory = {
    version: 1,
    entries: input.snapshots.entries.filter((snapshot) => {
      const recorded = validTime(snapshot.recordedAt);
      return recorded !== undefined && recorded > monitoringTime;
    }),
  };
  const stability = buildRecommendationPolicyStabilityAudit({
    candidate,
    snapshots: monitoringSnapshots,
    minimumSnapshots: input.minimumSnapshots,
  });
  const coverage = buildRecommendationPolicyCoverageAudit({
    stability,
    snapshots: monitoringSnapshots,
    minimumSnapshots: input.minimumSnapshots,
  });

  return summarizePromotedPolicyHealth({
    candidatePolicyId: candidate.id,
    promotedAt,
    monitoringSince,
    monitoringEpoch,
    postPromotionSnapshots: monitoringSnapshots.entries.length,
    minimumSnapshots: input.minimumSnapshots,
    stability,
    coverage,
  });
}

/**
 * A degraded, latched, probation-failed, or internally inconsistent policy is suspended for
 * recommendation generation without deleting persisted evidence. Recovery probation still
 * alternates baseline and candidate traffic after state consistency is established.
 */
export function resolveRecommendationPlannerPolicyWithHealth(
  state: RecommendationPolicyExperimentState,
  history: RecommendationHistory,
  health: RecommendationPolicyHealthAudit,
  safety?: RecommendationPolicySafetyState,
  probationAudit?: RecommendationPolicyProbationAudit,
): ResolvedRecommendationPlannerPolicy {
  const resolved = resolveRecommendationPlannerPolicy(state, history);
  const consistency = buildRecommendationPolicyConsistencyAudit({
    state,
    safety: safety ?? { version: 1, events: [] },
    recommendations: history,
  });
  if (consistency.fallbackRequired) {
    return {
      mode: "baseline-default",
      policyId: BASELINE_RECOMMENDATION_POLICY_ID,
      variant: "baseline",
      adjustments: {},
    };
  }

  const candidate = state.candidate;
  const latched = hasActiveRecommendationPolicySuspension(safety, candidate?.id);
  const probationFailed = probationAudit?.fallbackRequired === true;

  if ((health.fallbackRequired || latched || probationFailed) && resolved.mode === "candidate-default") {
    return {
      mode: "baseline-default",
      policyId: BASELINE_RECOMMENDATION_POLICY_ID,
      variant: "baseline",
      adjustments: {},
    };
  }

  if (
    resolved.mode === "candidate-default"
    && candidate
    && hasActiveRecommendationPolicyProbation(safety, candidate.id)
    && safety?.probation
  ) {
    const assignmentIndex = history.entries.filter((entry) => {
      const snapshot = entry as { probationId?: string; policyVariant?: string };
      return snapshot.probationId === safety.probation?.id
        && (snapshot.policyVariant === "baseline" || snapshot.policyVariant === "candidate");
    }).length;
    const candidateTurn = assignmentIndex % 2 === 1;
    return {
      mode: "recovery-probation",
      policyId: candidateTurn ? candidate.id : BASELINE_RECOMMENDATION_POLICY_ID,
      variant: candidateTurn ? "candidate" : "baseline",
      probationId: safety.probation.id,
      assignmentIndex,
      adjustments: candidateTurn ? candidate.adjustments : {},
    };
  }

  return resolved;
}
