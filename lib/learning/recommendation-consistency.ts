import type { StorageLike } from "./evidence.ts";
import {
  BASELINE_RECOMMENDATION_POLICY_ID,
  RECOMMENDATION_POLICY_EXPERIMENT_KEY,
  emptyRecommendationPolicyExperimentState,
  readRecommendationPolicyExperimentState,
  type RecommendationPolicyExperimentState,
  type RecommendationPolicyLineageEntry,
  type ResolvedRecommendationPlannerPolicy,
} from "./recommendation-experiment.ts";
import type { SnapshottedRecommendationHistoryEntry } from "./recommendation-policy.ts";
import {
  RECOMMENDATION_POLICY_SAFETY_KEY,
  readRecommendationPolicySafetyState,
  type RecommendationPolicySafetyState,
} from "./recommendation-recovery.ts";
import {
  RECOMMENDATION_HISTORY_KEY,
  readRecommendationHistory,
  type RecommendationHistory,
} from "./recommendations.ts";

export const RECOMMENDATION_POLICY_REPAIR_KEY = "agocode.progress.recommendation-policy-repair";

export type RecommendationPolicyConsistencySeverity = "critical" | "warning";
export type RecommendationPolicyConsistencyStatus = "healthy" | "warning" | "critical";
export type RecommendationPolicyConsistencyIssueCode =
  | "suspension-candidate-mismatch"
  | "probation-candidate-mismatch"
  | "lineage-time-invalid"
  | "lineage-time-regression"
  | "lineage-event-semantic-mismatch"
  | "candidate-attribution-policy-mismatch"
  | "baseline-attribution-policy-mismatch"
  | "unknown-experiment-attribution";

export type RecommendationPolicyConsistencyIssue = {
  code: RecommendationPolicyConsistencyIssueCode;
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

export type RecommendationPolicyRepairReceipt = {
  version: 1;
  repairedAt: string;
  previousCandidatePolicyId?: string;
  previousExperimentId?: string;
  criticalIssuesResolved: number;
  quarantinedAttributions: number;
  preservedRecommendationChoices: number;
  remainingWarnings: number;
  triggerCodes: RecommendationPolicyConsistencyIssueCode[];
};

export type RecommendationPolicyRepairResult = {
  changed: boolean;
  repaired: boolean;
  audit: RecommendationPolicyConsistencyAudit;
  receipt?: RecommendationPolicyRepairReceipt;
};

function asSnapshot(entry: RecommendationHistory["entries"][number]) {
  return entry as SnapshottedRecommendationHistoryEntry;
}

function validTime(value: string | undefined) {
  if (!value) return undefined;
  const time = Date.parse(value);
  return Number.isFinite(time) ? time : undefined;
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
  const safetyTargetsCurrentCandidate = Boolean(
    currentCandidateId
    && input.safety.candidatePolicyId === currentCandidateId,
  );

  // Safety state is intentionally scoped to the candidate that produced it. If the persisted
  // safety record belongs to an older candidate, the recovery subsystem ignores it and so does
  // this consistency audit. Only contradictions *inside safety state for the current candidate*
  // are fail-closed integrity errors.
  if (
    safetyTargetsCurrentCandidate
    && input.safety.suspension
    && input.safety.suspension.candidatePolicyId !== currentCandidateId
  ) {
    issues.push({
      code: "suspension-candidate-mismatch",
      severity: "critical",
      relatedId: input.safety.suspension.candidatePolicyId,
      message: "The current candidate's safety record contains a suspension for a different candidate.",
    });
  }
  if (
    safetyTargetsCurrentCandidate
    && input.safety.probation
    && input.safety.probation.candidatePolicyId !== currentCandidateId
  ) {
    issues.push({
      code: "probation-candidate-mismatch",
      severity: "critical",
      relatedId: input.safety.probation.candidatePolicyId,
      message: "The current candidate's safety record contains a probation canary for a different candidate.",
    });
  }

  let previousTime: number | undefined;
  for (const entry of lineage) {
    const time = validTime(entry.occurredAt);
    if (time === undefined) issues.push({ code: "lineage-time-invalid", severity: "critical", relatedId: entry.id, message: `Lifecycle event ${entry.id} has an invalid timestamp.` });
    else if (previousTime !== undefined && time < previousTime) issues.push({ code: "lineage-time-regression", severity: "critical", relatedId: entry.id, message: `Lifecycle event ${entry.id} is ordered before an earlier persisted event.` });
    if (time !== undefined) previousTime = time;
    if (!expectedLineageState(entry)) issues.push({ code: "lineage-event-semantic-mismatch", severity: "critical", relatedId: entry.id, message: `Lifecycle event ${entry.event} stores a policy/default/experiment status combination that cannot represent that transition.` });
  }

  for (const rawEntry of input.recommendations.entries) {
    const entry = asSnapshot(rawEntry);
    if (entry.policyVariant === "candidate" && (!entry.policyId || entry.policyId === BASELINE_RECOMMENDATION_POLICY_ID)) {
      issues.push({ code: "candidate-attribution-policy-mismatch", severity: "critical", relatedId: entry.exerciseId, message: `Recommendation ${entry.exerciseId} is labeled candidate traffic but is attributed to the baseline or has no candidate policy ID.` });
    }
    if (entry.policyVariant === "baseline" && entry.policyId && entry.policyId !== BASELINE_RECOMMENDATION_POLICY_ID) {
      issues.push({ code: "baseline-attribution-policy-mismatch", severity: "critical", relatedId: entry.exerciseId, message: `Recommendation ${entry.exerciseId} is labeled baseline traffic but is attributed to ${entry.policyId}.` });
    }
    if (entry.experimentId && !knownExperimentIds.has(entry.experimentId)) {
      issues.push({ code: "unknown-experiment-attribution", severity: "warning", relatedId: entry.experimentId, message: `Recommendation history references experiment ${entry.experimentId}, but that experiment is no longer represented in the bounded lifecycle ledger.` });
    }
  }

  const deduped = [...new Map(issues.map((issue) => [`${issue.code}|${issue.relatedId ?? ""}|${issue.message}`, issue])).values()];
  const criticalIssues = deduped.filter((issue) => issue.severity === "critical").length;
  const warnings = deduped.length - criticalIssues;
  const status: RecommendationPolicyConsistencyStatus = criticalIssues ? "critical" : warnings ? "warning" : "healthy";
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

export function enforceRecommendationPolicyConsistency(resolved: ResolvedRecommendationPlannerPolicy, audit: RecommendationPolicyConsistencyAudit): ResolvedRecommendationPlannerPolicy {
  if (!audit.fallbackRequired) return resolved;
  return { mode: "baseline-default", policyId: BASELINE_RECOMMENDATION_POLICY_ID, variant: "baseline", adjustments: {} };
}

function quarantineContradictoryAttribution(history: RecommendationHistory) {
  let quarantinedAttributions = 0;
  const entries = history.entries.map((rawEntry) => {
    const entry = asSnapshot(rawEntry);
    const candidateMismatch = entry.policyVariant === "candidate"
      && (!entry.policyId || entry.policyId === BASELINE_RECOMMENDATION_POLICY_ID);
    const baselineMismatch = entry.policyVariant === "baseline"
      && Boolean(entry.policyId && entry.policyId !== BASELINE_RECOMMENDATION_POLICY_ID);
    if (!candidateMismatch && !baselineMismatch) return rawEntry;

    quarantinedAttributions += 1;
    const repaired = { ...entry };
    delete repaired.policyId;
    delete repaired.policyVariant;
    delete repaired.experimentId;
    delete repaired.probationId;
    delete repaired.policyAdjustment;
    return repaired;
  });
  return { history: { version: 1, entries } satisfies RecommendationHistory, quarantinedAttributions };
}

function safePersist(storage: StorageLike, key: string, value: unknown) {
  try {
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function parseRepairReceipt(value: unknown): RecommendationPolicyRepairReceipt | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const receipt = value as Partial<RecommendationPolicyRepairReceipt>;
  const validCodes = new Set<RecommendationPolicyConsistencyIssueCode>([
    "suspension-candidate-mismatch",
    "probation-candidate-mismatch",
    "lineage-time-invalid",
    "lineage-time-regression",
    "lineage-event-semantic-mismatch",
    "candidate-attribution-policy-mismatch",
    "baseline-attribution-policy-mismatch",
    "unknown-experiment-attribution",
  ]);
  if (
    receipt.version !== 1
    || typeof receipt.repairedAt !== "string"
    || validTime(receipt.repairedAt) === undefined
    || typeof receipt.criticalIssuesResolved !== "number"
    || typeof receipt.quarantinedAttributions !== "number"
    || typeof receipt.preservedRecommendationChoices !== "number"
    || typeof receipt.remainingWarnings !== "number"
    || !Array.isArray(receipt.triggerCodes)
    || receipt.triggerCodes.some((code) => !validCodes.has(code))
  ) return undefined;
  return {
    version: 1,
    repairedAt: receipt.repairedAt,
    previousCandidatePolicyId: typeof receipt.previousCandidatePolicyId === "string" ? receipt.previousCandidatePolicyId : undefined,
    previousExperimentId: typeof receipt.previousExperimentId === "string" ? receipt.previousExperimentId : undefined,
    criticalIssuesResolved: Math.max(0, Math.floor(receipt.criticalIssuesResolved)),
    quarantinedAttributions: Math.max(0, Math.floor(receipt.quarantinedAttributions)),
    preservedRecommendationChoices: Math.max(0, Math.floor(receipt.preservedRecommendationChoices)),
    remainingWarnings: Math.max(0, Math.floor(receipt.remainingWarnings)),
    triggerCodes: [...new Set(receipt.triggerCodes as RecommendationPolicyConsistencyIssueCode[])],
  };
}

export function readRecommendationPolicyRepairReceipt(storage: StorageLike): RecommendationPolicyRepairReceipt | undefined {
  try {
    const raw = storage.getItem(RECOMMENDATION_POLICY_REPAIR_KEY);
    if (!raw) return undefined;
    return parseRepairReceipt(JSON.parse(raw));
  } catch {
    return undefined;
  }
}

/**
 * Explicitly repairs fail-closed recommendation-policy metadata without deleting learner work.
 *
 * Critical contradictions make experiment attribution untrustworthy. The repair therefore:
 * 1. strips only contradictory policy/experiment attribution from affected recommendation choices,
 * 2. resets candidate/experiment/safety control state to deterministic baseline-v1,
 * 3. preserves exercise choices, rationale snapshots, mastery/evidence, outcomes, and policy snapshots,
 * 4. verifies the persisted state after the write before recording a repair receipt.
 *
 * If storage writes fail, the function leaves the post-write audit critical and the live planner
 * continues to fail closed. No repair is reported unless the persisted state is actually usable.
 */
export function repairRecommendationPolicyConsistency(
  storage: StorageLike,
  repairedAt = new Date().toISOString(),
): RecommendationPolicyRepairResult {
  const state = readRecommendationPolicyExperimentState(storage);
  const safety = readRecommendationPolicySafetyState(storage);
  const recommendations = readRecommendationHistory(storage);
  const before = buildRecommendationPolicyConsistencyAudit({ state, safety, recommendations });
  if (!before.fallbackRequired) {
    return { changed: false, repaired: false, audit: before, receipt: readRecommendationPolicyRepairReceipt(storage) };
  }

  const quarantined = quarantineContradictoryAttribution(recommendations);
  if (quarantined.quarantinedAttributions > 0) {
    safePersist(storage, RECOMMENDATION_HISTORY_KEY, quarantined.history);
  }
  safePersist(storage, RECOMMENDATION_POLICY_SAFETY_KEY, { version: 1, events: [] } satisfies RecommendationPolicySafetyState);
  safePersist(storage, RECOMMENDATION_POLICY_EXPERIMENT_KEY, emptyRecommendationPolicyExperimentState());

  const persistedState = readRecommendationPolicyExperimentState(storage);
  const persistedSafety = readRecommendationPolicySafetyState(storage);
  const persistedRecommendations = readRecommendationHistory(storage);
  const after = buildRecommendationPolicyConsistencyAudit({
    state: persistedState,
    safety: persistedSafety,
    recommendations: persistedRecommendations,
  });
  if (after.fallbackRequired) return { changed: true, repaired: false, audit: after };

  const receipt: RecommendationPolicyRepairReceipt = {
    version: 1,
    repairedAt,
    previousCandidatePolicyId: state.candidate?.id,
    previousExperimentId: state.experiment?.id,
    criticalIssuesResolved: before.criticalIssues,
    quarantinedAttributions: quarantined.quarantinedAttributions,
    preservedRecommendationChoices: persistedRecommendations.entries.length,
    remainingWarnings: after.warnings,
    triggerCodes: [...new Set(before.issues.filter((issue) => issue.severity === "critical").map((issue) => issue.code))],
  };
  safePersist(storage, RECOMMENDATION_POLICY_REPAIR_KEY, receipt);
  return { changed: true, repaired: true, audit: after, receipt };
}
