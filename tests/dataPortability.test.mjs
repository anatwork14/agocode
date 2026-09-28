import assert from "node:assert/strict";
import test from "node:test";
import {
  collectAgoCodeData,
  collectSealedAgoCodeData,
  importAgoCodeData,
  parseAgoCodeData,
  parseAgoCodeDataForImport,
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

test("sealed exports verify SHA-256 integrity before import staging", async () => {
  const source = storage({
    "agocode.progress.b": "second",
    "agocode.progress.a": "first",
  });
  const sealed = await collectSealedAgoCodeData(source, "2026-09-28T02:00:00.000Z");
  assert.equal(sealed.integrity?.algorithm, "SHA-256");
  assert.equal(sealed.integrity?.entryCount, 2);
  assert.match(sealed.integrity?.digest ?? "", /^[a-f0-9]{64}$/);

  const parsed = await parseAgoCodeDataForImport(serializeAgoCodeData(sealed));
  assert.equal(parsed.integrity.status, "verified");
  assert.equal(parsed.integrity.entryCount, 2);
  assert.deepEqual(parsed.data.entries, {
    "agocode.progress.a": "first",
    "agocode.progress.b": "second",
  });
});

test("sealed imports reject changed bytes instead of staging a partial-looking backup", async () => {
  const source = storage({ "agocode.progress.a": "original" });
  const sealed = await collectSealedAgoCodeData(source, "2026-09-28T02:10:00.000Z");
  const tampered = JSON.parse(serializeAgoCodeData(sealed));
  tampered.entries["agocode.progress.a"] = "changed-after-export";

  await assert.rejects(
    () => parseAgoCodeDataForImport(JSON.stringify(tampered)),
    /does not match its SHA-256 manifest/,
  );
});

test("sealed imports reject manifest entry-count mismatches", async () => {
  const source = storage({ "agocode.progress.a": "one" });
  const sealed = await collectSealedAgoCodeData(source, "2026-09-28T02:20:00.000Z");
  const tampered = JSON.parse(serializeAgoCodeData(sealed));
  tampered.integrity.entryCount = 2;

  await assert.rejects(
    () => parseAgoCodeDataForImport(JSON.stringify(tampered)),
    /manifest expected 2 entries but the file contains 1/,
  );
});

test("legacy v1 exports remain compatible but are explicitly unverified", async () => {
  const legacy = JSON.stringify({
    product: "AgoCode",
    version: 1,
    exportedAt: "2026-09-28T02:30:00.000Z",
    entries: { "agocode.progress.legacy": "keep-compatible" },
  });
  const parsed = await parseAgoCodeDataForImport(legacy);
  assert.deepEqual(parsed.integrity, { status: "legacy-unverified", entryCount: 1 });
  assert.equal(parsed.data.entries["agocode.progress.legacy"], "keep-compatible");
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
