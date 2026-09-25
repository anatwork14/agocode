import assert from "node:assert/strict";
import test from "node:test";
import { dpStateScenarios } from "../lib/knowledge/dp-state-workbench.ts";

const decisionGroups = ["stateChoices", "dimensionChoices", "dependencyChoices", "baseChoices", "orderChoices"];

test("DP state workbench contains several distinct problem shapes", () => {
  assert.ok(dpStateScenarios.length >= 4);
  assert.equal(new Set(dpStateScenarios.map((scenario) => scenario.id)).size, dpStateScenarios.length);
});

test("every DP design decision has exactly one supported choice", () => {
  for (const scenario of dpStateScenarios) {
    for (const groupName of decisionGroups) {
      const choices = scenario[groupName];
      assert.ok(choices.length >= 3, `${scenario.id} ${groupName} should include plausible alternatives`);
      assert.equal(choices.filter((choice) => choice.correct).length, 1, `${scenario.id} ${groupName} must have one correct answer`);
      assert.equal(new Set(choices.map((choice) => choice.id)).size, choices.length, `${scenario.id} ${groupName} ids must be unique`);
    }
  }
});

test("DP table previews keep target dependencies inside the table", () => {
  for (const scenario of dpStateScenarios) {
    const { rowLabels, colLabels, targetRow, targetCol, dependencies } = scenario.table;
    assert.ok(targetRow >= 0 && targetRow < rowLabels.length);
    assert.ok(targetCol >= 0 && targetCol < colLabels.length);
    assert.ok(dependencies.length >= 1);

    for (const dependency of dependencies) {
      const row = targetRow + dependency.rowDelta;
      const col = targetCol + dependency.colDelta;
      assert.ok(row >= 0 && row < rowLabels.length, `${scenario.id} dependency row outside preview`);
      assert.ok(col >= 0 && col < colLabels.length, `${scenario.id} dependency column outside preview`);
      assert.ok(dependency.label.length > 2);
    }
  }
});

test("DP scenarios make state meaning, recurrence, cost, and transfer explicit", () => {
  for (const scenario of dpStateScenarios) {
    assert.ok(scenario.summary.state.length > 20);
    assert.ok(scenario.summary.dimensions.length > 15);
    assert.ok(scenario.summary.dependencies.length > 15);
    assert.ok(scenario.summary.base.length > 15);
    assert.ok(scenario.summary.order.length > 15);
    assert.ok(scenario.summary.recurrence.length > 30);
    assert.ok(scenario.summary.complexity.length > 15);
    assert.ok(scenario.transferQuestion.endsWith("?"));
  }
});
