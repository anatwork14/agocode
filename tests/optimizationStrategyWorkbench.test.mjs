import assert from "node:assert/strict";
import test from "node:test";
import {
  optimizationScenarios,
  strategyFits,
} from "../lib/knowledge/optimization-strategy-workbench.ts";

test("optimization workbench covers several hard-problem families", () => {
  assert.ok(optimizationScenarios.length >= 4);
  assert.equal(new Set(optimizationScenarios.map((item) => item.id)).size, optimizationScenarios.length);
});

test("each optimization problem compares exact, approximation, and heuristic reasoning where applicable", () => {
  for (const scenario of optimizationScenarios) {
    const classes = new Set(scenario.strategies.map((strategy) => strategy.class));
    assert.ok(classes.has("exact"), `${scenario.id} needs an exact reference strategy`);
    assert.ok(classes.has("approximation"), `${scenario.id} needs a bounded approximation strategy`);
    assert.ok(classes.has("heuristic"), `${scenario.id} needs a heuristic comparison`);
    assert.ok(scenario.smallOracle.length > 45);
    assert.ok(scenario.stressCase.length > 35);
  }
});

test("strategy fit respects required quality before scale", () => {
  const setCover = optimizationScenarios.find((item) => item.id === "set-cover");
  assert.ok(setCover);
  const greedy = setCover.strategies.find((strategy) => strategy.id === "greedy");
  const enumerate = setCover.strategies.find((strategy) => strategy.id === "enumerate");
  assert.ok(greedy && enumerate);

  assert.equal(strategyFits(greedy, "exact", "large").fits, false);
  assert.equal(strategyFits(greedy, "guaranteed", "large").fits, true);
  assert.equal(strategyFits(enumerate, "exact", "tiny").fits, true);
  assert.equal(strategyFits(enumerate, "exact", "large").fits, false);
});

test("every strategy states its guarantee, assumptions, strength, and limitation", () => {
  for (const scenario of optimizationScenarios) {
    for (const strategy of scenario.strategies) {
      assert.ok(strategy.guarantee.length > 15);
      assert.ok(strategy.requires.length >= 1);
      assert.ok(strategy.strength.length > 30);
      assert.ok(strategy.limitation.length > 30);
    }
  }
});

test("every hard-problem scenario asks an assumption-changing transfer question", () => {
  for (const scenario of optimizationScenarios) {
    assert.ok(scenario.hardnessNote.length > 60);
    assert.ok(scenario.transferQuestion.endsWith("?"));
  }
});
