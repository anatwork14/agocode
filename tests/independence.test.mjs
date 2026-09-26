import assert from "node:assert/strict";
import test from "node:test";
import { classifiedAtlasExercises } from "../lib/practice/atlas-recognition.ts";
import {
  buildProblemIndependenceProfile,
  readProblemRecognitionHistory,
  recordProblemRecognitionSession,
} from "../lib/learning/independence.ts";

function memoryStorage() {
  const data = new Map();
  return {
    getItem(key) { return data.has(key) ? data.get(key) : null; },
    setItem(key, value) { data.set(key, value); },
  };
}

function reasoning(entries) {
  return { byExercise: entries };
}

test("recommendation history alone establishes seen, not solved", () => {
  const profile = buildProblemIndependenceProfile({
    recommendationHistory: {
      version: 1,
      entries: [{ exerciseId: "problem-a", chosenAt: "2026-09-01T00:00:00.000Z" }],
    },
  });
  assert.equal(profile.states["problem-a"]?.stage, "seen");
});

test("partial reasoning or structural-lens use establishes guided", () => {
  const profile = buildProblemIndependenceProfile({
    reasoning: reasoning({
      "problem-a": {
        developedStages: 3,
        totalStages: 8,
        lensRevealed: true,
        updatedAt: "2026-09-02T00:00:00.000Z",
      },
    }),
  });
  assert.equal(profile.states["problem-a"]?.stage, "guided");
});

test("completed guided work is solved but not independent", () => {
  const profile = buildProblemIndependenceProfile({
    reasoning: reasoning({
      "problem-a": {
        developedStages: 8,
        totalStages: 8,
        lensRevealed: true,
        completedAt: "2026-09-02T00:00:00.000Z",
        updatedAt: "2026-09-02T00:00:00.000Z",
      },
    }),
  });
  assert.equal(profile.states["problem-a"]?.stage, "solved");
});

test("substantial completion without the lens establishes independence", () => {
  const profile = buildProblemIndependenceProfile({
    reasoning: reasoning({
      "problem-a": {
        developedStages: 6,
        totalStages: 8,
        lensRevealed: false,
        completedAt: "2026-09-02T00:00:00.000Z",
        updatedAt: "2026-09-02T00:00:00.000Z",
      },
    }),
  });
  assert.equal(profile.states["problem-a"]?.stage, "independent");
});

test("independent structural neighbors across source or domain establish transfer", () => {
  let pair;
  for (const item of classifiedAtlasExercises) {
    const neighbor = classifiedAtlasExercises.find((candidate) => (
      candidate.exercise.id !== item.exercise.id
      && candidate.family.id === item.family.id
      && (candidate.exercise.source !== item.exercise.source || candidate.exercise.domain !== item.exercise.domain)
    ));
    if (neighbor) {
      pair = [item, neighbor];
      break;
    }
  }
  assert.ok(pair, "expected at least one cross-source/domain pair in the same structural family");
  const [first, second] = pair;
  const completed = (at) => ({
    developedStages: 8,
    totalStages: 8,
    lensRevealed: false,
    completedAt: at,
    updatedAt: at,
  });
  const profile = buildProblemIndependenceProfile({
    reasoning: reasoning({
      [first.exercise.id]: completed("2026-09-01T00:00:00.000Z"),
      [second.exercise.id]: completed("2026-09-02T00:00:00.000Z"),
    }),
  });
  assert.equal(profile.states[first.exercise.id]?.stage, "transferred");
  assert.equal(profile.states[second.exercise.id]?.stage, "transferred");
});

test("recognition history persists problem-level first-try outcomes", () => {
  const storage = memoryStorage();
  recordProblemRecognitionSession(storage, [
    { exerciseId: "a", firstTry: true },
    { exerciseId: "b", firstTry: false },
  ], "2026-09-03T00:00:00.000Z");
  assert.deepEqual(readProblemRecognitionHistory(storage).entries, [
    { exerciseId: "a", firstTry: true, recognizedAt: "2026-09-03T00:00:00.000Z" },
    { exerciseId: "b", firstTry: false, recognizedAt: "2026-09-03T00:00:00.000Z" },
  ]);
});

test("first-try recognition only becomes recall after the configured delay", () => {
  const profile = buildProblemIndependenceProfile({
    recallDelayMs: 24 * 60 * 60 * 1000,
    reasoning: reasoning({
      "problem-a": {
        developedStages: 8,
        totalStages: 8,
        lensRevealed: false,
        completedAt: "2026-09-01T00:00:00.000Z",
        updatedAt: "2026-09-01T00:00:00.000Z",
      },
    }),
    recognitionHistory: {
      version: 1,
      entries: [
        { exerciseId: "problem-a", firstTry: true, recognizedAt: "2026-09-01T12:00:00.000Z" },
        { exerciseId: "problem-a", firstTry: true, recognizedAt: "2026-09-03T00:00:00.000Z" },
      ],
    },
  });
  assert.equal(profile.states["problem-a"]?.stage, "recalled");
  assert.equal(profile.states["problem-a"]?.recognitionAt, "2026-09-03T00:00:00.000Z");
});
