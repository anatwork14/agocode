import assert from "node:assert/strict";
import test from "node:test";
import {
  analyzeSubsetBacktracking,
  backtrackingScenarios,
  isSafePruningClaim,
} from "../lib/knowledge/backtracking-workbench.ts";

test("safe pruning visits no more nodes than exhaustive subset search and preserves solutions", () => {
  const scenario = backtrackingScenarios[0];
  const exhaustive = analyzeSubsetBacktracking(scenario, "none");
  const bounded = analyzeSubsetBacktracking(scenario, "bound");
  assert.ok(bounded.visitedNodes <= exhaustive.visitedNodes);
  assert.deepEqual(bounded.solutions, exhaustive.solutions);
});

test("remaining-bound pruning actually removes impossible search", () => {
  const scenario = backtrackingScenarios[1];
  const bounded = analyzeSubsetBacktracking(scenario, "bound");
  assert.ok(bounded.prunedBranches > 0);
});

test("pruning claims encode their assumption boundary", () => {
  assert.equal(isSafePruningClaim("sum-exceeds"), true);
  assert.equal(isSafePruningClaim("remaining-insufficient"), true);
  assert.equal(isSafePruningClaim("current-smaller"), false);
});
