import assert from "node:assert/strict";
import test from "node:test";
import { classifiedAtlasExercises } from "../lib/practice/atlas-recognition.ts";
import {
  buildAdaptiveRecommendations,
  readRecommendationHistory,
  recordRecommendationChoice,
} from "../lib/learning/recommendations.ts";

function mastery(weakestId = "transfer", overall = 52) {
  const ids = ["understand", "trace", "predict", "rebuild", "explain", "transfer", "recall"];
  const dimensions = ids.map((id) => ({
    id,
    label: id[0].toUpperCase() + id.slice(1),
    score: id === weakestId ? 24 : 62,
    evidenceCount: 3,
    completedCount: 2,
    band: id === weakestId ? "emerging" : "developing",
  }));
  return {
    overall,
    dimensions,
    weakest: dimensions.find((item) => item.id === weakestId),
    strongest: dimensions.find((item) => item.id !== weakestId),
  };
}

function obstacleEvidence(id, count) {
  return {
    version: 1,
    events: Array.from({ length: count }, (_, index) => ({
      id,
      selectedAt: `2026-09-${String(index + 1).padStart(2, "0")}T00:00:00.000Z`,
    })),
    counts: { [id]: count },
    lastSelected: id,
    lastSelectedAt: "2026-09-20T00:00:00.000Z",
  };
}

function memoryStorage() {
  const data = new Map();
  return {
    getItem(key) { return data.has(key) ? data.get(key) : null; },
    setItem(key, value) { data.set(key, value); },
    removeItem(key) { data.delete(key); },
  };
}

test("adaptive recommendations are deterministic for the same evidence and seed", () => {
  const input = {
    mastery: mastery("transfer"),
    obstacles: obstacleEvidence("graph-model", 3),
    limit: 5,
    seed: "same-seed",
  };
  const first = buildAdaptiveRecommendations(input).map((item) => item.exercise.id);
  const second = buildAdaptiveRecommendations(input).map((item) => item.exercise.id);
  assert.deepEqual(first, second);
});

test("the shortlist deliberately diversifies structural families", () => {
  const recommendations = buildAdaptiveRecommendations({
    mastery: mastery("transfer"),
    limit: 5,
    seed: "diversity",
  });
  assert.equal(recommendations.length, 5);
  assert.ok(new Set(recommendations.map((item) => item.familyId)).size >= 3);
  assert.ok(new Set(recommendations.map((item) => item.exercise.source)).size >= 2);
});

test("a recent blind-recognition miss is strongly eligible for retry", () => {
  const missed = classifiedAtlasExercises.find((item) => item.exercise.level !== "advanced");
  assert.ok(missed);
  const recommendations = buildAdaptiveRecommendations({
    mastery: mastery("predict"),
    missedExerciseIds: [missed.exercise.id],
    limit: 8,
    seed: "missed-retry",
  });
  const retry = recommendations.find((item) => item.exercise.id === missed.exercise.id);
  assert.ok(retry, "expected the missed exercise to remain in the adaptive shortlist");
  assert.ok(retry.reasons.some((reason) => reason.includes("blind-recognition miss")));
});

test("repeated DP-state friction surfaces a related structural family", () => {
  const recommendations = buildAdaptiveRecommendations({
    mastery: mastery("explain"),
    obstacles: obstacleEvidence("dp-state", 8),
    limit: 5,
    seed: "dp-friction",
  });
  assert.ok(
    recommendations.some((item) => item.familyId === "dynamic-programming" || item.familyId === "recursive-search"),
    "expected DP-state friction to influence the shortlist",
  );
  assert.ok(recommendations.some((item) => item.matchedObstacleIds.includes("dp-state")));
});

test("recommendation history persists choices without becoming mastery evidence", () => {
  const storage = memoryStorage();
  assert.deepEqual(readRecommendationHistory(storage).entries, []);
  recordRecommendationChoice(storage, "problem-a", "2026-09-01T00:00:00.000Z");
  recordRecommendationChoice(storage, "problem-b", "2026-09-02T00:00:00.000Z");
  const history = readRecommendationHistory(storage);
  assert.deepEqual(history.entries.map((entry) => entry.exerciseId), ["problem-a", "problem-b"]);
  assert.equal(history.version, 1);
});

test("an overdue recalled problem becomes eligible for adaptive retrieval again", () => {
  const candidate = classifiedAtlasExercises.find((item) => item.exercise.level !== "advanced");
  assert.ok(candidate);
  const exerciseId = candidate.exercise.id;
  const recommendations = buildAdaptiveRecommendations({
    mastery: mastery("recall", 52),
    problemIndependence: {
      [exerciseId]: {
        exerciseId,
        stage: "recalled",
        rank: 6,
        label: "Recalled",
        explanation: "",
        nextRequirement: "",
        familyId: candidate.family.id,
        completedAt: "2026-09-01T00:00:00.000Z",
        recognitionAt: "2026-09-03T00:00:00.000Z",
      },
    },
    problemReview: {
      [exerciseId]: {
        exerciseId,
        independenceStage: "recalled",
        anchorAt: "2026-09-03T00:00:00.000Z",
        nextReviewAt: "2026-09-10T00:00:00.000Z",
        intervalDays: 7,
        sessions: 0,
        successful: 0,
        failed: 0,
        dueState: "overdue",
        freshness: 0,
        overdueMs: 3 * 24 * 60 * 60 * 1000,
        priority: 103,
        recommendedMode: "blind-recognition",
        explanation: "",
      },
    },
    limit: 8,
    seed: "overdue-retrieval",
  });
  const retrieval = recommendations.find((item) => item.exercise.id === exerciseId);
  assert.ok(retrieval, "expected overdue recalled evidence to re-enter the shortlist");
  assert.ok(retrieval.reasons.some((reason) => reason.includes("overdue")));
});
