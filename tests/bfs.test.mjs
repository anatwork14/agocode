import assert from "node:assert/strict";
import test from "node:test";
import { bfsShortestPath, buildBfsTrace } from "../lib/algorithms/bfs.ts";

test("BFS finds a shortest unweighted path", () => {
  const graph = {
    A: ["B", "C"],
    B: ["D"],
    C: ["E"],
    D: ["F"],
    E: ["F"],
    F: [],
  };

  assert.deepEqual(bfsShortestPath(graph, "A", "F"), ["A", "B", "D", "F"]);
});

test("BFS returns the start when start equals target", () => {
  const graph = { A: ["B"], B: [] };
  assert.deepEqual(bfsShortestPath(graph, "A", "A"), ["A"]);
});

test("BFS handles cycles without repeated discovery", () => {
  const graph = {
    A: ["B"],
    B: ["C"],
    C: ["A", "D"],
    D: [],
  };
  const frames = buildBfsTrace(graph, "A", "D");
  const visitedFrames = frames.filter((frame) => frame.event.type === "VISIT");

  assert.deepEqual(visitedFrames.map((frame) => frame.current), ["A", "B", "C", "D"]);
  assert.deepEqual(bfsShortestPath(graph, "A", "D"), ["A", "B", "C", "D"]);
});

test("BFS returns null when the target is unreachable", () => {
  const graph = { A: ["B"], B: [], C: [] };
  assert.equal(bfsShortestPath(graph, "A", "C"), null);
  const finalFrame = buildBfsTrace(graph, "A", "C").at(-1);
  assert.ok(finalFrame);
  assert.equal(finalFrame.event.type, "COMPLETE");
  assert.equal(finalFrame.event.found, false);
});

test("BFS dequeues nodes in nondecreasing degree order", () => {
  const graph = {
    A: ["B", "C"],
    B: ["D", "E"],
    C: ["F"],
    D: [],
    E: [],
    F: [],
  };
  const dequeues = buildBfsTrace(graph, "A", "Z")
    .filter((frame) => frame.event.type === "DEQUEUE")
    .map((frame) => frame.event.type === "DEQUEUE" ? frame.event.depth : -1);

  for (let index = 1; index < dequeues.length; index += 1) {
    assert.ok(dequeues[index] >= dequeues[index - 1]);
  }
});

test("missing start node produces no trace", () => {
  assert.deepEqual(buildBfsTrace({ A: [] }, "missing", "A"), []);
});
