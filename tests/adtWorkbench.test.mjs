import assert from "node:assert/strict";
import test from "node:test";
import { adtScenarios, defaultWorkload, evaluateImplementations } from "../lib/knowledge/adt-workbench.ts";

function scenario(id) {
  const value = adtScenarios.find((item) => item.id === id);
  assert.ok(value, `missing scenario ${id}`);
  return value;
}

test("ADT workbench exposes multiple representations for every contract", () => {
  assert.ok(adtScenarios.length >= 4);
  for (const item of adtScenarios) {
    assert.ok(item.operations.length >= 4);
    assert.ok(item.implementations.length >= 3);
    for (const implementation of item.implementations) {
      assert.deepEqual(
        Object.keys(implementation.costs).sort(),
        item.operations.map((operation) => operation.id).sort(),
      );
    }
  }
});

test("dynamic array wins a sequence workload dominated by random access", () => {
  const item = scenario("sequence");
  const results = evaluateImplementations(item, { index: 10, append: 1, "middle-edit": 0, scan: 0 }, 1000);
  assert.equal(results[0].id, "dynamic-array");
});

test("positional doubly linked list wins a sequence workload dominated by known-position edits", () => {
  const item = scenario("sequence");
  const results = evaluateImplementations(item, { index: 0, append: 1, "middle-edit": 10, scan: 0 }, 1000);
  assert.equal(results[0].id, "doubly-linked");
});

test("binary heap balances heavy insertion and remove-min priority queue workloads", () => {
  const item = scenario("priority-queue");
  const results = evaluateImplementations(item, { insert: 10, min: 1, "remove-min": 10, "bulk-scan": 0 }, 10000);
  assert.equal(results[0].id, "binary-heap-pq");
});

test("hash map wins an exact-key workload while a balanced tree improves relative to it when order dominates", () => {
  const item = scenario("map");
  const exact = evaluateImplementations(item, { lookup: 10, update: 5, delete: 5, ordered: 0 }, 10000);
  assert.equal(exact[0].id, "hash-map");

  const ordered = evaluateImplementations(item, { lookup: 0, update: 0, delete: 0, ordered: 10 }, 10000);
  assert.equal(ordered[0].id, "balanced-search-tree-map");
});

test("default workload gives every operation nonzero evidence weight", () => {
  for (const item of adtScenarios) {
    const weights = defaultWorkload(item);
    assert.ok(item.operations.every((operation) => weights[operation.id] > 0));
  }
});
