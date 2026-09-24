import assert from "node:assert/strict";
import test from "node:test";
import { buildRecursiveSumTrace, recursiveSum } from "../lib/algorithms/recursiveSumTrace.ts";

test("recursive sum handles empty and non-empty inputs", () => {
  assert.equal(recursiveSum([]), 0);
  assert.equal(recursiveSum([2, 4, 6, 8]), 20);
  assert.equal(recursiveSum([5, -2, 9, -4]), 8);
});

test("recursive sum trace reaches an empty-list base case", () => {
  const frames = buildRecursiveSumTrace([2, 4, 6]);
  const base = frames.find((frame) => frame.event.type === "BASE");

  assert.ok(base);
  assert.equal(base.result, 0);
  assert.equal(base.stack.length, 4);
  assert.deepEqual(base.stack.at(-1)?.values, []);
});

test("recursive sum unwinds from shortest suspended list to longest", () => {
  const frames = buildRecursiveSumTrace([2, 4, 6]);
  const returns = frames.filter((frame) => frame.event.type === "RETURN");

  assert.deepEqual(
    returns.map((frame) => frame.event.type === "RETURN" ? frame.event.head : null),
    [6, 4, 2],
  );
  assert.deepEqual(returns.map((frame) => frame.result), [6, 10, 12]);
});

test("recursive sum trace completes with an empty stack", () => {
  const finalFrame = buildRecursiveSumTrace([3, 1, 4]).at(-1);

  assert.ok(finalFrame);
  assert.equal(finalFrame.event.type, "COMPLETE");
  assert.equal(finalFrame.result, 8);
  assert.deepEqual(finalFrame.stack, []);
});
