import assert from "node:assert/strict";
import test from "node:test";
import {
  REJECTED_APPROACHES_KEY,
  readRejectedApproaches,
  removeRejectedApproach,
  saveRejectedApproach,
} from "../lib/learning/rejected-approaches.ts";

function storage() {
  const data = new Map();
  return {
    getItem(key) { return data.has(key) ? data.get(key) : null; },
    setItem(key, value) { data.set(key, value); },
    data,
  };
}

test("rejected approaches are stored per exercise", () => {
  const store = storage();
  saveRejectedApproach(store, "a", { id: "1", approach: "greedy", because: "counterexample", wouldWorkIf: "exchange property", recordedAt: "2026-09-26T00:00:00.000Z" });
  saveRejectedApproach(store, "b", { id: "2", approach: "sort", because: "online input", wouldWorkIf: "batch input", recordedAt: "2026-09-26T00:00:00.000Z" });
  const history = readRejectedApproaches(store);
  assert.equal(history.a[0].approach, "greedy");
  assert.equal(history.b[0].wouldWorkIf, "batch input");
});

test("editing the same rejection id replaces instead of duplicating", () => {
  const store = storage();
  const base = { id: "1", approach: "heap", because: "wrong contract", wouldWorkIf: "priority access", recordedAt: "2026-09-26T00:00:00.000Z" };
  saveRejectedApproach(store, "a", base);
  saveRejectedApproach(store, "a", { ...base, because: "range query needed" });
  const entries = readRejectedApproaches(store).a;
  assert.equal(entries.length, 1);
  assert.equal(entries[0].because, "range query needed");
});

test("removing the final rejection removes the exercise bucket", () => {
  const store = storage();
  saveRejectedApproach(store, "a", { id: "1", approach: "x", because: "y", wouldWorkIf: "z", recordedAt: "2026-09-26T00:00:00.000Z" });
  removeRejectedApproach(store, "a", "1");
  assert.deepEqual(readRejectedApproaches(store), {});
});

test("malformed rejection storage is ignored", () => {
  const store = storage();
  store.setItem(REJECTED_APPROACHES_KEY, "not-json");
  assert.deepEqual(readRejectedApproaches(store), {});
});
