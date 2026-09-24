import assert from "node:assert/strict";
import test from "node:test";
import { buildQuicksortTrace, quicksort } from "../lib/algorithms/quicksort.ts";

test("quicksort handles empty, single, duplicates, and negative values", () => {
  assert.deepEqual(quicksort([]), []);
  assert.deepEqual(quicksort([7]), [7]);
  assert.deepEqual(quicksort([4, 1, 4, 2, 4]), [1, 2, 4, 4, 4]);
  assert.deepEqual(quicksort([3, -1, 8, -5, 0]), [-5, -1, 0, 3, 8]);
});

test("quicksort trace completes with sorted output and an empty call stack", () => {
  const finalFrame = buildQuicksortTrace([10, 5, 2, 3]).at(-1);

  assert.ok(finalFrame);
  assert.equal(finalFrame.event.type, "COMPLETE");
  assert.deepEqual(finalFrame.result, [2, 3, 5, 10]);
  assert.deepEqual(finalFrame.stack, []);
});

test("every partition sends all remaining values into strictly smaller subproblems", () => {
  const partitions = buildQuicksortTrace([7, 3, 9, 2, 5, 8]).filter(
    (frame) => frame.event.type === "PARTITION",
  );

  assert.ok(partitions.length > 0);
  for (const frame of partitions) {
    if (frame.event.type !== "PARTITION") continue;
    const event = frame.event;
    assert.equal(event.less.length + event.greater.length, event.values.length - 1);
    assert.ok(event.less.length < event.values.length);
    assert.ok(event.greater.length < event.values.length);
    assert.ok(event.less.every((value) => value <= event.pivot));
    assert.ok(event.greater.every((value) => value > event.pivot));
  }
});

test("combine frames preserve sorted-left, pivot, sorted-right order", () => {
  const combines = buildQuicksortTrace([6, 1, 8, 3, 5]).filter(
    (frame) => frame.event.type === "COMBINE",
  );

  assert.ok(combines.length > 0);
  for (const frame of combines) {
    if (frame.event.type !== "COMBINE") continue;
    const { lessSorted, pivot, greaterSorted, result } = frame.event;
    assert.deepEqual(result, [...lessSorted, pivot, ...greaterSorted]);
    assert.deepEqual(result, [...result].sort((a, b) => a - b));
  }
});

test("first-item pivots make a deeper stack than middle-item pivots on sorted input", () => {
  const input = Array.from({ length: 16 }, (_, index) => index + 1);
  const firstDepth = Math.max(...buildQuicksortTrace(input, "first").map((frame) => frame.stack.length));
  const middleDepth = Math.max(...buildQuicksortTrace(input, "middle").map((frame) => frame.stack.length));

  assert.ok(firstDepth > middleDepth);
  assert.equal(firstDepth, input.length);
});
