import test from "node:test";
import assert from "node:assert/strict";
import {
  getModuleDependents,
  getModulePrerequisites,
  getSyllabusGraphNode,
  hasSyllabusGraphCycle,
  syllabusGraphEdges,
  syllabusGraphNodes,
} from "../lib/knowledge/syllabus-graph.ts";
import { syllabusModuleCount } from "../lib/knowledge/syllabus.ts";
import { getModuleRoute } from "../lib/knowledge/module-lab-routes.ts";

test("syllabus graph covers every module exactly once", () => {
  assert.equal(syllabusGraphNodes.length, syllabusModuleCount);
  assert.equal(new Set(syllabusGraphNodes.map((node) => node.id)).size, syllabusModuleCount);
});

test("all prerequisite edges point to known modules and remain acyclic", () => {
  for (const edge of syllabusGraphEdges) {
    assert.ok(getSyllabusGraphNode(edge.from), `missing prerequisite ${edge.from}`);
    assert.ok(getSyllabusGraphNode(edge.to), `missing dependent ${edge.to}`);
  }
  assert.equal(hasSyllabusGraphCycle(), false);
});

test("prerequisite and dependent lookups agree", () => {
  for (const node of syllabusGraphNodes) {
    for (const prerequisite of getModulePrerequisites(node.id)) {
      assert.ok(getModuleDependents(prerequisite.id).some((item) => item.id === node.id));
    }
  }
});

test("every syllabus module resolves to a concrete route", () => {
  for (const node of syllabusGraphNodes) {
    const route = getModuleRoute(node.id, node.module.route);
    assert.ok(route.startsWith("/"));
    assert.notEqual(route, "/syllabus");
  }
});

test("specialized new workbenches are used by their modules", () => {
  assert.equal(getModuleRoute("priority-queues"), "/lab/priority-queues");
  assert.equal(getModuleRoute("backtracking-pruning"), "/lab/backtracking");
  assert.equal(getModuleRoute("greedy-invariant"), "/lab/greedy-counterexamples");
});
