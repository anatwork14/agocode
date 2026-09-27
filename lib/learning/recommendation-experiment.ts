import type { StorageLike } from "./evidence.ts";
import type {
  RecommendationPolicyAudit,
  RecommendationPolicyVariant,
  SnapshottedRecommendationHistoryEntry,
} from "./recommendation-policy.ts";
import { buildRecommendationPolicyCoverageAudit } from "./recommendation-coverage.ts";
import {
  recommendationReasonIds,
  type RecommendationReasonId,
  type RecommendationScoreAdjustments,
  type RecommendationScoreDelta,
} from "./recommendation-rationale.ts";
import {
  buildRecommendationPolicyStabilityAudit,
  readRecommendationPolicySnapshotHistory,
} from "./recommendation-stability.ts";
import type { RecommendationHistory, RecommendationHistoryEntry } from "./recommendations.ts";
import type { RecommendationOutcome, RecommendationOutcomeAudit } from "./system-evaluation.ts";

export const RECOMMENDATION_POLICY_EXPERIMENT_KEY = "agocode.progress.recommendation-policy-experiment";
export const BASELINE_RECOMMENDATION_POLICY_ID = "baseline-v1";
export const DEFAULT_EXPERIMENT_MIN_PER_VARIANT = 8;
export const DEFAULT_EXPERIMENT_PRIOR_WEIGHT = 4;
export const DEFAULT_EXPERIMENT_LIFT_THRESHOLD = 10;
export const MAX_CANDIDATE_REASON_ADJUSTMENTS = 4;
export const MAX_CANDIDATE_TOTAL_ADJUSTMENT = 4;

export type RecommendationExperimentStatus = "running" | "paused" | "completed";
export type RecommendationExperimentDecision = "insufficient" | "candidate-leading" | "inconclusive" | "candidate-trailing";
export type RecommendationPlannerPolicyMode = "baseline-default" | "candidate-default" | "experiment";

export type RecommendationPolicyCandidate = {
  id: string;
  createdAt: string;
  baselinePolicyId: typeof BASELINE_RECOMMENDATION_POLICY_ID;
  adjustments: RecommendationScoreAdjustments;
  source: {
    matureSnapshottedChoices: number;
    baselineStrongEvidenceRate?: number;
    suggestedChanges: number;
  };
};

export type RecommendationPolicyExperiment = {
  id: string;
  candidatePolicyId: string;
  status: RecommendationExperimentStatus;
  startedAt: string;
  completedAt?: string;
  promotedAt?: string;
};

export type RecommendationPolicyExperimentState = {
  version: 1;
  defaultPolicyId: string;
  candidate?: RecommendationPolicyCandidate;
  experiment?: RecommendationPolicyExperiment;
  lastRollbackAt?: string;
};

export type ResolvedRecommendationPlannerPolicy = {
  mode: RecommendationPlannerPolicyMode;
  policyId: string;
  variant: RecommendationPolicyVariant;
  experimentId?: string;
  assignmentIndex?: number;
  adjustments: RecommendationScoreAdjustments;
};

export type RecommendationExperimentVariantStats = {
  matureChoices: number;
  followedThrough: number;
  strongEvidence: number;
  noEvidence: number;
  followThroughRate?: number;
  strongEvidenceRate?: number;
  smoothedFollowThroughRate?: number;
  smoothedStrongEvidenceRate?: number;
};

export type RecommendationPolicyExperimentEvaluation = {
  available: boolean;
  experimentId?: string;
  candidatePolicyId?: string;
  status?: RecommendationExperimentStatus;
  baseline: RecommendationExperimentVariantStats;
  candidate: RecommendationExperimentVariantStats;
  minimumPerVariant: number;
  strongEvidenceLift?: number;
  followThroughLift?: number;
  decision: RecommendationExperimentDecision;
  promotionEligible: boolean;
  explanation: string;
};

const reasonIdSet = new Set<RecommendationReasonId>(recommendationReasonIds);

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

function stableHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function shortHash(value: string) {
  return stableHash(value).toString(16).padStart(8, "0");
}

function outcomeKey(exerciseId: string, chosenAt: string) {
  return `${exerciseId}\u0000${chosenAt}`;
}

function asSnapshot(entry: RecommendationHistoryEntry) {
  return entry as SnapshottedRecommendationHistoryEntry;
}

function validDelta(value: unknown): value is RecommendationScoreDelta {
  return value === -2 || value === 0 || value === 2;
}

function parseAdjustments(value: unknown): RecommendationScoreAdjustments | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const adjustments: RecommendationScoreAdjustments = {};
  for (const [key, raw] of Object.entries(value)) {
    if (!reasonIdSet.has(key as RecommendationReasonId) || !validDelta(raw) || raw === 0) continue;
    adjustments[key as RecommendationReasonId] = raw;
  }
  return Object.keys(adjustments).length ? adjustments : undefined;
}

function persistState(storage: StorageLike, state: RecommendationPolicyExperimentState) {
  try {
    storage.setItem(RECOMMENDATION_POLICY_EXPERIMENT_KEY, JSON.stringify(state));
  } catch {
    // Experiments are optional. Planner safely falls back to the baseline policy.
  }
  return state;
}

export function emptyRecommendationPolicyExperimentState(): RecommendationPolicyExperimentState {
  return { version: 1, defaultPolicyId: BASELINE_RECOMMENDATION_POLICY_ID };
}

export function readRecommendationPolicyExperimentState(storage: StorageLike): RecommendationPolicyExperimentState {
  try {
    const raw = storage.getItem(RECOMMENDATION_POLICY_EXPERIMENT_KEY);
    if (!raw) return emptyRecommendationPolicyExperimentState();
    const parsed = JSON.parse(raw) as Partial<RecommendationPolicyExperimentState>;
    if (parsed.version !== 1) return emptyRecommendationPolicyExperimentState();

    let candidate: RecommendationPolicyCandidate | undefined;
    const rawCandidate = parsed.candidate as Partial<RecommendationPolicyCandidate> | undefined;
    const adjustments = parseAdjustments(rawCandidate?.adjustments);
    if (
      rawCandidate
      && typeof rawCandidate.id === "string"
      && typeof rawCandidate.createdAt === "string"
      && rawCandidate.baselinePolicyId === BASELINE_RECOMMENDATION_POLICY_ID
      && adjustments
    ) {
      candidate = {
        id: rawCandidate.id,
        createdAt: rawCandidate.createdAt,
        baselinePolicyId: BASELINE_RECOMMENDATION_POLICY_ID,
        adjustments,
        source: {
          matureSnapshottedChoices: Math.max(0, Math.floor(rawCandidate.source?.matureSnapshottedChoices ?? 0)),
          baselineStrongEvidenceRate: typeof rawCandidate.source?.baselineStrongEvidenceRate === "number"
            ? rawCandidate.source.baselineStrongEvidenceRate
            : undefined,
          suggestedChanges: Math.max(0, Math.floor(rawCandidate.source?.suggestedChanges ?? Object.keys(adjustments).length)),
        },
      };
    }

    let experiment: RecommendationPolicyExperiment | undefined;
    const rawExperiment = parsed.experiment as Partial<RecommendationPolicyExperiment> | undefined;
    if (
      candidate
      && rawExperiment
      && typeof rawExperiment.id === "string"
      && rawExperiment.candidatePolicyId === candidate.id
      && (rawExperiment.status === "running" || rawExperiment.status === "paused" || rawExperiment.status === "completed")
      && typeof rawExperiment.startedAt === "string"
    ) {
      experiment = {
        id: rawExperiment.id,
        candidatePolicyId: candidate.id,
        status: rawExperiment.status,
        startedAt: rawExperiment.startedAt,
        completedAt: typeof rawExperiment.completedAt === "string" ? rawExperiment.completedAt : undefined,
        promotedAt: typeof rawExperiment.promotedAt === "string" ? rawExperiment.promotedAt : undefined,
      };
    }

    const defaultPolicyId = candidate && parsed.defaultPolicyId === candidate.id
      ? candidate.id
      : BASELINE_RECOMMENDATION_POLICY_ID;

    return {
      version: 1,
      defaultPolicyId,
      candidate,
      experiment,
      lastRollbackAt: typeof parsed.lastRollbackAt === "string" ? parsed.lastRollbackAt : undefined,
    };
  } catch {
    return emptyRecommendationPolicyExperimentState();
  }
}

export function buildRecommendationPolicyCandidate(
  audit: RecommendationPolicyAudit,
  createdAt = new Date().toISOString(),
): RecommendationPolicyCandidate | undefined {
  const rows = audit.reasons
    .filter((row) => row.reasonId !== "other" && row.suggestedScoreDelta !== 0)
    .sort((a, b) => (
      b.matureChoices - a.matureChoices
      || Math.abs(b.strongEvidenceLift ?? 0) - Math.abs(a.strongEvidenceLift ?? 0)
      || a.reasonId.localeCompare(b.reasonId)
    ))
    .slice(0, MAX_CANDIDATE_REASON_ADJUSTMENTS);
  if (!rows.length) return undefined;

  const adjustments: RecommendationScoreAdjustments = {};
  for (const row of rows) adjustments[row.reasonId] = row.suggestedScoreDelta;
  const signature = Object.entries(adjustments)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([id, delta]) => `${id}:${delta}`)
    .join("|");

  return {
    id: `candidate-v1-${shortHash(`${BASELINE_RECOMMENDATION_POLICY_ID}|${signature}`)}`,
    createdAt,
    baselinePolicyId: BASELINE_RECOMMENDATION_POLICY_ID,
    adjustments,
    source: {
      matureSnapshottedChoices: audit.matureSnapshottedChoices,
      baselineStrongEvidenceRate: audit.baselineStrongEvidenceRate,
      suggestedChanges: rows.length,
    },
  };
}

export function startRecommendationPolicyExperiment(
  storage: StorageLike,
  audit: RecommendationPolicyAudit,
  startedAt = new Date().toISOString(),
) {
  const current = readRecommendationPolicyExperimentState(storage);
  if (current.experiment?.status === "running" || current.defaultPolicyId !== BASELINE_RECOMMENDATION_POLICY_ID) return current;
  const candidate = buildRecommendationPolicyCandidate(audit, startedAt);
  if (!candidate) return current;

  const snapshots = readRecommendationPolicySnapshotHistory(storage);
  const stability = buildRecommendationPolicyStabilityAudit({ candidate, snapshots });
  if (!stability.launchEligible) return current;
  const coverage = buildRecommendationPolicyCoverageAudit({ stability, snapshots });
  if (!coverage.launchEligible) return current;

  const experiment: RecommendationPolicyExperiment = {
    id: `experiment-${shortHash(`${candidate.id}|${startedAt}`)}`,
    candidatePolicyId: candidate.id,
    status: "running",
    startedAt,
  };
  return persistState(storage, {
    version: 1,
    defaultPolicyId: BASELINE_RECOMMENDATION_POLICY_ID,
    candidate,
    experiment,
  });
}

export function pauseRecommendationPolicyExperiment(storage: StorageLike) {
  const current = readRecommendationPolicyExperimentState(storage);
  if (!current.experiment || current.experiment.status !== "running") return current;
  return persistState(storage, {
    ...current,
    experiment: { ...current.experiment, status: "paused" },
  });
}

export function resumeRecommendationPolicyExperiment(storage: StorageLike) {
  const current = readRecommendationPolicyExperimentState(storage);
  if (
    !current.candidate
    || !current.experiment
    || current.experiment.status !== "paused"
    || current.experiment.candidatePolicyId !== current.candidate.id
    || current.defaultPolicyId !== BASELINE_RECOMMENDATION_POLICY_ID
  ) return current;
  return persistState(storage, {
    ...current,
    experiment: { ...current.experiment, status: "running" },
  });
}

export function resolveRecommendationPlannerPolicy(
  state: RecommendationPolicyExperimentState,
  history: RecommendationHistory,
): ResolvedRecommendationPlannerPolicy {
  const candidate = state.candidate;
  const experiment = state.experiment;
  if (candidate && experiment?.status === "running" && experiment.candidatePolicyId === candidate.id) {
    const assignmentIndex = history.entries
      .map(asSnapshot)
      .filter((entry) => entry.experimentId === experiment.id && (entry.policyVariant === "baseline" || entry.policyVariant === "candidate"))
      .length;
    const candidateFirst = stableHash(experiment.id) % 2 === 1;
    const candidateTurn = assignmentIndex % 2 === 0 ? candidateFirst : !candidateFirst;
    return {
      mode: "experiment",
      policyId: candidateTurn ? candidate.id : BASELINE_RECOMMENDATION_POLICY_ID,
      variant: candidateTurn ? "candidate" : "baseline",
      experimentId: experiment.id,
      assignmentIndex,
      adjustments: candidateTurn ? candidate.adjustments : {},
    };
  }

  if (candidate && state.defaultPolicyId === candidate.id) {
    return {
      mode: "candidate-default",
      policyId: candidate.id,
      variant: "candidate",
      adjustments: candidate.adjustments,
    };
  }

  return {
    mode: "baseline-default",
    policyId: BASELINE_RECOMMENDATION_POLICY_ID,
    variant: "baseline",
    adjustments: {},
  };
}

function variantStats(
  pairs: Array<{ entry: SnapshottedRecommendationHistoryEntry; outcome: RecommendationOutcome }>,
  priorFollowThroughRate: number,
  priorStrongEvidenceRate: number,
  priorWeight: number,
): RecommendationExperimentVariantStats {
  const matureChoices = pairs.length;
  const followedThrough = pairs.filter(({ outcome }) => outcome.status !== "no-evidence").length;
  const strongEvidence = pairs.filter(({ outcome }) => outcome.strongEvidence).length;
  const noEvidence = pairs.filter(({ outcome }) => outcome.status === "no-evidence").length;
  return {
    matureChoices,
    followedThrough,
    strongEvidence,
    noEvidence,
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

function emptyVariantStats(): RecommendationExperimentVariantStats {
  return { matureChoices: 0, followedThrough: 0, strongEvidence: 0, noEvidence: 0 };
}

export function buildRecommendationPolicyExperimentEvaluation(input: {
  state: RecommendationPolicyExperimentState;
  recommendations: RecommendationHistory;
  outcomes: RecommendationOutcomeAudit;
  minPerVariant?: number;
  priorWeight?: number;
  liftThreshold?: number;
}): RecommendationPolicyExperimentEvaluation {
  const experiment = input.state.experiment;
  const candidatePolicy = input.state.candidate;
  const minPerVariant = Math.max(4, Math.floor(input.minPerVariant ?? DEFAULT_EXPERIMENT_MIN_PER_VARIANT));
  const priorWeight = Math.max(1, input.priorWeight ?? DEFAULT_EXPERIMENT_PRIOR_WEIGHT);
  const liftThreshold = Math.max(5, input.liftThreshold ?? DEFAULT_EXPERIMENT_LIFT_THRESHOLD);

  if (!experiment || !candidatePolicy || experiment.candidatePolicyId !== candidatePolicy.id) {
    return {
      available: false,
      baseline: emptyVariantStats(),
      candidate: emptyVariantStats(),
      minimumPerVariant: minPerVariant,
      decision: "insufficient",
      promotionEligible: false,
      explanation: "No frozen baseline-vs-candidate policy experiment exists yet.",
    };
  }

  const outcomeByKey = new Map(input.outcomes.outcomes.map((outcome) => [outcomeKey(outcome.exerciseId, outcome.chosenAt), outcome]));
  const maturePairs = input.recommendations.entries
    .map(asSnapshot)
    .filter((entry) => entry.experimentId === experiment.id && (entry.policyVariant === "baseline" || entry.policyVariant === "candidate"))
    .map((entry) => ({ entry, outcome: outcomeByKey.get(outcomeKey(entry.exerciseId, entry.chosenAt)) }))
    .filter((pair): pair is { entry: SnapshottedRecommendationHistoryEntry; outcome: RecommendationOutcome } => Boolean(
      pair.outcome && pair.outcome.status !== "waiting",
    ));

  const pooledFollowed = maturePairs.filter(({ outcome }) => outcome.status !== "no-evidence").length;
  const pooledStrong = maturePairs.filter(({ outcome }) => outcome.strongEvidence).length;
  const pooledFollowRate = finitePercent(pooledFollowed, maturePairs.length) ?? 0;
  const pooledStrongRate = finitePercent(pooledStrong, maturePairs.length) ?? 0;
  const baselinePairs = maturePairs.filter(({ entry }) => entry.policyVariant === "baseline");
  const candidatePairs = maturePairs.filter(({ entry }) => entry.policyVariant === "candidate");
  const baseline = variantStats(baselinePairs, pooledFollowRate, pooledStrongRate, priorWeight);
  const candidate = variantStats(candidatePairs, pooledFollowRate, pooledStrongRate, priorWeight);

  const enoughEvidence = baseline.matureChoices >= minPerVariant && candidate.matureChoices >= minPerVariant;
  const strongEvidenceLift = baseline.smoothedStrongEvidenceRate === undefined || candidate.smoothedStrongEvidenceRate === undefined
    ? undefined
    : candidate.smoothedStrongEvidenceRate - baseline.smoothedStrongEvidenceRate;
  const followThroughLift = baseline.smoothedFollowThroughRate === undefined || candidate.smoothedFollowThroughRate === undefined
    ? undefined
    : candidate.smoothedFollowThroughRate - baseline.smoothedFollowThroughRate;

  let decision: RecommendationExperimentDecision = "insufficient";
  if (enoughEvidence && strongEvidenceLift !== undefined && followThroughLift !== undefined) {
    if (strongEvidenceLift >= liftThreshold && followThroughLift >= -10) decision = "candidate-leading";
    else if (strongEvidenceLift <= -liftThreshold && followThroughLift <= 5) decision = "candidate-trailing";
    else decision = "inconclusive";
  }

  const promotionEligible = decision === "candidate-leading"
    && input.state.defaultPolicyId === BASELINE_RECOMMENDATION_POLICY_ID
    && experiment.status !== "completed";

  const explanation = decision === "insufficient"
    ? `Wait for at least ${minPerVariant} mature recommendations in both baseline and candidate variants before comparing them.`
    : decision === "candidate-leading"
      ? `The frozen candidate currently leads the baseline by ${strongEvidenceLift ?? 0} points of shrinkage-adjusted strong evidence without a material follow-through penalty. Promotion is still explicit and reversible.`
      : decision === "candidate-trailing"
        ? `The frozen candidate currently trails the baseline by ${Math.abs(strongEvidenceLift ?? 0)} points of shrinkage-adjusted strong evidence. Keep or restore the baseline.`
        : "The two frozen policy versions are currently too close to justify changing the local default.";

  return {
    available: true,
    experimentId: experiment.id,
    candidatePolicyId: candidatePolicy.id,
    status: experiment.status,
    baseline,
    candidate,
    minimumPerVariant: minPerVariant,
    strongEvidenceLift,
    followThroughLift,
    decision,
    promotionEligible,
    explanation,
  };
}

export function promoteRecommendationPolicyCandidate(
  storage: StorageLike,
  evaluation: RecommendationPolicyExperimentEvaluation,
  promotedAt = new Date().toISOString(),
) {
  const current = readRecommendationPolicyExperimentState(storage);
  if (
    !evaluation.promotionEligible
    || !current.candidate
    || !current.experiment
    || evaluation.experimentId !== current.experiment.id
    || evaluation.candidatePolicyId !== current.candidate.id
  ) return current;

  return persistState(storage, {
    ...current,
    defaultPolicyId: current.candidate.id,
    experiment: {
      ...current.experiment,
      status: "completed",
      completedAt: promotedAt,
      promotedAt,
    },
  });
}

export function rollbackRecommendationPolicyCandidate(
  storage: StorageLike,
  rolledBackAt = new Date().toISOString(),
) {
  const current = readRecommendationPolicyExperimentState(storage);
  if (current.defaultPolicyId === BASELINE_RECOMMENDATION_POLICY_ID) return current;
  return persistState(storage, {
    ...current,
    defaultPolicyId: BASELINE_RECOMMENDATION_POLICY_ID,
    lastRollbackAt: rolledBackAt,
  });
}
