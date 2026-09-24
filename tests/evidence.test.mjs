import assert from "node:assert/strict";
import test from "node:test";
import { readLearningEvidence, recordLearningAttempt } from "../lib/learning/evidence.ts";

function makeStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem(key) {
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      values.set(key, value);
    },
  };
}

test("legacy completion records remain readable", () => {
  const storage = makeStorage({
    legacy: JSON.stringify({ completedAt: "2026-09-20T00:00:00.000Z", exerciseId: "binary-search" }),
  });

  const evidence = readLearningEvidence(storage, "legacy");
  assert.ok(evidence);
  assert.equal(evidence.completedAt, "2026-09-20T00:00:00.000Z");
  assert.equal(evidence.exerciseId, "binary-search");
  assert.deepEqual(evidence.attempts, []);
});

test("attempt history records failures and first successful completion", () => {
  const storage = makeStorage();

  recordLearningAttempt(storage, "exercise", {
    exerciseId: "exercise",
    attemptedAt: "2026-09-20T00:00:00.000Z",
    passed: false,
    passedCount: 3,
    totalTests: 5,
    hintCount: 2,
    runtimeError: false,
  });

  const completed = recordLearningAttempt(storage, "exercise", {
    exerciseId: "exercise",
    attemptedAt: "2026-09-20T00:05:00.000Z",
    passed: true,
    passedCount: 5,
    totalTests: 5,
    hintCount: 1,
    runtimeError: false,
  });

  assert.equal(completed.attempts.length, 2);
  assert.equal(completed.bestPassedCount, 5);
  assert.equal(completed.completedAt, "2026-09-20T00:05:00.000Z");
  assert.equal(completed.lowestHintCountOnPass, 1);
});

test("later successful attempts do not reset the original completion time", () => {
  const storage = makeStorage();

  recordLearningAttempt(storage, "exercise", {
    exerciseId: "exercise",
    attemptedAt: "2026-09-20T00:00:00.000Z",
    passed: true,
    passedCount: 5,
    totalTests: 5,
    hintCount: 3,
    runtimeError: false,
  });

  const later = recordLearningAttempt(storage, "exercise", {
    exerciseId: "exercise",
    attemptedAt: "2026-09-22T00:00:00.000Z",
    passed: true,
    passedCount: 5,
    totalTests: 5,
    hintCount: 0,
    runtimeError: false,
  });

  assert.equal(later.completedAt, "2026-09-20T00:00:00.000Z");
  assert.equal(later.lowestHintCountOnPass, 0);
});

test("attempt history is bounded", () => {
  const storage = makeStorage();

  for (let index = 0; index < 55; index += 1) {
    recordLearningAttempt(storage, "exercise", {
      exerciseId: "exercise",
      attemptedAt: `2026-09-20T00:${String(index).padStart(2, "0")}:00.000Z`,
      passed: false,
      passedCount: index % 5,
      totalTests: 5,
      hintCount: 0,
      runtimeError: false,
    });
  }

  const evidence = readLearningEvidence(storage, "exercise");
  assert.ok(evidence);
  assert.equal(evidence.attempts.length, 50);
});
