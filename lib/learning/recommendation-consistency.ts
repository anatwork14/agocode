import {
  BASELINE_RECOMMENDATION_POLICY_ID,
  type RecommendationPolicyExperimentState,
  type RecommendationPolicyLineageEntry,
} from "./recommendation-experiment.ts";
import type { SnapshottedRecommendationHistoryEntry } from "./recommendation-policy.ts";
import type { RecommendationPolicySafetyState } from "./recommendation-recovery.ts";
import type { RecommendationHistory } from "./recommendations.ts";

export type RecommendationPolicyConsistencySeverity = "critical" | "warning";
export type RecommendationPolicyConsistencyStatus = "healthy" | "warning" | "critical";

export type RecommendationPolicyConsistencyIssue = {
  code:
    | "safety-candidate-mismatch"
    | "suspension-candidate-mismatch"
    | "probation-candidate-mismatch"
    | "lineage-time-invalid"
    | "lineage-time-regression"
    | "lineage-event-semantic-mismatch"
    | "candidate-attribution-policy-mismatch"
    | "baseline-attribution-policy-mismatch"
    | "unknown-experiment-attribution";
  severity: RecommendationPolicyConsistencySeverity;
  message: string;
  relatedId?: string;
};

export type RecommendationPolicyConsistencyAudit = {
  status: RecommendationPolicyConsistencyStatus;
  criticalIssues: number;
  warnings: number;
  fallbackRequired: boolean;
  knownCandidateIds: string[];
  knownExperimentIds: string[];
  issues: RecommendationPolicyConsistencyIssue[];
  explanation: string;
};

function asSnapshot(entry: RecommendationHistory["entries"][number]) {
  return entry as SnapshottedRecommendationHistoryEntry;
}

function validTime(value: string | undefined) {
  if (!value) return undefined;
  const time = Date.parse(value);
  return Number.isFinite(time) ? time : undefined;
}

function pushIssue(
  issues: RecommendationPolicyConsistencyIssue[],
  issue: RecommendationPolicyConsistencyIssue,
) {
  issues.push(issue);
}

function expectedLineageState(entry: RecommendationPolicyLineageEntry) {
  switch (entry.event) {
    case "experiment-started":
    case "experiment-resumed":
      return entry.experimentStatus === "running";
    case "experiment-paused":
      return entry.experimentStatus === "paused";
    case "candidate-promoted":
      return entry.experimentStatus === "completed" && entry.defaultPolicyId === entry.candidatePolicyId;
    case "candidate-rolled-back":
      return entry.defaultPolicyId === BASELINE_RECOMMENDATION_POLICY_ID;
    case "cycle-archived":
      return true;
    default:
      return false;
  }
}

export function buildRecommendationPolicyConsistencyAudit(input: {
  state: RecommendationPolicyExperimentState;
  safety: RecommendationPolicySafetyState;
  recommendations: RecommendationHistory;
}): RecommendationPolicyConsistencyAudit {
  const issues: RecommendationPolicyConsistencyIssue[] = [];
  const lineage = input.state.lineage ?? [];
  const knownCandidateIds = new Set<string>();
  const knownExperimentIds = new Set<string>();

  if (input.state.candidate?.id) knownCandidateIds.add(input.state.candidate.id);
  if (input.state.experiment?.id) knownExperimentIds.add(input.state.experiment.id);
  for (const entry of lineage) {
    knownCandidateIds.add(entry.candidatePolicyId);
    if (entry.experimentId) knownExperimentIds.add(entry.experimentId);
  }

  const currentCandidateId = input.state.candidate?.id;
  if (
    input.safety.candidatePolicyId
    && currentCandidateId
    && input.safety.candidatePolicyId !== currentCandidateId
    && (input.safety.suspension || input.safety.probation)
  ) {
    pushIssue(issues, {
      code: "safety-candidate-mismatch",
      severity: "critical",
      relatedId: input.safety.candidatePolicyId,
      message: `Active safety state belongs to ${input.safety.candidatePolicyId}, but the live candidate is ${currentCandidateId}.`,
    });
  }
  if (
    input.safety.suspension
    && currentCandidateId
    && input.safety.suspension.candidatePolicyId !== currentCandidateId
  ) {
    pushIssue(issues, {
      code: "suspension-candidate-mismatch",
      severity: "critical",
      relatedId: input.safety.suspension.candidatePolicyId,
      message: "The active suspension is attached to a different candidate than the current experiment state.",
    });
  }
  if (
    input.safety.probation
    && currentCandidateId
    && input.safety.probation.candidatePolicyId !== currentCandidateId
  ) {
    pushIssue(issues, {
      code: "probation-candidate-mismatch",
      severity: "critical",
      relatedId: input.safety.probation.candidatePolicyId,
      message: "The active probation canary is attached to a different candidate than the current experiment state.",
    });
  }

  let previousTime: number | undefined;
  for (const entry of lineage) {
    const time = validTime(entry.occurredAt);
    if (time === undefined) {
      pushIssue(issues, {
        code: "lineage-time-invalid",
        severity: "critical",
        relatedId: entry.id,
        message: `Lifecycle event ${entry.id} has an invalid timestamp.`,
      });
    } else if (previousTime !== undefined && time < previousTime) {
      pushIssue(issues, {
        code: "lineage-time-regression",
        severity: "critical",
        relatedId: entry.id,
        message: `Lifecycle event ${entry.id} is ordered before an earlier persisted event.`,
      });
    }
    if (time !== undefined) previousTime = time;

    if (!expectedLineageState(entry)) {
      pushIssue(issues, {
        code: "lineage-event-semantic-mismatch",
        severity: "critical",
        relatedId: entry.id,
        message: `Lifecycle event ${entry.event} stores a policy/default/experiment status combination that cannot represent that transition.`,
      });
    }
  }

  for (const rawEntry of input.recommendations.entries) {
    const entry = asSnapshot(rawEntry);
    if (entry.policyVariant === "candidate") {
      if (!entry.policyId || entry.policyId === BASELINE_RECOMMENDATION_POLICY_ID) {
        pushIssue(issues, {
          code: "candidate-attribution-policy-mismatch",
          severity: "critical",
          relatedId: entry.exerciseId,
          message: `Recommendation ${entry.exerciseId} is labeled candidate traffic but is attributed to the baseline or has no candidate policy ID.`,
        });
      }
    }
    if (entry.policyVariant === "baseline" && entry.policyId && entry.policyId !== BASELINE_RECOMMENDATION_POLICY_ID) {
      pushIssue(issues, {
        code: "baseline-attribution-policy-mismatch",
        severity: "critical",
        relatedId: entry.exerciseId,
        message: `Recommendation ${entry.exerciseId} is labeled baseline traffic but is attributed to ${entry.policyId}.`,
      });
    }
    if (entry.experimentId && !knownExperimentIds.has(entry.experimentId)) {
      pushIssue(issues, {
        code: "unknown-experiment-attribution",
        severity: "warning",
        relatedId: entry.experimentId,
        message: `Recommendation history references experiment ${entry.experimentId}, but that experiment is no longer represented in the bounded lifecycle ledger.`,
      });
    }
  }

  const deduped = [...new Map(issues.map((issue) => [
    `${issue.code}|${issue.relatedId ?? ""}|${issue.message}`,
    issue,
  ])).values()];
  const criticalIssues = deduped.filter((issue) => issue.severity === "critical").length;
  const warnings = deduped.length - criticalIssues;
  const status: RecommendationPolicyConsistencyStatus = criticalIssues
    ? "critical"
    : warnings
      ? "warning"
      : "healthy";

  return {
    status,
    criticalIssues,
    warnings,
    fallbackRequired: criticalIssues > 0,
    knownCandidateIds: [...knownCandidateIds].sort(),
    knownExperimentIds: [...knownExperimentIds].sort(),
    issues: deduped,
    explanation: criticalIssues
      ? `Policy state has ${criticalIssues} critical consistency issue${criticalIssues === 1 ? "" : "s"}. New recommendations must fail closed to baseline-v1 until the stored lifecycle state is repaired or reset.`
      : warnings
        ? `Policy state is internally usable, but ${warnings} bounded-history attribution warning${warnings === 1 ? "" : "s"} cannot be fully resolved from retained local metadata.`
        : "Experiment state, safety state, lifecycle events, and recommendation attribution are internally consistent.",
  };
}
