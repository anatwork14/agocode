import type { ProblemIndependenceProfile, ProblemRecognitionHistory } from "../learning/independence.ts";
import { classifyReasoningAttempt, type ReasoningAttemptEntry, type ReasoningAttemptHistory } from "../learning/reasoning-attempts.ts";
import type { DailyPracticeSession, DailyPracticeSessionItem } from "./daily-session.ts";

export type DailyPracticeObjectiveEvidence = {
  reasoningAttempts: ReasoningAttemptHistory;
  recognitionHistory: ProblemRecognitionHistory;
  independence: ProblemIndependenceProfile;
};

export type DailyPracticeObjectiveResult = {
  satisfied: boolean;
  requirement: string;
  satisfiedAt?: string;
  detail?: string;
};

export type DailyPracticeReconciliation = {
  session: DailyPracticeSession;
  updatedExerciseIds: string[];
};

function time(value: string) {
  const parsed = new Date(value).getTime();
  return Number.isFinite(parsed) ? parsed : Number.NEGATIVE_INFINITY;
}

function after(value: string, boundary: string) {
  return time(value) > time(boundary);
}

function firstRecognitionAfter(item: DailyPracticeSessionItem, history: ProblemRecognitionHistory) {
  return history.entries
    .filter((entry) => entry.exerciseId === item.exerciseId && after(entry.recognizedAt, item.enteredAt))
    .sort((a, b) => a.recognizedAt.localeCompare(b.recognizedAt))[0];
}

function attemptsAfter(item: DailyPracticeSessionItem, history: ReasoningAttemptHistory) {
  return history.entries
    .filter((entry) => entry.exerciseId === item.exerciseId && after(entry.finalizedAt, item.enteredAt))
    .sort((a, b) => a.finalizedAt.localeCompare(b.finalizedAt));
}

function firstCompletedAttempt(attempts: ReasoningAttemptEntry[]) {
  return attempts.find((entry) => Boolean(entry.completedAt));
}

function firstIndependentAttempt(attempts: ReasoningAttemptEntry[]) {
  return attempts.find((entry) => classifyReasoningAttempt(entry) === "independent");
}

export function getDailyPracticeObjectiveRequirement(item: DailyPracticeSessionItem) {
  if (item.role === "retrieve") {
    return "Complete a fresh objective retrieval for this problem after it entered today's plan.";
  }
  if (item.role === "repair-recognition") {
    return "Recover the structural family in a fresh blind-recognition attempt after this row entered today's plan.";
  }
  if (item.role === "remove-support") {
    return "Finalize a fresh independent reasoning attempt with substantial coverage and without revealing the structural lens.";
  }
  if (item.role === "transfer") {
    return "Finalize a fresh independent solve that leaves this problem at transferred-or-recalled evidence.";
  }
  return "Finalize a fresh complete reasoning attempt after this row entered today's plan.";
}

export function evaluateDailyPracticeObjective(
  item: DailyPracticeSessionItem,
  evidence: DailyPracticeObjectiveEvidence,
): DailyPracticeObjectiveResult {
  const requirement = getDailyPracticeObjectiveRequirement(item);

  if (item.role === "retrieve" || item.role === "repair-recognition") {
    const recognition = firstRecognitionAfter(item, evidence.recognitionHistory);
    if (!recognition) return { satisfied: false, requirement };
    return {
      satisfied: true,
      requirement,
      satisfiedAt: recognition.recognizedAt,
      detail: recognition.firstTry
        ? "Fresh structural recognition was recorded correctly on the first try."
        : "Fresh structural recognition was recovered after a miss; the review scheduler still records the weaker retrieval outcome.",
    };
  }

  const attempts = attemptsAfter(item, evidence.reasoningAttempts);
  if (item.role === "remove-support") {
    const attempt = firstIndependentAttempt(attempts);
    if (!attempt) return { satisfied: false, requirement };
    return {
      satisfied: true,
      requirement,
      satisfiedAt: attempt.finalizedAt,
      detail: "A fresh independent no-lens reasoning attempt satisfied the support-removal requirement.",
    };
  }

  if (item.role === "transfer") {
    const attempt = firstIndependentAttempt(attempts);
    const state = evidence.independence.states[item.exerciseId];
    if (!attempt || !state || state.rank < 5) return { satisfied: false, requirement };
    return {
      satisfied: true,
      requirement,
      satisfiedAt: attempt.finalizedAt,
      detail: `A fresh independent solve now sits at ${state.label.toLowerCase()} evidence in its structural family.`,
    };
  }

  const attempt = firstCompletedAttempt(attempts);
  if (!attempt) return { satisfied: false, requirement };
  return {
    satisfied: true,
    requirement,
    satisfiedAt: attempt.finalizedAt,
    detail: `A fresh completed reasoning attempt was recorded (${classifyReasoningAttempt(attempt)} evidence).`,
  };
}

export function reconcileDailyPracticeSession(
  session: DailyPracticeSession,
  evidence: DailyPracticeObjectiveEvidence,
  reconciledAt = new Date().toISOString(),
): DailyPracticeReconciliation {
  const updatedExerciseIds: string[] = [];
  const items = session.items.map((item) => {
    const result = evaluateDailyPracticeObjective(item, evidence);
    if (!result.satisfied || !result.satisfiedAt) return item;

    const alreadyObjective = item.status === "done"
      && item.completionMode === "objective"
      && item.satisfiedAt === result.satisfiedAt
      && item.satisfactionDetail === result.detail;
    if (alreadyObjective) return item;

    updatedExerciseIds.push(item.exerciseId);
    return {
      ...item,
      status: "done" as const,
      completionMode: "objective" as const,
      satisfiedAt: result.satisfiedAt,
      satisfactionDetail: result.detail,
    };
  });

  if (!updatedExerciseIds.length) return { session, updatedExerciseIds };
  const pending = items.filter((item) => item.status === "pending").length;
  const next: DailyPracticeSession = {
    ...session,
    items,
    updatedAt: reconciledAt,
    completedAt: pending === 0 ? session.completedAt ?? reconciledAt : undefined,
  };
  return { session: next, updatedExerciseIds };
}
