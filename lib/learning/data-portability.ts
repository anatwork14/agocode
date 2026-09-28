export const AGOCODE_DATA_EXPORT_VERSION = 1 as const;
export const AGOCODE_DATA_INTEGRITY_ALGORITHM = "SHA-256" as const;
export const AGOCODE_STORAGE_PREFIXES = ["agocode.", "agocode:"] as const;
export const AGOCODE_INTERNAL_STORAGE_PREFIX = "agocode.system.";

export type PortableStorage = {
  length: number;
  key(index: number): string | null;
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem?(key: string): void;
};

export type AgoCodeDataIntegrity = {
  algorithm: typeof AGOCODE_DATA_INTEGRITY_ALGORITHM;
  digest: string;
  entryCount: number;
};

export type AgoCodeDataExport = {
  product: "AgoCode";
  version: typeof AGOCODE_DATA_EXPORT_VERSION;
  exportedAt: string;
  entries: Record<string, string>;
  integrity?: AgoCodeDataIntegrity;
};

export type AgoCodeImportIntegrity =
  | {
      status: "verified";
      algorithm: typeof AGOCODE_DATA_INTEGRITY_ALGORITHM;
      digest: string;
      entryCount: number;
    }
  | {
      status: "legacy-unverified";
      entryCount: number;
    };

export type AgoCodeParsedImport = {
  data: AgoCodeDataExport;
  integrity: AgoCodeImportIntegrity;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function sortedEntries(entries: Record<string, string>) {
  return Object.fromEntries(Object.entries(entries).sort(([left], [right]) => left.localeCompare(right)));
}

function canonicalExportPayload(data: Pick<AgoCodeDataExport, "product" | "version" | "exportedAt" | "entries">) {
  return JSON.stringify({
    product: data.product,
    version: data.version,
    exportedAt: data.exportedAt,
    entries: sortedEntries(data.entries),
  });
}

async function sha256Hex(value: string) {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) throw new Error("SHA-256 integrity checks are unavailable in this runtime.");
  const digest = await subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function parseEnvelope(raw: string) {
  const parsed = JSON.parse(raw) as unknown;
  if (!isRecord(parsed) || parsed.product !== "AgoCode" || parsed.version !== AGOCODE_DATA_EXPORT_VERSION) {
    throw new Error("Unsupported AgoCode data export.");
  }
  if (!isRecord(parsed.entries)) {
    throw new Error("The export does not contain a valid entries object.");
  }
  return parsed;
}

function parseIntegrityManifest(value: unknown): AgoCodeDataIntegrity | undefined {
  if (value === undefined) return undefined;
  if (
    !isRecord(value) ||
    value.algorithm !== AGOCODE_DATA_INTEGRITY_ALGORITHM ||
    typeof value.digest !== "string" ||
    !/^[a-f0-9]{64}$/.test(value.digest) ||
    typeof value.entryCount !== "number" ||
    !Number.isSafeInteger(value.entryCount) ||
    value.entryCount < 0
  ) {
    throw new Error("The export contains an invalid integrity manifest.");
  }
  return {
    algorithm: AGOCODE_DATA_INTEGRITY_ALGORITHM,
    digest: value.digest,
    entryCount: value.entryCount,
  };
}

export function isAgoCodeStorageKey(key: string) {
  return AGOCODE_STORAGE_PREFIXES.some((prefix) => key.startsWith(prefix));
}

export function isPortableAgoCodeStorageKey(key: string) {
  return isAgoCodeStorageKey(key) && !key.startsWith(AGOCODE_INTERNAL_STORAGE_PREFIX);
}

export function collectAgoCodeData(storage: PortableStorage, exportedAt = new Date().toISOString()): AgoCodeDataExport {
  const entries: Record<string, string> = {};
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (!key || !isPortableAgoCodeStorageKey(key)) continue;
    const value = storage.getItem(key);
    if (value !== null) entries[key] = value;
  }
  return { product: "AgoCode", version: AGOCODE_DATA_EXPORT_VERSION, exportedAt, entries };
}

/**
 * Adds a deterministic SHA-256 manifest to one portable bundle.
 *
 * The digest is an integrity check, not an authenticity signature: it detects accidental damage or
 * bytes changed without updating the manifest, but anyone who can rewrite the file can also compute
 * a new digest. The canonical payload sorts entry keys so verification is stable across JSON key order.
 */
export async function sealAgoCodeDataExport(data: AgoCodeDataExport): Promise<AgoCodeDataExport> {
  const entries = sortedEntries(data.entries);
  const unsigned = {
    product: "AgoCode" as const,
    version: AGOCODE_DATA_EXPORT_VERSION,
    exportedAt: data.exportedAt,
    entries,
  };
  const digest = await sha256Hex(canonicalExportPayload(unsigned));
  return {
    ...unsigned,
    integrity: {
      algorithm: AGOCODE_DATA_INTEGRITY_ALGORITHM,
      digest,
      entryCount: Object.keys(entries).length,
    },
  };
}

export async function collectSealedAgoCodeData(
  storage: PortableStorage,
  exportedAt = new Date().toISOString(),
) {
  return sealAgoCodeDataExport(collectAgoCodeData(storage, exportedAt));
}

export function serializeAgoCodeData(data: AgoCodeDataExport) {
  return JSON.stringify({ ...data, entries: sortedEntries(data.entries) }, null, 2);
}

export function parseAgoCodeData(raw: string): AgoCodeDataExport {
  const parsed = parseEnvelope(raw);
  const integrity = parseIntegrityManifest(parsed.integrity);
  const entries: Record<string, string> = {};
  for (const [key, value] of Object.entries(parsed.entries)) {
    if (!isPortableAgoCodeStorageKey(key) || typeof value !== "string") continue;
    entries[key] = value;
  }
  return {
    product: "AgoCode",
    version: AGOCODE_DATA_EXPORT_VERSION,
    exportedAt: typeof parsed.exportedAt === "string" ? parsed.exportedAt : new Date(0).toISOString(),
    entries,
    ...(integrity ? { integrity } : {}),
  };
}

/**
 * Parses an import candidate and verifies its optional integrity manifest before returning any data
 * to the import preflight. Legacy v1 bundles without a manifest stay compatible, but callers can
 * surface that their bytes could not be checked against the original export.
 */
export async function parseAgoCodeDataForImport(raw: string): Promise<AgoCodeParsedImport> {
  const parsed = parseEnvelope(raw);
  const integrity = parseIntegrityManifest(parsed.integrity);

  if (!integrity) {
    const data = parseAgoCodeData(raw);
    return {
      data,
      integrity: {
        status: "legacy-unverified",
        entryCount: Object.keys(data.entries).length,
      },
    };
  }

  if (typeof parsed.exportedAt !== "string") {
    throw new Error("Integrity-sealed AgoCode exports must contain an exportedAt timestamp.");
  }

  const rawEntries: Record<string, string> = {};
  for (const [key, value] of Object.entries(parsed.entries)) {
    if (typeof value !== "string") {
      throw new Error(`Integrity-sealed export contains a non-string value for ${key}.`);
    }
    if (!isPortableAgoCodeStorageKey(key)) {
      throw new Error(`Integrity-sealed export contains a non-portable storage key: ${key}.`);
    }
    rawEntries[key] = value;
  }

  const entryCount = Object.keys(rawEntries).length;
  if (integrity.entryCount !== entryCount) {
    throw new Error(`Integrity check failed: manifest expected ${integrity.entryCount} entries but the file contains ${entryCount}.`);
  }

  const data: AgoCodeDataExport = {
    product: "AgoCode",
    version: AGOCODE_DATA_EXPORT_VERSION,
    exportedAt: parsed.exportedAt,
    entries: sortedEntries(rawEntries),
    integrity,
  };
  const digest = await sha256Hex(canonicalExportPayload(data));
  if (digest !== integrity.digest) {
    throw new Error("Integrity check failed: this AgoCode backup does not match its SHA-256 manifest. The import was not staged.");
  }

  return {
    data,
    integrity: {
      status: "verified",
      algorithm: AGOCODE_DATA_INTEGRITY_ALGORITHM,
      digest: integrity.digest,
      entryCount,
    },
  };
}

export function importAgoCodeData(storage: PortableStorage, data: AgoCodeDataExport, replace = false) {
  if (replace) resetAgoCodeData(storage);
  for (const [key, value] of Object.entries(data.entries)) storage.setItem(key, value);
  return Object.keys(data.entries).length;
}

export function resetAgoCodeData(storage: PortableStorage) {
  if (!storage.removeItem) return 0;
  const keys: string[] = [];
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (key && isAgoCodeStorageKey(key)) keys.push(key);
  }
  keys.forEach((key) => storage.removeItem?.(key));
  return keys.length;
}
