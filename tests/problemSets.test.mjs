import assert from "node:assert/strict";
import test from "node:test";
import {
  createProblemSet,
  deleteProblemSet,
  getProblemSetExerciseIds,
  readProblemSets,
  renameProblemSet,
  toggleExerciseInProblemSet,
  toggleProblemBookmark,
} from "../lib/learning/problem-sets.ts";

function memoryStorage() {
  const data = new Map();
  return {
    getItem(key) { return data.has(key) ? data.get(key) : null; },
    setItem(key, value) { data.set(key, value); },
  };
}

test("bookmarks toggle without becoming a custom set", () => {
  const storage = memoryStorage();
  toggleProblemBookmark(storage, "a");
  toggleProblemBookmark(storage, "b");
  assert.deepEqual(readProblemSets(storage).bookmarks, ["a", "b"]);
  toggleProblemBookmark(storage, "a");
  assert.deepEqual(readProblemSets(storage).bookmarks, ["b"]);
});

test("custom sets can be created, renamed, populated, and deleted", () => {
  const storage = memoryStorage();
  const created = createProblemSet(storage, "Graph Weaknesses", "2026-09-26T00:00:00.000Z");
  const setId = created.sets[0].id;
  toggleExerciseInProblemSet(storage, setId, "bfs");
  toggleExerciseInProblemSet(storage, setId, "dijkstra");
  const renamed = renameProblemSet(storage, setId, "Graph Review", "2026-09-27T00:00:00.000Z");
  assert.equal(renamed.sets[0].name, "Graph Review");
  assert.deepEqual(getProblemSetExerciseIds(renamed, setId), ["bfs", "dijkstra"]);
  assert.equal(deleteProblemSet(storage, setId).sets.length, 0);
});

test("adding the same exercise twice toggles membership instead of duplicating it", () => {
  const storage = memoryStorage();
  const created = createProblemSet(storage, "Interview", "2026-09-26T00:00:00.000Z");
  const setId = created.sets[0].id;
  toggleExerciseInProblemSet(storage, setId, "two-sum");
  const removed = toggleExerciseInProblemSet(storage, setId, "two-sum");
  assert.deepEqual(removed.sets[0].exerciseIds, []);
});
