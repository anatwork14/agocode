import assert from "node:assert/strict";
import test from "node:test";
import {
  defaultPriorityQueueWorkload,
  evaluatePriorityQueues,
} from "../lib/knowledge/priority-queue-workbench.ts";

test("binary heap wins a balanced insert/extract priority-queue workload", () => {
  const evaluated = evaluatePriorityQueues(defaultPriorityQueueWorkload, 1024);
  assert.equal(evaluated[0].id, "binary-heap");
});

test("unsorted list wins when insertion dominates and best-item access is absent", () => {
  const evaluated = evaluatePriorityQueues({ insert: 10, peek: 0, extract: 0, update: 0 }, 1000);
  assert.equal(evaluated[0].id, "unsorted-list");
});

test("sorted list wins a read-heavy workload with almost no insertions", () => {
  const evaluated = evaluatePriorityQueues({ insert: 0, peek: 10, extract: 10, update: 0 }, 1000);
  assert.equal(evaluated[0].id, "sorted-list");
});
