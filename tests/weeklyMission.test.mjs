import assert from "node:assert/strict";
import test from "node:test";
import { canonicalExercises } from "../lib/knowledge/all-exercises.ts";
import { buildAdaptiveCurriculumPlan } from "../lib/learning/curriculum-planner.ts";
import { diagnosticQuestions, scoreDiagnosticAnswers } from "../lib/learning/diagnostic.ts";
import {
  WEEKLY_MISSION_KEY,
  buildWeeklyMission,
  ensureWeeklyMission,
  evaluateWeeklyMission,
  getLocalWeekKey,
  readWeeklyMissionState,
} from "../lib/learning/weekly-mission.ts";

function store() {
  const values = new Map();
  return {
    values,
    getItem(key) { return values.get(key) ?? null; },
    setItem(key, value) { values.set(key, value); },
  };
}

function diagnostic() {
  return scoreDiagnosticAnswers(Object.fromEntries(diagnosticQuestions.map((question) => [question.id, question.correctOptionId])));
}

function attempt(exerciseId, n) {
  return {
    attemptId: `a-${n}`,
    exerciseId,
    startedAt: `2026-09-2${n}T08:00:00.000Z`,
    finalizedAt: `2026-09-2${n}T08:20:00.000Z`,
    developedStages: 8,
    totalStages: 8,
    lensRevealed: false,
    completedAt: `2026-09-2${n}T08:20:00.000Z`,
  };
}

test("local week key starts on Monday, including Sunday rollover", () => {
  assert.equal(getLocalWeekKey(new Date(2026, 8, 21, 12, 0, 0)), "2026-09-21");
  assert.equal(getLocalWeekKey(new Date(2026, 8, 27, 12, 0, 0)), "2026-09-21");
  assert.equal(getLocalWeekKey(new Date(2026, 8, 28, 12, 0, 0)), "2026-09-28");
});

test("weekly mission is bounded, deterministic from the plan, and contains no blocked modules", () => {
  const plan = buildAdaptiveCurriculumPlan({ diagnostic: diagnostic(), reasoningAttempts: { version: 1, entries: [] } });
  const mission = buildWeeklyMission(plan, new Date(2026, 8, 26, 12, 0, 0));
  assert.ok(mission.items.length > 0 && mission.items.length <= 4);
  const profileById = new Map(plan.modules.map((module) => [module.id, module]));
  assert.equal(mission.items.every((item) => profileById.get(item.moduleId)?.state !== "blocked"), true);
});

test("same-week mission is frozen in localStorage", () => {
  const storage = store();
  const plan = buildAdaptiveCurriculumPlan({ diagnostic: diagnostic(), reasoningAttempts: { version: 1, entries: [] } });
  const first = ensureWeeklyMission(storage, plan, new Date(2026, 8, 21, 9, 0, 0));
  const resumed = ensureWeeklyMission(storage, plan, new Date(2026, 8, 26, 18, 0, 0));
  assert.deepEqual(resumed, first);
  assert.ok(storage.values.has(WEEKLY_MISSION_KEY));
});

test("diagnostic placement alone never satisfies a weekly objective target", () => {
  const plan = buildAdaptiveCurriculumPlan({ diagnostic: diagnostic(), reasoningAttempts: { version: 1, entries: [] } });
  const mission = buildWeeklyMission(plan, new Date(2026, 8, 26, 12, 0, 0));
  const evaluations = evaluateWeeklyMission(mission, plan);
  assert.equal(evaluations.some((entry) => entry.satisfied), false);
});

test("fresh objective module evidence can satisfy a weekly mission target", () => {
  const baseline = buildAdaptiveCurriculumPlan({ reasoningAttempts: { version: 1, entries: [] } });
  const mission = buildWeeklyMission(baseline, new Date(2026, 8, 26, 12, 0, 0));
  const searchMission = mission.items.find((item) => item.moduleId === "search-growth");
  assert.ok(searchMission, "search-growth should be a high-downstream root target");

  const exercise = canonicalExercises.find((item) => item.tags.includes("complexity"));
  assert.ok(exercise);
  const progressed = buildAdaptiveCurriculumPlan({
    reasoningAttempts: { version: 1, entries: [attempt(exercise.id, 1)] },
  });
  const evaluation = evaluateWeeklyMission(mission, progressed).find((entry) => entry.item.moduleId === "search-growth");
  assert.equal(evaluation?.satisfied, true);
  assert.ok((evaluation?.progressDelta ?? 0) > 0);
});

test("week rollover archives the prior mission with its objective satisfaction count", () => {
  const storage = store();
  const plan = buildAdaptiveCurriculumPlan({ reasoningAttempts: { version: 1, entries: [] } });
  ensureWeeklyMission(storage, plan, new Date(2026, 8, 21, 12, 0, 0));
  ensureWeeklyMission(storage, plan, new Date(2026, 8, 28, 12, 0, 0));
  const state = readWeeklyMissionState(storage);
  assert.equal(state.history.length, 1);
  assert.equal(state.history[0].weekKey, "2026-09-21");
  assert.equal(state.current?.weekKey, "2026-09-28");
});
