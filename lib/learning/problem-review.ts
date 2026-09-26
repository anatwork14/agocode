import type { StorageLike } from "./evidence.ts";
import type { ProblemIndependenceProfile, ProblemIndependenceState, ProblemRecognitionHistory } from "./independence.ts";
import { classifyReasoningAttempt, type ReasoningAttemptHistory } from "./reasoning-attempts.ts";

export const PROBLEM_REVIEW_HISTORY_KEY = "agocode.progress.problem-review-history";

export type ProblemReviewOutcome = "remembered" | "needs-work";
export type ProblemReviewDueState = "fresh" | "due-soon" | "due" | "overdue";

export type ProblemReviewEntry = {
  exerciseId: string;
  outcome: ProblemReviewOutcome;
  reviewedAt: string;
};

export type ProblemReviewHistory = {
  version: 1;
  entries: ProblemReviewEntry[];
};

export type ProblemReviewStatus = {
  exerciseId: string;
  independenceStage: ProblemIndependenceState["stage"];
  anchorAt: string;
  lastReviewedAt?: string;
  nextReviewAt: string;
  intervalDays: number;
  sessions: number;
  successful: number;
  failed: number;
  dueState: ProblemReviewDueState;
  freshness: number;
  overdueMs: number;
  priority: number;
  recommendedMode: "rebuild" | "blind-recognition";
  explanation: string;
};

export type ProblemReviewProfile = {
  statuses: Record<string, ProblemReviewStatus>;
  scheduled: number;
  dueSoon: number;
  due: number;
  overdue: number;
  averageFreshness: number;
};

type BuildProblemReviewProfileInput = {
  independence: ProblemIndependenceProfile;
  reviewHistory?: ProblemReviewHistory | null;
  recognitionHistory?: ProblemRecognitionHistory | null;
  reasoningAttempts?: ReasoningAttemptHistory | null;
  now?: string | number | Date;
};

const MAX_REVIEW_ENTRIES = 240;
const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_INTERVAL_DAYS = 30;

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function isOutcome(value: unknown): value is ProblemReviewOutcome {
  return value === "remembered" || value === "needs-work";
}

function parseEntry(value: unknown): ProblemReviewEntry | null {
  if (!value || typeof value !== "object") return null;
  const entry = value as Partial<ProblemReviewEntry>;
  if (
    typeof entry.exerciseId !== "string"
    || typeof entry.reviewedAt !== "string"
    || !isOutcome(entry.outcome)
  ) return null;
  return { exerciseId: entry.exerciseId, reviewedAt: entry.reviewedAt, outcome: entry.outcome };
}

function baseIntervalDays(state: ProblemIndependenceState) {
  if (state.stage === "recalled") return 7;
  if (state.stage === "transferred") return 4;
  return 2;
}

function reviewAnchor(state: ProblemIndependenceState) {
  return state.recognitionAt ?? state.completedAt;
}

function dueStateFor(nextReviewTime: number, nowTime: number, intervalDays: number): ProblemReviewDueState {
  const remaining = nextReviewTime - nowTime;
  if (remaining > DAY_MS) return "fresh";
  if (remaining > 0) return "due-soon";
  const overdue = Math.abs(remaining);
  return overdue > Math.max(DAY_MS, intervalDays * DAY_MS * 0.5) ? "overdue" : "due";
}

function explanationFor(status: Omit<ProblemReviewStatus, "explanation">) {
  if (status.dueState === "overdue") {
    return "This proof is historically valid, but retrieval is overdue. Reconstruct it now before the memory trace gets older.";
  }
  if (status.dueState === "due") {
    return "The current spacing interval has elapsed. This is a good time for effortful retrieval without reopening prior notes.";
  }
  if (status.dueState === "due-soon") {
    return "This problem is approaching its next retrieval window. Delay a little rather than repeating it immediately.";
  }
  return "The latest proof is still fresh inside its current spacing interval, so immediate repetition is intentionally down-weighted.";
}

export function readProblemReviewHistory(storage: StorageLike): ProblemReviewHistory {
  try {
    const raw = storage.getItem(PROBLEM_REVIEW_HISTORY_KEY);
    if (!raw) return { version: 1, entries: [] };
    const parsed = JSON.parse(raw) as Partial<ProblemReviewHistory>;
    const entries = Array.isArray(parsed.entries)
      ? parsed.entries
        .map(parseEntry)
        .filter((entry): entry is ProblemReviewEntry => Boolean(entry))
        .slice(-MAX_REVIEW_ENTRIES)
      : [];
    return { version: 1, entries };
  } catch {
    return { version: 1, entries: [] };
  }
}

// Kept for backward compatibility with review history already stored in browsers.
// New review UI does not require self-report: finalized reasoning attempts and
// blind-recognition outcomes are consumed automatically below.
export function recordProblemReviewOutcome(
  storage: StorageLike,
  input: Omit<ProblemReviewEntry, "reviewedAt"> & { reviewedAt?: string },
): ProblemReviewHistory {
  const reviewedAt = input.reviewedAt ?? new Date().toISOString();
  const previous = readProblemReviewHistory(storage);
  const entry: ProblemReviewEntry = {
    exerciseId: input.exerciseId,
    outcome: input.outcome,
    reviewedAt,
  };

  const duplicate = previous.entries.some((candidate) => (
    candidate.exerciseId === entry.exerciseId
    && candidate.outcome === entry.outcome
    && candidate.reviewedAt === entry.reviewedAt
  ));
  if (duplicate) return previous;

  const next: ProblemReviewHistory = {
    version: 1,
    entries: [...previous.entries, entry]
      .sort((a, b) => a.reviewedAt.localeCompare(b.reviewedAt))
      .slice(-MAX_REVIEW_ENTRIES),
  };
  try {
    storage.setItem(PROBLEM_REVIEW_HISTORY_KEY, JSON.stringify(next));
  } catch {
    // Scheduling metadata is optional; problem evidence remains intact without persistence.
  }
  return next;
}

export function buildProblemReviewProfile(input: BuildProblemReviewProfileInput): ProblemReviewProfile {
  const reviewEntries = input.reviewHistory?.entries ?? [];
  const recognitionEntries = input.recognitionHistory?.entries ?? [];
  const reasoningAttempts = input.reasoningAttempts?.entries ?? [];
  const nowTime = new Date(input.now ?? Date.now()).getTime();
  const statuses: Record<string, ProblemReviewStatus> = {};

  for (const state of Object.values(input.independence.states)) {
    if (state.rank < 4) continue;
    const anchorAt = reviewAnchor(state);
    if (!anchorAt) continue;
    const anchorTime = new Date(anchorAt).getTime();
    if (!Number.isFinite(anchorTime)) continue;

    const baseInterval = baseIntervalDays(state);
    let intervalDays = baseInterval;
    let lastReviewedAt: string | undefined;
    let sessions = 0;
    let successful = 0;
    let failed = 0;
    let nextReviewTime = anchorTime + intervalDays * DAY_MS;

    const events = [
      ...reviewEntries
        .filter((entry) => entry.exerciseId === state.exerciseId && new Date(entry.reviewedAt).getTime() > anchorTime)
        .map((entry) => ({ at: entry.reviewedAt, outcome: entry.outcome, source: "legacy-manual" as const, key: `manual:${entry.reviewedAt}:${entry.outcome}` })),
      ...recognitionEntries
        .filter((entry) => entry.exerciseId === state.exerciseId && new Date(entry.recognizedAt).getTime() > anchorTime)
        .map((entry) => ({
          at: entry.recognizedAt,
          outcome: entry.firstTry ? "remembered" as const : "needs-work" as const,
          source: "recognition" as const,
          key: `recognition:${entry.recognizedAt}:${entry.firstTry}`,
        })),
      ...reasoningAttempts
        .filter((entry) => entry.exerciseId === state.exerciseId && new Date(entry.finalizedAt).getTime() > anchorTime)
        .map((entry) => ({
          at: entry.finalizedAt,
          outcome: classifyReasoningAttempt(entry) === "independent" ? "remembered" as const : "needs-work" as const,
          source: "reasoning-attempt" as const,
          key: `attempt:${entry.attemptId}`,
        })),
    ].sort((a, b) => a.at.localeCompare(b.at) || a.key.localeCompare(b.key));

    const seenEventKeys = new Set<string>();
    for (const event of events) {
      if (seenEventKeys.has(event.key)) continue;
      seenEventKeys.add(event.key);
      const eventTime = new Date(event.at).getTime();
      if (!Number.isFinite(eventTime)) continue;

      sessions += 1;
      lastReviewedAt = event.at;
      if (event.outcome === "remembered") {
        successful += 1;
        intervalDays = Math.min(MAX_INTERVAL_DAYS, Math.max(baseInterval, intervalDays * 2));
      } else {
        failed += 1;
        intervalDays = 1;
      }
      nextReviewTime = eventTime + intervalDays * DAY_MS;
    }

    const dueState = dueStateFor(nextReviewTime, nowTime, intervalDays);
    const freshness = clamp01((nextReviewTime - nowTime) / Math.max(DAY_MS, intervalDays * DAY_MS));
    const overdueMs = Math.max(0, nowTime - nextReviewTime);
    const priority = dueState === "overdue"
      ? 100 + Math.min(30, overdueMs / DAY_MS)
      : dueState === "due"
        ? 80
        : dueState === "due-soon"
          ? 50 + (1 - freshness) * 10
          : 10 + (1 - freshness) * 10;
    const recommendedMode = state.stage === "independent" ? "rebuild" : "blind-recognition";
    const statusWithoutExplanation: Omit<ProblemReviewStatus, "explanation"> = {
      exerciseId: state.exerciseId,
      independenceStage: state.stage,
      anchorAt,
      lastReviewedAt,
      nextReviewAt: new Date(nextReviewTime).toISOString(),
      intervalDays,
      sessions,
      successful,
      failed,
      dueState,
      freshness,
      overdueMs,
      priority,
      recommendedMode,
    };
    statuses[state.exerciseId] = {
      ...statusWithoutExplanation,
      explanation: explanationFor(statusWithoutExplanation),
    };
  }

  const values = Object.values(statuses);
  return {
    statuses,
    scheduled: values.length,
    dueSoon: values.filter((status) => status.dueState === "due-soon").length,
    due: values.filter((status) => status.dueState === "due").length,
    overdue: values.filter((status) => status.dueState === "overdue").length,
    averageFreshness: values.length
      ? values.reduce((sum, status) => sum + status.freshness, 0) / values.length
      : 0,
  };
}
