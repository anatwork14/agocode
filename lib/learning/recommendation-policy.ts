import type { EvidenceDimension } from "./progressCatalog.ts";
import {
  classifyRecommendationReason,
  recommendationReasonLabel,
  type RecommendationReasonId,
  type RecommendationScoreDelta,
} from "./recommendation-rationale.ts";
import {
  RECOMMENDATION_HISTORY_KEY,
  recordRecommendationChoice,
  type AdaptiveRecommendation,
  type RecommendationHistory,
  type RecommendationHistoryEntry,
} from "./recommendations.ts";
import type { StorageLike } from "./evidence.ts";
import type { RecommendationOutcome, RecommendationOutcomeAudit } from "./system-evaluation.ts";

export { classifyRecommendationReason, recommendationReasonLabel } from "./recommendation-rationale.ts";
export type { RecommendationReasonId, RecommendationScoreDelta } from "./recommendation-rationale.ts";

export const DEFAULT_POLICY_MIN_MATURE_CHOICES = 8;
export const DEFAULT_POLICY_MIN_REASON_CHOICES = 5;
export const DEFAULT_POLICY_PRIOR_WEIGHT = 4;
export const DEFAULT_POLICY_LIFT_THRESHOLD = 12;
export const MAX_POLICY_PREVIEW_DELTA = 2 as const;

export type RecommendationPolicyStatus = "insufficient" | "promising" | "neutral" | "weak";
export type RecommendationPolicyVariant = "baseline" | "candidate";

export type RecommendationSelectionContext = {
  policyId?: string;
  policyVariant?: RecommendationPolicyVariant;
  experimentId?: string;
  probationId?: string;
  policyAdjustment?: number;
};

export type RecommendationChoiceSnapshot = RecommendationSelectionContext & {
  reasons?: string[];
  targetDimension?: EvidenceDimension;
  score?: number;
  familyId?: string;
};

export type SnapshottedRecommendationHistoryEntry = RecommendationHistoryEntry & RecommendationChoiceSnapshot;

export type RecommendationReasonAudit = {
  reasonId: RecommendationReasonId;
  label: string;
  matureChoices: number;
  followedThrough: number;
  strongEvidence: number;
  noEvidence: number;
  followThroughRate?: number;
  strongEvidenceRate?: number;
  smoothedFollowThroughRate?: number;
  smoothedStrongEvidenceRate?: number;
  strongEvidenceLift?: number;
  status: RecommendationPolicyStatus;
  suggestedScoreDelta: RecommendationScoreDelta;
  explanation: string;
};

export type RecommendationPolicyAudit = {
  choices: number;
  snapshottedChoices: number;
  matureSnapshottedChoices: number;
  metadataCoverageRate?: number;
  baselineFollowThroughRate?: number;
  baselineStrongEvidenceRate?: number;
  eligibleReasons: number;
  suggestedChanges: number;
  minimumMatureChoices: number;
  minimumReasonChoices: number;
  reasons: RecommendationReasonAudit[];
};

function finitePercent(numerator: number, denominator: number) {
  return denominator > 0 ? Math.round((numerator / denominator) * 100) : undefined;
}

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, value));
}

function smoothedRate(successes: number, total: number, baselinePercent: number, priorWeight: number) {
  const baseline = baselinePercent / 100;
  return clampPercent(((successes + baseline * priorWeight) / (total + priorWeight)) * 100);
}

function outcomeKey(exerciseId: string, chosenAt: string) {
  return `${exerciseId}\u0000${chosenAt}`;
}

function asSnapshot(entry: RecommendationHistoryEntry): SnapshottedRecommendationHistoryEntry {
  return entry as SnapshottedRecommendationHistoryEntry;
}

function isMature(outcome: RecommendationOutcome | undefined): outcome is RecommendationOutcome {
  return Boolean(outcome && outcome.status !== "waiting");
}

export function recordRecommendationSelection(
  storage: StorageLike,
  recommendation: AdaptiveRecommendation,
  chosenAt = new Date().toISOString(),
  context: RecommendationSelectionContext = {},
): RecommendationHistory {
  const history = recordRecommendationChoice(storage, recommendation.exercise.id, chosenAt);
  const lastIndex = history.entries.length - 1;
  const entries = history.entries.map((entry, index) => {
    if (index !== lastIndex || entry.exerciseId !== recommendation.exercise.id || entry.chosenAt !== chosenAt) return entry;
    return {
      ...entry,
      reasons: [...recommendation.reasons],
      targetDimension: recommendation.targetDimension,
      score: recommendation.score,
      familyId: recommendation.familyId,
      policyId: context.policyId,
      policyVariant: context.policyVariant,
      experimentId: context.experimentId,
      probationId: context.probationId,
      policyAdjustment: context.policyAdjustment ?? recommendation.policyAdjustment,
    } satisfies SnapshottedRecommendationHistoryEntry;
  });
  const enriched: RecommendationHistory = { version: 1, entries };
  try {
    storage.setItem(RECOMMENDATION_HISTORY_KEY, JSON.stringify(enriched));
  } catch {
    // Recommendation remains usable even if metadata enrichment cannot persist.
  }
  return enriched;
}

function reasonExplanation(
  status: RecommendationPolicyStatus,
  matureChoices: number,
  strongRate: number | undefined,
  baselineStrongRate: number | undefined,
  minReasonChoices: number,
  minMatureChoices: number,
  matureSnapshottedChoices: number,
) {
  if (matureSnapshottedChoices < minMatureChoices) {
    return `Only ${matureSnapshottedChoices} mature recommendation choices currently include reason snapshots; at least ${minMatureChoices} are required before any score-change preview is allowed.`;
  }
  if (matureChoices < minReasonChoices) {
    return `This rationale has only ${matureChoices} mature observation${matureChoices === 1 ? "" : "s"}; at least ${minReasonChoices} are required before comparing it with the local baseline.`;
  }
  if (status === "promising") {
    return `After conservative shrinkage, this rationale is associated with stronger objective evidence than the current local baseline (${Math.round(strongRate ?? 0)}% vs ${Math.round(baselineStrongRate ?? 0)}%). The +2 preview is bounded and is not applied to the live planner.`;
  }
  if (status === "weak") {
    return `After conservative shrinkage, this rationale is associated with weaker objective evidence than the current local baseline (${Math.round(strongRate ?? 0)}% vs ${Math.round(baselineStrongRate ?? 0)}%). The -2 preview is bounded and is not applied to the live planner.`;
  }
  return `This rationale currently sits close to the local baseline after shrinkage. No score change is suggested from the available evidence.`;
}

export function buildRecommendationPolicyAudit(input: {
  recommendations: RecommendationHistory;
  outcomes: RecommendationOutcomeAudit;
  minMatureChoices?: number;
  minReasonChoices?: number;
  priorWeight?: number;
  liftThreshold?: number;
}): RecommendationPolicyAudit {
  const minMatureChoices = Math.max(2, Math.floor(input.minMatureChoices ?? DEFAULT_POLICY_MIN_MATURE_CHOICES));
  const minReasonChoices = Math.max(2, Math.floor(input.minReasonChoices ?? DEFAULT_POLICY_MIN_REASON_CHOICES));
  const priorWeight = Math.max(1, input.priorWeight ?? DEFAULT_POLICY_PRIOR_WEIGHT);
  const liftThreshold = Math.max(5, input.liftThreshold ?? DEFAULT_POLICY_LIFT_THRESHOLD);
  const outcomeByKey = new Map(
    input.outcomes.outcomes.map((outcome) => [outcomeKey(outcome.exerciseId, outcome.chosenAt), outcome]),
  );

  const snapshots = input.recommendations.entries.map(asSnapshot).filter((entry) => (
    Array.isArray(entry.reasons) && entry.reasons.some((reason) => typeof reason === "string" && reason.trim().length > 0)
  ));
  const matureSnapshots = snapshots
    .map((entry) => ({ entry, outcome: outcomeByKey.get(outcomeKey(entry.exerciseId, entry.chosenAt)) }))
    .filter((pair): pair is { entry: SnapshottedRecommendationHistoryEntry; outcome: RecommendationOutcome } => isMature(pair.outcome));

  const baselineFollowed = matureSnapshots.filter(({ outcome }) => outcome.status !== "no-evidence").length;
  const baselineStrong = matureSnapshots.filter(({ outcome }) => outcome.strongEvidence).length;
  const baselineFollowThroughRate = finitePercent(baselineFollowed, matureSnapshots.length);
  const baselineStrongEvidenceRate = finitePercent(baselineStrong, matureSnapshots.length);

  const grouped = new Map<RecommendationReasonId, Array<{ entry: SnapshottedRecommendationHistoryEntry; outcome: RecommendationOutcome }>>();
  for (const pair of matureSnapshots) {
    const ids = new Set((pair.entry.reasons ?? []).map(classifyRecommendationReason));
    for (const id of ids) {
      const rows = grouped.get(id) ?? [];
      rows.push(pair);
      grouped.set(id, rows);
    }
  }

  const reasons = [...grouped.entries()].map(([reasonId, rows]): RecommendationReasonAudit => {
    const matureChoices = rows.length;
    const followedThrough = rows.filter(({ outcome }) => outcome.status !== "no-evidence").length;
    const strongEvidence = rows.filter(({ outcome }) => outcome.strongEvidence).length;
    const noEvidence = rows.filter(({ outcome }) => outcome.status === "no-evidence").length;
    const followThroughRate = finitePercent(followedThrough, matureChoices);
    const strongEvidenceRate = finitePercent(strongEvidence, matureChoices);
    const baselineFollow = baselineFollowThroughRate ?? 0;
    const baselineStrongRate = baselineStrongEvidenceRate ?? 0;
    const smoothedFollowThroughRate = smoothedRate(followedThrough, matureChoices, baselineFollow, priorWeight);
    const smoothedStrongEvidenceRate = smoothedRate(strongEvidence, matureChoices, baselineStrongRate, priorWeight);
    const strongEvidenceLift = Math.round(smoothedStrongEvidenceRate - baselineStrongRate);
    const enoughEvidence = matureSnapshots.length >= minMatureChoices && matureChoices >= minReasonChoices;

    let status: RecommendationPolicyStatus = "insufficient";
    let suggestedScoreDelta: RecommendationScoreDelta = 0;
    if (enoughEvidence) {
      const followLift = smoothedFollowThroughRate - baselineFollow;
      if (strongEvidenceLift >= liftThreshold && followLift >= -10) {
        status = "promising";
        suggestedScoreDelta = MAX_POLICY_PREVIEW_DELTA;
      } else if (strongEvidenceLift <= -liftThreshold && followLift <= 5) {
        status = "weak";
        suggestedScoreDelta = -2;
      } else {
        status = "neutral";
      }
    }

    return {
      reasonId,
      label: recommendationReasonLabel(reasonId),
      matureChoices,
      followedThrough,
      strongEvidence,
      noEvidence,
      followThroughRate,
      strongEvidenceRate,
      smoothedFollowThroughRate: Math.round(smoothedFollowThroughRate),
      smoothedStrongEvidenceRate: Math.round(smoothedStrongEvidenceRate),
      strongEvidenceLift,
      status,
      suggestedScoreDelta,
      explanation: reasonExplanation(
        status,
        matureChoices,
        smoothedStrongEvidenceRate,
        baselineStrongEvidenceRate,
        minReasonChoices,
        minMatureChoices,
        matureSnapshots.length,
      ),
    };
  }).sort((a, b) => {
    const statusRank: Record<RecommendationPolicyStatus, number> = { weak: 0, promising: 1, neutral: 2, insufficient: 3 };
    return statusRank[a.status] - statusRank[b.status] || b.matureChoices - a.matureChoices || a.label.localeCompare(b.label);
  });

  return {
    choices: input.recommendations.entries.length,
    snapshottedChoices: snapshots.length,
    matureSnapshottedChoices: matureSnapshots.length,
    metadataCoverageRate: finitePercent(snapshots.length, input.recommendations.entries.length),
    baselineFollowThroughRate,
    baselineStrongEvidenceRate,
    eligibleReasons: reasons.filter((reason) => reason.status !== "insufficient").length,
    suggestedChanges: reasons.filter((reason) => reason.suggestedScoreDelta !== 0).length,
    minimumMatureChoices: minMatureChoices,
    minimumReasonChoices: minReasonChoices,
    reasons,
  };
}
