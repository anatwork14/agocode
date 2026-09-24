import assert from "node:assert/strict";
import test from "node:test";
import {
  bloomMightContain,
  buildBloomFilter,
  buildInvertedIndex,
  mapWords,
  reduceWordCounts,
  searchInvertedIndex,
  traceBstSearch,
} from "../lib/algorithms/nextTopics.ts";

const tree = {
  value: "Mina",
  left: { value: "Iris", left: { value: "Dara" }, right: { value: "Lina" } },
  right: { value: "Ravi", left: { value: "Omar" }, right: { value: "Tess" } },
};

test("BST search follows only the ordered branch", () => {
  const trace = traceBstSearch(tree, "Lina");
  assert.deepEqual(trace, [
    { value: "Mina", comparison: "left" },
    { value: "Iris", comparison: "right" },
    { value: "Lina", comparison: "found" },
  ]);
});

test("BST search returns visited comparisons even when target is absent", () => {
  const trace = traceBstSearch(tree, "Kira");
  assert.deepEqual(trace.map((step) => step.value), ["Mina", "Iris", "Lina"]);
  assert.equal(trace.at(-1).comparison, "left");
});

test("inverted index maps terms to every document where they appear", () => {
  const index = buildInvertedIndex({ A: "red blue blue", B: "blue green", C: "red" });
  assert.deepEqual(searchInvertedIndex(index, "red"), ["A", "C"]);
  assert.deepEqual(searchInvertedIndex(index, "blue"), ["A", "B"]);
  assert.deepEqual(searchInvertedIndex(index, "missing"), []);
});

test("map emits one pair per word and reduce combines equal keys", () => {
  const pairs = mapWords(["learn algorithms", "algorithms visually"]);
  assert.equal(pairs.length, 4);
  assert.deepEqual(reduceWordCounts(pairs), { algorithms: 2, learn: 1, visually: 1 });
});

test("Bloom filter never rejects a value that was inserted", () => {
  const values = ["alpha", "beta", "gamma"];
  const state = buildBloomFilter(values, 9);
  for (const value of values) assert.equal(bloomMightContain(state, value), true);
});

test("Bloom filter can produce a deliberate false positive", () => {
  const state = buildBloomFilter(["agocode.dev", "example.org", "docs.test"], 7);
  assert.equal(state.inserted.includes("new.site"), false);
  assert.equal(bloomMightContain(state, "new.site"), true);
});

test("Bloom filter validates its bit-array size", () => {
  assert.throws(() => buildBloomFilter(["alpha"], 1), /at least 2/);
});
