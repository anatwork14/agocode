import assert from "node:assert/strict";
import test from "node:test";
import { buildKnapsackGrid, buildSequenceGrid } from "../lib/algorithms/dynamicProgramming.ts";

const items = [
  { id: "camera", label: "Camera", weight: 1, value: 1500 },
  { id: "projector", label: "Projector", weight: 4, value: 3000 },
  { id: "laptop", label: "Laptop", weight: 3, value: 2000 },
];

test("0/1 knapsack combines smaller solved capacities", () => {
  const result = buildKnapsackGrid(items, 4);
  assert.equal(result.bestValue, 3500);
  assert.deepEqual(result.selectedItemIds, ["camera", "laptop"]);
});

test("adding an item row never lowers a capacity's best value", () => {
  const result = buildKnapsackGrid(items, 4);
  for (let row = 1; row < result.grid.length; row += 1) {
    for (let capacity = 1; capacity <= result.capacity; capacity += 1) {
      assert.ok(result.grid[row][capacity].value >= result.grid[row - 1][capacity].value);
    }
  }
});

test("knapsack optimum is independent of item row order", () => {
  const forward = buildKnapsackGrid(items, 4);
  const reversed = buildKnapsackGrid([...items].reverse(), 4);
  assert.equal(forward.bestValue, reversed.bestValue);
});

test("teaching grid rejects fractional weights until capacity granularity is refined", () => {
  assert.throws(
    () => buildKnapsackGrid([{ id: "small", label: "Small", weight: 0.5, value: 10 }], 4),
    /positive integers/,
  );
});

test("longest common substring resets across mismatches", () => {
  const result = buildSequenceGrid("plane", "panel", "substring");
  assert.equal(result.bestLength, 3);
  assert.equal(result.bestValue, "ane");
});

test("longest common subsequence can skip mismatched letters", () => {
  const result = buildSequenceGrid("plane", "panel", "subsequence");
  assert.equal(result.bestLength, 4);
  assert.equal(result.bestValue, "pane");
});

test("empty sequence inputs produce zero-length answers", () => {
  assert.equal(buildSequenceGrid("", "panel", "substring").bestLength, 0);
  assert.equal(buildSequenceGrid("plane", "", "subsequence").bestLength, 0);
});
