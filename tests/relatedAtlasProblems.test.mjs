import assert from "node:assert/strict";
import test from "node:test";
import { classifiedAtlasExercises } from "../lib/practice/atlas-recognition.ts";
import { getRelatedAtlasProblems } from "../lib/practice/related-atlas-problems.ts";

function findTransferableTarget() {
  const byFamily = new Map();
  for (const item of classifiedAtlasExercises) {
    const group = byFamily.get(item.family.id) ?? [];
    group.push(item);
    byFamily.set(item.family.id, group);
  }

  for (const group of byFamily.values()) {
    if (group.length < 5) continue;
    if (new Set(group.map((item) => item.exercise.source)).size < 2) continue;
    return group[0];
  }

  return null;
}

test("related Atlas problems preserve structural family while excluding the current problem", () => {
  const target = findTransferableTarget();
  assert.ok(target);

  const related = getRelatedAtlasProblems(target.exercise.id, 4);
  assert.equal(related.length, 4);
  assert.ok(related.every(({ item }) => item.exercise.id !== target.exercise.id));
  assert.ok(related.every(({ item }) => item.family.id === target.family.id));
  assert.equal(new Set(related.map(({ item }) => item.exercise.id)).size, related.length);
});

test("transfer neighbors prefer cross-source or cross-domain variation when available", () => {
  const target = findTransferableTarget();
  assert.ok(target);

  const related = getRelatedAtlasProblems(target.exercise.id, 4);
  assert.ok(related.some((neighbor) => neighbor.crossSource || neighbor.crossDomain));
  assert.ok(related.every((neighbor) => Number.isFinite(neighbor.relationScore) && neighbor.relationScore > 0));
});

test("unknown or unclassified exercises have no automatic structural neighbors", () => {
  assert.deepEqual(getRelatedAtlasProblems("missing-exercise-id", 4), []);
});
