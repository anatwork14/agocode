import assert from "node:assert/strict";
import test from "node:test";
import { buildSelectionSortTrace, selectionSort } from "../lib/algorithms/selectionSort.ts";

test("selection sort returns ascending output without mutating the input", () => {
  const input = [5, 3, 6, 2, 10];
  const copy = [...input];
  assert.deepEqual(selectionSort(input), [2, 3, 5, 6, 10]);
  assert.deepEqual(input, copy);
});

test("each move frame grows the sorted output by exactly one item", () => {
  const frames = buildSelectionSortTrace([4, 1, 3, 2]);
  const moves = frames.filter((frame) => frame.event.type === "MOVE_SMALLEST");
  assert.equal(moves.length, 4);
  moves.forEach((frame, index) => {
    assert.equal(frame.sorted.length, index + 1);
    assert.equal(frame.remaining.length, 3 - index);
  });
});

test("the selected value on every pass is the minimum of that pass", () => {
  const frames = buildSelectionSortTrace([8, 5, 7, 1, 4]);
  const starts = frames.filter((frame) => frame.event.type === "START_PASS");
  const moves = frames.filter((frame) => frame.event.type === "MOVE_SMALLEST");

  assert.equal(starts.length, moves.length);
  for (let index = 0; index < moves.length; index += 1) {
    const expected = Math.min(...starts[index].remaining);
    const event = moves[index].event;
    assert.equal(event.type, "MOVE_SMALLEST");
    if (event.type === "MOVE_SMALLEST") assert.equal(event.value, expected);
  }
});

test("empty input produces only the completion frame", () => {
  const frames = buildSelectionSortTrace([]);
  assert.equal(frames.length, 1);
  assert.equal(frames[0].event.type, "COMPLETE");
  assert.deepEqual(frames[0].sorted, []);
});
