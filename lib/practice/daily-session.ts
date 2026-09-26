import type { StorageLike } from "../learning/evidence.ts";
import type { MixedPracticeSession, MixedSessionItem, MixedSessionRole } from "./mixed-session.ts";

export const DAILY_PRACTICE_SESSION_KEY = "agocode.practice.daily-session";
export const DAILY_PRACTICE_HISTORY_LIMIT = 30;

export type DailyPracticeItemStatus = "pending" | "done" | "skipped";
export type DailyPracticeCompletionMode = "manual" | "objective";

export type DailyPracticeSessionItem = Pick<
  MixedSessionItem,
  "exerciseId" | "title" | "familyId" | "familyLabel" | "role" | "reason" | "href"
> & {
  status: DailyPracticeItemStatus;
  enteredAt: string;
  completionMode?: DailyPracticeCompletionMode;
  satisfiedAt?: string;
  satisfactionDetail?: string;
};

export type DailyPracticeSession = {
  version: 1;
  dayKey: string;
  seed: string;
  startedAt: string;
  generatedAt: string;
  updatedAt: string;
  regenerationCount: number;
  familyCount: number;
  sourceCount: number;
  dueRetrievalCount: number;
  items: DailyPracticeSessionItem[];
  completedAt?: string;
};

export type DailyPracticeSessionSummary = {
  dayKey: string;
  startedAt: string;
  updatedAt: string;
  completedAt?: string;
  total: number;
  done: number;
  objectiveDone: number;
  manualDone: number;
  skipped: number;
  regenerationCount: number;
};

export type DailyPracticeState = {
  version: 1;
  current?: DailyPracticeSession;
  history: DailyPracticeSessionSummary[];
};

export type DailyPracticeProgress = {
  total: number;
  done: number;
  objectiveDone: number;
  manualDone: number;
  skipped: number;
  pending: number;
  cleared: number;
  isComplete: boolean;
};

const validRoles = new Set<MixedSessionRole>([
  "retrieve",
  "repair-recognition",
  "remove-support",
  "transfer",
  "weak-dimension",
  "diversify",
]);
const validStatuses = new Set<DailyPracticeItemStatus>(["pending", "done", "skipped"]);
const validCompletionModes = new Set<DailyPracticeCompletionMode>(["manual", "objective"]);

function emptyState(): DailyPracticeState {
  return { version: 1, history: [] };
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function nonNegativeInteger(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

export function getLocalDayKey(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function isString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function parseItem(value: unknown, fallbackEnteredAt: string, fallbackSatisfiedAt: string): DailyPracticeSessionItem | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Partial<DailyPracticeSessionItem>;
  if (
    !isString(item.exerciseId) ||
    !isString(item.title) ||
    !isString(item.familyId) ||
    !isString(item.familyLabel) ||
    !isString(item.reason) ||
    !isString(item.href) ||
    !validRoles.has(item.role as MixedSessionRole) ||
    !validStatuses.has(item.status as DailyPracticeItemStatus)
  ) {
    return null;
  }

  const done = item.status === "done";
  const completionMode = done
    ? validCompletionModes.has(item.completionMode as DailyPracticeCompletionMode)
      ? item.completionMode as DailyPracticeCompletionMode
      : "manual"
    : undefined;

  return {
    exerciseId: item.exerciseId,
    title: item.title,
    familyId: item.familyId,
    familyLabel: item.familyLabel,
    role: item.role as MixedSessionRole,
    reason: item.reason,
    href: item.href,
    status: item.status,
    enteredAt: isString(item.enteredAt) ? item.enteredAt : fallbackEnteredAt,
    completionMode,
    satisfiedAt: done
      ? isString(item.satisfiedAt) ? item.satisfiedAt : fallbackSatisfiedAt
      : undefined,
    satisfactionDetail: done && isString(item.satisfactionDetail) ? item.satisfactionDetail : undefined,
  };
}

function parseSession(value: unknown): DailyPracticeSession | undefined {
  if (!value || typeof value !== "object") return undefined;
  const session = value as Partial<DailyPracticeSession>;
  if (
    session.version !== 1 ||
    !isString(session.dayKey) ||
    !isString(session.seed) ||
    !isString(session.startedAt) ||
    !isString(session.generatedAt) ||
    !isString(session.updatedAt) ||
    !Array.isArray(session.items)
  ) {
    return undefined;
  }
  const items = session.items
    .map((item) => parseItem(item, session.generatedAt!, session.updatedAt!))
    .filter((item): item is DailyPracticeSessionItem => Boolean(item));
  if (items.length !== session.items.length) return undefined;
  return {
    version: 1,
    dayKey: session.dayKey,
    seed: session.seed,
    startedAt: session.startedAt,
    generatedAt: session.generatedAt,
    updatedAt: session.updatedAt,
    regenerationCount: nonNegativeInteger(session.regenerationCount),
    familyCount: nonNegativeInteger(session.familyCount),
    sourceCount: nonNegativeInteger(session.sourceCount),
    dueRetrievalCount: nonNegativeInteger(session.dueRetrievalCount),
    items,
    completedAt: isString(session.completedAt) ? session.completedAt : undefined,
  };
}

function parseSummary(value: unknown): DailyPracticeSessionSummary | null {
  if (!value || typeof value !== "object") return null;
  const summary = value as Partial<DailyPracticeSessionSummary>;
  if (!isString(summary.dayKey) || !isString(summary.startedAt) || !isString(summary.updatedAt)) return null;
  const done = nonNegativeInteger(summary.done);
  const objectiveDone = nonNegativeInteger(summary.objectiveDone);
  const manualDone = typeof summary.manualDone === "number"
    ? nonNegativeInteger(summary.manualDone)
    : Math.max(0, done - objectiveDone);
  return {
    dayKey: summary.dayKey,
    startedAt: summary.startedAt,
    updatedAt: summary.updatedAt,
    completedAt: isString(summary.completedAt) ? summary.completedAt : undefined,
    total: nonNegativeInteger(summary.total),
    done,
    objectiveDone,
    manualDone,
    skipped: nonNegativeInteger(summary.skipped),
    regenerationCount: nonNegativeInteger(summary.regenerationCount),
  };
}

export function readDailyPracticeState(storage: StorageLike): DailyPracticeState {
  const raw = storage.getItem(DAILY_PRACTICE_SESSION_KEY);
  if (!raw) return emptyState();
  try {
    const parsed = JSON.parse(raw) as Partial<DailyPracticeState>;
    if (parsed.version !== 1) return emptyState();
    const current = parseSession(parsed.current);
    const history = Array.isArray(parsed.history)
      ? parsed.history.map(parseSummary).filter((entry): entry is DailyPracticeSessionSummary => Boolean(entry)).slice(-DAILY_PRACTICE_HISTORY_LIMIT)
      : [];
    return { version: 1, current, history };
  } catch {
    return emptyState();
  }
}

function writeState(storage: StorageLike, state: DailyPracticeState) {
  storage.setItem(DAILY_PRACTICE_SESSION_KEY, JSON.stringify(state));
}

export function saveCurrentDailyPracticeSession(storage: StorageLike, session: DailyPracticeSession) {
  const state = readDailyPracticeState(storage);
  if (state.current && state.current.dayKey !== session.dayKey) return state.current;
  writeState(storage, { ...state, current: session });
  return session;
}

export function getDailyPracticeProgress(session: DailyPracticeSession): DailyPracticeProgress {
  const doneItems = session.items.filter((item) => item.status === "done");
  const done = doneItems.length;
  const objectiveDone = doneItems.filter((item) => item.completionMode === "objective").length;
  const manualDone = doneItems.filter((item) => item.completionMode !== "objective").length;
  const skipped = session.items.filter((item) => item.status === "skipped").length;
  const total = session.items.length;
  const cleared = done + skipped;
  const pending = Math.max(0, total - cleared);
  return { total, done, objectiveDone, manualDone, skipped, pending, cleared, isComplete: total > 0 && pending === 0 };
}

function summarize(session: DailyPracticeSession): DailyPracticeSessionSummary {
  const progress = getDailyPracticeProgress(session);
  return {
    dayKey: session.dayKey,
    startedAt: session.startedAt,
    updatedAt: session.updatedAt,
    completedAt: session.completedAt,
    total: progress.total,
    done: progress.done,
    objectiveDone: progress.objectiveDone,
    manualDone: progress.manualDone,
    skipped: progress.skipped,
    regenerationCount: session.regenerationCount,
  };
}

function archive(history: DailyPracticeSessionSummary[], session: DailyPracticeSession) {
  const withoutSameDay = history.filter((entry) => entry.dayKey !== session.dayKey);
  return [...withoutSameDay, summarize(session)].slice(-DAILY_PRACTICE_HISTORY_LIMIT);
}

function snapshotItem(item: MixedSessionItem, enteredAt: string, previous?: DailyPracticeSession): DailyPracticeSessionItem {
  const old = previous?.items.find((candidate) => candidate.exerciseId === item.exerciseId);
  if (old?.status === "done") {
    return {
      exerciseId: item.exerciseId,
      title: item.title,
      familyId: item.familyId,
      familyLabel: item.familyLabel,
      role: item.role,
      reason: item.reason,
      href: item.href,
      status: "done",
      enteredAt: old.enteredAt,
      completionMode: old.completionMode,
      satisfiedAt: old.satisfiedAt,
      satisfactionDetail: old.satisfactionDetail,
    };
  }

  return {
    exerciseId: item.exerciseId,
    title: item.title,
    familyId: item.familyId,
    familyLabel: item.familyLabel,
    role: item.role,
    reason: item.reason,
    href: item.href,
    // Regeneration gives pending/skipped work a fresh evidence window; old events cannot clear the new row.
    status: "pending",
    enteredAt,
  };
}

function createSession(
  mixed: MixedPracticeSession,
  now: Date,
  previous?: DailyPracticeSession,
): DailyPracticeSession {
  const timestamp = now.toISOString();
  const items = mixed.items.map((item) => snapshotItem(item, timestamp, previous));
  const draft: DailyPracticeSession = {
    version: 1,
    dayKey: getLocalDayKey(now),
    seed: mixed.seed,
    startedAt: previous?.startedAt ?? timestamp,
    generatedAt: timestamp,
    updatedAt: timestamp,
    regenerationCount: previous ? previous.regenerationCount + 1 : 0,
    familyCount: mixed.familyCount,
    sourceCount: mixed.sourceCount,
    dueRetrievalCount: mixed.dueRetrievalCount,
    items,
  };
  if (getDailyPracticeProgress(draft).isComplete) draft.completedAt = previous?.completedAt ?? timestamp;
  return draft;
}

/**
 * Returns the learner's frozen plan for the local calendar day. New evidence may change
 * tomorrow's plan, but it does not silently reorder today's work on refresh.
 */
export function ensureDailyPracticeSession(
  storage: StorageLike,
  mixed: MixedPracticeSession,
  now = new Date(),
): DailyPracticeSession {
  const state = readDailyPracticeState(storage);
  const dayKey = getLocalDayKey(now);
  if (state.current?.dayKey === dayKey) return state.current;

  const history = state.current ? archive(state.history, state.current) : state.history;
  const current = createSession(mixed, now);
  writeState(storage, { version: 1, current, history });
  return current;
}

/** Explicitly rebuilds the remaining daily mix. Completed items stay completed when reused. */
export function regenerateDailyPracticeSession(
  storage: StorageLike,
  mixed: MixedPracticeSession,
  now = new Date(),
): DailyPracticeSession {
  const state = readDailyPracticeState(storage);
  const dayKey = getLocalDayKey(now);
  const sameDay = state.current?.dayKey === dayKey ? state.current : undefined;
  const history = state.current && !sameDay ? archive(state.history, state.current) : state.history;
  const current = createSession(mixed, now, sameDay);
  writeState(storage, { version: 1, current, history });
  return current;
}

/**
 * Updates only session bookkeeping. This function deliberately does not write mastery,
 * reasoning, recognition, or retrieval evidence. Re-queueing starts a fresh objective window.
 */
export function updateDailyPracticeItemStatus(
  storage: StorageLike,
  exerciseId: string,
  status: DailyPracticeItemStatus,
  now = new Date(),
): DailyPracticeSession | null {
  const state = readDailyPracticeState(storage);
  const current = state.current;
  if (!current || current.dayKey !== getLocalDayKey(now)) return null;
  const index = current.items.findIndex((item) => item.exerciseId === exerciseId);
  if (index < 0) return current;

  const timestamp = now.toISOString();
  const items = current.items.map((item, itemIndex) => {
    if (itemIndex !== index) return item;
    if (status === "done") {
      return {
        ...item,
        status,
        completionMode: "manual" as const,
        satisfiedAt: timestamp,
        satisfactionDetail: "Manually cleared for today's workflow; this does not create learning evidence.",
      };
    }
    if (status === "pending") {
      return {
        ...item,
        status,
        enteredAt: timestamp,
        completionMode: undefined,
        satisfiedAt: undefined,
        satisfactionDetail: undefined,
      };
    }
    return {
      ...item,
      status,
      completionMode: undefined,
      satisfiedAt: undefined,
      satisfactionDetail: undefined,
    };
  });
  const next: DailyPracticeSession = { ...current, items, updatedAt: timestamp, completedAt: undefined };
  const progress = getDailyPracticeProgress(next);
  if (progress.isComplete) next.completedAt = current.completedAt ?? timestamp;
  writeState(storage, { ...state, current: next });
  return next;
}
