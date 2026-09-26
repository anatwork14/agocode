import assert from "node:assert/strict";
import test from "node:test";
import {
  buildDifficultyCalibrationProfile,
  evaluateDifficultyCalibrationEntry,
  readDifficultyCalibrationHistory,
  recordDifficultyCalibration,
} from "../lib/learning/calibration.ts";
import { getCalibratedTargetLevel } from "../lib/learning/recommendations.ts";

function memoryStorage() {
  const data = new Map();
  return {
    getItem(key) { return data.has(key) ? data.get(key) : null; },
    setItem(key, value) { data.set(key, value); },
    removeItem(key) { data.delete(key); },
  };
}

function reasoningEvidence({
  developedStages = 8,
  totalStages = 8,
  lensRevealed = false,
  completed = true,
  updatedAt = "2026-09-26T01:00:00.000Z",
} = {}) {
  return {
    developedStages,
    totalStages,
    lensRevealed,
    completedAt: completed ? updatedAt : undefined,
    updatedAt,
  };
}

test("difficulty calibration persists a rating with an objective evidence snapshot", () => {
  const storage = memoryStorage();
  recordDifficultyCalibration(storage, {
    exerciseId: "problem-a",
    recommendationChosenAt: "2026-09-26T00:00:00.000Z",
    rating: "too-easy",
    evidence: reasoningEvidence(),
    ratedAt: "2026-09-26T01:05:00.000Z",
  });

  const history = readDifficultyCalibrationHistory(storage);
  assert.equal(history.version, 1);
  assert.equal(history.entries.length, 1);
  assert.equal(history.entries[0].rating, "too-easy");
  assert.equal(history.entries[0].objective.coverage, 1);
  assert.equal(history.entries[0].objective.completed, true);
});

test("re-rating the same recommendation updates it instead of creating fake extra evidence", () => {
  const storage = memoryStorage();
  const base = {
    exerciseId: "problem-a",
    recommendationChosenAt: "2026-09-26T00:00:00.000Z",
    evidence: reasoningEvidence(),
  };

  recordDifficultyCalibration(storage, { ...base, rating: "too-hard", ratedAt: "2026-09-26T01:00:00.000Z" });
  recordDifficultyCalibration(storage, { ...base, rating: "productive-stretch", ratedAt: "2026-09-26T01:10:00.000Z" });

  const history = readDifficultyCalibrationHistory(storage);
  assert.equal(history.entries.length, 1);
  assert.equal(history.entries[0].rating, "productive-stretch");
});

test("too easy only raises difficulty when recorded work supports independent completion", () => {
  const supportedStorage = memoryStorage();
  recordDifficultyCalibration(supportedStorage, {
    exerciseId: "problem-a",
    recommendationChosenAt: "2026-09-26T00:00:00.000Z",
    rating: "too-easy",
    evidence: reasoningEvidence({ developedStages: 7, completed: true, lensRevealed: false }),
  });
  assert.equal(buildDifficultyCalibrationProfile(readDifficultyCalibrationHistory(supportedStorage)).bias, 1);

  const conflictStorage = memoryStorage();
  recordDifficultyCalibration(conflictStorage, {
    exerciseId: "problem-b",
    recommendationChosenAt: "2026-09-26T00:00:00.000Z",
    rating: "too-easy",
    evidence: reasoningEvidence({ developedStages: 3, completed: false, lensRevealed: false }),
  });
  assert.equal(buildDifficultyCalibrationProfile(readDifficultyCalibrationHistory(conflictStorage)).bias, 0);
});

test("too hard lowers difficulty when the recorded attempt also shows support or incomplete progress", () => {
  const storage = memoryStorage();
  recordDifficultyCalibration(storage, {
    exerciseId: "problem-a",
    recommendationChosenAt: "2026-09-26T00:00:00.000Z",
    rating: "too-hard",
    evidence: reasoningEvidence({ developedStages: 4, completed: false, lensRevealed: true }),
  });

  const history = readDifficultyCalibrationHistory(storage);
  const evaluation = evaluateDifficultyCalibrationEntry(history.entries[0]);
  assert.equal(evaluation.signal, "lower");
  assert.equal(buildDifficultyCalibrationProfile(history).bias, -1);
});

test("a rating without observable work stays inactive", () => {
  const storage = memoryStorage();
  recordDifficultyCalibration(storage, {
    exerciseId: "problem-a",
    recommendationChosenAt: "2026-09-26T00:00:00.000Z",
    rating: "too-hard",
    evidence: reasoningEvidence({ developedStages: 0, completed: false, lensRevealed: false }),
  });

  const history = readDifficultyCalibrationHistory(storage);
  assert.equal(history.entries[0].objective, null);
  assert.equal(buildDifficultyCalibrationProfile(history).evidenceSamples, 0);
  assert.equal(buildDifficultyCalibrationProfile(history).bias, 0);
});

test("calibration shifts the planner target by at most one difficulty band", () => {
  assert.equal(getCalibratedTargetLevel(52, 0), "core");
  assert.equal(getCalibratedTargetLevel(52, 1), "advanced");
  assert.equal(getCalibratedTargetLevel(52, -1), "foundation");
  assert.equal(getCalibratedTargetLevel(90, 1), "advanced");
  assert.equal(getCalibratedTargetLevel(10, -1), "foundation");
});
