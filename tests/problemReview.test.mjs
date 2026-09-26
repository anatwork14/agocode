import assert from "node:assert/strict";
import test from "node:test";
import {
  buildProblemReviewProfile,
  readProblemReviewHistory,
  recordProblemReviewOutcome,
} from "../lib/learning/problem-review.ts";

function memoryStorage() {
  const data = new Map();
  return {
    getItem(key) { return data.has(key) ? data.get(key) : null; },
    setItem(key, value) { data.set(key, value); },
  };
}

function independence(stage, completedAt = "2026-09-01T00:00:00.000Z", extra = {}) {
  const ranks = { seen: 1, guided: 2, solved: 3, independent: 4, transferred: 5, recalled: 6 };
  return {
    states: {
      problem: {
        exerciseId: "problem",
        stage,
        rank: ranks[stage],
        label: stage,
        explanation: "",
        nextRequirement: "",
        completedAt,
        ...extra,
      },
    },
    counts: { seen: 0, guided: 0, solved: 0, independent: 0, transferred: 0, recalled: 0 },
    tracked: 1,
    independentOrBetter: stage === "independent" || stage === "transferred" || stage === "recalled" ? 1 : 0,
    transferredOrBetter: stage === "transferred" || stage === "recalled" ? 1 : 0,
    recalled: stage === "recalled" ? 1 : 0,
  };
}

test("independent problems start with a two-day retrieval interval", () => {
  const profile = buildProblemReviewProfile({
    independence: independence("independent"),
    now: "2026-09-01T12:00:00.000Z",
  });
  const status = profile.statuses.problem;
  assert.equal(status.intervalDays, 2);
  assert.equal(status.nextReviewAt, "2026-09-03T00:00:00.000Z");
  assert.equal(status.dueState, "fresh");
});

test("staleness changes retrieval state without demoting independence", () => {
  const profile = buildProblemReviewProfile({
    independence: independence("independent"),
    now: "2026-09-06T00:00:00.000Z",
  });
  const status = profile.statuses.problem;
  assert.equal(status.independenceStage, "independent");
  assert.equal(status.dueState, "overdue");
  assert.equal(status.freshness, 0);
});

test("manual remembered retrieval expands the interval", () => {
  const profile = buildProblemReviewProfile({
    independence: independence("independent"),
    reviewHistory: {
      version: 1,
      entries: [{ exerciseId: "problem", outcome: "remembered", reviewedAt: "2026-09-03T00:00:00.000Z" }],
    },
    now: "2026-09-03T01:00:00.000Z",
  });
  const status = profile.statuses.problem;
  assert.equal(status.sessions, 1);
  assert.equal(status.successful, 1);
  assert.equal(status.intervalDays, 4);
  assert.equal(status.nextReviewAt, "2026-09-07T00:00:00.000Z");
});

test("needs-work retrieval resets the next interval to one day", () => {
  const profile = buildProblemReviewProfile({
    independence: independence("transferred"),
    reviewHistory: {
      version: 1,
      entries: [{ exerciseId: "problem", outcome: "needs-work", reviewedAt: "2026-09-05T00:00:00.000Z" }],
    },
    now: "2026-09-05T01:00:00.000Z",
  });
  const status = profile.statuses.problem;
  assert.equal(status.failed, 1);
  assert.equal(status.intervalDays, 1);
  assert.equal(status.nextReviewAt, "2026-09-06T00:00:00.000Z");
});

test("later blind recognition automatically updates retrieval spacing", () => {
  const profile = buildProblemReviewProfile({
    independence: independence("independent"),
    recognitionHistory: {
      version: 1,
      entries: [
        { exerciseId: "problem", recognizedAt: "2026-09-03T00:00:00.000Z", firstTry: true },
        { exerciseId: "problem", recognizedAt: "2026-09-07T00:00:00.000Z", firstTry: false },
      ],
    },
    now: "2026-09-07T01:00:00.000Z",
  });
  const status = profile.statuses.problem;
  assert.equal(status.sessions, 2);
  assert.equal(status.successful, 1);
  assert.equal(status.failed, 1);
  assert.equal(status.intervalDays, 1);
  assert.equal(status.nextReviewAt, "2026-09-08T00:00:00.000Z");
});

test("recalled problems anchor the next schedule at the recall event", () => {
  const profile = buildProblemReviewProfile({
    independence: independence("recalled", "2026-09-01T00:00:00.000Z", {
      recognitionAt: "2026-09-04T00:00:00.000Z",
    }),
    now: "2026-09-05T00:00:00.000Z",
  });
  const status = profile.statuses.problem;
  assert.equal(status.anchorAt, "2026-09-04T00:00:00.000Z");
  assert.equal(status.intervalDays, 7);
  assert.equal(status.nextReviewAt, "2026-09-11T00:00:00.000Z");
});

test("problem review history persists and deduplicates identical events", () => {
  const storage = memoryStorage();
  recordProblemReviewOutcome(storage, {
    exerciseId: "problem",
    outcome: "remembered",
    reviewedAt: "2026-09-03T00:00:00.000Z",
  });
  recordProblemReviewOutcome(storage, {
    exerciseId: "problem",
    outcome: "remembered",
    reviewedAt: "2026-09-03T00:00:00.000Z",
  });
  const history = readProblemReviewHistory(storage);
  assert.equal(history.entries.length, 1);
  assert.equal(history.entries[0].outcome, "remembered");
});
