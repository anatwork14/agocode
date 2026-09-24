import assert from "node:assert/strict";
import test from "node:test";
import { euclideanDistance, knnClassify, knnRegress, nearestNeighbors } from "../lib/algorithms/knn.ts";

test("Euclidean distance works in two and higher dimensions", () => {
  assert.equal(euclideanDistance([0, 0], [3, 4]), 5);
  assert.equal(euclideanDistance([1, 2, 3], [1, 2, 6]), 3);
});

test("nearestNeighbors returns samples in ascending distance order", () => {
  const samples = [
    { id: "far", features: [8, 8] },
    { id: "near", features: [2, 2] },
    { id: "middle", features: [4, 4] },
  ];
  const result = nearestNeighbors(samples, [1, 1], 2);
  assert.deepEqual(result.map((neighbor) => neighbor.id), ["near", "middle"]);
});

test("KNN classification uses the majority among selected neighbors", () => {
  const samples = [
    { id: "a", features: [1, 1], label: "orange" },
    { id: "b", features: [2, 1], label: "orange" },
    { id: "c", features: [8, 8], label: "grapefruit" },
    { id: "d", features: [9, 8], label: "grapefruit" },
  ];
  const result = knnClassify(samples, [2.2, 1.4], 3);
  assert.equal(result.label, "orange");
  assert.equal(result.neighbors.length, 3);
  assert.equal(result.votes.orange, 2);
});

test("KNN regression averages numeric responses of k nearest neighbors", () => {
  const samples = [
    { id: "a", features: [0], response: 10 },
    { id: "b", features: [1], response: 20 },
    { id: "c", features: [9], response: 100 },
  ];
  const result = knnRegress(samples, [0.5], 2);
  assert.equal(result.prediction, 15);
  assert.deepEqual(result.neighbors.map((neighbor) => neighbor.id), ["a", "b"]);
});

test("changing k can change the neighborhood and prediction", () => {
  const samples = [
    { id: "a", features: [0], response: 0 },
    { id: "b", features: [1], response: 10 },
    { id: "c", features: [2], response: 50 },
  ];
  assert.equal(knnRegress(samples, [0], 1).prediction, 0);
  assert.equal(knnRegress(samples, [0], 3).prediction, 20);
});

test("KNN validates k and feature dimensions", () => {
  assert.throws(() => nearestNeighbors([{ id: "a", features: [1, 2] }], [1], 1), /same feature dimensions/);
  assert.throws(() => nearestNeighbors([{ id: "a", features: [1] }], [1], 0), /positive integer/);
  assert.throws(() => nearestNeighbors([{ id: "a", features: [1] }], [1], 2), /larger than the number of samples/);
});

test("classification and regression require the appropriate target data", () => {
  assert.throws(() => knnClassify([{ id: "a", features: [1] }], [1], 1), /needs a label/);
  assert.throws(() => knnRegress([{ id: "a", features: [1] }], [1], 1), /needs a finite numeric response/);
});
