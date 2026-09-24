import assert from "node:assert/strict";
import test from "node:test";
import { greedyIntervalSchedule, greedySetCover } from "../lib/algorithms/greedy.ts";

test("interval scheduling chooses a maximum-size compatible set for the reference schedule", () => {
  const intervals = [
    { id: "Art", start: 9, end: 10 },
    { id: "English", start: 9.5, end: 11 },
    { id: "Math", start: 10, end: 11 },
    { id: "CS", start: 10.5, end: 12 },
    { id: "Music", start: 11, end: 12 },
  ];
  const result = greedyIntervalSchedule(intervals);
  assert.deepEqual(result.selected.map((item) => item.id), ["Art", "Math", "Music"]);
});

test("selected intervals never overlap", () => {
  const result = greedyIntervalSchedule([
    { id: "A", start: 0, end: 3 },
    { id: "B", start: 1, end: 2 },
    { id: "C", start: 2, end: 4 },
    { id: "D", start: 4, end: 5 },
  ]);
  for (let index = 1; index < result.selected.length; index += 1) {
    assert.ok(result.selected[index].start >= result.selected[index - 1].end);
  }
});

test("set-cover approximation covers every reachable required item", () => {
  const result = greedySetCover(
    ["mt", "wa", "or", "id", "nv", "ut", "ca", "az"],
    {
      kone: ["id", "nv", "ut"],
      ktwo: ["wa", "id", "mt"],
      kthree: ["or", "nv", "ca"],
      kfour: ["nv", "ut"],
      kfive: ["ca", "az"],
    },
  );
  assert.deepEqual(result.uncovered, []);
  assert.ok(result.selected.length <= 5);
});

test("each set-cover step covers at least one previously uncovered item", () => {
  const result = greedySetCover(["a", "b", "c", "d"], {
    one: ["a", "b"],
    two: ["b", "c"],
    three: ["d"],
  });
  assert.ok(result.steps.every((step) => step.newlyCovered.length > 0));
  assert.ok(result.steps.every((step) => step.uncoveredAfter.length < step.uncoveredBefore.length));
});

test("set-cover engine reports items that no option can cover", () => {
  const result = greedySetCover(["a", "b"], { one: ["a"] });
  assert.deepEqual(result.uncovered, ["b"]);
});
