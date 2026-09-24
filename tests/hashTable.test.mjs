import assert from "node:assert/strict";
import test from "node:test";
import {
  buildHashTable,
  educationalHash,
  lookupHashTable,
  rehashTable,
  traceEducationalHash,
} from "../lib/algorithms/hashTable.ts";

test("educational hash is deterministic and stays inside capacity", () => {
  for (const capacity of [5, 7, 11]) {
    const first = educationalHash("mango", capacity);
    const second = educationalHash("mango", capacity);
    assert.equal(first, second);
    assert.ok(first >= 0 && first < capacity);
  }
});

test("hash trace ends at the same bucket as educationalHash", () => {
  const steps = traceEducationalHash("roadmap", 7);
  assert.ok(steps.length > 0);
  assert.equal(steps.at(-1)?.next, educationalHash("roadmap", 7));
});

test("building a table preserves all distinct keys and exposes collisions", () => {
  const table = buildHashTable([
    { key: "mango", value: 1 },
    { key: "apple", value: 2 },
    { key: "bread", value: 3 },
    { key: "tofu", value: 4 },
  ], 5);

  assert.equal(table.size, 4);
  assert.ok(table.collisions > 0);
  assert.ok(table.longestChain > 1);
  assert.equal(table.loadFactor, 4 / 5);
});

test("inserting the same key updates rather than duplicates it", () => {
  const table = buildHashTable([
    { key: "mango", value: "old" },
    { key: "mango", value: "new" },
  ], 5);

  assert.equal(table.size, 1);
  assert.equal(lookupHashTable(table, "mango")?.value, "new");
});

test("lookup hashes directly to the target bucket", () => {
  const table = buildHashTable([
    { key: "tea", value: 2.4 },
    { key: "rice", value: 4.1 },
  ], 7);

  assert.deepEqual(lookupHashTable(table, "tea"), { key: "tea", value: 2.4 });
  assert.equal(lookupHashTable(table, "missing"), null);
});

test("rehashing preserves entries while changing capacity", () => {
  const original = buildHashTable([
    { key: "mango", value: 1 },
    { key: "apple", value: 2 },
    { key: "bread", value: 3 },
  ], 5);
  const resized = rehashTable(original, 10);

  assert.equal(resized.capacity, 10);
  assert.equal(resized.size, original.size);
  assert.equal(lookupHashTable(resized, "apple")?.value, 2);
  assert.equal(resized.loadFactor, 3 / 10);
});

test("invalid capacities are rejected", () => {
  assert.throws(() => educationalHash("x", 0));
  assert.throws(() => buildHashTable([], -2));
});
