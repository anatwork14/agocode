import type { StorageLike } from "./evidence.ts";
import type { RecommendationPolicyExperimentState } from "./recommendation-experiment.ts";
import {
  buildRecommendationPolicyCoverageAudit,
  type RecommendationPolicyCoverageAudit,
} from "./recommendation-coverage.ts";
import {
  buildRecommendationPolicyStabilityAudit,
  type RecommendationPolicySnapshotHistory,
  type RecommendationPolicyStabilityAudit,
} from "./recommendation-stability.ts";

export const RECOMMENDATION_POLICY_SAFETY_KEY = "agocode.progress.recommendation-policy-safety";
export const RECOMMENDATION_POLICY_SAFETY_EVENT_LIMIT = 12;
export const DEFAULT_POLICY_RECOVERY_MIN_SNAPSHOTS = 6;

export type RecommendationPolicySafetyReason = "stability" | "coverage" | "stability-and-coverage";
export type RecommendationPolicySafetyEventType = "candidate-suspended" | "candidate-reactivated";
export type RecommendationPolicyRecoveryStatus = "inactive" | "observing" | "blocked" | "ready";

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

export type RecommendationPolicySafetyState = {
  version: 1;
  candidatePolicyId?: string;
  suspension?: RecommendationPolicySuspension;
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

const safetyReasons = new Set<RecommendationPolicySafetyReason>(["stability", "coverage", "stability-and-coverage"]);
const safetyEventTypes = new Set<RecommendationPolicySafetyEventType>(["candidate-suspended", "candidate-reactivated"]);

function emptySafetyState(): RecommendationPolicySafetyState {
  return { version: 1, events: [] };
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

function persist(storage: StorageLike, state: RecommendationPolicySafetyState) {
  try {
    storage.setItem(RECOMMENDATION_POLICY_SAFETY_KEY, JSON.stringify(state));
  } catch {
    // Runtime safety state is optional persistence. The planner still has its immediate health fallback.
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
    const lastReactivatedAt = typeof parsed.lastReactivatedAt === "string" && validTime(parsed.lastReactivatedAt) !== undefined
      ? parsed.lastReactivatedAt
      : undefined;
    return {
      version: 1,
      candidatePolicyId,
      suspension,
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
  if (hasActiveRecommendationPolicySuspension(current, candidate.id)) return current;

  const reason = reasonFromHealth(health);
  const suspension: RecommendationPolicySuspension = {
    candidatePolicyId: candidate.id,
    suspendedAt,
    reason,
  };
  const base: RecommendationPolicySafetyState = {
    version: 1,
    candidatePolicyId: candidate.id,
    suspension,
    lastReactivatedAt: current.candidatePolicyId === candidate.id ? current.lastReactivatedAt : undefined,
    events: current.candidatePolicyId === candidate.id ? current.events : [],
  };
  return persist(storage, {
    ...base,
    events: appendEvent(base, {
      event: "candidate-suspended",
      occurredAt: suspendedAt,
      candidatePolicyId: candidate.id,
      reason,
    }),
  });
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
      ? `Fresh post-suspension replay now passes both ranking stability and curriculum coverage across ${recoverySnapshots.entries.length} states. Reactivation is available, but remains explicit.`
      : "Fresh post-suspension replay still violates stability or curriculum coverage. Keep the deterministic baseline active.",
  };
}

/** Explicitly re-enables the same promoted candidate after fresh recovery evidence passes. */
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

  const base: RecommendationPolicySafetyState = {
    ...current,
    candidatePolicyId: candidate.id,
    suspension: undefined,
    lastReactivatedAt: reactivatedAt,
  };
  return persist(storage, {
    ...base,
    events: appendEvent(base, {
      event: "candidate-reactivated",
      occurredAt: reactivatedAt,
      candidatePolicyId: candidate.id,
    }),
  });
}
