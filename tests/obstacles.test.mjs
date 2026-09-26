import assert from "node:assert/strict";
import test from "node:test";
import {
  OBSTACLE_STORAGE_KEY,
  getMostFrequentObstacles,
  readObstacleEvidence,
  recordObstacleSelection,
} from "../lib/learning/obstacles.ts";

function memoryStorage() {
  const data = new Map();
  return {
    getItem(key) { return data.get(key) ?? null; },
    setItem(key, value) { data.set(key, value); },
  };
}

test("obstacle selections accumulate separately from learning evidence", () => {
  const storage = memoryStorage();
  recordObstacleSelection(storage, "model", "/exercises/a", "2026-09-26T00:00:00.000Z");
  recordObstacleSelection(storage, "baseline", "/solve", "2026-09-26T00:01:00.000Z");
  recordObstacleSelection(storage, "model", "/exercises/b", "2026-09-26T00:02:00.000Z");

  const evidence = readObstacleEvidence(storage);
  assert.equal(evidence.events.length, 3);
  assert.equal(evidence.counts.model, 2);
  assert.equal(evidence.counts.baseline, 1);
  assert.equal(evidence.lastSelected, "model");
  assert.equal(evidence.events.at(-1)?.context, "/exercises/b");
  assert.ok(storage.getItem(OBSTACLE_STORAGE_KEY));
});

test("frequent obstacles are ranked by count", () => {
  const storage = memoryStorage();
  for (let index = 0; index < 3; index += 1) recordObstacleSelection(storage, "transfer");
  for (let index = 0; index < 2; index += 1) recordObstacleSelection(storage, "correctness");
  recordObstacleSelection(storage, "debugging");

  const ranked = getMostFrequentObstacles(readObstacleEvidence(storage), 2);
  assert.deepEqual(ranked, [
    { id: "transfer", count: 3 },
    { id: "correctness", count: 2 },
  ]);
});

test("malformed obstacle storage degrades to empty evidence", () => {
  const storage = memoryStorage();
  storage.setItem(OBSTACLE_STORAGE_KEY, "not-json");
  assert.deepEqual(readObstacleEvidence(storage), { version: 1, events: [], counts: {} });
});
