import type { ReasoningConfidence, ReasoningEvidence, ReasoningExerciseEvidence, StorageLike } from "./evidence.ts";

export const REASONING_ATTEMPT_HISTORY_KEY = "agocode.progress.reasoning-attempt-history";

export type ReasoningAttemptStage = "guided" | "solved" | "independent";

export type ReasoningAttemptEntry = {
  attemptId: string;
  exerciseId: string;
  startedAt: string;
  finalizedAt: string;
  developedStages: number;
  totalStages: number;
  lensRevealed: boolean;
  confidence?: ReasoningConfidence;
  completedAt?: string;
};

export type ReasoningAttemptHistory = {
  version: 1;
  entries: ReasoningAttemptEntry[];
};

export type ReasoningAttemptSummary = {
  exerciseId: string;
  attempts: number;
  latest: ReasoningAttemptEntry;
  best: ReasoningAttemptEntry;
  latestStage: ReasoningAttemptStage;
  bestStage: ReasoningAttemptStage;
  independentAttempts: number;
  supportRemoved: boolean;
  belowPeak: boolean;
  firstAttemptAt: string;
  firstIndependentAt?: string;
  attemptsToIndependence?: number;
  timeToIndependenceMs?: number;
};

type RecordReasoningAttemptInput = Omit<ReasoningAttemptEntry, "finalizedAt"> & {
  finalizedAt?: string;
};

const MAX_REASONING_ATTEMPTS = 160;

export const reasoningAttemptStageLabels: Record<ReasoningAttemptStage, string> = {
  guided: "Guided",
  solved: "Solved",
  independent: "Independent",
};

export const reasoningAttemptStageRank: Record<ReasoningAttemptStage, number> = {
  guided: 1,
  solved: 2,
  independent: 3,
};

function clampAttempt(entry: ReasoningAttemptEntry): ReasoningAttemptEntry {
  const totalStages = Math.max(1, entry.totalStages);
  return {
    ...entry,
    totalStages,
    developedStages: Math.max(0, Math.min(entry.developedStages, totalStages)),
  };
}

function isConfidence(value: unknown): value is ReasoningConfidence {
  return value === "stuck" || value === "developing" || value === "solid";
}

function parseEntry(value: unknown): ReasoningAttemptEntry | null {
  if (!value || typeof value !== "object") return null;
  const entry = value as Partial<ReasoningAttemptEntry>;
  if (
    typeof entry.attemptId !== "string"
    || typeof entry.exerciseId !== "string"
    || typeof entry.startedAt !== "string"
    || typeof entry.finalizedAt !== "string"
    || typeof entry.developedStages !== "number"
    || typeof entry.totalStages !== "number"
    || typeof entry.lensRevealed !== "boolean"
  ) return null;

  return clampAttempt({
    attemptId: entry.attemptId,
    exerciseId: entry.exerciseId,
    startedAt: entry.startedAt,
    finalizedAt: entry.finalizedAt,
    developedStages: entry.developedStages,
    totalStages: entry.totalStages,
    lensRevealed: entry.lensRevealed,
    confidence: isConfidence(entry.confidence) ? entry.confidence : undefined,
    completedAt: typeof entry.completedAt === "string" ? entry.completedAt : undefined,
  });
}

export function classifyReasoningAttempt(entry: ReasoningAttemptEntry): ReasoningAttemptStage {
  if (!entry.completedAt) return "guided";
  const coverage = entry.developedStages / Math.max(1, entry.totalStages);
  return coverage >= 0.75 && !entry.lensRevealed ? "independent" : "solved";
}

function compareStrength(a: ReasoningAttemptEntry, b: ReasoningAttemptEntry) {
  const stageDelta = reasoningAttemptStageRank[classifyReasoningAttempt(a)] - reasoningAttemptStageRank[classifyReasoningAttempt(b)];
  if (stageDelta !== 0) return stageDelta;
  const coverageA = a.developedStages / Math.max(1, a.totalStages);
  const coverageB = b.developedStages / Math.max(1, b.totalStages);
  if (coverageA !== coverageB) return coverageA - coverageB;
  if (a.developedStages !== b.developedStages) return a.developedStages - b.developedStages;
  return b.finalizedAt.localeCompare(a.finalizedAt);
}

function meaningfulAttempt(entry: ReasoningAttemptEntry) {
  return entry.developedStages > 0 || entry.lensRevealed || Boolean(entry.confidence) || Boolean(entry.completedAt);
}

export function readReasoningAttemptHistory(storage: StorageLike): ReasoningAttemptHistory {
  try {
    const raw = storage.getItem(REASONING_ATTEMPT_HISTORY_KEY);
    if (!raw) return { version: 1, entries: [] };
    const parsed = JSON.parse(raw) as Partial<ReasoningAttemptHistory>;
    const entries = Array.isArray(parsed.entries)
      ? parsed.entries
        .map(parseEntry)
        .filter((entry): entry is ReasoningAttemptEntry => Boolean(entry))
        .slice(-MAX_REASONING_ATTEMPTS)
      : [];
    return { version: 1, entries };
  } catch {
    return { version: 1, entries: [] };
  }
}

export function recordReasoningAttempt(
  storage: StorageLike,
  input: RecordReasoningAttemptInput,
): ReasoningAttemptHistory {
  const finalizedAt = input.finalizedAt ?? new Date().toISOString();
  const incoming = clampAttempt({ ...input, finalizedAt });
  const previous = readReasoningAttemptHistory(storage);
  if (!meaningfulAttempt(incoming)) return previous;

  const existingIndex = previous.entries.findIndex((entry) => entry.attemptId === incoming.attemptId);
  let entries: ReasoningAttemptEntry[];

  if (existingIndex >= 0) {
    const existing = previous.entries[existingIndex];
    const stronger = compareStrength(incoming, existing) > 0 ? incoming : existing;
    const merged: ReasoningAttemptEntry = {
      ...stronger,
      startedAt: existing.startedAt < incoming.startedAt ? existing.startedAt : incoming.startedAt,
    };
    entries = previous.entries.map((entry, index) => index === existingIndex ? merged : entry);
  } else {
    entries = [...previous.entries, incoming];
  }

  entries = entries
    .sort((a, b) => a.finalizedAt.localeCompare(b.finalizedAt))
    .slice(-MAX_REASONING_ATTEMPTS);
  const next: ReasoningAttemptHistory = { version: 1, entries };

  try {
    storage.setItem(REASONING_ATTEMPT_HISTORY_KEY, JSON.stringify(next));
  } catch {
    // Attempt history is additional evidence; the notebook remains usable without persistence.
  }
  return next;
}

function entryFromLegacyEvidence(exerciseId: string, evidence: ReasoningExerciseEvidence): ReasoningAttemptEntry {
  return {
    attemptId: `legacy:${exerciseId}`,
    exerciseId,
    startedAt: evidence.completedAt ?? evidence.updatedAt,
    finalizedAt: evidence.updatedAt,
    developedStages: evidence.developedStages,
    totalStages: evidence.totalStages,
    lensRevealed: evidence.lensRevealed,
    confidence: evidence.confidence,
    completedAt: evidence.completedAt,
  };
}

export function buildReasoningAttemptSummaries(
  history: ReasoningAttemptHistory,
): Record<string, ReasoningAttemptSummary> {
  const grouped = new Map<string, ReasoningAttemptEntry[]>();
  for (const entry of history.entries) {
    const group = grouped.get(entry.exerciseId) ?? [];
    group.push(entry);
    grouped.set(entry.exerciseId, group);
  }

  const summaries: Record<string, ReasoningAttemptSummary> = {};
  for (const [exerciseId, rawEntries] of grouped) {
    const entries = [...rawEntries].sort((a, b) => a.finalizedAt.localeCompare(b.finalizedAt));
    const latest = entries[entries.length - 1];
    const best = entries.reduce((current, candidate) => compareStrength(candidate, current) > 0 ? candidate : current);
    const independentEntries = entries.filter((entry) => classifyReasoningAttempt(entry) === "independent");
    const firstIndependent = independentEntries[0];
    const firstAttemptAt = entries[0].startedAt;
    const firstAttemptTime = new Date(firstAttemptAt).getTime();
    const firstIndependentTime = firstIndependent ? new Date(firstIndependent.finalizedAt).getTime() : Number.NaN;
    const firstIndependentIndex = firstIndependent ? entries.findIndex((entry) => entry.attemptId === firstIndependent.attemptId) : -1;
    const supportRemoved = Boolean(firstIndependent && entries.some((entry) => (
      entry.finalizedAt < firstIndependent.finalizedAt && entry.lensRevealed
    )));

    summaries[exerciseId] = {
      exerciseId,
      attempts: entries.length,
      latest,
      best,
      latestStage: classifyReasoningAttempt(latest),
      bestStage: classifyReasoningAttempt(best),
      independentAttempts: independentEntries.length,
      supportRemoved,
      belowPeak: reasoningAttemptStageRank[classifyReasoningAttempt(latest)] < reasoningAttemptStageRank[classifyReasoningAttempt(best)],
      firstAttemptAt,
      firstIndependentAt: firstIndependent?.finalizedAt,
      attemptsToIndependence: firstIndependentIndex >= 0 ? firstIndependentIndex + 1 : undefined,
      timeToIndependenceMs: Number.isFinite(firstAttemptTime) && Number.isFinite(firstIndependentTime)
        ? Math.max(0, firstIndependentTime - firstAttemptTime)
        : undefined,
    };
  }
  return summaries;
}

export function buildMonotonicReasoningEvidence(
  history: ReasoningAttemptHistory,
  fallback?: ReasoningEvidence,
): ReasoningEvidence | undefined {
  const candidates = new Map<string, ReasoningAttemptEntry[]>();
  for (const entry of history.entries) {
    const group = candidates.get(entry.exerciseId) ?? [];
    group.push(entry);
    candidates.set(entry.exerciseId, group);
  }
  for (const [exerciseId, evidence] of Object.entries(fallback?.byExercise ?? {})) {
    const group = candidates.get(exerciseId) ?? [];
    group.push(entryFromLegacyEvidence(exerciseId, evidence));
    candidates.set(exerciseId, group);
  }

  const byExercise: Record<string, ReasoningExerciseEvidence> = {};
  for (const [exerciseId, entries] of candidates) {
    const best = entries.reduce((current, candidate) => compareStrength(candidate, current) > 0 ? candidate : current);
    byExercise[exerciseId] = {
      developedStages: best.developedStages,
      totalStages: best.totalStages,
      lensRevealed: best.lensRevealed,
      confidence: best.confidence,
      completedAt: best.completedAt,
      updatedAt: best.finalizedAt,
    };
  }

  return Object.keys(byExercise).length ? { byExercise } : undefined;
}
