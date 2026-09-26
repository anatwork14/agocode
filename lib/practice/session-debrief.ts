import type {
  ProblemIndependenceStage,
  ProblemIndependenceState,
  ProblemRecognitionHistory,
} from "../learning/independence.ts";
import {
  classifyReasoningAttempt,
  type ReasoningAttemptEntry,
  type ReasoningAttemptHistory,
} from "../learning/reasoning-attempts.ts";
import type { DailyPracticeSession, DailyPracticeSessionItem } from "./daily-session.ts";

export type SessionEvidenceSignal =
  | "independent-solve"
  | "solved-with-support"
  | "guided-attempt"
  | "retrieval-hit"
  | "retrieval-miss"
  | "none";

export type SessionDebriefOutcome =
  | "confirmed"
  | "progress"
  | "needs-work"
  | "no-evidence"
  | "skipped"
  | "pending";

export type SessionDebriefItem = {
  exerciseId: string;
  title: string;
  role: DailyPracticeSessionItem["role"];
  status: DailyPracticeSessionItem["status"];
  outcome: SessionDebriefOutcome;
  primarySignal: SessionEvidenceSignal;
  signals: SessionEvidenceSignal[];
  observedAt?: string;
  objectiveEvidenceRecorded: boolean;
  supportRemoved: boolean;
  currentStage?: ProblemIndependenceStage;
  explanation: string;
  carryForwardReason?: string;
};

export type DailySessionDebrief = {
  startedAt: string;
  items: SessionDebriefItem[];
  objectiveEvidenceCount: number;
  confirmedCount: number;
  needsWorkCount: number;
  supportRemovedCount: number;
  retrievalHits: number;
  retrievalMisses: number;
  bookkeepingOnlyCount: number;
  carryForward: SessionDebriefItem[];
};

type BuildDailySessionDebriefInput = {
  session: DailyPracticeSession;
  reasoningAttempts?: ReasoningAttemptHistory | null;
  recognitionHistory?: ProblemRecognitionHistory | null;
  independenceStates?: Record<string, ProblemIndependenceState>;
};

type EvidenceEvent = {
  signal: Exclude<SessionEvidenceSignal, "none">;
  at: string;
  rank: number;
};

export const sessionDebriefOutcomeLabels: Record<SessionDebriefOutcome, string> = {
  confirmed: "Objective proof",
  progress: "Progress recorded",
  "needs-work": "Needs another pass",
  "no-evidence": "No objective proof",
  skipped: "Skipped today",
  pending: "Still pending",
};

export const sessionEvidenceSignalLabels: Record<SessionEvidenceSignal, string> = {
  "independent-solve": "independent solve",
  "solved-with-support": "completed with support",
  "guided-attempt": "guided attempt",
  "retrieval-hit": "first-try retrieval",
  "retrieval-miss": "retrieval miss",
  none: "no objective event",
};

function timeOf(value: string) {
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : Number.NaN;
}

function afterRowEntered(at: string, enteredAt: string) {
  const eventTime = timeOf(at);
  const boundaryTime = timeOf(enteredAt);
  return Number.isFinite(eventTime) && Number.isFinite(boundaryTime) && eventTime > boundaryTime;
}

function reasoningEvent(entry: ReasoningAttemptEntry): EvidenceEvent {
  const stage = classifyReasoningAttempt(entry);
  if (stage === "independent") {
    return { signal: "independent-solve", at: entry.finalizedAt, rank: 5 };
  }
  if (stage === "solved") {
    return { signal: "solved-with-support", at: entry.finalizedAt, rank: 3 };
  }
  return { signal: "guided-attempt", at: entry.finalizedAt, rank: 2 };
}

function strongestEvent(events: EvidenceEvent[]) {
  return events.reduce<EvidenceEvent | undefined>((best, event) => {
    if (!best) return event;
    if (event.rank !== best.rank) return event.rank > best.rank ? event : best;
    return timeOf(event.at) > timeOf(best.at) ? event : best;
  }, undefined);
}

function latestRecognition(events: EvidenceEvent[]) {
  return events
    .filter((event) => event.signal === "retrieval-hit" || event.signal === "retrieval-miss")
    .sort((a, b) => timeOf(a.at) - timeOf(b.at))
    .at(-1);
}

function outcomeFor(
  item: DailyPracticeSessionItem,
  events: EvidenceEvent[],
  currentStage: ProblemIndependenceStage | undefined,
): SessionDebriefOutcome {
  if (!events.length) {
    if (item.status === "done") return "no-evidence";
    if (item.status === "skipped") return "skipped";
    return "pending";
  }

  const signals = new Set(events.map((event) => event.signal));
  const independent = signals.has("independent-solve");
  const solved = signals.has("solved-with-support");
  const guided = signals.has("guided-attempt");
  const recognition = latestRecognition(events)?.signal;

  if (item.role === "retrieve") {
    if (recognition === "retrieval-hit" || independent) return "confirmed";
    if (recognition === "retrieval-miss") return "needs-work";
    return solved || guided ? "progress" : "needs-work";
  }

  if (item.role === "repair-recognition") {
    if (recognition === "retrieval-hit") return "confirmed";
    if (recognition === "retrieval-miss") return "needs-work";
    return independent || solved || guided ? "progress" : "needs-work";
  }

  if (item.role === "remove-support") {
    if (independent) return "confirmed";
    if (recognition === "retrieval-miss" && !solved && !guided) return "needs-work";
    return "progress";
  }

  if (item.role === "transfer") {
    if (independent && (currentStage === "transferred" || currentStage === "recalled")) return "confirmed";
    if (recognition === "retrieval-miss" && !independent && !solved) return "needs-work";
    return "progress";
  }

  if (independent || solved || recognition === "retrieval-hit") return "confirmed";
  if (recognition === "retrieval-miss") return "needs-work";
  return "progress";
}

function explanationFor(
  item: DailyPracticeSessionItem,
  primary: EvidenceEvent | undefined,
  outcome: SessionDebriefOutcome,
  supportRemoved: boolean,
  currentStage: ProblemIndependenceStage | undefined,
) {
  if (!primary) {
    if (outcome === "no-evidence") {
      return item.completionMode === "manual"
        ? "This row was manually cleared, but AgoCode cannot find a fresh reasoning or retrieval event after the row entered the plan. Manual workflow completion is not learning evidence."
        : "This row is cleared, but its bounded local evidence history no longer exposes the fresh event needed to audit that claim. AgoCode does not infer mastery from the checkmark alone.";
    }
    if (outcome === "skipped") return "No learning claim is made for a skipped row.";
    return "No fresh reasoning or retrieval event has been recorded since this row entered the current plan.";
  }

  if (primary.signal === "independent-solve") {
    if (supportRemoved) {
      return "An independent reasoning attempt followed earlier lens-supported work. This is direct evidence that support was removed.";
    }
    if (item.role === "transfer" && (currentStage === "transferred" || currentStage === "recalled")) {
      return "A fresh independent solve was recorded and this problem currently satisfies the cross-context transfer requirement.";
    }
    return "A fresh independent reasoning attempt was completed with sufficient stage coverage and without revealing the structural lens.";
  }
  if (primary.signal === "retrieval-hit") {
    return "A fresh blind-recognition event was correct on the first try after this row entered the plan.";
  }
  if (primary.signal === "solved-with-support") {
    return "A fresh complete reasoning attempt was recorded, but support use or coverage still prevents an independence claim.";
  }
  if (primary.signal === "guided-attempt") {
    return "A fresh meaningful reasoning attempt was recorded, but it did not yet reach a complete independent solution.";
  }
  return "A fresh blind-recognition attempt missed on the first try. The attempt satisfies the practice contract, but the retrieval quality still needs repair.";
}

function carryForwardReasonFor(item: SessionDebriefItem) {
  if (item.outcome === "no-evidence") {
    return "Cleared without auditable objective evidence; reopen it before treating the work as learned.";
  }
  if (item.outcome === "skipped") return "Skipped today; reconsider it when the next session is generated.";
  if (item.outcome === "needs-work") {
    return item.primarySignal === "retrieval-miss"
      ? "Retrieval missed; schedule another delayed attempt rather than converting completion into mastery."
      : "The role-specific proof was not met yet.";
  }
  if (item.outcome === "progress" && item.role === "remove-support") {
    return "The attempt progressed, but independent no-lens evidence is still missing.";
  }
  if (item.outcome === "progress" && item.role === "transfer") {
    return "The attempt progressed, but cross-context transfer is not yet objectively demonstrated.";
  }
  return undefined;
}

export function buildDailySessionDebrief(input: BuildDailySessionDebriefInput): DailySessionDebrief {
  const reasoningEntries = input.reasoningAttempts?.entries ?? [];
  const recognitionEntries = input.recognitionHistory?.entries ?? [];

  const items = input.session.items.map((item): SessionDebriefItem => {
    const exerciseAttempts = reasoningEntries
      .filter((entry) => entry.exerciseId === item.exerciseId)
      .sort((a, b) => timeOf(a.finalizedAt) - timeOf(b.finalizedAt));
    const rowAttempts = exerciseAttempts
      .filter((entry) => afterRowEntered(entry.finalizedAt, item.enteredAt));
    const rowRecognition = recognitionEntries
      .filter((entry) => entry.exerciseId === item.exerciseId && afterRowEntered(entry.recognizedAt, item.enteredAt))
      .map((entry): EvidenceEvent => ({
        signal: entry.firstTry ? "retrieval-hit" : "retrieval-miss",
        at: entry.recognizedAt,
        rank: entry.firstTry ? 4 : 1,
      }));
    const reasoningEvents = rowAttempts.map(reasoningEvent);
    const events = [...reasoningEvents, ...rowRecognition];
    const primary = strongestEvent(events);
    const signals = Array.from(new Set(events.map((event) => event.signal)));
    const independentAttempt = rowAttempts.find((entry) => classifyReasoningAttempt(entry) === "independent");
    const independentTime = independentAttempt ? timeOf(independentAttempt.finalizedAt) : Number.NaN;
    const supportRemoved = Boolean(independentAttempt && exerciseAttempts.some((entry) => (
      entry.lensRevealed
      && Number.isFinite(independentTime)
      && timeOf(entry.finalizedAt) < independentTime
    )));
    const currentStage = input.independenceStates?.[item.exerciseId]?.stage;
    const outcome = outcomeFor(item, events, currentStage);
    const draft: SessionDebriefItem = {
      exerciseId: item.exerciseId,
      title: item.title,
      role: item.role,
      status: item.status,
      outcome,
      primarySignal: primary?.signal ?? "none",
      signals: signals.length ? signals : ["none"],
      observedAt: primary?.at,
      objectiveEvidenceRecorded: events.length > 0,
      supportRemoved,
      currentStage,
      explanation: explanationFor(item, primary, outcome, supportRemoved, currentStage),
    };
    return { ...draft, carryForwardReason: carryForwardReasonFor(draft) };
  });

  const carryForward = items.filter((item) => Boolean(item.carryForwardReason));
  return {
    startedAt: input.session.startedAt,
    items,
    objectiveEvidenceCount: items.filter((item) => item.objectiveEvidenceRecorded).length,
    confirmedCount: items.filter((item) => item.outcome === "confirmed").length,
    needsWorkCount: items.filter((item) => item.outcome === "needs-work" || item.outcome === "no-evidence").length,
    supportRemovedCount: items.filter((item) => item.supportRemoved).length,
    retrievalHits: items.filter((item) => item.signals.includes("retrieval-hit")).length,
    retrievalMisses: items.filter((item) => item.signals.includes("retrieval-miss")).length,
    bookkeepingOnlyCount: items.filter((item) => (
      item.status === "done"
      && item.outcome === "no-evidence"
    )).length,
    carryForward,
  };
}
