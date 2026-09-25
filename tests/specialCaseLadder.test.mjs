import assert from "node:assert/strict";
import test from "node:test";
import { specialCaseScenarios } from "../lib/knowledge/special-case-ladder.ts";

test("special-case ladder covers multiple algorithm families", () => {
  assert.ok(specialCaseScenarios.length >= 4);
  assert.equal(new Set(specialCaseScenarios.map((scenario) => scenario.id)).size, specialCaseScenarios.length);
});

test("each ladder has multiple meaningful generalization stages", () => {
  for (const scenario of specialCaseScenarios) {
    assert.ok(scenario.stages.length >= 3, `${scenario.id} should generalize through at least three stages`);
    assert.equal(new Set(scenario.stages.map((stage) => stage.id)).size, scenario.stages.length);
  }
});

test("each stage names the simplifying assumption and the obstruction created by lifting it", () => {
  for (const scenario of specialCaseScenarios) {
    for (const stage of scenario.stages) {
      assert.ok(stage.restriction.length > 20);
      assert.ok(stage.algorithm.length > 5);
      assert.ok(stage.whyItWorks.length > 35);
      assert.ok(stage.liftedConstraint.length > 20);
      assert.ok(stage.obstruction.length > 40);
      assert.ok(stage.addedMachinery.length > 30);
    }
  }
});

test("special-case scenarios finish with transferable reasoning prompts", () => {
  for (const scenario of specialCaseScenarios) {
    assert.ok(scenario.durableInsight.length > 50);
    assert.ok(scenario.transferQuestion.endsWith("?"));
  }
});
