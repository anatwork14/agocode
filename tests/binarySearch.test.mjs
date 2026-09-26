import assert from "node:assert/strict";
import test from "node:test";
import {
  binarySearchCodeLines,
  binarySearchExample,
  buildBinarySearchTrace,
} from "../lib/algorithms/binarySearch.ts";
import {
  codeLineNumberForId,
  validateSemanticCodeLines,
} from "../lib/visualization/code-sync.ts";

test("binary search trace finds the reference target", () => {
  const frames = buildBinarySearchTrace(binarySearchExample.values, binarySearchExample.target);
  const finalFrame = frames.at(-1);

  assert.ok(finalFrame);
  assert.equal(finalFrame.event.type, "FOUND");
  assert.equal(finalFrame.mid, 6);
  assert.equal(finalFrame.comparison, "return 6");
  assert.equal(finalFrame.activeCodeLineId, "return-found");
});

test("missing target ends with an empty candidate interval", () => {
  const frames = buildBinarySearchTrace([1, 3, 5, 7, 9], 4);
  const finalFrame = frames.at(-1);

  assert.ok(finalFrame);
  assert.equal(finalFrame.activeCodeLineId, "return-missing");
  assert.equal(finalFrame.comparison, "return None");
  assert.ok(finalFrame.low > finalFrame.high);
});

test("trace semantic code ids all resolve against the displayed source listing", () => {
  const frames = buildBinarySearchTrace([1, 3, 5, 7, 9], 7);
  assert.deepEqual(
    validateSemanticCodeLines(binarySearchCodeLines, frames.map((frame) => frame.activeCodeLineId)),
    [],
  );
});

test("display line numbers are derived from semantic ids rather than trace behavior", () => {
  const original = codeLineNumberForId(binarySearchCodeLines, "return-missing");
  const reformatted = [
    { id: "comment", text: "# formatting-only line" },
    ...binarySearchCodeLines,
  ];
  const shifted = codeLineNumberForId(reformatted, "return-missing");

  assert.equal(original, 13);
  assert.equal(shifted, 14);
  const missingTrace = buildBinarySearchTrace([1, 3], 9).at(-1);
  assert.equal(missingTrace?.activeCodeLineId, "return-missing");
});

test("comparison frames expose the prediction that preserves the correct side", () => {
  const frames = buildBinarySearchTrace([2, 4, 6, 8, 10, 12, 14], 12);
  const comparisons = frames.filter((frame) => frame.event.type === "COMPARE");

  assert.ok(comparisons.length > 0);
  for (const frame of comparisons) {
    assert.ok(frame.prediction);
    const comparison = frame.event;
    if (comparison.type !== "COMPARE") continue;

    if (comparison.left < comparison.right) {
      assert.equal(frame.prediction.correctOptionId, "move-low");
    } else if (comparison.left > comparison.right) {
      assert.equal(frame.prediction.correctOptionId, "move-high");
    } else {
      assert.equal(frame.prediction.correctOptionId, "return");
    }
  }
});

test("candidate interval never grows after a range update", () => {
  const frames = buildBinarySearchTrace([1, 5, 9, 13, 17, 21, 25, 29, 33], 29);
  const ranges = frames.filter((frame) => frame.event.type === "SET_RANGE" && frame.low <= frame.high);
  let previousSize = Number.POSITIVE_INFINITY;

  for (const frame of ranges) {
    const size = frame.high - frame.low + 1;
    assert.ok(size <= previousSize);
    previousSize = size;
  }
});

test("empty input produces no trace frames", () => {
  assert.deepEqual(buildBinarySearchTrace([], 3), []);
});
