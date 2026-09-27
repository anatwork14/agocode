import type { DifficultyCalibrationProfile } from "./calibration.ts";
import type { StorageLike } from "./evidence.ts";
import type { ProblemIndependenceState } from "./independence.ts";
import type { MasterySnapshot } from "./mastery.ts";
import type { ObstacleEvidence } from "./obstacles.ts";
import type { ProblemReviewStatus } from "./problem-review.ts";
import type { RecommendationScoreAdjustments } from "./recommendation-rationale.ts";
import {
  buildAdaptiveRecommendations,
  type AdaptiveRecommendationInput,
} from "./recommendations.ts";

export const RECOMMENDATION_POLICY_SNAPSHOT_KEY = "agocode.progress.recommendation-policy-snapshots";
export const RECOMMENDATION_POLICY_SNAPSHOT_LIMIT = 16;
export const DEFAULT_STABILITY_MIN_SNAPSHOTS = 6;
export const DEFAULT_STABILITY_MIN_TOP_CHOICE_RETENTION = 50;
export const DEFAULT_STABILITY_MIN_TOP_FIVE_OVERLAP = 70;
export const DEFAULT_STABILITY_MIN_FAMILY_OVERLAP = 70;
export const DEFAULT_STABILITY_MAX_RANK_DISPLACEMENT = 35;
export const DEFAULT_STABILITY_MAX_HIGH_CHURN_RATE = 34;
export const STABILITY_REPLAY_LIMIT = 5;
export const STABILITY_MAX_POLICY_ADJUSTMENT = 4;

const evidenceDimensions = new Set(["understand", "trace", "predict", "rebuild", "explain", "transfer", "recall"]);
const independenceStages = new Set(["seen", "guided", "solved", "independent", "transferred", "recalled"]);
const reviewDueStates = new Set(["fresh", "due-soon", "due", "overdue"]);

export type RecommendationPolicySnapshot = {
  version: 1;
  id: string;
  signature: string;
  recordedAt: string;
  mastery: Pick<MasterySnapshot, "overall" | "weakest">;
  obstacleCounts: ObstacleEvidence["counts"];
  recentExerciseIds: string[];
  missedExerciseIds: string[];
  recommendationHistoryIds: string[];
  difficultyBias: DifficultyCalibrationProfile["bias"];
  problemIndependence: Record<string, Pick<ProblemIndependenceState, "stage" | "rank" | "familyId">>;
  problemReview: Record<string, Pick<ProblemReviewStatus, "dueState">>;
};

export type RecommendationPolicySnapshotHistory = {
  version: 1;
  entries: RecommendationPolicySnapshot[];
};

export type RecommendationStabilityCandidate = {
  id: string;
  adjustments: RecommendationScoreAdjustments;
};

export type RecommendationStabilityComparison = {
  snapshotId: string;
  recordedAt: string;
  topChoiceSame: boolean;
  topFiveOverlap: number;
  familyOverlap: number;
  rankDisplacement: number;
  baselineTopIds: string[];
  candidateTopIds: string[];
  baselineFamilies: string[];
  candidateFamilies: string[];
};

export type RecommendationPolicyStabilityStatus = "insufficient" | "stable" | "unstable";

export type RecommendationPolicyStabilityAudit = {
  available: boolean;
  candidatePolicyId?: string;
  storedSnapshots: number;
  replayedSnapshots: number;
  invalidSnapshots: number;
  minimumSnapshots: number;
  topChoiceRetention?: number;
  meanTopFiveOverlap?: number;
  meanFamilyOverlap?: number;
  meanRankDisplacement?: number;
  highChurnSnapshots: number;
  highChurnRate?: number;
  effectfulSnapshots: number;
  status: RecommendationPolicyStabilityStatus;
  launchEligible: boolean;
  explanation: string;
  comparisons: RecommendationStabilityComparison[];
};

function emptyHistory(): RecommendationPolicySnapshotHistory {
  return { version: 1, entries: [] };
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

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, nested]) => [key, canonicalize(nested)]),
  );
}

function signatureFor(value: unknown) {
  return shortHash(JSON.stringify(canonicalize(value)));
}

function finitePercent(numerator: number, denominator: number) {
  return denominator > 0 ? Math.round((numerator / denominator) * 100) : undefined;
}

function mean(values: readonly number[]) {
  if (!values.length) return undefined;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function parseIndependence(value: unknown): RecommendationPolicySnapshot["problemIndependence"] | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const output: RecommendationPolicySnapshot["problemIndependence"] = {};
  for (const [exerciseId, raw] of Object.entries(value)) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
    const item = raw as Partial<ProblemIndependenceState>;
    if (!independenceStages.has(String(item.stage)) || typeof item.rank !== "number" || !Number.isFinite(item.rank)) return null;
    output[exerciseId] = {
      stage: item.stage as ProblemIndependenceState["stage"],
      rank: item.rank,
      familyId: typeof item.familyId === "string" ? item.familyId : undefined,
    };
  }
  return output;
}

function parseReview(value: unknown): RecommendationPolicySnapshot["problemReview"] | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const output: RecommendationPolicySnapshot["problemReview"] = {};
  for (const [exerciseId, raw] of Object.entries(value)) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
    const dueState = (raw as Partial<ProblemReviewStatus>).dueState;
    if (!reviewDueStates.has(String(dueState))) return null;
    output[exerciseId] = { dueState: dueState as ProblemReviewStatus["dueState"] };
  }
  return output;
}

function parseSnapshot(value: unknown): RecommendationPolicySnapshot | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const snapshot = value as Partial<RecommendationPolicySnapshot>;
  const mastery = snapshot.mastery as RecommendationPolicySnapshot["mastery"] | undefined;
  const weakest = mastery?.weakest;
  const problemIndependence = parseIndependence(snapshot.problemIndependence);
  const problemReview = parseReview(snapshot.problemReview);
  if (
    snapshot.version !== 1
    || typeof snapshot.id !== "string"
    || typeof snapshot.signature !== "string"
    || typeof snapshot.recordedAt !== "string"
    || !mastery
    || typeof mastery.overall !== "number"
    || !Number.isFinite(mastery.overall)
    || !weakest
    || !evidenceDimensions.has(String(weakest.id))
    || typeof weakest.label !== "string"
    || typeof weakest.score !== "number"
    || !Number.isFinite(weakest.score)
    || !snapshot.obstacleCounts
    || typeof snapshot.obstacleCounts !== "object"
    || !isStringArray(snapshot.recentExerciseIds)
    || !isStringArray(snapshot.missedExerciseIds)
    || !isStringArray(snapshot.recommendationHistoryIds)
    || (snapshot.difficultyBias !== -1 && snapshot.difficultyBias !== 0 && snapshot.difficultyBias !== 1)
    || !problemIndependence
    || !problemReview
  ) return null;

  return {
    version: 1,
    id: snapshot.id,
    signature: snapshot.signature,
    recordedAt: snapshot.recordedAt,
    mastery,
    obstacleCounts: snapshot.obstacleCounts,
    recentExerciseIds: [...snapshot.recentExerciseIds],
    missedExerciseIds: [...snapshot.missedExerciseIds],
    recommendationHistoryIds: [...snapshot.recommendationHistoryIds],
    difficultyBias: snapshot.difficultyBias,
    problemIndependence,
    problemReview,
  };
}

export function readRecommendationPolicySnapshotHistory(storage: StorageLike): RecommendationPolicySnapshotHistory {
  try {
    const raw = storage.getItem(RECOMMENDATION_POLICY_SNAPSHOT_KEY);
    if (!raw) return emptyHistory();
    const parsed = JSON.parse(raw) as Partial<RecommendationPolicySnapshotHistory>;
    if (parsed.version !== 1 || !Array.isArray(parsed.entries)) return emptyHistory();
    const entries = parsed.entries
      .map(parseSnapshot)
      .filter((entry): entry is RecommendationPolicySnapshot => Boolean(entry))
      .slice(-RECOMMENDATION_POLICY_SNAPSHOT_LIMIT);
    return { version: 1, entries };
  } catch {
    return emptyHistory();
  }
}

function snapshotInput(input: AdaptiveRecommendationInput) {
  const problemIndependence: RecommendationPolicySnapshot["problemIndependence"] = {};
  for (const [exerciseId, state] of Object.entries(input.problemIndependence ?? {})) {
    problemIndependence[exerciseId] = {
      stage: state.stage,
      rank: state.rank,
      familyId: state.familyId,
    };
  }

  const problemReview: RecommendationPolicySnapshot["problemReview"] = {};
  for (const [exerciseId, state] of Object.entries(input.problemReview ?? {})) {
    problemReview[exerciseId] = { dueState: state.dueState };
  }

  return {
    mastery: {
      overall: input.mastery.overall,
      weakest: { ...input.mastery.weakest },
    },
    obstacleCounts: { ...(input.obstacles?.counts ?? {}) },
    recentExerciseIds: [...(input.recentExerciseIds ?? [])],
    missedExerciseIds: [...(input.missedExerciseIds ?? [])],
    recommendationHistoryIds: [...(input.recommendationHistoryIds ?? [])],
    difficultyBias: input.difficultyCalibration?.bias ?? 0,
    problemIndependence,
    problemReview,
  };
}

/**
 * Records only recommendation-relevant learner state. Policy weights, active experiment arm,
 * and UI mix seed are intentionally excluded so a snapshot can replay baseline and candidate
 * policies against the exact same learner state.
 */
export function recordRecommendationPolicySnapshot(
  storage: StorageLike,
  input: AdaptiveRecommendationInput,
  recordedAt = new Date().toISOString(),
): RecommendationPolicySnapshotHistory {
  const previous = readRecommendationPolicySnapshotHistory(storage);
  const compact = snapshotInput(input);
  const signature = signatureFor(compact);
  if (previous.entries.some((entry) => entry.signature === signature)) return previous;

  const snapshot: RecommendationPolicySnapshot = {
    version: 1,
    id: `planner-state-${signature}`,
    signature,
    recordedAt,
    ...compact,
  };
  const next: RecommendationPolicySnapshotHistory = {
    version: 1,
    entries: [...previous.entries, snapshot].slice(-RECOMMENDATION_POLICY_SNAPSHOT_LIMIT),
  };
  try {
    storage.setItem(RECOMMENDATION_POLICY_SNAPSHOT_KEY, JSON.stringify(next));
  } catch {
    return previous;
  }
  return next;
}

function replayInput(snapshot: RecommendationPolicySnapshot): AdaptiveRecommendationInput {
  return {
    mastery: snapshot.mastery as MasterySnapshot,
    obstacles: {
      version: 1,
      events: [],
      counts: snapshot.obstacleCounts,
    } as ObstacleEvidence,
    recentExerciseIds: snapshot.recentExerciseIds,
    missedExerciseIds: snapshot.missedExerciseIds,
    recommendationHistoryIds: snapshot.recommendationHistoryIds,
    difficultyCalibration: { bias: snapshot.difficultyBias } as DifficultyCalibrationProfile,
    problemIndependence: snapshot.problemIndependence as Record<string, ProblemIndependenceState>,
    problemReview: snapshot.problemReview as Record<string, ProblemReviewStatus>,
    limit: STABILITY_REPLAY_LIMIT,
    seed: `stability:${snapshot.id}`,
  };
}

function overlapPercent(left: readonly string[], right: readonly string[]) {
  const denominator = Math.max(left.length, right.length, 1);
  const rightSet = new Set(right);
  const overlap = new Set(left.filter((item) => rightSet.has(item))).size;
  return Math.round((overlap / denominator) * 100);
}

function familyOverlapPercent(left: readonly string[], right: readonly string[]) {
  const leftSet = new Set(left);
  const rightSet = new Set(right);
  const denominator = Math.max(leftSet.size, rightSet.size, 1);
  let overlap = 0;
  for (const family of leftSet) if (rightSet.has(family)) overlap += 1;
  return Math.round((overlap / denominator) * 100);
}

function rankDisplacementPercent(left: readonly string[], right: readonly string[]) {
  const k = Math.max(left.length, right.length, 1);
  const union = [...new Set([...left, ...right])];
  if (!union.length) return 0;
  const leftRank = new Map(left.map((id, index) => [id, index]));
  const rightRank = new Map(right.map((id, index) => [id, index]));
  const total = union.reduce((sum, id) => (
    sum + Math.abs((leftRank.get(id) ?? k) - (rightRank.get(id) ?? k))
  ), 0);
  return Math.round((total / (union.length * k)) * 100);
}

export function summarizeRecommendationStabilityComparisons(input: {
  candidatePolicyId: string;
  comparisons: RecommendationStabilityComparison[];
  storedSnapshots?: number;
  invalidSnapshots?: number;
  minimumSnapshots?: number;
  minTopChoiceRetention?: number;
  minTopFiveOverlap?: number;
  minFamilyOverlap?: number;
  maxRankDisplacement?: number;
  maxHighChurnRate?: number;
}): RecommendationPolicyStabilityAudit {
  const minimumSnapshots = Math.max(2, Math.floor(input.minimumSnapshots ?? DEFAULT_STABILITY_MIN_SNAPSHOTS));
  const minTopChoiceRetention = input.minTopChoiceRetention ?? DEFAULT_STABILITY_MIN_TOP_CHOICE_RETENTION;
  const minTopFiveOverlap = input.minTopFiveOverlap ?? DEFAULT_STABILITY_MIN_TOP_FIVE_OVERLAP;
  const minFamilyOverlap = input.minFamilyOverlap ?? DEFAULT_STABILITY_MIN_FAMILY_OVERLAP;
  const maxRankDisplacement = input.maxRankDisplacement ?? DEFAULT_STABILITY_MAX_RANK_DISPLACEMENT;
  const maxHighChurnRate = input.maxHighChurnRate ?? DEFAULT_STABILITY_MAX_HIGH_CHURN_RATE;
  const comparisons = input.comparisons;
  const topChoiceRetention = finitePercent(comparisons.filter((item) => item.topChoiceSame).length, comparisons.length);
  const meanTopFiveOverlap = mean(comparisons.map((item) => item.topFiveOverlap));
  const meanFamilyOverlap = mean(comparisons.map((item) => item.familyOverlap));
  const meanRankDisplacement = mean(comparisons.map((item) => item.rankDisplacement));
  const highChurnSnapshots = comparisons.filter((item) => (
    item.topFiveOverlap < 60 || item.familyOverlap < 60 || item.rankDisplacement > 50
  )).length;
  const highChurnRate = finitePercent(highChurnSnapshots, comparisons.length);
  const effectfulSnapshots = comparisons.filter((item) => (
    !item.topChoiceSame || item.topFiveOverlap < 100 || item.rankDisplacement > 0
  )).length;

  let status: RecommendationPolicyStabilityStatus = "insufficient";
  if (comparisons.length >= minimumSnapshots) {
    const unstable = (topChoiceRetention ?? 0) < minTopChoiceRetention
      || (meanTopFiveOverlap ?? 0) < minTopFiveOverlap
      || (meanFamilyOverlap ?? 0) < minFamilyOverlap
      || (meanRankDisplacement ?? 100) > maxRankDisplacement
      || (highChurnRate ?? 100) > maxHighChurnRate;
    status = unstable ? "unstable" : "stable";
  }
  const launchEligible = status === "stable";
  const explanation = status === "insufficient"
    ? `Collect at least ${minimumSnapshots} distinct prospective planner-state snapshots before exposing this candidate to a learner experiment.`
    : status === "unstable"
      ? `Counterfactual replay shows excessive ranking churn: top-choice retention ${topChoiceRetention ?? 0}%, top-five overlap ${meanTopFiveOverlap ?? 0}%, family overlap ${meanFamilyOverlap ?? 0}%, and high-churn states ${highChurnRate ?? 0}%. Keep the deterministic baseline.`
      : `The candidate is stable across ${comparisons.length} saved learner states: top-choice retention ${topChoiceRetention ?? 0}%, top-five overlap ${meanTopFiveOverlap ?? 0}%, and family overlap ${meanFamilyOverlap ?? 0}%. It may proceed to a real baseline-vs-candidate experiment.`;

  return {
    available: true,
    candidatePolicyId: input.candidatePolicyId,
    storedSnapshots: input.storedSnapshots ?? comparisons.length,
    replayedSnapshots: comparisons.length,
    invalidSnapshots: input.invalidSnapshots ?? 0,
    minimumSnapshots,
    topChoiceRetention,
    meanTopFiveOverlap,
    meanFamilyOverlap,
    meanRankDisplacement,
    highChurnSnapshots,
    highChurnRate,
    effectfulSnapshots,
    status,
    launchEligible,
    explanation,
    comparisons,
  };
}

export function buildRecommendationPolicyStabilityAudit(input: {
  candidate?: RecommendationStabilityCandidate;
  snapshots: RecommendationPolicySnapshotHistory;
  minimumSnapshots?: number;
}): RecommendationPolicyStabilityAudit {
  if (!input.candidate) {
    return {
      available: false,
      storedSnapshots: input.snapshots.entries.length,
      replayedSnapshots: 0,
      invalidSnapshots: 0,
      minimumSnapshots: Math.max(2, Math.floor(input.minimumSnapshots ?? DEFAULT_STABILITY_MIN_SNAPSHOTS)),
      highChurnSnapshots: 0,
      effectfulSnapshots: 0,
      status: "insufficient",
      launchEligible: false,
      explanation: "Phase 5 has not produced a non-zero candidate policy to replay yet.",
      comparisons: [],
    };
  }

  const comparisons: RecommendationStabilityComparison[] = [];
  let invalidSnapshots = 0;
  for (const snapshot of input.snapshots.entries) {
    try {
      const baseInput = replayInput(snapshot);
      const baseline = buildAdaptiveRecommendations({
        ...baseInput,
        policyAdjustments: {},
        maxPolicyAdjustment: STABILITY_MAX_POLICY_ADJUSTMENT,
      });
      const candidate = buildAdaptiveRecommendations({
        ...baseInput,
        policyAdjustments: input.candidate.adjustments,
        maxPolicyAdjustment: STABILITY_MAX_POLICY_ADJUSTMENT,
      });
      if (!baseline.length || !candidate.length) {
        invalidSnapshots += 1;
        continue;
      }
      const baselineTopIds = baseline.map((item) => item.exercise.id);
      const candidateTopIds = candidate.map((item) => item.exercise.id);
      const baselineFamilies = baseline.map((item) => item.familyId);
      const candidateFamilies = candidate.map((item) => item.familyId);
      comparisons.push({
        snapshotId: snapshot.id,
        recordedAt: snapshot.recordedAt,
        topChoiceSame: baselineTopIds[0] === candidateTopIds[0],
        topFiveOverlap: overlapPercent(baselineTopIds, candidateTopIds),
        familyOverlap: familyOverlapPercent(baselineFamilies, candidateFamilies),
        rankDisplacement: rankDisplacementPercent(baselineTopIds, candidateTopIds),
        baselineTopIds,
        candidateTopIds,
        baselineFamilies,
        candidateFamilies,
      });
    } catch {
      invalidSnapshots += 1;
    }
  }

  return summarizeRecommendationStabilityComparisons({
    candidatePolicyId: input.candidate.id,
    comparisons,
    storedSnapshots: input.snapshots.entries.length,
    invalidSnapshots,
    minimumSnapshots: input.minimumSnapshots,
  });
}
