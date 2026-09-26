import assert from "node:assert/strict";
import test from "node:test";
import { buildAdaptiveCurriculumPlan } from "../lib/learning/curriculum-planner.ts";
import {
  WEEKLY_REVIEW_KEY,
  buildWeeklyReviewSnapshot,
  compareWeeklyReviews,
  getWeeklyReviewRates,
  readWeeklyReviewState,
  recordWeeklyReviewSnapshot,
} from "../lib/learning/weekly-review.ts";
import { buildWeeklyMission } from "../lib/learning/weekly-mission.ts";

function store() {
  const values = new Map();
  return {
    values,
    getItem(key) { return values.get(key) ?? null; },
    setItem(key, value) { values.set(key, value); },
  };
}

function localIso(year, month, day, hour = 12) {
  return new Date(year, month, day, hour, 0, 0).toISOString();
}

function reasoningEntry({ id, exerciseId, day, completed = true, independent = true, lens = false }) {
  return {
    attemptId: id,
    exerciseId,
    startedAt: localIso(2026, 8, day, 9),
    finalizedAt: localIso(2026, 8, day, 10),
    developedStages: independent ? 8 : 5,
    totalStages: 8,
    lensRevealed: lens,
    completedAt: completed ? localIso(2026, 8, day, 10) : undefined,
  };
}

function basePlan() {
  return buildAdaptiveCurriculumPlan({ reasoningAttempts: { version: 1, entries: [] } });
}

function snapshot(overrides = {}) {
  return {
    version: 1,
    weekKey: "2026-09-21",
    firstObservedAt: localIso(2026, 8, 21, 8),
    updatedAt: localIso(2026, 8, 26, 12),
    finalizedAttempts: 4,
    completedAttempts: 3,
    independentAttempts: 2,
    uniqueExercises: 3,
    supportAssistedCompleted: 1,
    supportFreeCompleted: 2,
    recognitionChecks: 4,
    firstTryRecognitions: 3,
    missionTotal: 4,
    missionSatisfied: 2,
    curriculumCounts: { mastered: 1, developing: 2, ready: 4, blocked: 3 },
    nextTargetIds: ["search-growth", "correctness"],
    ...overrides,
  };
}

test("weekly snapshot counts only timestamped evidence from the current local week", () => {
  const now = new Date(2026, 8, 26, 12, 0, 0);
  const attempts = {
    version: 1,
    entries: [
      reasoningEntry({ id: "this-independent", exerciseId: "p1", day: 22, independent: true }),
      reasoningEntry({ id: "this-supported", exerciseId: "p2", day: 23, independent: false, lens: true }),
      reasoningEntry({ id: "this-guided", exerciseId: "p3", day: 24, completed: false, independent: false }),
      reasoningEntry({ id: "last-week", exerciseId: "old", day: 20, independent: true }),
    ],
  };
  const recognitionHistory = {
    version: 1,
    entries: [
      { exerciseId: "p1", recognizedAt: localIso(2026, 8, 25, 12), firstTry: true },
      { exerciseId: "p2", recognizedAt: localIso(2026, 8, 25, 13), firstTry: false },
      { exerciseId: "old", recognizedAt: localIso(2026, 8, 20, 13), firstTry: true },
    ],
  };
  const plan = basePlan();
  const mission = buildWeeklyMission(plan, now);
  const result = buildWeeklyReviewSnapshot({ reasoningAttempts: attempts, recognitionHistory, curriculumPlan: plan, weeklyMission: mission, now });

  assert.equal(result.finalizedAttempts, 3);
  assert.equal(result.completedAttempts, 2);
  assert.equal(result.independentAttempts, 1);
  assert.equal(result.uniqueExercises, 3);
  assert.equal(result.supportFreeCompleted, 1);
  assert.equal(result.supportAssistedCompleted, 1);
  assert.equal(result.recognitionChecks, 2);
  assert.equal(result.firstTryRecognitions, 1);
  assert.equal(getWeeklyReviewRates(result).recognitionAccuracy, 50);
  assert.equal(getWeeklyReviewRates(result).supportFreeRate, 50);
});

test("same-week persistence updates live metrics but preserves first-observed boundary", () => {
  const storage = store();
  const first = snapshot({ firstObservedAt: localIso(2026, 8, 21, 9), independentAttempts: 1 });
  const later = snapshot({ firstObservedAt: localIso(2026, 8, 25, 9), updatedAt: localIso(2026, 8, 25, 18), independentAttempts: 4 });

  recordWeeklyReviewSnapshot(storage, first);
  const state = recordWeeklyReviewSnapshot(storage, later);
  assert.equal(state.current?.firstObservedAt, first.firstObservedAt);
  assert.equal(state.current?.independentAttempts, 4);
  assert.equal(state.history.length, 0);
  assert.ok(storage.values.has(WEEKLY_REVIEW_KEY));
});

test("week rollover archives the previous prospective snapshot", () => {
  const storage = store();
  const previous = snapshot();
  const next = snapshot({
    weekKey: "2026-09-28",
    firstObservedAt: localIso(2026, 8, 28, 8),
    updatedAt: localIso(2026, 8, 28, 8),
    independentAttempts: 0,
  });
  recordWeeklyReviewSnapshot(storage, previous);
  const state = recordWeeklyReviewSnapshot(storage, next);
  assert.equal(state.history.length, 1);
  assert.equal(state.history[0].weekKey, "2026-09-21");
  assert.equal(state.current?.weekKey, "2026-09-28");
});

test("first observed week deliberately has no fabricated comparison", () => {
  const comparison = compareWeeklyReviews(snapshot());
  assert.equal(comparison.hasPrevious, false);
  assert.equal(comparison.masteredDelta, 0);
  assert.deepEqual(comparison.newlyPrioritized, []);
});

test("weekly comparison explains objective deltas and target-set movement", () => {
  const previous = snapshot({
    independentAttempts: 1,
    recognitionChecks: 4,
    firstTryRecognitions: 2,
    supportFreeCompleted: 1,
    supportAssistedCompleted: 3,
    curriculumCounts: { mastered: 1, developing: 2, ready: 4, blocked: 3 },
    nextTargetIds: ["search-growth", "correctness"],
  });
  const current = snapshot({
    weekKey: "2026-09-28",
    independentAttempts: 4,
    recognitionChecks: 4,
    firstTryRecognitions: 3,
    supportFreeCompleted: 3,
    supportAssistedCompleted: 1,
    curriculumCounts: { mastered: 3, developing: 2, ready: 4, blocked: 1 },
    nextTargetIds: ["correctness", "amortization"],
  });
  const comparison = compareWeeklyReviews(current, previous);
  assert.equal(comparison.hasPrevious, true);
  assert.equal(comparison.independentDelta, 3);
  assert.equal(comparison.recognitionAccuracyDelta, 25);
  assert.equal(comparison.supportFreeRateDelta, 50);
  assert.equal(comparison.masteredDelta, 2);
  assert.deepEqual(comparison.newlyPrioritized, ["amortization"]);
  assert.deepEqual(comparison.deprioritized, ["search-growth"]);
});

test("corrupt weekly-review state fails closed", () => {
  const storage = store();
  storage.setItem(WEEKLY_REVIEW_KEY, "{broken");
  assert.deepEqual(readWeeklyReviewState(storage), { version: 1, history: [] });
});
