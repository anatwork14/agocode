import assert from "node:assert/strict";
import test from "node:test";
import {
  evaluateGreedyRule,
  greedyCounterexampleScenarios,
} from "../lib/knowledge/greedy-counterexample-workbench.ts";

test("coin-system largest-first rule is rejected by the stored counterexample", () => {
  const result = evaluateGreedyRule("coin-change", "largest-coin");
  assert.ok(result);
  assert.equal(result.valid, false);
  assert.match(result.explanation, /4 \+ 1 \+ 1/);
});

test("interval earliest-finish rule has an explicit proof boundary", () => {
  const result = evaluateGreedyRule("interval-scheduling", "earliest-finish");
  assert.ok(result);
  assert.equal(result.valid, true);
  assert.match(result.explanation, /exchange argument/i);
});

test("every scenario contains at least one valid and one attackable modeling choice", () => {
  for (const scenario of greedyCounterexampleScenarios) {
    assert.ok(scenario.rules.some((rule) => rule.valid));
    assert.ok(scenario.rules.some((rule) => !rule.valid));
  }
});
