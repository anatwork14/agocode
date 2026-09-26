import test from "node:test";
import assert from "node:assert/strict";
import {
  amortizedExplanationModes,
  buildThrashingSequence,
  compareShrinkPolicies,
  simulateResizeSequence,
} from "../lib/knowledge/amortization-hysteresis.ts";

test("alternating around half capacity exposes resize thrashing", () => {
  const [half, quarter] = compareShrinkPolicies(8);
  assert.equal(half.policyId, "shrink-half");
  assert.equal(quarter.policyId, "shrink-quarter");
  assert.ok(half.resizeCount >= 8);
  assert.equal(quarter.resizeCount, 0);
  assert.ok(half.totalCopies > quarter.totalCopies);
});

test("hysteresis preserves size semantics while reducing work", () => {
  const operations = buildThrashingSequence(10);
  const half = simulateResizeSequence(operations, "shrink-half");
  const quarter = simulateResizeSequence(operations, "shrink-quarter");
  assert.equal(half.finalSize, quarter.finalSize);
  assert.equal(half.finalSize, 9);
  assert.ok(half.totalCost > quarter.totalCost * 4);
});

test("resize steps account for copied live values", () => {
  const simulation = simulateResizeSequence(["pop", "push"], "shrink-half");
  assert.equal(simulation.steps[0].resized, "shrink");
  assert.equal(simulation.steps[0].copies, simulation.steps[0].sizeAfter);
  assert.equal(simulation.steps[1].resized, "grow");
  assert.equal(simulation.steps[1].copies, simulation.steps[1].sizeBefore);
});

test("amortized analysis exposes aggregate, accounting, and potential viewpoints", () => {
  assert.deepEqual(amortizedExplanationModes.map((mode) => mode.id), ["aggregate", "accounting", "potential"]);
  for (const mode of amortizedExplanationModes) assert.ok(mode.explanation.length >= 100);
});
