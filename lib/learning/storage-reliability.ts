import {
  AGOCODE_INTERNAL_STORAGE_PREFIX,
  collectAgoCodeData,
  isAgoCodeStorageKey,
  type PortableStorage,
} from "./data-portability";
import { progressEvidenceKeys } from "./progressCatalog";

export const AGOCODE_STORAGE_SCHEMA_VERSION = 1 as const;
export const AGOCODE_STORAGE_RECOVERY_KEY = "agocode.system.storage-recovery.v1";
export const AGOCODE_STORAGE_SCHEMA_KEY = "agocode.system.storage-schema.v1";

const evidenceKeySet = new Set(progressEvidenceKeys);

export type StorageEntryClassification =
  | "current-evidence"
  | "legacy-evidence"
  | "invalid-known-evidence"
  | "unmanaged"
  | "system";

export type StorageAuditEntry = {
  key: string;
  classification: StorageEntryClassification;
  migratable: boolean;
  note: string;
};

export type AgoCodeStorageRecoveryPoint = {
  product: "AgoCode";
  version: typeof AGOCODE_STORAGE_SCHEMA_VERSION;
  createdAt: string;
  reason: string;
  entries: Record<string, string>;
};

export type AgoCodeStorageSchemaState = {
  product: "AgoCode";
  version: typeof AGOCODE_STORAGE_SCHEMA_VERSION;
  lastMigrationAt: string;
  recoveryCreatedAt: string;
  migratedKeys: string[];
};

export type AgoCodeStorageAudit = {
  totalEntries: number;
  currentEvidence: number;
  legacyEvidence: number;
  invalidKnownEvidence: number;
  unmanaged: number;
  systemEntries: number;
  recoveryPoint?: AgoCodeStorageRecoveryPoint;
  schemaState?: AgoCodeStorageSchemaState;
  entries: StorageAuditEntry[];
};

export type AgoCodeStorageMigrationResult = {
  migratedKeys: string[];
  recoveryPoint?: AgoCodeStorageRecoveryPoint;
  schemaState?: AgoCodeStorageSchemaState;
};

type JsonResult =
  | { ok: true; value: unknown }
  | { ok: false };

function parseJson(raw: string): JsonResult {
  try {
    return { ok: true, value: JSON.parse(raw) as unknown };
  } catch {
    return { ok: false };
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isCurrentLearningEvidence(value: unknown) {
  if (!isRecord(value)) return false;
  return value.version === 1 && Array.isArray(value.attempts);
}

function isLegacyLearningEvidence(value: unknown) {
  if (!isRecord(value)) return false;
  return value.version !== 1 && typeof value.completedAt === "string";
}

function normalizeLegacyLearningEvidence(key: string, value: Record<string, unknown>) {
  const totalScenarios = typeof value.total === "number" ? Math.max(0, value.total) : undefined;
  const score = typeof value.score === "number" && totalScenarios !== undefined
    ? Math.max(0, Math.min(value.score, totalScenarios))
    : undefined;
  const recognition = totalScenarios !== undefined && score !== undefined
    ? {
        sessions: 1,
        lastFirstTryCorrect: score,
        bestFirstTryCorrect: score,
        totalScenarios,
      }
    : undefined;

  return {
    version: 1 as const,
    exerciseId: typeof value.exerciseId === "string" ? value.exerciseId : key,
    completedAt: value.completedAt as string,
    attempts: [],
    bestPassedCount: 0,
    totalTests: 0,
    ...(recognition ? { recognition } : {}),
  };
}

function listAgoCodeKeys(storage: PortableStorage) {
  const keys: string[] = [];
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (key && isAgoCodeStorageKey(key)) keys.push(key);
  }
  return keys;
}

function classifyEntry(key: string, raw: string): StorageAuditEntry {
  if (key.startsWith(AGOCODE_INTERNAL_STORAGE_PREFIX)) {
    return {
      key,
      classification: "system",
      migratable: false,
      note: "Internal AgoCode recovery or schema metadata.",
    };
  }

  if (!evidenceKeySet.has(key)) {
    return {
      key,
      classification: "unmanaged",
      migratable: false,
      note: "AgoCode-owned state outside the versioned learning-evidence catalog; preserved without interpretation.",
    };
  }

  const parsed = parseJson(raw);
  if (!parsed.ok) {
    return {
      key,
      classification: "invalid-known-evidence",
      migratable: false,
      note: "Known learning-evidence key contains unreadable JSON; preserved for manual recovery/export.",
    };
  }

  if (isCurrentLearningEvidence(parsed.value)) {
    return {
      key,
      classification: "current-evidence",
      migratable: false,
      note: "Learning evidence already uses the current schema.",
    };
  }

  if (isLegacyLearningEvidence(parsed.value)) {
    return {
      key,
      classification: "legacy-evidence",
      migratable: true,
      note: "Legacy completion evidence the current reader already understands and can safely promote to schema v1.",
    };
  }

  return {
    key,
    classification: "invalid-known-evidence",
    migratable: false,
    note: "Known learning-evidence key has an unrecognized shape; no automatic rewrite will be attempted.",
  };
}

export function readAgoCodeStorageRecoveryPoint(storage: PortableStorage): AgoCodeStorageRecoveryPoint | undefined {
  const raw = storage.getItem(AGOCODE_STORAGE_RECOVERY_KEY);
  if (!raw) return undefined;
  const parsed = parseJson(raw);
  if (!parsed.ok || !isRecord(parsed.value)) return undefined;
  const value = parsed.value;
  if (
    value.product !== "AgoCode" ||
    value.version !== AGOCODE_STORAGE_SCHEMA_VERSION ||
    typeof value.createdAt !== "string" ||
    typeof value.reason !== "string" ||
    !isRecord(value.entries)
  ) return undefined;

  const entries: Record<string, string> = {};
  for (const [key, rawValue] of Object.entries(value.entries)) {
    if (isAgoCodeStorageKey(key) && !key.startsWith(AGOCODE_INTERNAL_STORAGE_PREFIX) && typeof rawValue === "string") {
      entries[key] = rawValue;
    }
  }

  return {
    product: "AgoCode",
    version: AGOCODE_STORAGE_SCHEMA_VERSION,
    createdAt: value.createdAt,
    reason: value.reason,
    entries,
  };
}

export function readAgoCodeStorageSchemaState(storage: PortableStorage): AgoCodeStorageSchemaState | undefined {
  const raw = storage.getItem(AGOCODE_STORAGE_SCHEMA_KEY);
  if (!raw) return undefined;
  const parsed = parseJson(raw);
  if (!parsed.ok || !isRecord(parsed.value)) return undefined;
  const value = parsed.value;
  if (
    value.product !== "AgoCode" ||
    value.version !== AGOCODE_STORAGE_SCHEMA_VERSION ||
    typeof value.lastMigrationAt !== "string" ||
    typeof value.recoveryCreatedAt !== "string" ||
    !Array.isArray(value.migratedKeys)
  ) return undefined;

  return {
    product: "AgoCode",
    version: AGOCODE_STORAGE_SCHEMA_VERSION,
    lastMigrationAt: value.lastMigrationAt,
    recoveryCreatedAt: value.recoveryCreatedAt,
    migratedKeys: value.migratedKeys.filter((key): key is string => typeof key === "string"),
  };
}

export function auditAgoCodeStorage(storage: PortableStorage): AgoCodeStorageAudit {
  const entries = listAgoCodeKeys(storage).map((key) => classifyEntry(key, storage.getItem(key) ?? ""));
  return {
    totalEntries: entries.filter((entry) => entry.classification !== "system").length,
    currentEvidence: entries.filter((entry) => entry.classification === "current-evidence").length,
    legacyEvidence: entries.filter((entry) => entry.classification === "legacy-evidence").length,
    invalidKnownEvidence: entries.filter((entry) => entry.classification === "invalid-known-evidence").length,
    unmanaged: entries.filter((entry) => entry.classification === "unmanaged").length,
    systemEntries: entries.filter((entry) => entry.classification === "system").length,
    recoveryPoint: readAgoCodeStorageRecoveryPoint(storage),
    schemaState: readAgoCodeStorageSchemaState(storage),
    entries,
  };
}

export function createAgoCodeStorageRecoveryPoint(
  storage: PortableStorage,
  reason = "manual",
  createdAt = new Date().toISOString(),
): AgoCodeStorageRecoveryPoint {
  const exported = collectAgoCodeData(storage, createdAt);
  const recoveryPoint: AgoCodeStorageRecoveryPoint = {
    product: "AgoCode",
    version: AGOCODE_STORAGE_SCHEMA_VERSION,
    createdAt,
    reason,
    entries: exported.entries,
  };
  storage.setItem(AGOCODE_STORAGE_RECOVERY_KEY, JSON.stringify(recoveryPoint));
  return recoveryPoint;
}

export function restoreAgoCodeStorageRecoveryPoint(
  storage: PortableStorage,
  recoveryPoint = readAgoCodeStorageRecoveryPoint(storage),
) {
  if (!recoveryPoint) throw new Error("No valid AgoCode recovery point is available.");
  if (!storage.removeItem) throw new Error("This storage provider cannot remove keys, so a safe restore is unavailable.");

  const keys = listAgoCodeKeys(storage).filter((key) => key !== AGOCODE_STORAGE_RECOVERY_KEY);
  keys.forEach((key) => storage.removeItem?.(key));
  for (const [key, value] of Object.entries(recoveryPoint.entries)) storage.setItem(key, value);
  storage.setItem(AGOCODE_STORAGE_RECOVERY_KEY, JSON.stringify(recoveryPoint));
  return Object.keys(recoveryPoint.entries).length;
}

export function migrateAgoCodeStorage(
  storage: PortableStorage,
  migratedAt = new Date().toISOString(),
): AgoCodeStorageMigrationResult {
  const audit = auditAgoCodeStorage(storage);
  const candidates = audit.entries.filter((entry) => entry.classification === "legacy-evidence" && entry.migratable);
  if (!candidates.length) return { migratedKeys: [], recoveryPoint: audit.recoveryPoint, schemaState: audit.schemaState };
  if (!storage.removeItem) throw new Error("This storage provider cannot support rollback, so migration was not started.");

  const recoveryPoint = createAgoCodeStorageRecoveryPoint(storage, "pre-migration", migratedAt);
  const migratedKeys: string[] = [];

  try {
    for (const candidate of candidates) {
      const raw = storage.getItem(candidate.key);
      if (!raw) continue;
      const parsed = parseJson(raw);
      if (!parsed.ok || !isRecord(parsed.value) || !isLegacyLearningEvidence(parsed.value)) continue;
      storage.setItem(candidate.key, JSON.stringify(normalizeLegacyLearningEvidence(candidate.key, parsed.value)));
      migratedKeys.push(candidate.key);
    }

    const schemaState: AgoCodeStorageSchemaState = {
      product: "AgoCode",
      version: AGOCODE_STORAGE_SCHEMA_VERSION,
      lastMigrationAt: migratedAt,
      recoveryCreatedAt: recoveryPoint.createdAt,
      migratedKeys,
    };
    storage.setItem(AGOCODE_STORAGE_SCHEMA_KEY, JSON.stringify(schemaState));
    return { migratedKeys, recoveryPoint, schemaState };
  } catch (error) {
    try {
      restoreAgoCodeStorageRecoveryPoint(storage, recoveryPoint);
    } catch {
      // The original migration error is more actionable; the recovery point remains serialized when possible.
    }
    throw error;
  }
}
