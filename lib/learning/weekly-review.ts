import type { StorageLike } from "./evidence.ts";
import type { ProblemRecognitionHistory } from "./independence.ts";
import { classifyReasoningAttempt, type ReasoningAttemptHistory } from "./reasoning-attempts.ts";
import type { AdaptiveCurriculumPlan, CurriculumModuleState } from "./curriculum-planner.ts";
import { evaluateWeeklyMission, getLocalWeekKey, type WeeklyMission } from "./weekly-mission.ts";

export const WEEKLY_REVIEW_KEY = "agocode.progress.weekly-review";
export const WEEKLY_REVIEW_HISTORY_LIMIT = 12;

export type WeeklyReviewCurriculumCounts = Record<CurriculumModuleState, number>;

export type WeeklyReviewSnapshot = {
  version: 1;
  weekKey: string;
  firstObservedAt: string;
  updatedAt: string;
  finalizedAttempts: number;
  completedAttempts: number;
  independentAttempts: number;
  uniqueExercises: number;
  supportAssistedCompleted: number;
  supportFreeCompleted: number;
  recognitionChecks: number;
  firstTryRecognitions: number;
  missionTotal: number;
  missionSatisfied: number;
  curriculumCounts: WeeklyReviewCurriculumCounts;
  nextTargetIds: string[];
};

export type WeeklyReviewState = {
  version: 1;
  current?: WeeklyReviewSnapshot;
  history: WeeklyReviewSnapshot[];
};

export type WeeklyReviewComparison = {
  hasPrevious: boolean;
  independentDelta: number;
  recognitionAccuracyDelta: number;
  supportFreeRateDelta: number;
  masteredDelta: number;
  newlyPrioritized: string[];
  deprioritized: string[];
};

function emptyState(): WeeklyReviewState {
  return { version: 1, history: [] };
}

function recognitionAccuracy(snapshot: WeeklyReviewSnapshot) {
  return snapshot.recognitionChecks
    ? Math.round((snapshot.firstTryRecognitions / snapshot.recognitionChecks) * 100)
    : 0;
}

function supportFreeRate(snapshot: WeeklyReviewSnapshot) {
  const total = snapshot.supportFreeCompleted + snapshot.supportAssistedCompleted;
  return total ? Math.round((snapshot.supportFreeCompleted / total) * 100) : 0;
}

function parseSnapshot(value: unknown): WeeklyReviewSnapshot | null {
  if (!value || typeof value !== "object") return null;
  const snapshot = value as Partial<WeeklyReviewSnapshot>;
  if (
    snapshot.version !== 1
    || typeof snapshot.weekKey !== "string"
    || typeof snapshot.firstObservedAt !== "string"
    || typeof snapshot.updatedAt !== "string"
    || !snapshot.curriculumCounts
    || !Array.isArray(snapshot.nextTargetIds)
  ) return null;
  const numberFields = [
    snapshot.finalizedAttempts,
    snapshot.completedAttempts,
    snapshot.independentAttempts,
    snapshot.uniqueExercises,
    snapshot.supportAssistedCompleted,
    snapshot.supportFreeCompleted,
    snapshot.recognitionChecks,
    snapshot.firstTryRecognitions,
    snapshot.missionTotal,
    snapshot.missionSatisfied,
  ];
  if (numberFields.some((value) => typeof value !== "number" || !Number.isFinite(value))) return null;
  const counts = snapshot.curriculumCounts as Partial<WeeklyReviewCurriculumCounts>;
  if ([counts.mastered, counts.developing, counts.ready, counts.blocked].some((value) => typeof value !== "number" || !Number.isFinite(value))) return null;
  return snapshot as WeeklyReviewSnapshot;
}

export function readWeeklyReviewState(storage: StorageLike): WeeklyReviewState {
  try {
    const raw = storage.getItem(WEEKLY_REVIEW_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as Partial<WeeklyReviewState>;
    if (parsed.version !== 1) return emptyState();
    const current = parseSnapshot(parsed.current);
    const history = Array.isArray(parsed.history)
      ? parsed.history.map(parseSnapshot).filter((entry): entry is WeeklyReviewSnapshot => Boolean(entry)).slice(-WEEKLY_REVIEW_HISTORY_LIMIT)
      : [];
    return { version: 1, current: current ?? undefined, history };
  } catch {
    return emptyState();
  }
}

function writeState(storage: StorageLike, state: WeeklyReviewState) {
  storage.setItem(WEEKLY_REVIEW_KEY, JSON.stringify(state));
}

function inWeek(timestamp: string, weekKey: string) {
  const date = new Date(timestamp);
  return Number.isFinite(date.getTime()) && getLocalWeekKey(date) === weekKey;
}

export function buildWeeklyReviewSnapshot(input: {
  reasoningAttempts: ReasoningAttemptHistory;
  recognitionHistory: ProblemRecognitionHistory;
  curriculumPlan: AdaptiveCurriculumPlan;
  weeklyMission: WeeklyMission;
  now?: Date;
  firstObservedAt?: string;
}): WeeklyReviewSnapshot {
  const now = input.now ?? new Date();
  const weekKey = getLocalWeekKey(now);
  const timestamp = now.toISOString();
  const attempts = input.reasoningAttempts.entries.filter((entry) => inWeek(entry.finalizedAt, weekKey));
  const completed = attempts.filter((entry) => Boolean(entry.completedAt));
  const independent = attempts.filter((entry) => classifyReasoningAttempt(entry) === "independent");
  const recognition = input.recognitionHistory.entries.filter((entry) => inWeek(entry.recognizedAt, weekKey));
  const missionEvaluation = evaluateWeeklyMission(input.weeklyMission, input.curriculumPlan);

  return {
    version: 1,
    weekKey,
    firstObservedAt: input.firstObservedAt ?? timestamp,
    updatedAt: timestamp,
    finalizedAttempts: attempts.length,
    completedAttempts: completed.length,
    independentAttempts: independent.length,
    uniqueExercises: new Set(attempts.map((entry) => entry.exerciseId)).size,
    supportAssistedCompleted: completed.filter((entry) => entry.lensRevealed).length,
    supportFreeCompleted: completed.filter((entry) => !entry.lensRevealed).length,
    recognitionChecks: recognition.length,
    firstTryRecognitions: recognition.filter((entry) => entry.firstTry).length,
    missionTotal: input.weeklyMission.items.length,
    missionSatisfied: missionEvaluation.filter((entry) => entry.satisfied).length,
    curriculumCounts: { ...input.curriculumPlan.counts },
    nextTargetIds: input.curriculumPlan.nextModules.map((moduleProfile) => moduleProfile.id),
  };
}

/**
 * Stores one live snapshot for the local week and archives it at rollover.
 * Historical snapshots begin when this feature is first observed; AgoCode does not invent
 * pre-feature module transitions from incomplete historical state.
 */
export function recordWeeklyReviewSnapshot(
  storage: StorageLike,
  snapshot: WeeklyReviewSnapshot,
): WeeklyReviewState {
  const state = readWeeklyReviewState(storage);
  if (state.current?.weekKey === snapshot.weekKey) {
    const current = { ...snapshot, firstObservedAt: state.current.firstObservedAt };
    const next = { ...state, current };
    writeState(storage, next);
    return next;
  }
  const history = state.current
    ? [...state.history.filter((entry) => entry.weekKey !== state.current?.weekKey), state.current].slice(-WEEKLY_REVIEW_HISTORY_LIMIT)
    : state.history;
  const next = { version: 1 as const, current: snapshot, history };
  writeState(storage, next);
  return next;
}

export function compareWeeklyReviews(
  current: WeeklyReviewSnapshot,
  previous?: WeeklyReviewSnapshot,
): WeeklyReviewComparison {
  if (!previous) {
    return {
      hasPrevious: false,
      independentDelta: 0,
      recognitionAccuracyDelta: 0,
      supportFreeRateDelta: 0,
      masteredDelta: 0,
      newlyPrioritized: [],
      deprioritized: [],
    };
  }
  const previousTargets = new Set(previous.nextTargetIds);
  const currentTargets = new Set(current.nextTargetIds);
  return {
    hasPrevious: true,
    independentDelta: current.independentAttempts - previous.independentAttempts,
    recognitionAccuracyDelta: recognitionAccuracy(current) - recognitionAccuracy(previous),
    supportFreeRateDelta: supportFreeRate(current) - supportFreeRate(previous),
    masteredDelta: current.curriculumCounts.mastered - previous.curriculumCounts.mastered,
    newlyPrioritized: current.nextTargetIds.filter((id) => !previousTargets.has(id)),
    deprioritized: previous.nextTargetIds.filter((id) => !currentTargets.has(id)),
  };
}

export function getWeeklyReviewRates(snapshot: WeeklyReviewSnapshot) {
  return {
    recognitionAccuracy: recognitionAccuracy(snapshot),
    supportFreeRate: supportFreeRate(snapshot),
  };
}
