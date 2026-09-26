import type { StorageLike } from "./evidence.ts";
import type { StuckStateId } from "../knowledge/stuck-router.ts";

export const OBSTACLE_STORAGE_KEY = "agocode.progress.problem-solving-obstacles";

export type ObstacleEvent = {
  id: StuckStateId;
  selectedAt: string;
  context?: string;
};

export type ObstacleEvidence = {
  version: 1;
  events: ObstacleEvent[];
  counts: Partial<Record<StuckStateId, number>>;
  lastSelected?: StuckStateId;
  lastSelectedAt?: string;
};

const MAX_EVENTS = 80;

function isObstacleEvent(value: unknown): value is ObstacleEvent {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<ObstacleEvent>;
  return typeof item.id === "string" && typeof item.selectedAt === "string";
}

export function readObstacleEvidence(storage: StorageLike): ObstacleEvidence {
  try {
    const raw = storage.getItem(OBSTACLE_STORAGE_KEY);
    if (!raw) return { version: 1, events: [], counts: {} };
    const parsed = JSON.parse(raw) as Partial<ObstacleEvidence>;
    const events = Array.isArray(parsed.events) ? parsed.events.filter(isObstacleEvent).slice(-MAX_EVENTS) : [];
    const counts: Partial<Record<StuckStateId, number>> = {};
    for (const event of events) counts[event.id] = (counts[event.id] ?? 0) + 1;
    const last = events.at(-1);
    return {
      version: 1,
      events,
      counts,
      lastSelected: last?.id,
      lastSelectedAt: last?.selectedAt,
    };
  } catch {
    return { version: 1, events: [], counts: {} };
  }
}

export function recordObstacleSelection(
  storage: StorageLike,
  id: StuckStateId,
  context?: string,
  selectedAt = new Date().toISOString(),
): ObstacleEvidence {
  const previous = readObstacleEvidence(storage);
  const events = [...previous.events, { id, selectedAt, context }].slice(-MAX_EVENTS);
  const counts: Partial<Record<StuckStateId, number>> = {};
  for (const event of events) counts[event.id] = (counts[event.id] ?? 0) + 1;
  const evidence: ObstacleEvidence = {
    version: 1,
    events,
    counts,
    lastSelected: id,
    lastSelectedAt: selectedAt,
  };
  try {
    storage.setItem(OBSTACLE_STORAGE_KEY, JSON.stringify(evidence));
  } catch {
    // Contextual help remains usable when persistence is unavailable.
  }
  return evidence;
}

export function getMostFrequentObstacles(evidence: ObstacleEvidence, limit = 3) {
  return Object.entries(evidence.counts)
    .map(([id, count]) => ({ id: id as StuckStateId, count: count ?? 0 }))
    .sort((a, b) => b.count - a.count || a.id.localeCompare(b.id))
    .slice(0, Math.max(0, limit));
}
