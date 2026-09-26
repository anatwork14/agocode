import assert from "node:assert/strict";
import test from "node:test";
import { canonicalExercises } from "../lib/knowledge/all-exercises.ts";
import { buildAdaptiveCurriculumPlan } from "../lib/learning/curriculum-planner.ts";
import { diagnosticQuestions, scoreDiagnosticAnswers } from "../lib/learning/diagnostic.ts";

function allCorrectDiagnostic() {
  return scoreDiagnosticAnswers(Object.fromEntries(diagnosticQuestions.map((question) => [question.id, question.correctOptionId])));
}

function independentAttempt(exerciseId, suffix) {
  return {
    attemptId: `attempt-${suffix}`,
    exerciseId,
    startedAt: `2026-09-2${suffix}T08:00:00.000Z`,
    finalizedAt: `2026-09-2${suffix}T08:20:00.000Z`,
    developedStages: 8,
    totalStages: 8,
    lensRevealed: false,
    completedAt: `2026-09-2${suffix}T08:20:00.000Z`,
  };
}

test("without diagnostic or objective evidence, roots are ready and dependents remain blocked", () => {
  const plan = buildAdaptiveCurriculumPlan({ reasoningAttempts: { version: 1, entries: [] } });
  const searchGrowth = plan.modules.find((module) => module.id === "search-growth");
  const experimental = plan.modules.find((module) => module.id === "experimental-analysis");
  assert.equal(searchGrowth?.state, "ready");
  assert.equal(experimental?.state, "blocked");
  assert.ok(experimental?.blockedBy.includes("search-growth"));
});

test("strong diagnostic placement can satisfy prerequisites but cannot mark a module mastered", () => {
  const plan = buildAdaptiveCurriculumPlan({ diagnostic: allCorrectDiagnostic(), reasoningAttempts: { version: 1, entries: [] } });
  const searchGrowth = plan.modules.find((module) => module.id === "search-growth");
  const experimental = plan.modules.find((module) => module.id === "experimental-analysis");
  assert.equal(searchGrowth?.state, "ready");
  assert.equal(searchGrowth?.evidence.objectiveScore, 0);
  assert.equal(plan.counts.mastered, 0);
  assert.equal(experimental?.state, "ready");
  assert.equal(experimental?.prerequisites[0]?.basis, "diagnostic");
});

test("one independent relevant problem produces developing evidence, not mastery", () => {
  const exercise = canonicalExercises.find((item) => item.tags.includes("complexity"));
  assert.ok(exercise);
  const plan = buildAdaptiveCurriculumPlan({
    reasoningAttempts: { version: 1, entries: [independentAttempt(exercise.id, 1)] },
  });
  const searchGrowth = plan.modules.find((module) => module.id === "search-growth");
  assert.equal(searchGrowth?.state, "developing");
  assert.equal(searchGrowth?.evidence.independentExercises, 1);
  assert.ok((searchGrowth?.evidence.objectiveScore ?? 0) < 75);
});

test("two independent relevant exercises can establish objective module mastery", () => {
  const exercises = canonicalExercises.filter((item) => item.tags.includes("complexity")).slice(0, 2);
  assert.equal(exercises.length, 2);
  const plan = buildAdaptiveCurriculumPlan({
    reasoningAttempts: {
      version: 1,
      entries: [independentAttempt(exercises[0].id, 1), independentAttempt(exercises[1].id, 2)],
    },
  });
  const searchGrowth = plan.modules.find((module) => module.id === "search-growth");
  const experimental = plan.modules.find((module) => module.id === "experimental-analysis");
  assert.equal(searchGrowth?.state, "mastered");
  assert.ok((searchGrowth?.evidence.objectiveScore ?? 0) >= 75);
  assert.equal(experimental?.prerequisites.find((item) => item.moduleId === "search-growth")?.basis, "objective");
  assert.equal(experimental?.state, "ready");
});

test("next curriculum targets exclude mastered and blocked modules and remain deterministic", () => {
  const input = { diagnostic: allCorrectDiagnostic(), reasoningAttempts: { version: 1, entries: [] } };
  const first = buildAdaptiveCurriculumPlan(input);
  const second = buildAdaptiveCurriculumPlan(input);
  assert.deepEqual(first.nextModules.map((module) => module.id), second.nextModules.map((module) => module.id));
  assert.equal(first.nextModules.every((module) => module.state === "ready" || module.state === "developing"), true);
});
