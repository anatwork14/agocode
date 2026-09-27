import assert from "node:assert/strict";
import test from "node:test";

import {
  AGOCODE_STORAGE_RECOVERY_KEY,
  importAgoCodeDataSafely,
  readAgoCodeStorageRecoveryPoint,
  restoreAgoCodeStorageRecoveryPoint,
} from "../lib/learning/storage-reliability.ts";

function storage(initial = {}, options = {}) {
  const data = new Map(Object.entries(initial));
  let failureUsed = false;
  return {
    get length() { return data.size; },
    key(index) { return Array.from(data.keys())[index] ?? null; },
    getItem(key) { return data.has(key) ? data.get(key) : null; },
    setItem(key, value) {
      if (!failureUsed && options.failOnce?.(key, value)) {
        failureUsed = true;
        throw new Error("simulated quota/write failure");
      }
      data.set(key, value);
    },
    removeItem(key) { data.delete(key); },
    data,
  };
}

function bundle(entries) {
  return {
    product: "AgoCode",
    version: 1,
    exportedAt: "2026-09-28T01:00:00.000Z",
    entries,
  };
}

test("merge import creates a complete recovery point and verifies imported bytes", () => {
  const target = storage({
    "agocode.progress.before": "before",
    unrelated: "keep",
  });

  const result = importAgoCodeDataSafely(
    target,
    bundle({
      "agocode.progress.new-a": "alpha",
      "agocode.progress.new-b": "beta",
    }),
    false,
    "2026-09-28T02:00:00.000Z",
  );

  assert.equal(result.mode, "merge");
  assert.deepEqual(result.importedKeys, ["agocode.progress.new-a", "agocode.progress.new-b"]);
  assert.equal(target.getItem("agocode.progress.before"), "before");
  assert.equal(target.getItem("agocode.progress.new-a"), "alpha");
  assert.equal(target.getItem("agocode.progress.new-b"), "beta");
  assert.equal(target.getItem("unrelated"), "keep");

  const recovery = readAgoCodeStorageRecoveryPoint(target);
  assert.ok(recovery);
  assert.equal(recovery.reason, "pre-import");
  assert.equal(recovery.createdAt, "2026-09-28T02:00:00.000Z");
  assert.deepEqual(recovery.entries, { "agocode.progress.before": "before" });
  assert.equal(result.policyConsistency.fallbackRequired, false);
});

test("replace import preserves the pre-import snapshot so the learner can explicitly restore it", () => {
  const target = storage({
    "agocode.progress.old-a": "old-a",
    "agocode.progress.old-b": "old-b",
    unrelated: "keep",
  });

  const result = importAgoCodeDataSafely(
    target,
    bundle({ "agocode.progress.new": "new" }),
    true,
    "2026-09-28T02:10:00.000Z",
  );

  assert.equal(result.mode, "replace");
  assert.equal(target.getItem("agocode.progress.old-a"), null);
  assert.equal(target.getItem("agocode.progress.old-b"), null);
  assert.equal(target.getItem("agocode.progress.new"), "new");
  assert.ok(target.getItem(AGOCODE_STORAGE_RECOVERY_KEY));
  assert.equal(target.getItem("unrelated"), "keep");

  const restored = restoreAgoCodeStorageRecoveryPoint(target);
  assert.equal(restored, 2);
  assert.equal(target.getItem("agocode.progress.old-a"), "old-a");
  assert.equal(target.getItem("agocode.progress.old-b"), "old-b");
  assert.equal(target.getItem("agocode.progress.new"), null);
  assert.equal(target.getItem("unrelated"), "keep");
});

test("failed replace import rolls back automatically instead of leaving partially cleared learner state", () => {
  const target = storage({
    "agocode.progress.before-a": "before-a",
    "agocode.progress.before-b": "before-b",
    unrelated: "keep",
  }, {
    failOnce: (key) => key === "agocode.progress.new-b",
  });

  assert.throws(
    () => importAgoCodeDataSafely(
      target,
      bundle({
        "agocode.progress.new-a": "new-a",
        "agocode.progress.new-b": "new-b",
      }),
      true,
      "2026-09-28T02:20:00.000Z",
    ),
    /previous AgoCode state was restored automatically/i,
  );

  assert.equal(target.getItem("agocode.progress.before-a"), "before-a");
  assert.equal(target.getItem("agocode.progress.before-b"), "before-b");
  assert.equal(target.getItem("agocode.progress.new-a"), null);
  assert.equal(target.getItem("agocode.progress.new-b"), null);
  assert.equal(target.getItem("unrelated"), "keep");
  assert.ok(readAgoCodeStorageRecoveryPoint(target));
});

test("critical imported policy contradiction remains imported but is surfaced for fail-closed repair", () => {
  const target = storage({ "agocode.progress.before": "before" });
  const contradictoryHistory = JSON.stringify({
    version: 1,
    entries: [{
      exerciseId: "imported-corrupt-policy-attribution",
      chosenAt: "2026-09-28T01:30:00.000Z",
      policyVariant: "candidate",
      policyId: "baseline-v1",
    }],
  });

  const result = importAgoCodeDataSafely(
    target,
    bundle({
      "agocode.progress.next-problem-history": contradictoryHistory,
      "agocode.progress.imported-learning-note": "keep-the-learner-data",
    }),
    false,
    "2026-09-28T02:30:00.000Z",
  );

  assert.equal(result.policyConsistency.status, "critical");
  assert.equal(result.policyConsistency.fallbackRequired, true);
  assert.ok(result.policyConsistency.issues.some((issue) => issue.code === "candidate-attribution-policy-mismatch"));
  assert.equal(target.getItem("agocode.progress.next-problem-history"), contradictoryHistory);
  assert.equal(target.getItem("agocode.progress.imported-learning-note"), "keep-the-learner-data");
  assert.equal(target.getItem("agocode.progress.before"), "before");
});
