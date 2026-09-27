import type { StorageLike } from "./evidence.ts";
import type { RecommendationPolicyExperimentState } from "./recommendation-experiment.ts";
import {
  buildRecommendationPolicyCoverageAudit,
  type RecommendationPolicyCoverageAudit,
} from "./recommendation-coverage.ts";
import type { SnapshottedRecommendationHistoryEntry } from "./recommendation-policy.ts";
import {
  buildRecommendationPolicyStabilityAudit,
  type RecommendationPolicySnapshotHistory,
  type RecommendationPolicyStabilityAudit,
} from "./recommendation-stability.ts";
import type { RecommendationHistory } from "./recommendations.ts";
import type { RecommendationOutcome, RecommendationOutcomeAudit } from "./system-evaluation.ts";

export const RECOMMENDATION_POLICY_SAFETY_KEY = "agocode.progress.recommendation-policy-safety";
export const RECOMMENDATION_POLICY_SAFETY_EVENT_LIMIT = 12;
export const DEFAULT_POLICY_RECOVERY_MIN_SNAPSHOTS = 6;
export const DEFAULT_POLICY_PROBATION_MIN_PER_VARIANT = 4;
export const DEFAULT_POLICY_PROBATION_PRIOR_WEIGHT = 4;
export const DEFAULT_POLICY_PROBATION_MAX_STRONG_EVIDENCE_DEFICIT = 5;
export const DEFAULT_POLICY_PROBATION_MAX_FOLLOW_THROUGH_DEFICIT = 10;

export type RecommendationPolicySafetyReason = "stability" | "coverage" | "stability-and-coverage" | "probation-outcomes";
export type RecommendationPolicySafetyEventType =
  | "candidate-suspended"
  | "candidate-reactivated"
  | "candidate-probation-started"
  | "candidate-probation-completed";
export type RecommendationPolicyRecoveryStatus = "inactive" | "observing" | "blocked" | "ready";
export type RecommendationPolicyProbationStatus = "inactive" | "observing" | "ready" | "failed";

export type RecommendationPolicySafetyEvent = {
  version: 1;
  id: string;
  event: RecommendationPolicySafetyEventType;
  occurredAt: string;
  candidatePolicyId: string;
  reason?: RecommendationPolicySafetyReason;
};

export type RecommendationPolicySuspension = {
  candidatePolicyId: string;
  suspendedAt: string;
  reason: RecommendationPolicySafetyReason;
};

export type RecommendationPolicyProbation = {
  version: 1;
  id: string;
  candidatePolicyId: string;
  startedAt: string;
};

export type RecommendationPolicySafetyState = {
  version: 1;
  candidatePolicyId?: string;
  suspension?: RecommendationPolicySuspension;
  probation?: RecommendationPolicyProbation;
  lastReactivatedAt?: string;
  events: RecommendationPolicySafetyEvent[];
};

export type RecommendationPolicyRecoveryAudit = {
  status: RecommendationPolicyRecoveryStatus;
  candidatePolicyId?: string;
  suspendedAt?: string;
  reason?: RecommendationPolicySafetyReason;
  recoverySnapshots: number;
  minimumSnapshots: number;
  stability?: RecommendationPolicyStabilityAudit;
  coverage?: RecommendationPolicyCoverageAudit;
  reactivationEligible: boolean;
  explanation: string;
};

export type RecommendationPolicyProbationVariantStats = {
  matureChoices: number;
  followedThrough: number;
  strongEvidence: number;
  followThroughRate?: number;
  strongEvidenceRate?: number;
  smoothedFollowThroughRate?: number;
  smoothedStrongEvidenceRate?: number;
};

export type RecommendationPolicyProbationAudit = {
  status: RecommendationPolicyProbationStatus;
  candidatePolicyId?: string;
  probationId?: string;
  startedAt?: string;
  baseline: RecommendationPolicyProbationVariantStats;
  candidate: RecommendationPolicyProbationVariantStats;
  minimumPerVariant: number;
  strongEvidenceLift?: number;
  followThroughLift?: number;
  healthStatus?: string;
  completionEligible: boolean;
  fallbackRequired: boolean;
  failureReason?: "health" | "outcomes";
  explanation: string;
};

const safetyReasons = new Set<RecommendationPolicySafetyReason>([
  "stability",
  "coverage",
  "stability-and-coverage",
  "probation-outcomes",
]);
const safetyEventTypes = new Set<RecommendationPolicySafetyEventType>([
  "candidate-suspended",
  "candidate-reactivated",
  "candidate-probation-started",
  "candidate-probation-completed",
]);

function emptySafetyState(): RecommendationPolicySafetyState {
  return { version: 1, events: [] };
}

function emptyProbationStats(): RecommendationPolicyProbationVariantStats {
  return { matureChoices: 0, followedThrough: 0, strongEvidence: 0 };
}

function validTime(value: string | undefined) {
  if (!value) return undefined;
  const time = Date.parse(value);
  return Number.isFinite(time) ? time : undefined;
}

function stableHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function finitePercent(numerator: number, denominator: number) {
  return denominator > 0 ? Math.round((numerator / denominator) * 100) : undefined;
}

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, value));
}

function smoothedRate(successes: number, total: number, priorPercent: number, priorWeight: number) {
  const prior = priorPercent / 100;
  return clampPercent(((successes + prior * priorWeight) / (total + priorWeight)) * 100);
}

function outcomeKey(exerciseId: string, chosenAt: string) {
  return `${exerciseId}\u0000${chosenAt}`;
}

function parseEvent(value: unknown): RecommendationPolicySafetyEvent | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const event = value as Partial<RecommendationPolicySafetyEvent>;
  if (
    event.version !== 1
    || typeof event.id !== "string"
    || !safetyEventTypes.has(event.event as RecommendationPolicySafetyEventType)
    || typeof event.occurredAt !== "string"
    || validTime(event.occurredAt) === undefined
    || typeof event.candidatePolicyId !== "string"
    || (event.reason !== undefined && !safetyReasons.has(event.reason))
  ) return undefined;
  return {
    version: 1,
    id: event.id,
    event: event.event as RecommendationPolicySafetyEventType,
    occurredAt: event.occurredAt,
    candidatePolicyId: event.candidatePolicyId,
    reason: event.reason,
  };
}

function parseSuspension(value: unknown): RecommendationPolicySuspension | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const suspension = value as Partial<RecommendationPolicySuspension>;
  if (
    typeof suspension.candidatePolicyId !== "string"
    || typeof suspension.suspendedAt !== "string"
    || validTime(suspension.suspendedAt) === undefined
    || !safetyReasons.has(suspension.reason as RecommendationPolicySafetyReason)
  ) return undefined;
  return {
    candidatePolicyId: suspension.candidatePolicyId,
    suspendedAt: suspension.suspendedAt,
    reason: suspension.reason as RecommendationPolicySafetyReason,
  };
}

function parseProbation(value: unknown): RecommendationPolicyProbation | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const probation = value as Partial<RecommendationPolicyProbation>;
  if (
    probation.version !== 1
    || typeof probation.id !== "string"
    || typeof probation.candidatePolicyId !== "string"
    || typeof probation.startedAt !== "string"
    || validTime(probation.startedAt) === undefined
  ) return undefined;
  return {
    version: 1,
    id: probation.id,
    candidatePolicyId: probation.candidatePolicyId,
    startedAt: probation.startedAt,
  };
}

function persist(storage: StorageLike, state: RecommendationPolicySafetyState) {
  try {
    storage.setItem(RECOMMENDATION_POLICY_SAFETY_KEY, JSON.stringify(state));
  } catch {
    // Runtime safety state is optional persistence. The planner still has its immediate fallback.
  }
  return state;
}

function appendEvent(
  state: RecommendationPolicySafetyState,
  input: Omit<RecommendationPolicySafetyEvent, "version" | "id">,
) {
  const id = `policy-safety-${stableHash(`${input.event}|${input.candidatePolicyId}|${input.occurredAt}`)}`;
  const event: RecommendationPolicySafetyEvent = { version: 1, id, ...input };
  return [...state.events.filter((item) => item.id !== id), event].slice(-RECOMMENDATION_POLICY_SAFETY_EVENT_LIMIT);
}

export function readRecommendationPolicySafetyState(storage: StorageLike): RecommendationPolicySafetyState {
  try {
    const raw = storage.getItem(RECOMMENDATION_POLICY_SAFETY_KEY);
    if (!raw) return emptySafetyState();
    const parsed = JSON.parse(raw) as Partial<RecommendationPolicySafetyState>;
    if (parsed.version !== 1) return emptySafetyState();
    const events = Array.isArray(parsed.events)
      ? parsed.events.map(parseEvent).filter((entry): entry is RecommendationPolicySafetyEvent => Boolean(entry)).slice(-RECOMMENDATION_POLICY_SAFETY_EVENT_LIMIT)
      : [];
    const candidatePolicyId = typeof parsed.candidatePolicyId === "string" ? parsed.candidatePolicyId : undefined;
    const suspension = parseSuspension(parsed.suspension);
    const probation = parseProbation(parsed.probation);
    const lastReactivatedAt = typeof parsed.lastReactivatedAt === "string" && validTime(parsed.lastReactivatedAt) !== undefined
      ? parsed.lastReactivatedAt
      : undefined;
    return {
      version: 1,
      candidatePolicyId,
      suspension,
      probation,
      lastReactivatedAt,
      events,
    };
  } catch {
    return emptySafetyState();
  }
}

export function hasActiveRecommendationPolicySuspension(
  state: RecommendationPolicySafetyState | undefined,
  candidatePolicyId: string | undefined,
) {
  return Boolean(
    state
    && candidatePolicyId
    && state.candidatePolicyId === candidatePolicyId
    && state.suspension?.candidatePolicyId === candidatePolicyId,
  );
}

export function hasActiveRecommendationPolicyProbation(
  state: RecommendationPolicySafetyState | undefined,
  candidatePolicyId: string | undefined,
) {
  return Boolean(
    state
    && candidatePolicyId
    && state.candidatePolicyId === candidatePolicyId
    && !state.suspension
    && state.probation?.candidatePolicyId === candidatePolicyId,
  );
}

function reasonFromHealth(health: {
  stability?: { status: string };
  coverage?: { status: string };
}): RecommendationPolicySafetyReason {
  const stabilityFailed = health.stability?.status === "unstable";
  const coverageFailed = health.coverage?.status === "imbalanced";
  return stabilityFailed && coverageFailed
    ? "stability-and-coverage"
    : stabilityFailed
      ? "stability"
      : "coverage";
}

function suspendCandidate(
  storage: StorageLike,
  current: RecommendationPolicySafetyState,
  candidatePolicyId: string,
  reason: RecommendationPolicySafetyReason,
  suspendedAt: string,
) {
  if (hasActiveRecommendationPolicySuspension(current, candidatePolicyId)) return current;
  const suspension: RecommendationPolicySuspension = { candidatePolicyId, suspendedAt, reason };
  const base: RecommendationPolicySafetyState = {
    version: 1,
    candidatePolicyId,
    suspension,
    probation: undefined,
    lastReactivatedAt: current.candidatePolicyId === candidatePolicyId ? current.lastReactivatedAt : undefined,
    events: current.candidatePolicyId === candidatePolicyId ? current.events : [],
  };
  return persist(storage, {
    ...base,
    events: appendEvent(base, {
      event: "candidate-suspended",
      occurredAt: suspendedAt,
      candidatePolicyId,
      reason,
    }),
  });
}

/**
 * Latches a post-promotion safety breach. Repeated health checks are idempotent and never
 * produce recommendation/mastery evidence. A healthy later aggregate does not auto-clear it.
 */
export function synchronizeRecommendationPolicySafety(
  storage: StorageLike,
  experimentState: RecommendationPolicyExperimentState,
  health: {
    fallbackRequired: boolean;
    candidatePolicyId?: string;
    stability?: { status: string };
    coverage?: { status: string };
  },
  suspendedAt = new Date().toISOString(),
) {
  const current = readRecommendationPolicySafetyState(storage);
  const candidate = experimentState.candidate;
  if (
    !health.fallbackRequired
    || !candidate
    || health.candidatePolicyId !== candidate.id
    || experimentState.defaultPolicyId !== candidate.id
    || experimentState.experiment?.status !== "completed"
    || experimentState.experiment.candidatePolicyId !== candidate.id
  ) return current;
  return suspendCandidate(storage, current, candidate.id, reasonFromHealth(health), suspendedAt);
}

export function buildRecommendationPolicyRecoveryAudit(input: {
  state: RecommendationPolicyExperimentState;
  safety: RecommendationPolicySafetyState;
  snapshots: RecommendationPolicySnapshotHistory;
  minimumSnapshots?: number;
}): RecommendationPolicyRecoveryAudit {
  const minimumSnapshots = Math.max(2, Math.floor(input.minimumSnapshots ?? DEFAULT_POLICY_RECOVERY_MIN_SNAPSHOTS));
  const candidate = input.state.candidate;
  const suspension = input.safety.suspension;
  if (
    !candidate
    || input.state.defaultPolicyId !== candidate.id
    || input.state.experiment?.status !== "completed"
    || input.state.experiment.candidatePolicyId !== candidate.id
    || input.safety.candidatePolicyId !== candidate.id
    || suspension?.candidatePolicyId !== candidate.id
  ) {
    return {
      status: "inactive",
      recoverySnapshots: 0,
      minimumSnapshots,
      reactivationEligible: false,
      explanation: "No active safety suspension exists for the current promoted candidate.",
    };
  }

  const suspendedTime = validTime(suspension.suspendedAt);
  if (suspendedTime === undefined) {
    return {
      status: "blocked",
      candidatePolicyId: candidate.id,
      suspendedAt: suspension.suspendedAt,
      reason: suspension.reason,
      recoverySnapshots: 0,
      minimumSnapshots,
      reactivationEligible: false,
      explanation: "The suspension timestamp is invalid, so recovery fails closed to the deterministic baseline.",
    };
  }

  const recoverySnapshots: RecommendationPolicySnapshotHistory = {
    version: 1,
    entries: input.snapshots.entries.filter((snapshot) => {
      const recorded = validTime(snapshot.recordedAt);
      return recorded !== undefined && recorded > suspendedTime;
    }),
  };
  const stability = buildRecommendationPolicyStabilityAudit({
    candidate,
    snapshots: recoverySnapshots,
    minimumSnapshots,
  });
  const coverage = buildRecommendationPolicyCoverageAudit({
    stability,
    snapshots: recoverySnapshots,
    minimumSnapshots,
  });

  if (
    recoverySnapshots.entries.length < minimumSnapshots
    || stability.status === "insufficient"
    || coverage.status === "insufficient"
  ) {
    return {
      status: "observing",
      candidatePolicyId: candidate.id,
      suspendedAt: suspension.suspendedAt,
      reason: suspension.reason,
      recoverySnapshots: recoverySnapshots.entries.length,
      minimumSnapshots,
      stability,
      coverage,
      reactivationEligible: false,
      explanation: `Candidate remains latched off. Collect at least ${minimumSnapshots} distinct recommendation-relevant learner states after suspension before recovery can be judged.`,
    };
  }

  const recovered = stability.status === "stable" && coverage.status === "balanced";
  return {
    status: recovered ? "ready" : "blocked",
    candidatePolicyId: candidate.id,
    suspendedAt: suspension.suspendedAt,
    reason: suspension.reason,
    recoverySnapshots: recoverySnapshots.entries.length,
    minimumSnapshots,
    stability,
    coverage,
    reactivationEligible: recovered,
    explanation: recovered
      ? `Fresh post-suspension replay now passes both ranking stability and curriculum coverage across ${recoverySnapshots.entries.length} states. Reactivation is available, but returns through a baseline-vs-candidate probation canary rather than immediately restoring full candidate traffic.`
      : "Fresh post-suspension replay still violates stability or curriculum coverage. Keep the deterministic baseline active.",
  };
}

function probationStats(
  pairs: Array<{ entry: SnapshottedRecommendationHistoryEntry; outcome: RecommendationOutcome }>,
  priorFollowThroughRate: number,
  priorStrongEvidenceRate: number,
  priorWeight: number,
): RecommendationPolicyProbationVariantStats {
  const matureChoices = pairs.length;
  const followedThrough = pairs.filter(({ outcome }) => outcome.status !== "no-evidence").length;
  const strongEvidence = pairs.filter(({ outcome }) => outcome.strongEvidence).length;
  return {
    matureChoices,
    followedThrough,
    strongEvidence,
    followThroughRate: finitePercent(followedThrough, matureChoices),
    strongEvidenceRate: finitePercent(strongEvidence, matureChoices),
    smoothedFollowThroughRate: matureChoices
      ? Math.round(smoothedRate(followedThrough, matureChoices, priorFollowThroughRate, priorWeight))
      : undefined,
    smoothedStrongEvidenceRate: matureChoices
      ? Math.round(smoothedRate(strongEvidence, matureChoices, priorStrongEvidenceRate, priorWeight))
      : undefined,
  };
}

export function buildRecommendationPolicyProbationAudit(input: {
  state: RecommendationPolicyExperimentState;
  safety: RecommendationPolicySafetyState;
  recommendations: RecommendationHistory;
  outcomes: RecommendationOutcomeAudit;
  health: { status: string; fallbackRequired: boolean; candidatePolicyId?: string };
  minimumPerVariant?: number;
  priorWeight?: number;
  maxStrongEvidenceDeficit?: number;
  maxFollowThroughDeficit?: number;
}): RecommendationPolicyProbationAudit {
  const minimumPerVariant = Math.max(2, Math.floor(input.minimumPerVariant ?? DEFAULT_POLICY_PROBATION_MIN_PER_VARIANT));
  const priorWeight = Math.max(1, input.priorWeight ?? DEFAULT_POLICY_PROBATION_PRIOR_WEIGHT);
  const maxStrongEvidenceDeficit = Math.max(0, input.maxStrongEvidenceDeficit ?? DEFAULT_POLICY_PROBATION_MAX_STRONG_EVIDENCE_DEFICIT);
  const maxFollowThroughDeficit = Math.max(0, input.maxFollowThroughDeficit ?? DEFAULT_POLICY_PROBATION_MAX_FOLLOW_THROUGH_DEFICIT);
  const probation = input.safety.probation;
  const candidate = input.state.candidate;
  if (
    !probation
    || !candidate
    || probation.candidatePolicyId !== candidate.id
    || input.safety.candidatePolicyId !== candidate.id
    || input.state.defaultPolicyId !== candidate.id
    || input.state.experiment?.status !== "completed"
    || input.state.experiment.candidatePolicyId !== candidate.id
    || input.safety.suspension
  ) {
    return {
      status: "inactive",
      baseline: emptyProbationStats(),
      candidate: emptyProbationStats(),
      minimumPerVariant,
      completionEligible: false,
      fallbackRequired: false,
      explanation: "No active recovery probation exists for the current promoted candidate.",
    };
  }

  const outcomeByKey = new Map(input.outcomes.outcomes.map((outcome) => [outcomeKey(outcome.exerciseId, outcome.chosenAt), outcome]));
  const maturePairs = input.recommendations.entries
    .map((entry) => entry as SnapshottedRecommendationHistoryEntry)
    .filter((entry) => entry.probationId === probation.id && (entry.policyVariant === "baseline" || entry.policyVariant === "candidate"))
    .map((entry) => ({ entry, outcome: outcomeByKey.get(outcomeKey(entry.exerciseId, entry.chosenAt)) }))
    .filter((pair): pair is { entry: SnapshottedRecommendationHistoryEntry; outcome: RecommendationOutcome } => Boolean(
      pair.outcome && pair.outcome.status !== "waiting",
    ));
  const pooledFollowed = maturePairs.filter(({ outcome }) => outcome.status !== "no-evidence").length;
  const pooledStrong = maturePairs.filter(({ outcome }) => outcome.strongEvidence).length;
  const pooledFollowRate = finitePercent(pooledFollowed, maturePairs.length) ?? 0;
  const pooledStrongRate = finitePercent(pooledStrong, maturePairs.length) ?? 0;
  const baseline = probationStats(
    maturePairs.filter(({ entry }) => entry.policyVariant === "baseline"),
    pooledFollowRate,
    pooledStrongRate,
    priorWeight,
  );
  const candidateStats = probationStats(
    maturePairs.filter(({ entry }) => entry.policyVariant === "candidate"),
    pooledFollowRate,
    pooledStrongRate,
    priorWeight,
  );
  const strongEvidenceLift = baseline.smoothedStrongEvidenceRate === undefined || candidateStats.smoothedStrongEvidenceRate === undefined
    ? undefined
    : candidateStats.smoothedStrongEvidenceRate - baseline.smoothedStrongEvidenceRate;
  const followThroughLift = baseline.smoothedFollowThroughRate === undefined || candidateStats.smoothedFollowThroughRate === undefined
    ? undefined
    : candidateStats.smoothedFollowThroughRate - baseline.smoothedFollowThroughRate;

  if (input.health.fallbackRequired || input.health.status === "degraded") {
    return {
      status: "failed",
      candidatePolicyId: candidate.id,
      probationId: probation.id,
      startedAt: probation.startedAt,
      baseline,
      candidate: candidateStats,
      minimumPerVariant,
      strongEvidenceLift,
      followThroughLift,
      healthStatus: input.health.status,
      completionEligible: false,
      fallbackRequired: true,
      failureReason: "health",
      explanation: "Recovery probation failed because fresh post-reactivation ranking stability or curriculum coverage degraded again. Keep the deterministic baseline latched.",
    };
  }

  const enoughOutcomes = baseline.matureChoices >= minimumPerVariant && candidateStats.matureChoices >= minimumPerVariant;
  if (!enoughOutcomes || input.health.status !== "healthy") {
    return {
      status: "observing",
      candidatePolicyId: candidate.id,
      probationId: probation.id,
      startedAt: probation.startedAt,
      baseline,
      candidate: candidateStats,
      minimumPerVariant,
      strongEvidenceLift,
      followThroughLift,
      healthStatus: input.health.status,
      completionEligible: false,
      fallbackRequired: false,
      explanation: `Recovery probation is still collecting evidence. Require at least ${minimumPerVariant} mature recommendations per arm plus a healthy fresh replay epoch before full candidate service can resume.`,
    };
  }

  const outcomesSafe = (strongEvidenceLift ?? -100) >= -maxStrongEvidenceDeficit
    && (followThroughLift ?? -100) >= -maxFollowThroughDeficit;
  if (!outcomesSafe) {
    return {
      status: "failed",
      candidatePolicyId: candidate.id,
      probationId: probation.id,
      startedAt: probation.startedAt,
      baseline,
      candidate: candidateStats,
      minimumPerVariant,
      strongEvidenceLift,
      followThroughLift,
      healthStatus: input.health.status,
      completionEligible: false,
      fallbackRequired: true,
      failureReason: "outcomes",
      explanation: `Recovery probation failed objective-outcome parity: candidate strong-evidence lift ${strongEvidenceLift ?? 0} points and follow-through lift ${followThroughLift ?? 0} points. Keep the deterministic baseline latched before attempting another fresh recovery cycle.`,
    };
  }

  return {
    status: "ready",
    candidatePolicyId: candidate.id,
    probationId: probation.id,
    startedAt: probation.startedAt,
    baseline,
    candidate: candidateStats,
    minimumPerVariant,
    strongEvidenceLift,
    followThroughLift,
    healthStatus: input.health.status,
    completionEligible: true,
    fallbackRequired: false,
    explanation: `Recovery probation has enough objective outcomes in both arms and the fresh health epoch remains inside stability + coverage guardrails. Full candidate service may be restored explicitly.`,
  };
}

/** Explicitly re-enables the same promoted candidate into a baseline-vs-candidate recovery canary. */
export function reactivateRecommendationPolicyAfterRecovery(
  storage: StorageLike,
  experimentState: RecommendationPolicyExperimentState,
  recovery: RecommendationPolicyRecoveryAudit,
  reactivatedAt = new Date().toISOString(),
) {
  const current = readRecommendationPolicySafetyState(storage);
  const candidate = experimentState.candidate;
  if (
    !recovery.reactivationEligible
    || !candidate
    || recovery.candidatePolicyId !== candidate.id
    || experimentState.defaultPolicyId !== candidate.id
    || experimentState.experiment?.status !== "completed"
    || current.candidatePolicyId !== candidate.id
    || current.suspension?.candidatePolicyId !== candidate.id
  ) return current;

  const probation: RecommendationPolicyProbation = {
    version: 1,
    id: `recovery-probation-${stableHash(`${candidate.id}|${reactivatedAt}`)}`,
    candidatePolicyId: candidate.id,
    startedAt: reactivatedAt,
  };
  const base: RecommendationPolicySafetyState = {
    ...current,
    candidatePolicyId: candidate.id,
    suspension: undefined,
    probation,
    lastReactivatedAt: reactivatedAt,
  };
  const reactivatedEvents = appendEvent(base, {
    event: "candidate-reactivated",
    occurredAt: reactivatedAt,
    candidatePolicyId: candidate.id,
  });
  const withReactivation: RecommendationPolicySafetyState = { ...base, events: reactivatedEvents };
  return persist(storage, {
    ...withReactivation,
    events: appendEvent(withReactivation, {
      event: "candidate-probation-started",
      occurredAt: reactivatedAt,
      candidatePolicyId: candidate.id,
    }),
  });
}

export function synchronizeRecommendationPolicyProbationFailure(
  storage: StorageLike,
  experimentState: RecommendationPolicyExperimentState,
  probation: RecommendationPolicyProbationAudit,
  suspendedAt = new Date().toISOString(),
) {
  const current = readRecommendationPolicySafetyState(storage);
  const candidate = experimentState.candidate;
  if (
    probation.status !== "failed"
    || probation.failureReason !== "outcomes"
    || !candidate
    || probation.candidatePolicyId !== candidate.id
    || current.probation?.candidatePolicyId !== candidate.id
  ) return current;
  return suspendCandidate(storage, current, candidate.id, "probation-outcomes", suspendedAt);
}

export function completeRecommendationPolicyProbation(
  storage: StorageLike,
  experimentState: RecommendationPolicyExperimentState,
  probationAudit: RecommendationPolicyProbationAudit,
  completedAt = new Date().toISOString(),
) {
  const current = readRecommendationPolicySafetyState(storage);
  const candidate = experimentState.candidate;
  if (
    !probationAudit.completionEligible
    || probationAudit.status !== "ready"
    || !candidate
    || probationAudit.candidatePolicyId !== candidate.id
    || current.probation?.candidatePolicyId !== candidate.id
    || current.suspension
  ) return current;

  const base: RecommendationPolicySafetyState = { ...current, probation: undefined };
  return persist(storage, {
    ...base,
    events: appendEvent(base, {
      event: "candidate-probation-completed",
      occurredAt: completedAt,
      candidatePolicyId: candidate.id,
    }),
  });
}