import assert from "node:assert/strict";
import test from "node:test";
import { graphModelingScenarios } from "../lib/knowledge/graph-modeling-workbench.ts";

const choiceGroups = ["vertexChoices", "edgeChoices", "directionChoices", "weightChoices", "algorithmChoices"];

test("graph modeling workbench contains multiple uniquely addressable application models", () => {
  assert.ok(graphModelingScenarios.length >= 4);
  assert.equal(new Set(graphModelingScenarios.map((scenario) => scenario.id)).size, graphModelingScenarios.length);
});

test("each modeling decision has exactly one supported answer", () => {
  for (const scenario of graphModelingScenarios) {
    for (const groupName of choiceGroups) {
      const choices = scenario[groupName];
      assert.ok(choices.length >= 2, `${scenario.id} ${groupName} needs alternatives`);
      assert.equal(choices.filter((choice) => choice.correct).length, 1, `${scenario.id} ${groupName} should have one correct choice`);
      assert.equal(new Set(choices.map((choice) => choice.id)).size, choices.length, `${scenario.id} ${groupName} ids must be unique`);
    }
  }
});

test("renderable graph examples agree with directed and weighted model flags", () => {
  for (const scenario of graphModelingScenarios) {
    assert.ok(scenario.graph.nodes.length >= 4);
    assert.ok(scenario.graph.edges.length >= 3);
    const nodeIds = new Set(scenario.graph.nodes.map((node) => node.id));
    for (const edge of scenario.graph.edges) {
      assert.ok(nodeIds.has(edge.from));
      assert.ok(nodeIds.has(edge.to));
      if (scenario.graph.weighted) assert.ok(edge.weight, `${scenario.id} weighted edge should display a weight`);
    }
    const chosenDirection = scenario.directionChoices.find((choice) => choice.correct)?.id;
    assert.equal(chosenDirection, scenario.graph.directed ? "directed" : "undirected");
    const chosenWeight = scenario.weightChoices.find((choice) => choice.correct)?.id;
    assert.equal(chosenWeight, scenario.graph.weighted ? "weighted" : "unweighted");
  }
});

test("every graph model closes with an algorithm reason and a transfer question", () => {
  for (const scenario of graphModelingScenarios) {
    assert.ok(scenario.modelSummary.vertices.length > 3);
    assert.ok(scenario.modelSummary.edges.length > 3);
    assert.ok(scenario.modelSummary.objective.length > 15);
    assert.ok(scenario.modelSummary.algorithm.length > 2);
    assert.ok(scenario.modelSummary.reason.length > 30);
    assert.ok(scenario.transferQuestion.endsWith("?"));
  }
});
