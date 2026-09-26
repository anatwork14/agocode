import assert from "node:assert/strict";
import test from "node:test";
import { progressEvidenceKeys } from "../lib/learning/progressCatalog.ts";
import {
  AGOCODE_STORAGE_RECOVERY_KEY,
  auditAgoCodeStorage,
  migrateAgoCodeStorage,
  readAgoCodeStorageRecoveryPoint,
  restoreAgoCodeStorageRecoveryPoint,
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

const currentKey = progressEvidenceKeys[0];
const legacyKey = progressEvidenceKeys[1];
const invalidKey = progressEvidenceKeys[2];

test("storage audit only treats canonical evidence keys as migration-managed", () => {
  const source = storage({
    [currentKey]: JSON.stringify({ version: 1, exerciseId: currentKey, attempts: [], bestPassedCount: 0, totalTests: 0 }),
    [legacyKey]: JSON.stringify({ exerciseId: legacyKey, completedAt: "2026-09-01T00:00:00.000Z" }),
    [invalidKey]: "{broken-json",
    "agocode.custom.notes": JSON.stringify({ keep: true }),
    unrelated: "leave-me-alone",
  });

  const audit = auditAgoCodeStorage(source);
  assert.equal(audit.currentEvidence, 1);
  assert.equal(audit.legacyEvidence, 1);
  assert.equal(audit.invalidKnownEvidence, 1);
  assert.equal(audit.unmanaged, 1);
  assert.equal(audit.totalEntries, 4);
  assert.equal(audit.entries.find((entry) => entry.key === legacyKey)?.migratable, true);
  assert.equal(source.getItem("unrelated"), "leave-me-alone");
});

test("migration creates a complete recovery point before rewriting safe legacy evidence", () => {
  const legacyRaw = JSON.stringify({
    exerciseId: legacyKey,
    completedAt: "2026-09-01T00:00:00.000Z",
    score: 3,
    total: 4,
  });
  const source = storage({
    [legacyKey]: legacyRaw,
    "agocode.custom.notes": "raw-custom-state",
    unrelated: "keep",
  });

  const result = migrateAgoCodeStorage(source, "2026-09-26T12:00:00.000Z");
  assert.deepEqual(result.migratedKeys, [legacyKey]);

  const migrated = JSON.parse(source.getItem(legacyKey));
  assert.equal(migrated.version, 1);
  assert.deepEqual(migrated.attempts, []);
  assert.equal(migrated.completedAt, "2026-09-01T00:00:00.000Z");
  assert.deepEqual(migrated.recognition, {
    sessions: 1,
    lastFirstTryCorrect: 3,
    bestFirstTryCorrect: 3,
    totalScenarios: 4,
  });

  const recovery = readAgoCodeStorageRecoveryPoint(source);
  assert.ok(recovery);
  assert.equal(recovery.createdAt, "2026-09-26T12:00:00.000Z");
  assert.equal(recovery.entries[legacyKey], legacyRaw);
  assert.equal(recovery.entries["agocode.custom.notes"], "raw-custom-state");
  assert.equal(recovery.entries[AGOCODE_STORAGE_RECOVERY_KEY], undefined);
  assert.equal(source.getItem("agocode.custom.notes"), "raw-custom-state");
  assert.equal(source.getItem("unrelated"), "keep");
});

test("restore replaces AgoCode-owned state from the recovery snapshot without touching unrelated storage", () => {
  const legacyRaw = JSON.stringify({ completedAt: "2026-09-01T00:00:00.000Z" });
  const source = storage({
    [legacyKey]: legacyRaw,
    "agocode.custom.before": "before",
    unrelated: "keep",
  });

  migrateAgoCodeStorage(source, "2026-09-26T12:00:00.000Z");
  source.setItem("agocode.custom.after", "after");
  source.setItem("unrelated", "still-keep");

  const restored = restoreAgoCodeStorageRecoveryPoint(source);
  assert.equal(restored, 2);
  assert.equal(source.getItem(legacyKey), legacyRaw);
  assert.equal(source.getItem("agocode.custom.before"), "before");
  assert.equal(source.getItem("agocode.custom.after"), null);
  assert.equal(source.getItem("unrelated"), "still-keep");
  assert.ok(source.getItem(AGOCODE_STORAGE_RECOVERY_KEY));
});

test("invalid known evidence is never rewritten by automatic migration", () => {
  const source = storage({
    [invalidKey]: "{broken-json",
  });

  const result = migrateAgoCodeStorage(source, "2026-09-26T12:00:00.000Z");
  assert.deepEqual(result.migratedKeys, []);
  assert.equal(source.getItem(invalidKey), "{broken-json");
  assert.equal(source.getItem(AGOCODE_STORAGE_RECOVERY_KEY), null);
});
