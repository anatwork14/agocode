import assert from "node:assert/strict";
import test from "node:test";
import {
  buildMonotonicReasoningEvidence,
  buildReasoningAttemptSummaries,
  classifyReasoningAttempt,
  readReasoningAttemptHistory,
  recordReasoningAttempt,
} from "../lib/learning/reasoning-attempts.ts";

function memoryStorage() {
  const values = new Map();
  return {
    getItem(key) { return values.get(key) ?? null; },
    setItem(key, value) { values.set(key, value); },
  };
}

function attempt(overrides = {}) {
  return {
    attemptId: "attempt-1",
    exerciseId: "problem-a",
    startedAt: "2026-09-01T00:00:00.000Z",
    finalizedAt: "2026-09-01T00:10:00.000Z",
    developedStages: 4,
    totalStages: 8,
    lensRevealed: true,
    ...overrides,
  };
}

test("classifies finalized reasoning attempts by objective evidence", () => {
  assert.equal(classifyReasoningAttempt(attempt()), "guided");
  assert.equal(classifyReasoningAttempt(attempt({ completedAt: "2026-09-01T00:09:00.000Z" })), "solved");
  assert.equal(classifyReasoningAttempt(attempt({
    developedStages: 6,
    lensRevealed: false,
    completedAt: "2026-09-01T00:09:00.000Z",
  })), "independent");
});

test("recording the same attempt id does not create duplicate evidence", () => {
  const storage = memoryStorage();
  recordReasoningAttempt(storage, attempt());
  recordReasoningAttempt(storage, attempt({
    developedStages: 7,
    completedAt: "2026-09-01T00:09:00.000Z",
    finalizedAt: "2026-09-01T00:12:00.000Z",
  }));

  const history = readReasoningAttemptHistory(storage);
  assert.equal(history.entries.length, 1);
  assert.equal(history.entries[0].developedStages, 7);
  assert.equal(history.entries[0].completedAt, "2026-09-01T00:09:00.000Z");
});

test("a weaker later write for the same attempt cannot erase stronger finalized proof", () => {
  const storage = memoryStorage();
  recordReasoningAttempt(storage, attempt({
    developedStages: 8,
    lensRevealed: false,
    completedAt: "2026-09-01T00:09:00.000Z",
  }));
  recordReasoningAttempt(storage, attempt({
    developedStages: 2,
    lensRevealed: true,
    completedAt: undefined,
    finalizedAt: "2026-09-01T00:20:00.000Z",
  }));

  const [entry] = readReasoningAttemptHistory(storage).entries;
  assert.equal(classifyReasoningAttempt(entry), "independent");
  assert.equal(entry.developedStages, 8);
  assert.equal(entry.lensRevealed, false);
});

test("monotonic aggregate preserves independent evidence after a weaker later attempt", () => {
  const history = {
    version: 1,
    entries: [
      attempt({
        attemptId: "guided",
        developedStages: 8,
        lensRevealed: true,
        completedAt: "2026-09-01T00:09:00.000Z",
      }),
      attempt({
        attemptId: "independent",
        startedAt: "2026-09-02T00:00:00.000Z",
        finalizedAt: "2026-09-02T00:10:00.000Z",
        developedStages: 8,
        lensRevealed: false,
        completedAt: "2026-09-02T00:09:00.000Z",
      }),
      attempt({
        attemptId: "later-guided",
        startedAt: "2026-09-03T00:00:00.000Z",
        finalizedAt: "2026-09-03T00:10:00.000Z",
        developedStages: 3,
        lensRevealed: true,
      }),
    ],
  };

  const evidence = buildMonotonicReasoningEvidence(history);
  assert.equal(evidence?.byExercise["problem-a"].developedStages, 8);
  assert.equal(evidence?.byExercise["problem-a"].lensRevealed, false);
  assert.equal(evidence?.byExercise["problem-a"].completedAt, "2026-09-02T00:09:00.000Z");
});

test("attempt summaries detect support reduction and time to independence", () => {
  const history = {
    version: 1,
    entries: [
      attempt({
        attemptId: "guided",
        finalizedAt: "2026-09-01T01:00:00.000Z",
        completedAt: "2026-09-01T00:50:00.000Z",
      }),
      attempt({
        attemptId: "independent",
        startedAt: "2026-09-02T00:00:00.000Z",
        finalizedAt: "2026-09-02T01:00:00.000Z",
        developedStages: 8,
        lensRevealed: false,
        completedAt: "2026-09-02T00:50:00.000Z",
      }),
    ],
  };

  const summary = buildReasoningAttemptSummaries(history)["problem-a"];
  assert.equal(summary.supportRemoved, true);
  assert.equal(summary.attemptsToIndependence, 2);
  assert.equal(summary.independentAttempts, 1);
  assert.equal(summary.timeToIndependenceMs, 25 * 60 * 60 * 1000);
});

test("later below-peak attempts are visible without changing the best stage", () => {
  const history = {
    version: 1,
    entries: [
      attempt({
        attemptId: "independent",
        developedStages: 8,
        lensRevealed: false,
        completedAt: "2026-09-01T00:09:00.000Z",
      }),
      attempt({
        attemptId: "retry",
        startedAt: "2026-09-02T00:00:00.000Z",
        finalizedAt: "2026-09-02T00:10:00.000Z",
        developedStages: 2,
        lensRevealed: true,
      }),
    ],
  };

  const summary = buildReasoningAttemptSummaries(history)["problem-a"];
  assert.equal(summary.bestStage, "independent");
  assert.equal(summary.latestStage, "guided");
  assert.equal(summary.belowPeak, true);
});

test("legacy latest-snapshot evidence remains available when no attempt ledger exists", () => {
  const evidence = buildMonotonicReasoningEvidence({ version: 1, entries: [] }, {
    byExercise: {
      "legacy-problem": {
        developedStages: 6,
        totalStages: 8,
        lensRevealed: false,
        completedAt: "2026-09-01T00:00:00.000Z",
        updatedAt: "2026-09-01T00:00:00.000Z",
      },
    },
  });

  assert.equal(evidence?.byExercise["legacy-problem"].completedAt, "2026-09-01T00:00:00.000Z");
  assert.equal(evidence?.byExercise["legacy-problem"].lensRevealed, false);
});
