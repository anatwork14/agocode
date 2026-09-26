export const REJECTED_APPROACHES_KEY = "agocode.progress.design.rejected-approaches.v1";
export const MAX_REJECTIONS_PER_PROBLEM = 16;

export type RejectedApproach = {
  id: string;
  approach: string;
  because: string;
  wouldWorkIf: string;
  recordedAt: string;
};

export type RejectedApproachHistory = Record<string, RejectedApproach[]>;

type StorageLike = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

function normalizeEntry(value: unknown, index: number): RejectedApproach | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Partial<RejectedApproach>;
  return {
    id: typeof item.id === "string" && item.id ? item.id : `rejection-${index + 1}`,
    approach: typeof item.approach === "string" ? item.approach : "",
    because: typeof item.because === "string" ? item.because : "",
    wouldWorkIf: typeof item.wouldWorkIf === "string" ? item.wouldWorkIf : "",
    recordedAt: typeof item.recordedAt === "string" && item.recordedAt ? item.recordedAt : new Date(0).toISOString(),
  };
}

export function readRejectedApproaches(storage: StorageLike): RejectedApproachHistory {
  try {
    const raw = storage.getItem(REJECTED_APPROACHES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return Object.fromEntries(Object.entries(parsed).map(([exerciseId, value]) => [
      exerciseId,
      Array.isArray(value)
        ? value.map(normalizeEntry).filter((item): item is RejectedApproach => Boolean(item)).slice(-MAX_REJECTIONS_PER_PROBLEM)
        : [],
    ]));
  } catch {
    return {};
  }
}

function write(storage: StorageLike, history: RejectedApproachHistory) {
  storage.setItem(REJECTED_APPROACHES_KEY, JSON.stringify(history));
  return history;
}

export function saveRejectedApproach(storage: StorageLike, exerciseId: string, entry: RejectedApproach) {
  const history = readRejectedApproaches(storage);
  const current = history[exerciseId] ?? [];
  const next = [...current.filter((item) => item.id !== entry.id), entry].slice(-MAX_REJECTIONS_PER_PROBLEM);
  return write(storage, { ...history, [exerciseId]: next });
}

export function removeRejectedApproach(storage: StorageLike, exerciseId: string, id: string) {
  const history = readRejectedApproaches(storage);
  const next = (history[exerciseId] ?? []).filter((item) => item.id !== id);
  if (next.length) return write(storage, { ...history, [exerciseId]: next });
  const { [exerciseId]: _removed, ...rest } = history;
  void _removed;
  return write(storage, rest);
}
