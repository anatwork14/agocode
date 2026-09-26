import assert from "node:assert/strict";
import test from "node:test";
import { invariantScenarios } from "../lib/knowledge/all-invariant-scenarios.ts";

test("invariant workbench exposes multiple uniquely addressable scenarios", () => {
  assert.ok(invariantScenarios.length >= 5);
  assert.equal(new Set(invariantScenarios.map((scenario) => scenario.id)).size, invariantScenarios.length);
});

test("graph traversal and Dijkstra finalization are explicit correctness scenarios", () => {
  assert.ok(invariantScenarios.some((scenario) => scenario.id === "bfs-discovery"));
  assert.ok(invariantScenarios.some((scenario) => scenario.id === "dijkstra-finalization"));
});

test("every invariant scenario has exactly one correctness-supporting claim", () => {
  for (const scenario of invariantScenarios) {
    const validClaims = scenario.claims.filter((claim) => claim.valid);
    assert.equal(validClaims.length, 1, `${scenario.id} should have exactly one valid claim`);
    assert.ok(validClaims[0].text.length >= 45, `${scenario.id} valid invariant should be substantive`);
    assert.ok(scenario.claims.length >= 3, `${scenario.id} should include plausible distractors`);
  }
});

test("every invariant scenario supports initialization, preservation, and termination reasoning", () => {
  for (const scenario of invariantScenarios) {
    assert.ok(scenario.proof.initialization.trim().length >= 40, `${scenario.id} missing initialization argument`);
    assert.ok(scenario.proof.preservation.trim().length >= 40, `${scenario.id} missing preservation argument`);
    assert.ok(scenario.proof.termination.trim().length >= 40, `${scenario.id} missing termination argument`);
    assert.ok(scenario.frames.length >= 3, `${scenario.id} needs enough state transitions to inspect preservation`);
  }
});

test("counterexamples and transfer prompts force the learner beyond recognition", () => {
  for (const scenario of invariantScenarios) {
    assert.ok(scenario.counterexample.weakClaim.trim().length >= 20);
    assert.ok(scenario.counterexample.state.length >= 3);
    assert.ok(scenario.counterexample.explanation.trim().length >= 40);
    assert.ok(scenario.transferQuestion.trim().endsWith("?"));
  }
});
