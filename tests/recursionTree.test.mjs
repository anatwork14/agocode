import assert from "node:assert/strict";
import test from "node:test";
import { buildBalancedRecursionTree } from "../lib/algorithms/recursionTree.ts";
import { validateGraphRendererContract } from "../lib/visualization/renderer-contracts.ts";

test("balanced recursion tree preserves n work on every level", () => {
  const model = buildBalancedRecursionTree(8);
  assert.equal(model.depth, 3);
  assert.equal(model.levels.length, 4);
  assert.deepEqual(model.levels.map((level) => level.totalWork), [8, 8, 8, 8]);
  assert.equal(model.totalWork, 32);
});

test("balanced recursion tree doubles nodes while halving subproblem size", () => {
  const model = buildBalancedRecursionTree(8);
  assert.deepEqual(model.levels.map((level) => level.nodeCount), [1, 2, 4, 8]);
  assert.deepEqual(model.levels.map((level) => level.subproblemSize), [8, 4, 2, 1]);
});

test("recursion tree renderer data has stable valid graph references", () => {
  const model = buildBalancedRecursionTree(8);
  assert.deepEqual(validateGraphRendererContract(model.nodes, model.edges), []);
  assert.equal(model.nodes.length, 15);
  assert.equal(model.edges.length, 14);
});

test("recursion tree rejects unreadable or invalid sizes", () => {
  assert.throws(() => buildBalancedRecursionTree(3), RangeError);
  assert.throws(() => buildBalancedRecursionTree(0), RangeError);
  assert.throws(() => buildBalancedRecursionTree(32), RangeError);
});
