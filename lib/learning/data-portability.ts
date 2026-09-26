export const AGOCODE_DATA_EXPORT_VERSION = 1 as const;
export const AGOCODE_STORAGE_PREFIXES = ["agocode.", "agocode:"] as const;
export const AGOCODE_INTERNAL_STORAGE_PREFIX = "agocode.system.";

export type PortableStorage = {
  length: number;
  key(index: number): string | null;
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem?(key: string): void;
};

export type AgoCodeDataExport = {
  product: "AgoCode";
  version: typeof AGOCODE_DATA_EXPORT_VERSION;
  exportedAt: string;
  entries: Record<string, string>;
};

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

export function serializeAgoCodeData(data: AgoCodeDataExport) {
  return JSON.stringify(data, null, 2);
}

export function parseAgoCodeData(raw: string): AgoCodeDataExport {
  const parsed = JSON.parse(raw) as Partial<AgoCodeDataExport>;
  if (parsed.product !== "AgoCode" || parsed.version !== AGOCODE_DATA_EXPORT_VERSION) {
    throw new Error("Unsupported AgoCode data export.");
  }
  if (!parsed.entries || typeof parsed.entries !== "object" || Array.isArray(parsed.entries)) {
    throw new Error("The export does not contain a valid entries object.");
  }
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
