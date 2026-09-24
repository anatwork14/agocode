import assert from "node:assert/strict";
import test from "node:test";
import { buildDijkstraTrace, dijkstraShortestPath } from "../lib/algorithms/dijkstra.ts";

const graph = {
  start: { a: 6, b: 2 },
  a: { fin: 1 },
  b: { a: 3, fin: 5 },
  fin: {},
};

test("Dijkstra finds the lowest total weight rather than the fewest edges", () => {
  const result = dijkstraShortestPath(graph, "start", "fin");
  assert.equal(result.cost, 6);
  assert.deepEqual(result.path, ["start", "b", "a", "fin"]);
});

test("relaxation improves a previously known cost and parent", () => {
  const result = buildDijkstraTrace(graph, "start", "fin");
  assert.equal(result.costs.a, 5);
  assert.equal(result.parents.a, "b");
  assert.equal(result.parents.fin, "a");
  assert.ok(result.frames.some((frame) => frame.event.type === "UPDATE" && frame.event.node === "a" && frame.event.cost === 5));
});

test("processed order is nondecreasing by finalized cost", () => {
  const result = buildDijkstraTrace(graph, "start", "fin");
  const selections = result.frames.filter((frame) => frame.event.type === "SELECT");
  const costs = selections.map((frame) => frame.event.type === "SELECT" ? frame.event.cost : Infinity);
  for (let index = 1; index < costs.length; index += 1) {
    assert.ok(costs[index] >= costs[index - 1]);
  }
});

test("unreachable targets retain infinity and no path", () => {
  const disconnected = { start: { a: 2 }, a: {}, fin: {} };
  const result = dijkstraShortestPath(disconnected, "start", "fin");
  assert.equal(result.cost, Infinity);
  assert.equal(result.path, null);
});

test("zero-weight edges are valid", () => {
  const result = dijkstraShortestPath({ start: { a: 0, fin: 4 }, a: { fin: 1 }, fin: {} }, "start", "fin");
  assert.equal(result.cost, 1);
  assert.deepEqual(result.path, ["start", "a", "fin"]);
});

test("negative edges are rejected because Dijkstra cannot safely finalize processed nodes", () => {
  assert.throws(
    () => dijkstraShortestPath({ start: { a: -1 }, a: {} }, "start", "a"),
    /non-negative edge weights/,
  );
});
