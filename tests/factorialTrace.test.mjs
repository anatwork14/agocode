import assert from "node:assert/strict";
import test from "node:test";
import { buildFactorialTrace } from "../lib/algorithms/factorialTrace.ts";

test("factorial one hits the base case and completes", () => {
  const frames = buildFactorialTrace(1);
  assert.equal(frames.length, 2);
  assert.equal(frames[0].event.type, "BASE");
  assert.equal(frames[0].result, 1);
  assert.equal(frames.at(-1)?.event.type, "COMPLETE");
  assert.equal(frames.at(-1)?.result, 1);
  assert.deepEqual(frames.at(-1)?.stack, []);
});

test("factorial trace reaches the expected final result", () => {
  const frames = buildFactorialTrace(5);
  const finalFrame = frames.at(-1);
  assert.ok(finalFrame);
  assert.equal(finalFrame.event.type, "COMPLETE");
  assert.equal(finalFrame.result, 120);
  assert.deepEqual(finalFrame.stack, []);
});

test("recursive calls grow the stack until the base case", () => {
  const frames = buildFactorialTrace(4);
  const base = frames.find((frame) => frame.event.type === "BASE");
  assert.ok(base);
  assert.equal(base.stack.length, 4);
  assert.deepEqual(base.stack.map((item) => item.n), [4, 3, 2, 1]);
});

test("return frames unwind from the smallest suspended call upward", () => {
  const frames = buildFactorialTrace(4);
  const returns = frames.filter((frame) => frame.event.type === "RETURN");
  assert.deepEqual(
    returns.map((frame) => frame.event.type === "RETURN" ? frame.event.n : null),
    [2, 3, 4],
  );
  assert.deepEqual(returns.map((frame) => frame.result), [2, 6, 24]);
});

test("invalid factorial inputs do not produce a trace", () => {
  assert.deepEqual(buildFactorialTrace(0), []);
  assert.deepEqual(buildFactorialTrace(-2), []);
  assert.deepEqual(buildFactorialTrace(2.5), []);
});
