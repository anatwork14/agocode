import test from "node:test";
import assert from "node:assert/strict";
import {
  MODEL_VARIANT_HISTORY_KEY,
  buildModelVariantProfile,
  readModelVariantHistory,
  recordModelVariantAttempt,
} from "../lib/learning/variant-practice.ts";

function memoryStorage() {
  const values = new Map();
  return {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
  };
}

function attempt(index, correct = index % 2 === 0) {
  return {
    exerciseId: `exercise-${index % 5}`,
    variantId: `variant-${index}`,
    familyId: index % 2 === 0 ? "graph-traversal" : "dynamic-programming",
    expectedDecision: correct ? "same-family" : "new-family",
    decision: "same-family",
    correct,
    noteLength: 30 + index,
    attemptedAt: new Date(Date.UTC(2026, 8, 1, 0, index % 60)).toISOString(),
  };
}

test("variant attempts persist independently from mastery evidence", () => {
  const storage = memoryStorage();
  recordModelVariantAttempt(storage, attempt(0, true));
  const history = readModelVariantHistory(storage);
  assert.equal(history.entries.length, 1);
  assert.equal(history.entries[0].correct, true);
  assert.ok(storage.getItem(MODEL_VARIANT_HISTORY_KEY));
});

test("variant history is bounded to the most recent 200 attempts", () => {
  const storage = memoryStorage();
  for (let index = 0; index < 230; index += 1) recordModelVariantAttempt(storage, attempt(index));
  const history = readModelVariantHistory(storage);
  assert.equal(history.entries.length, 200);
  assert.equal(history.entries[0].variantId, "variant-30");
  assert.equal(history.entries.at(-1).variantId, "variant-229");
});

test("variant profile reports accuracy overall and per family", () => {
  const history = {
    entries: [attempt(0, true), attempt(1, false), attempt(2, true), attempt(3, false)],
  };
  const profile = buildModelVariantProfile(history);
  assert.equal(profile.attempts, 4);
  assert.equal(profile.correct, 2);
  assert.equal(profile.accuracy, 0.5);
  assert.equal(profile.families.length, 2);
  assert.ok(profile.families.every((family) => family.attempts === 2));
});

test("malformed variant storage degrades safely", () => {
  const storage = memoryStorage();
  storage.setItem(MODEL_VARIANT_HISTORY_KEY, "not-json");
  assert.deepEqual(readModelVariantHistory(storage), { entries: [] });
});
