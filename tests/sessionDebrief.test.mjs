import assert from "node:assert/strict";
import test from "node:test";
import { buildDailySessionDebrief } from "../lib/practice/session-debrief.ts";

function session(items) {
  return {
    version: 1,
    dayKey: "2026-09-26",
    seed: "daily-test",
    startedAt: "2026-09-26T10:00:00.000Z",
    generatedAt: "2026-09-26T10:00:00.000Z",
    updatedAt: "2026-09-26T10:00:00.000Z",
    regenerationCount: 0,
    familyCount: items.length,
    sourceCount: 1,
    dueRetrievalCount: items.filter((item) => item.role === "retrieve").length,
    items: items.map((item) => ({
      familyId: `family-${item.exerciseId}`,
      familyLabel: `Family ${item.exerciseId}`,
      reason: "test reason",
      href: `/exercises/${item.exerciseId}`,
      status: "pending",
      enteredAt: "2026-09-26T10:00:00.000Z",
      title: `Problem ${item.exerciseId}`,
      ...item,
    })),
  };
}

function attempt({
  attemptId,
  exerciseId,
  finalizedAt,
  lensRevealed,
  completed = true,
  developedStages = 8,
  totalStages = 8,
}) {
  return {
    attemptId,
    exerciseId,
    startedAt: finalizedAt,
    finalizedAt,
    developedStages,
    totalStages,
    lensRevealed,
    completedAt: completed ? finalizedAt : undefined,
  };
}

test("manual done without fresh evidence stays bookkeeping-only", () => {
  const debrief = buildDailySessionDebrief({
    session: session([{
      exerciseId: "p1",
      role: "weak-dimension",
      status: "done",
      completionMode: "manual",
      satisfiedAt: "2026-09-26T10:05:00.000Z",
    }]),
  });

  assert.equal(debrief.objectiveEvidenceCount, 0);
  assert.equal(debrief.bookkeepingOnlyCount, 1);
  assert.equal(debrief.items[0].outcome, "no-evidence");
  assert.match(debrief.items[0].explanation, /not learning evidence/i);
  assert.equal(debrief.carryForward.length, 1);
});

test("remove-support role detects independent evidence after earlier lens use", () => {
  const debrief = buildDailySessionDebrief({
    session: session([{ exerciseId: "p1", role: "remove-support", status: "done" }]),
    reasoningAttempts: {
      version: 1,
      entries: [
        attempt({
          attemptId: "guided-before",
          exerciseId: "p1",
          finalizedAt: "2026-09-26T09:00:00.000Z",
          lensRevealed: true,
        }),
        attempt({
          attemptId: "independent-now",
          exerciseId: "p1",
          finalizedAt: "2026-09-26T10:30:00.000Z",
          lensRevealed: false,
        }),
      ],
    },
  });

  assert.equal(debrief.items[0].outcome, "confirmed");
  assert.equal(debrief.items[0].primarySignal, "independent-solve");
  assert.equal(debrief.items[0].supportRemoved, true);
  assert.equal(debrief.supportRemovedCount, 1);
});

test("first-try retrieval confirms a retrieval role", () => {
  const debrief = buildDailySessionDebrief({
    session: session([{ exerciseId: "p2", role: "retrieve", status: "done", completionMode: "objective" }]),
    recognitionHistory: {
      version: 1,
      entries: [{ exerciseId: "p2", recognizedAt: "2026-09-26T10:20:00.000Z", firstTry: true }],
    },
  });

  assert.equal(debrief.items[0].outcome, "confirmed");
  assert.equal(debrief.items[0].primarySignal, "retrieval-hit");
  assert.equal(debrief.retrievalHits, 1);
  assert.equal(debrief.retrievalMisses, 0);
});

test("objective retrieval can clear the practice contract while a later miss remains needs-work", () => {
  const debrief = buildDailySessionDebrief({
    session: session([{
      exerciseId: "p3",
      role: "retrieve",
      status: "done",
      completionMode: "objective",
      satisfiedAt: "2026-09-26T10:10:00.000Z",
    }]),
    recognitionHistory: {
      version: 1,
      entries: [
        { exerciseId: "p3", recognizedAt: "2026-09-26T10:10:00.000Z", firstTry: true },
        { exerciseId: "p3", recognizedAt: "2026-09-26T10:40:00.000Z", firstTry: false },
      ],
    },
  });

  assert.equal(debrief.items[0].outcome, "needs-work");
  assert.equal(debrief.retrievalHits, 1);
  assert.equal(debrief.retrievalMisses, 1);
  assert.equal(debrief.carryForward.length, 1);
});

test("events before a requeued row's enteredAt boundary are ignored", () => {
  const debrief = buildDailySessionDebrief({
    session: session([{
      exerciseId: "p4",
      role: "retrieve",
      status: "pending",
      enteredAt: "2026-09-26T10:30:00.000Z",
    }]),
    recognitionHistory: {
      version: 1,
      entries: [{ exerciseId: "p4", recognizedAt: "2026-09-26T10:20:00.000Z", firstTry: true }],
    },
  });

  assert.equal(debrief.items[0].outcome, "pending");
  assert.equal(debrief.items[0].primarySignal, "none");
  assert.equal(debrief.objectiveEvidenceCount, 0);
});

test("transfer is confirmed only when the fresh independent attempt also satisfies current transfer evidence", () => {
  const baseSession = session([{ exerciseId: "p5", role: "transfer", status: "done" }]);
  const reasoningAttempts = {
    version: 1,
    entries: [attempt({
      attemptId: "transfer-attempt",
      exerciseId: "p5",
      finalizedAt: "2026-09-26T10:25:00.000Z",
      lensRevealed: false,
    })],
  };

  const progress = buildDailySessionDebrief({ session: baseSession, reasoningAttempts });
  assert.equal(progress.items[0].outcome, "progress");
  assert.equal(progress.carryForward.length, 1);

  const confirmed = buildDailySessionDebrief({
    session: baseSession,
    reasoningAttempts,
    independenceStates: {
      p5: {
        exerciseId: "p5",
        stage: "transferred",
        rank: 5,
        label: "Transferred",
        explanation: "cross-context proof",
        nextRequirement: "recall later",
      },
    },
  });
  assert.equal(confirmed.items[0].outcome, "confirmed");
  assert.equal(confirmed.carryForward.length, 0);
});
