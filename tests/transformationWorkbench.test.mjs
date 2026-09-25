import assert from "node:assert/strict";
import test from "node:test";
import { transformationScenarios } from "../lib/knowledge/transformation-workbench.ts";

test("transformation workbench spans several structural problem shapes", () => {
  assert.ok(transformationScenarios.length >= 4);
  assert.equal(new Set(transformationScenarios.map((scenario) => scenario.id)).size, transformationScenarios.length);
});

test("each scenario names a baseline waste before presenting transformations", () => {
  for (const scenario of transformationScenarios) {
    assert.ok(scenario.baseline.method.length > 10);
    assert.ok(scenario.baseline.time.length > 0);
    assert.ok(scenario.baseline.waste.length > 35, `${scenario.id} should explain repeated waste`);
    assert.ok(scenario.options.length >= 3);
  }
});

test("every transformation option explains the relation it exposes and its trade-off", () => {
  for (const scenario of transformationScenarios) {
    for (const option of scenario.options) {
      assert.ok(option.move.length > 20, `${scenario.id}/${option.id} should describe the move`);
      assert.ok(option.exposes.length > 30, `${scenario.id}/${option.id} should name exposed structure`);
      assert.ok(option.explanation.length > 35, `${scenario.id}/${option.id} should justify the fit`);
      assert.ok(option.transformed.length >= 2, `${scenario.id}/${option.id} should show transformed state`);
      assert.ok(["strong", "viable", "mismatch"].includes(option.verdict));
    }
  }
});

test("scenarios avoid teaching one universal trick", () => {
  const scenariosWithMultipleStrongOptions = transformationScenarios.filter(
    (scenario) => scenario.options.filter((option) => option.verdict === "strong").length > 1,
  );
  const scenariosWithMismatch = transformationScenarios.filter(
    (scenario) => scenario.options.some((option) => option.verdict === "mismatch"),
  );

  assert.ok(scenariosWithMultipleStrongOptions.length >= 1, "at least one scenario should surface competing strong strategies");
  assert.ok(scenariosWithMismatch.length >= 2, "several scenarios should demonstrate primitive mismatch");
});

test("each scenario ends with a reusable insight and transfer question", () => {
  for (const scenario of transformationScenarios) {
    assert.ok(scenario.durableInsight.length > 45);
    assert.ok(scenario.transferQuestion.endsWith("?"));
  }
});
