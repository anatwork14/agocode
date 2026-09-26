import assert from "node:assert/strict";
import test from "node:test";
import { buildDesignSkillProfile } from "../lib/learning/design-skills.ts";

function attempt(overrides = {}) {
  return {
    attemptId: "a-1",
    exerciseId: "goodrich-r-3-1",
    startedAt: "2026-09-01T00:00:00.000Z",
    finalizedAt: "2026-09-01T00:10:00.000Z",
    developedStages: 8,
    totalStages: 8,
    developedStageIds: ["understand", "examples", "baseline", "waste", "strategy", "invariant", "analyze", "vary"],
    lensRevealed: false,
    completedAt: "2026-09-01T00:10:00.000Z",
    ...overrides,
  };
}

test("design-skill profile counts unique exercises instead of repeated attempts", () => {
  const history = {
    version: 1,
    entries: [
      attempt(),
      attempt({ attemptId: "a-2", finalizedAt: "2026-09-02T00:10:00.000Z" }),
    ],
  };
  const profile = buildDesignSkillProfile(history);

  assert.equal(profile.trackedExercises, 1);
  assert.equal(profile.stageSpecificAttempts, 2);
  assert.equal(profile.sourceWorkbookExercises, 1);
  for (const dimension of profile.dimensions) {
    assert.equal(dimension.observedExercises, 1);
    assert.equal(dimension.independentExercises, 1);
    assert.equal(dimension.coveragePercent, 100);
  }
});

test("specific dimensions reflect only stages actually developed", () => {
  const history = {
    version: 1,
    entries: [
      attempt({
        exerciseId: "custom-problem",
        developedStages: 3,
        developedStageIds: ["understand", "examples", "strategy"],
        completedAt: undefined,
      }),
      attempt({
        attemptId: "a-2",
        exerciseId: "goodrich-r-3-1",
        developedStages: 2,
        developedStageIds: ["baseline", "waste"],
        completedAt: undefined,
      }),
    ],
  };
  const profile = buildDesignSkillProfile(history);
  const byId = Object.fromEntries(profile.dimensions.map((dimension) => [dimension.id, dimension]));

  assert.equal(profile.trackedExercises, 2);
  assert.equal(byId.framing.observedExercises, 1);
  assert.equal(byId.framing.coveragePercent, 50);
  assert.equal(byId["baseline-diagnosis"].observedExercises, 1);
  assert.equal(byId["strategy-modeling"].observedExercises, 1);
  assert.equal(byId.correctness.observedExercises, 0);
  assert.ok(profile.leastObservedDimensionIds.includes("correctness"));
});

test("legacy count-only attempts stay coarse and do not invent stage evidence", () => {
  const history = {
    version: 1,
    entries: [
      attempt({ developedStageIds: undefined, developedStages: 7 }),
    ],
  };
  const profile = buildDesignSkillProfile(history);

  assert.equal(profile.trackedExercises, 0);
  assert.equal(profile.stageSpecificAttempts, 0);
  assert.equal(profile.legacyCoarseAttempts, 1);
  assert.ok(profile.dimensions.every((dimension) => dimension.observedExercises === 0));
});
