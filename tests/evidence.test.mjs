import assert from "node:assert/strict";
import test from "node:test";
import {
  readLearningEvidence,
  recordExplanationCompletion,
  recordLearningAttempt,
  recordPredictionAttempt,
  recordRecallOutcome,
  recordRecognitionCompletion,
} from "../lib/learning/evidence.ts";

function makeStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem(key) {
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      values.set(key, value);
    },
  };
}

test("legacy completion records remain readable", () => {
  const storage = makeStorage({
    legacy: JSON.stringify({ completedAt: "2026-09-20T00:00:00.000Z", exerciseId: "binary-search" }),
  });

  const evidence = readLearningEvidence(storage, "legacy");
  assert.ok(evidence);
  assert.equal(evidence.completedAt, "2026-09-20T00:00:00.000Z");
  assert.equal(evidence.exerciseId, "binary-search");
  assert.deepEqual(evidence.attempts, []);
});

test("early mixed-recognition records migrate score into structured evidence", () => {
  const storage = makeStorage({
    mixed: JSON.stringify({
      completedAt: "2026-09-21T00:00:00.000Z",
      exerciseId: "mixed-pattern-recognition",
      score: 7,
      total: 10,
    }),
  });

  const evidence = readLearningEvidence(storage, "mixed");
  assert.ok(evidence?.recognition);
  assert.equal(evidence.recognition.sessions, 1);
  assert.equal(evidence.recognition.bestFirstTryCorrect, 7);
  assert.equal(evidence.recognition.lastFirstTryCorrect, 7);
  assert.equal(evidence.recognition.totalScenarios, 10);
});

test("attempt history records failures and first successful completion", () => {
  const storage = makeStorage();

  recordLearningAttempt(storage, "exercise", {
    exerciseId: "exercise",
    attemptedAt: "2026-09-20T00:00:00.000Z",
    passed: false,
    passedCount: 3,
    totalTests: 5,
    hintCount: 2,
    runtimeError: false,
  });

  const completed = recordLearningAttempt(storage, "exercise", {
    exerciseId: "exercise",
    attemptedAt: "2026-09-20T00:05:00.000Z",
    passed: true,
    passedCount: 5,
    totalTests: 5,
    hintCount: 1,
    runtimeError: false,
  });

  assert.equal(completed.attempts.length, 2);
  assert.equal(completed.bestPassedCount, 5);
  assert.equal(completed.completedAt, "2026-09-20T00:05:00.000Z");
  assert.equal(completed.lowestHintCountOnPass, 1);
});

test("later successful attempts do not reset the original completion time", () => {
  const storage = makeStorage();

  recordLearningAttempt(storage, "exercise", {
    exerciseId: "exercise",
    attemptedAt: "2026-09-20T00:00:00.000Z",
    passed: true,
    passedCount: 5,
    totalTests: 5,
    hintCount: 3,
    runtimeError: false,
  });

  const later = recordLearningAttempt(storage, "exercise", {
    exerciseId: "exercise",
    attemptedAt: "2026-09-22T00:00:00.000Z",
    passed: true,
    passedCount: 5,
    totalTests: 5,
    hintCount: 0,
    runtimeError: false,
  });

  assert.equal(later.completedAt, "2026-09-20T00:00:00.000Z");
  assert.equal(later.lowestHintCountOnPass, 0);
});

test("recognition sessions preserve the first completion and best first-try score", () => {
  const storage = makeStorage();

  recordRecognitionCompletion(storage, "mixed", {
    exerciseId: "mixed-pattern-recognition",
    completedAt: "2026-09-20T00:00:00.000Z",
    firstTryCorrect: 6,
    totalScenarios: 10,
  });

  const later = recordRecognitionCompletion(storage, "mixed", {
    exerciseId: "mixed-pattern-recognition",
    completedAt: "2026-09-27T00:00:00.000Z",
    firstTryCorrect: 9,
    totalScenarios: 10,
  });

  assert.equal(later.completedAt, "2026-09-20T00:00:00.000Z");
  assert.ok(later.recognition);
  assert.equal(later.recognition.sessions, 2);
  assert.equal(later.recognition.lastFirstTryCorrect, 9);
  assert.equal(later.recognition.bestFirstTryCorrect, 9);
  assert.equal(later.recognition.totalScenarios, 10);
});

test("recognition evidence accumulates technique results and replaces the recent miss set", () => {
  const storage = makeStorage();

  recordRecognitionCompletion(storage, "mixed", {
    exerciseId: "mixed-pattern-recognition",
    firstTryCorrect: 7,
    totalScenarios: 10,
    techniqueResults: {
      "binary-search": { totalScenarios: 2, firstTryCorrect: 1 },
      bfs: { totalScenarios: 1, firstTryCorrect: 0 },
    },
    missedScenarioIds: ["server-capacity", "fewest-handoffs"],
  });

  const later = recordRecognitionCompletion(storage, "mixed", {
    exerciseId: "mixed-pattern-recognition",
    firstTryCorrect: 9,
    totalScenarios: 10,
    techniqueResults: {
      "binary-search": { totalScenarios: 2, firstTryCorrect: 2 },
      bfs: { totalScenarios: 1, firstTryCorrect: 1 },
    },
    missedScenarioIds: ["directory-threshold"],
  });

  assert.deepEqual(later.recognition?.byTechnique?.["binary-search"], {
    totalSeen: 4,
    firstTryCorrect: 3,
  });
  assert.deepEqual(later.recognition?.byTechnique?.bfs, {
    totalSeen: 2,
    firstTryCorrect: 1,
  });
  assert.deepEqual(later.recognition?.recentMissedScenarioIds, ["directory-threshold"]);
});

test("recognition score is clamped to the scenario count", () => {
  const storage = makeStorage();
  const evidence = recordRecognitionCompletion(storage, "mixed", {
    exerciseId: "mixed-pattern-recognition",
    firstTryCorrect: 15,
    totalScenarios: 10,
  });

  assert.equal(evidence.recognition?.lastFirstTryCorrect, 10);
});

test("prediction evidence tracks first-try accuracy and sessions", () => {
  const storage = makeStorage();

  recordPredictionAttempt(storage, "prediction", {
    exerciseId: "bfs-prediction",
    sessionId: "session-a",
    correct: true,
    answeredAt: "2026-09-20T00:00:00.000Z",
  });
  recordPredictionAttempt(storage, "prediction", {
    exerciseId: "bfs-prediction",
    sessionId: "session-a",
    correct: false,
    answeredAt: "2026-09-20T00:01:00.000Z",
  });
  const third = recordPredictionAttempt(storage, "prediction", {
    exerciseId: "bfs-prediction",
    sessionId: "session-b",
    correct: true,
    answeredAt: "2026-09-21T00:00:00.000Z",
  });

  assert.equal(third.prediction?.sessions, 2);
  assert.equal(third.prediction?.totalQuestions, 3);
  assert.equal(third.prediction?.correctFirstTry, 2);
  assert.equal(third.prediction?.bestStreak, 1);
  assert.equal(third.prediction?.lastAccuracy, 2 / 3);
  assert.equal(third.completedAt, "2026-09-21T00:00:00.000Z");
});

test("explanation evidence keeps best and average score", () => {
  const storage = makeStorage();

  recordExplanationCompletion(storage, "explain", {
    exerciseId: "binary-search-explain",
    score: 0.5,
    completed: true,
    completedAt: "2026-09-20T00:00:00.000Z",
  });
  const later = recordExplanationCompletion(storage, "explain", {
    exerciseId: "binary-search-explain",
    score: 0.9,
    completed: true,
    completedAt: "2026-09-21T00:00:00.000Z",
  });

  assert.equal(later.explanation?.sessions, 2);
  assert.equal(later.explanation?.completed, 2);
  assert.equal(later.explanation?.bestScore, 0.9);
  assert.equal(later.explanation?.averageScore, 0.7);
  assert.equal(later.completedAt, "2026-09-20T00:00:00.000Z");
});

test("recall outcomes expand successful intervals and reset weak recall", () => {
  const storage = makeStorage();

  const first = recordRecallOutcome(storage, "recall", {
    exerciseId: "binary-search-recall",
    outcome: "remembered",
    reviewedAt: "2026-09-20T00:00:00.000Z",
    baseIntervalDays: 2,
  });
  assert.equal(first.recall?.intervalDays, 2);
  assert.equal(first.recall?.nextReviewAt, "2026-09-22T00:00:00.000Z");

  const second = recordRecallOutcome(storage, "recall", {
    exerciseId: "binary-search-recall",
    outcome: "remembered",
    reviewedAt: "2026-09-22T00:00:00.000Z",
    baseIntervalDays: 2,
  });
  assert.equal(second.recall?.intervalDays, 4);

  const weak = recordRecallOutcome(storage, "recall", {
    exerciseId: "binary-search-recall",
    outcome: "needs-work",
    reviewedAt: "2026-09-26T00:00:00.000Z",
  });
  assert.equal(weak.recall?.intervalDays, 1);
  assert.equal(weak.recall?.failed, 1);
});

test("attempt history is bounded", () => {
  const storage = makeStorage();

  for (let index = 0; index < 55; index += 1) {
    recordLearningAttempt(storage, "exercise", {
      exerciseId: "exercise",
      attemptedAt: `2026-09-20T00:${String(index).padStart(2, "0")}:00.000Z`,
      passed: false,
      passedCount: index % 5,
      totalTests: 5,
      hintCount: 0,
      runtimeError: false,
    });
  }

  const evidence = readLearningEvidence(storage, "exercise");
  assert.ok(evidence);
  assert.equal(evidence.attempts.length, 50);
});
