import assert from "node:assert/strict";
import test from "node:test";

import {
  AGOCODE_STORAGE_RECOVERY_KEY,
  importAgoCodeDataSafely,
  previewAgoCodeDataImport,
} from "../lib/learning/storage-reliability.ts";

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

function bundle(entries) {
  return {
    product: "AgoCode",
    version: 1,
    exportedAt: "2026-09-28T00:00:00.000Z",
    entries,
  };
}

test("merge preflight is non-mutating and separates additions, identical values, and conflicts", () => {
  const source = storage({
    "agocode.custom.conflict": "local",
    "agocode.custom.identical": "same",
    "agocode.custom.local-only": "preserve",
    unrelated: "leave-alone",
  });
  const before = Object.fromEntries(source.data);

  const preview = previewAgoCodeDataImport(source, bundle({
    "agocode.custom.conflict": "imported",
    "agocode.custom.identical": "same",
    "agocode.custom.new": "new",
  }));

  assert.equal(preview.mode, "merge");
  assert.equal(preview.conflictPolicy, "preserve-local");
  assert.deepEqual(preview.additions, ["agocode.custom.new"]);
  assert.deepEqual(preview.identical, ["agocode.custom.identical"]);
  assert.deepEqual(preview.conflicts, ["agocode.custom.conflict"]);
  assert.deepEqual(preview.removals, []);
  assert.deepEqual(preview.skippedConflictKeys, ["agocode.custom.conflict"]);
  assert.deepEqual(preview.appliedKeys, ["agocode.custom.identical", "agocode.custom.new"]);
  assert.deepEqual(Object.fromEntries(source.data), before);
  assert.equal(source.getItem(AGOCODE_STORAGE_RECOVERY_KEY), null);
});

test("preserve-local merge applies non-conflicts and leaves conflicting local bytes untouched", () => {
  const source = storage({
    "agocode.custom.conflict": "local",
    "agocode.custom.local-only": "preserve",
    unrelated: "leave-alone",
  });

  const result = importAgoCodeDataSafely(
    source,
    bundle({
      "agocode.custom.conflict": "imported",
      "agocode.custom.new": "new",
    }),
    false,
    "2026-09-28T01:00:00.000Z",
    "preserve-local",
  );

  assert.equal(source.getItem("agocode.custom.conflict"), "local");
  assert.equal(source.getItem("agocode.custom.new"), "new");
  assert.equal(source.getItem("agocode.custom.local-only"), "preserve");
  assert.equal(source.getItem("unrelated"), "leave-alone");
  assert.deepEqual(result.skippedConflictKeys, ["agocode.custom.conflict"]);
  assert.deepEqual(result.importedKeys, ["agocode.custom.new"]);

  const recovery = JSON.parse(source.getItem(AGOCODE_STORAGE_RECOVERY_KEY));
  assert.equal(recovery.reason, "pre-import");
  assert.equal(recovery.entries["agocode.custom.conflict"], "local");
  assert.equal(recovery.entries["agocode.custom.local-only"], "preserve");
});

test("explicit overwrite merge adopts imported conflicting bytes", () => {
  const source = storage({ "agocode.custom.conflict": "local" });

  const preview = previewAgoCodeDataImport(
    source,
    bundle({ "agocode.custom.conflict": "imported" }),
    false,
    "overwrite",
  );
  assert.deepEqual(preview.conflicts, ["agocode.custom.conflict"]);
  assert.deepEqual(preview.skippedConflictKeys, []);
  assert.deepEqual(preview.appliedKeys, ["agocode.custom.conflict"]);

  const result = importAgoCodeDataSafely(
    source,
    bundle({ "agocode.custom.conflict": "imported" }),
    false,
    "2026-09-28T01:10:00.000Z",
    "overwrite",
  );
  assert.equal(source.getItem("agocode.custom.conflict"), "imported");
  assert.deepEqual(result.skippedConflictKeys, []);
  assert.deepEqual(result.importedKeys, ["agocode.custom.conflict"]);
});

test("replace preflight reports removals and always uses imported values for conflicts", () => {
  const source = storage({
    "agocode.custom.conflict": "local",
    "agocode.custom.remove-a": "a",
    "agocode.custom.remove-b": "b",
    unrelated: "keep",
  });

  const preview = previewAgoCodeDataImport(
    source,
    bundle({
      "agocode.custom.conflict": "imported",
      "agocode.custom.new": "new",
    }),
    true,
    "preserve-local",
  );

  assert.equal(preview.mode, "replace");
  assert.equal(preview.conflictPolicy, "overwrite");
  assert.deepEqual(preview.conflicts, ["agocode.custom.conflict"]);
  assert.deepEqual(preview.skippedConflictKeys, []);
  assert.deepEqual(preview.removals, ["agocode.custom.remove-a", "agocode.custom.remove-b"]);
  assert.deepEqual(preview.appliedKeys, ["agocode.custom.conflict", "agocode.custom.new"]);
  assert.equal(source.getItem("agocode.custom.remove-a"), "a");
});

test("preflight projects fail-closed policy integrity without persisting the imported contradiction", () => {
  const recommendationKey = "agocode.progress.next-problem-history";
  const source = storage({ unrelated: "keep" });
  const contradictoryHistory = JSON.stringify({
    version: 1,
    entries: [{
      exerciseId: "preflight-problem",
      chosenAt: "2026-09-28T01:20:00.000Z",
      policyVariant: "candidate",
      policyId: "baseline-v1",
      experimentId: "preview-experiment",
    }],
  });

  const preview = previewAgoCodeDataImport(source, bundle({
    [recommendationKey]: contradictoryHistory,
  }));

  assert.equal(preview.policyConsistency.fallbackRequired, true);
  assert.equal(preview.policyConsistency.criticalIssues, 1);
  assert.equal(source.getItem(recommendationKey), null);
  assert.equal(source.getItem(AGOCODE_STORAGE_RECOVERY_KEY), null);
  assert.equal(source.getItem("unrelated"), "keep");
});
