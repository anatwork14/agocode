import assert from "node:assert/strict";
import test from "node:test";
import {
  graphEdgeKey,
  validateGraphRendererContract,
  validateLinearRendererItems,
} from "../lib/visualization/renderer-contracts.ts";

test("valid graph renderer data has no contract errors", () => {
  const nodes = [
    { id: "a", label: "A", x: 20, y: 30 },
    { id: "b", label: "B", x: 80, y: 60 },
  ];
  const edges = [{ from: "a", to: "b", directed: true }];

  assert.deepEqual(validateGraphRendererContract(nodes, edges), []);
  assert.equal(graphEdgeKey("a", "b"), "a->b");
});

test("graph renderer contracts reject duplicate ids and dangling edges", () => {
  const errors = validateGraphRendererContract(
    [
      { id: "a", label: "A", x: 0, y: 0 },
      { id: "a", label: "Again", x: 1, y: 1 },
    ],
    [{ from: "a", to: "missing" }],
  );

  assert.ok(errors.some((error) => error.includes("Duplicate graph node id")));
  assert.ok(errors.some((error) => error.includes("unknown target node")));
});

test("linear renderer contracts require stable unique item ids", () => {
  assert.deepEqual(validateLinearRendererItems([{ id: "front" }, { id: "back" }]), []);
  const errors = validateLinearRendererItems([{ id: "" }, { id: "dup" }, { id: "dup" }]);
  assert.ok(errors.some((error) => error.includes("non-empty id")));
  assert.ok(errors.some((error) => error.includes("Duplicate renderer item id")));
});
