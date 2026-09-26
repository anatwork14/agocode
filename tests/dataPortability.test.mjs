import assert from "node:assert/strict";
import test from "node:test";
import {
  collectAgoCodeData,
  importAgoCodeData,
  parseAgoCodeData,
  resetAgoCodeData,
  serializeAgoCodeData,
} from "../lib/learning/data-portability.ts";

function storage(initial = {}) {
  const data = new Map(Object.entries(initial));
  return {
    get length() { return data.size; },
    key(index) { return Array.from(data.keys())[index] ?? null; },
    getItem(key) { return data.has(key) ? data.get(key) : null; },
    setItem(key, value) { data.set(key, value); },
    removeItem(key) { data.delete(key); },
    data,
  };
}

test("export only includes portable AgoCode-prefixed browser state", () => {
  const source = storage({
    "agocode.progress.a": "1",
    "agocode:reasoning-notebook:x": "2",
    "agocode.system.storage-recovery.v1": "internal-copy",
    unrelated: "secret",
  });
  const exported = collectAgoCodeData(source, "2026-09-26T00:00:00.000Z");
  assert.deepEqual(exported.entries, {
    "agocode.progress.a": "1",
    "agocode:reasoning-notebook:x": "2",
  });
  assert.equal(exported.exportedAt, "2026-09-26T00:00:00.000Z");
});

test("serialized data round-trips and ignores foreign and internal keys", () => {
  const source = storage({ "agocode.progress.a": "1" });
  const parsed = parseAgoCodeData(serializeAgoCodeData(collectAgoCodeData(source)));
  parsed.entries.unrelated = "bad";
  parsed.entries["agocode.system.storage-schema.v1"] = "internal";
  const clean = parseAgoCodeData(JSON.stringify(parsed));
  assert.equal(clean.entries.unrelated, undefined);
  assert.equal(clean.entries["agocode.system.storage-schema.v1"], undefined);
});

test("replace import clears all existing AgoCode keys without touching unrelated storage", () => {
  const target = storage({
    "agocode.progress.old": "old",
    "agocode.system.storage-recovery.v1": "old-recovery",
    unrelated: "keep",
  });
  importAgoCodeData(target, {
    product: "AgoCode",
    version: 1,
    exportedAt: "2026-09-26T00:00:00.000Z",
    entries: { "agocode.progress.new": "new" },
  }, true);
  assert.equal(target.getItem("agocode.progress.old"), null);
  assert.equal(target.getItem("agocode.system.storage-recovery.v1"), null);
  assert.equal(target.getItem("agocode.progress.new"), "new");
  assert.equal(target.getItem("unrelated"), "keep");
  assert.equal(resetAgoCodeData(target), 1);
  assert.equal(target.getItem("unrelated"), "keep");
});
