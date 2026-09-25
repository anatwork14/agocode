import assert from "node:assert/strict";
import test from "node:test";
import { compareGrowthPolicies, growthPolicies, simulateAppends } from "../lib/knowledge/amortization-workbench.ts";

test("amortization workbench exposes geometric and arithmetic policies", () => {
  assert.equal(growthPolicies.length, 3);
  assert.ok(growthPolicies.some((policy) => policy.family === "geometric"));
  assert.ok(growthPolicies.some((policy) => policy.family === "arithmetic"));
});

test("a resize copies exactly the previously stored elements", () => {
  const simulation = simulateAppends(40, "double");
  const resizeSteps = simulation.steps.filter((step) => step.resized);
  assert.ok(resizeSteps.length > 0);
  for (const step of resizeSteps) {
    assert.equal(step.copies, step.sizeBefore);
    assert.ok(step.capacityAfter > step.capacityBefore);
    assert.equal(step.cost, step.copies + 1);
  }
});

test("doubling keeps modeled average append cost bounded as n grows", () => {
  const small = simulateAppends(64, "double");
  const large = simulateAppends(1024, "double");
  assert.ok(small.averageCost < 3);
  assert.ok(large.averageCost < 3);
  assert.ok(large.totalCost < 3 * large.appendCount);
});

test("fixed-increment growth accumulates much more copying than geometric growth", () => {
  const compared = compareGrowthPolicies(512);
  const doubling = compared.find((item) => item.policy.id === "double");
  const fixed = compared.find((item) => item.policy.id === "plus-four");
  assert.ok(doubling);
  assert.ok(fixed);
  assert.ok(fixed.totalCost > doubling.totalCost * 10);
  assert.ok(fixed.averageCost > doubling.averageCost * 10);
});

test("doubling creates rarer but increasingly expensive individual resize spikes", () => {
  const simulation = simulateAppends(70, "double");
  const resizeCosts = simulation.steps.filter((step) => step.resized).map((step) => step.cost);
  assert.ok(resizeCosts.length >= 5);
  for (let index = 1; index < resizeCosts.length; index += 1) {
    assert.ok(resizeCosts[index] > resizeCosts[index - 1]);
  }
});
