import assert from "node:assert/strict";
import test from "node:test";
import {
  evaluateDailyPracticeObjective,
  reconcileDailyPracticeSession,
} from "../lib/practice/daily-session-objectives.ts";

function item(role, overrides = {}) {
  return {
    exerciseId: "p1",
    title: "Problem p1",
    familyId: "family-1",
    familyLabel: "Family 1",
    role,
    reason: "reason",
    href: "/exercises/p1",
    status: "pending",
    enteredAt: "2026-09-26T10:00:00.000Z",
    ...overrides,
  };
}

function session(items) {
  return {
    version: 1,
    dayKey: "2026-09-26",
    seed: "today",
    startedAt: "2026-09-26T10:00:00.000Z",
    generatedAt: "2026-09-26T10:00:00.000Z",
    updatedAt: "2026-09-26T10:00:00.000Z",
    regenerationCount: 0,
    familyCount: items.length,
    sourceCount: 1,
    dueRetrievalCount: 0,
    items,
  };
}

function attempt({
  attemptId = "a1",
  exerciseId = "p1",
  finalizedAt = "2026-09-26T10:05:00.000Z",
  completed = true,
  lensRevealed = false,
  developedStages = 8,
  totalStages = 8,
} = {}) {
  return {
    attemptId,
    exerciseId,
    startedAt: "2026-09-26T10:01:00.000Z",
    finalizedAt,
    developedStages,
    totalStages,
    lensRevealed,
    completedAt: completed ? finalizedAt : undefined,
  };
}

function independence(stage = "independent", rank = 4) {
  return {
    states: {
      p1: {
        exerciseId: "p1",
        stage,
        rank,
        label: stage[0].toUpperCase() + stage.slice(1),
        explanation: "",
        nextRequirement: "",
        familyId: "family-1",
        completedAt: "2026-09-26T10:05:00.000Z",
      },
    },
    counts: { seen: 0, guided: 0, solved: 0, independent: 1, transferred: 0, recalled: 0 },
    tracked: 1,
    independentOrBetter: 1,
    transferredOrBetter: rank >= 5 ? 1 : 0,
    recalled: rank >= 6 ? 1 : 0,
  };
}

function evidence({ attempts = [], recognitions = [], stage = "independent", rank = 4 } = {}) {
  return {
    reasoningAttempts: { version: 1, entries: attempts },
    recognitionHistory: { version: 1, entries: recognitions },
    independence: independence(stage, rank),
  };
}

test("retrieval rows require fresh problem-recognition evidence", () => {
  const target = item("retrieve");
  const stale = evaluateDailyPracticeObjective(target, evidence({
    recognitions: [{ exerciseId: "p1", recognizedAt: "2026-09-26T09:59:00.000Z", firstTry: true }],
  }));
  assert.equal(stale.satisfied, false);

  const recovered = evaluateDailyPracticeObjective(target, evidence({
    recognitions: [{ exerciseId: "p1", recognizedAt: "2026-09-26T10:05:00.000Z", firstTry: false }],
  }));
  assert.equal(recovered.satisfied, true);
  assert.match(recovered.detail, /recovered after a miss/i);
});

test("recognition-repair rows use the same objective retrieval contract", () => {
  const result = evaluateDailyPracticeObjective(item("repair-recognition"), evidence({
    recognitions: [{ exerciseId: "p1", recognizedAt: "2026-09-26T10:03:00.000Z", firstTry: true }],
  }));
  assert.equal(result.satisfied, true);
  assert.match(result.requirement, /blind-recognition/i);
});

test("support-removal rows ignore guided or lens-assisted solves and require fresh independence", () => {
  const target = item("remove-support");
  const guided = evaluateDailyPracticeObjective(target, evidence({
    attempts: [attempt({ lensRevealed: true })],
  }));
  assert.equal(guided.satisfied, false);

  const independent = evaluateDailyPracticeObjective(target, evidence({
    attempts: [attempt({ lensRevealed: false, developedStages: 6, totalStages: 8 })],
  }));
  assert.equal(independent.satisfied, true);
  assert.match(independent.detail, /no-lens/i);
});

test("transfer rows require both a fresh independent solve and transferred-or-better state", () => {
  const target = item("transfer");
  const onlyIndependent = evaluateDailyPracticeObjective(target, evidence({
    attempts: [attempt()],
    stage: "independent",
    rank: 4,
  }));
  assert.equal(onlyIndependent.satisfied, false);

  const transferred = evaluateDailyPracticeObjective(target, evidence({
    attempts: [attempt()],
    stage: "transferred",
    rank: 5,
  }));
  assert.equal(transferred.satisfied, true);
  assert.match(transferred.detail, /transferred evidence/i);
});

test("weakness and diversify rows require fresh completed reasoning, not unfinished notebook activity", () => {
  const target = item("weak-dimension");
  const unfinished = evaluateDailyPracticeObjective(target, evidence({
    attempts: [attempt({ completed: false, developedStages: 4 })],
  }));
  assert.equal(unfinished.satisfied, false);

  const solved = evaluateDailyPracticeObjective(target, evidence({
    attempts: [attempt({ completed: true, lensRevealed: true })],
  }));
  assert.equal(solved.satisfied, true);
  assert.match(solved.detail, /completed reasoning attempt/i);
});

test("reconciliation upgrades skipped/manual rows to objective completion and can finish the queue", () => {
  const current = session([
    item("retrieve", {
      status: "skipped",
    }),
    item("remove-support", {
      exerciseId: "p2",
      familyId: "family-2",
      status: "done",
      completionMode: "manual",
      satisfiedAt: "2026-09-26T10:02:00.000Z",
      satisfactionDetail: "manual",
    }),
  ]);
  const result = reconcileDailyPracticeSession(current, {
    reasoningAttempts: {
      version: 1,
      entries: [attempt({ exerciseId: "p2", attemptId: "a2", finalizedAt: "2026-09-26T10:06:00.000Z" })],
    },
    recognitionHistory: {
      version: 1,
      entries: [{ exerciseId: "p1", recognizedAt: "2026-09-26T10:05:00.000Z", firstTry: true }],
    },
    independence: {
      ...independence(),
      states: {
        p1: independence().states.p1,
        p2: {
          ...independence().states.p1,
          exerciseId: "p2",
          familyId: "family-2",
        },
      },
    },
  }, "2026-09-26T10:07:00.000Z");

  assert.deepEqual(result.updatedExerciseIds.sort(), ["p1", "p2"]);
  assert.ok(result.session.items.every((entry) => entry.status === "done" && entry.completionMode === "objective"));
  assert.equal(result.session.completedAt, "2026-09-26T10:07:00.000Z");
});
