import assert from "node:assert/strict";
import test from "node:test";

import {
  RECOMMENDATION_POLICY_SNAPSHOT_KEY,
  RECOMMENDATION_POLICY_SNAPSHOT_LIMIT,
  buildRecommendationPolicyStabilityAudit,
  readRecommendationPolicySnapshotHistory,
  recordRecommendationPolicySnapshot,
  summarizeRecommendationStabilityComparisons,
} from "../lib/learning/recommendation-stability.ts";

function memoryStorage() {
  const data = new Map();
  return {
    getItem(key) { return data.has(key) ? data.get(key) : null; },
    setItem(key, value) { data.set(key, value); },
    removeItem(key) { data.delete(key); },
  };
}

function mastery(overall = 52) {
  const ids = ["understand", "trace", "predict", "rebuild", "explain", "transfer", "recall"];
  const dimensions = ids.map((id) => ({
    id,
    label: id[0].toUpperCase() + id.slice(1),
    score: id === "trace" ? 24 : 62,
    evidenceCount: 3,
    completedCount: 2,
    band: id === "trace" ? "emerging" : "developing",
  }));
  return {
    overall,
    dimensions,
    weakest: dimensions.find((item) => item.id === "trace"),
    strongest: dimensions.find((item) => item.id !== "trace"),
  };
}

function plannerInput(index = 0) {
  return {
    mastery: mastery(),
    obstacles: { version: 1, events: [], counts: {} },
    recentExerciseIds: [],
    missedExerciseIds: [],
    recommendationHistoryIds: [`noncanonical-history-${index}`],
    difficultyCalibration: { bias: 0 },
    problemIndependence: {},
    problemReview: {},
    limit: 5,
  };
}

function comparison(index, overrides = {}) {
  return {
    snapshotId: `state-${index}`,
    recordedAt: `2026-09-${String(index + 1).padStart(2, "0")}T00:00:00.000Z`,
    topChoiceSame: true,
    topFiveOverlap: 80,
    familyOverlap: 80,
    rankDisplacement: 20,
    baselineTopIds: ["a", "b", "c", "d", "e"],
    candidateTopIds: ["a", "b", "c", "d", "f"],
    baselineFamilies: ["f1", "f2", "f3", "f4", "f5"],
    candidateFamilies: ["f1", "f2", "f3", "f4", "f6"],
    ...overrides,
  };
}

test("prospective planner-state history deduplicates identical state and stays bounded", () => {
  const storage = memoryStorage();
  const first = recordRecommendationPolicySnapshot(storage, plannerInput(0), "2026-09-01T00:00:00.000Z");
  const duplicate = recordRecommendationPolicySnapshot(storage, plannerInput(0), "2026-09-02T00:00:00.000Z");
  assert.equal(first.entries.length, 1);
  assert.equal(duplicate.entries.length, 1);
  assert.equal(duplicate.entries[0].recordedAt, "2026-09-01T00:00:00.000Z");

  for (let index = 1; index <= RECOMMENDATION_POLICY_SNAPSHOT_LIMIT + 3; index += 1) {
    recordRecommendationPolicySnapshot(storage, plannerInput(index), `2026-09-${String((index % 27) + 1).padStart(2, "0")}T00:00:00.000Z`);
  }
  const history = readRecommendationPolicySnapshotHistory(storage);
  assert.equal(history.entries.length, RECOMMENDATION_POLICY_SNAPSHOT_LIMIT);
  assert.equal(new Set(history.entries.map((entry) => entry.signature)).size, history.entries.length);
});

test("corrupt or unknown snapshot storage fails closed", () => {
  const storage = memoryStorage();
  storage.setItem(RECOMMENDATION_POLICY_SNAPSHOT_KEY, "{broken-json");
  assert.deepEqual(readRecommendationPolicySnapshotHistory(storage), { version: 1, entries: [] });

  storage.setItem(RECOMMENDATION_POLICY_SNAPSHOT_KEY, JSON.stringify({ version: 99, entries: [{ id: "bad" }] }));
  assert.deepEqual(readRecommendationPolicySnapshotHistory(storage), { version: 1, entries: [] });
});

test("counterfactual preflight cannot pass with fewer than six distinct replay states", () => {
  const comparisons = Array.from({ length: 5 }, (_, index) => comparison(index));
  const audit = summarizeRecommendationStabilityComparisons({
    candidatePolicyId: "candidate-test",
    comparisons,
  });
  assert.equal(audit.status, "insufficient");
  assert.equal(audit.launchEligible, false);
  assert.equal(audit.replayedSnapshots, 5);
});

test("stable counterfactual rankings pass the preflight gate", () => {
  const comparisons = Array.from({ length: 6 }, (_, index) => comparison(index));
  const audit = summarizeRecommendationStabilityComparisons({
    candidatePolicyId: "candidate-test",
    comparisons,
  });
  assert.equal(audit.status, "stable");
  assert.equal(audit.launchEligible, true);
  assert.equal(audit.topChoiceRetention, 100);
  assert.equal(audit.meanTopFiveOverlap, 80);
  assert.equal(audit.meanFamilyOverlap, 80);
  assert.equal(audit.highChurnRate, 0);
});

test("excessive shortlist, family, and rank churn blocks candidate launch", () => {
  const comparisons = Array.from({ length: 6 }, (_, index) => comparison(index, {
    topChoiceSame: false,
    topFiveOverlap: 40,
    familyOverlap: 40,
    rankDisplacement: 60,
  }));
  const audit = summarizeRecommendationStabilityComparisons({
    candidatePolicyId: "candidate-test",
    comparisons,
  });
  assert.equal(audit.status, "unstable");
  assert.equal(audit.launchEligible, false);
  assert.equal(audit.topChoiceRetention, 0);
  assert.equal(audit.highChurnRate, 100);
});

test("real baseline and candidate replay uses the same saved state and deterministic seed", () => {
  const storage = memoryStorage();
  for (let index = 0; index < 6; index += 1) {
    recordRecommendationPolicySnapshot(storage, plannerInput(index), `2026-09-${String(index + 1).padStart(2, "0")}T00:00:00.000Z`);
  }
  const audit = buildRecommendationPolicyStabilityAudit({
    candidate: {
      id: "candidate-replay-test",
      adjustments: { "combined-diversity": 2 },
    },
    snapshots: readRecommendationPolicySnapshotHistory(storage),
  });

  assert.equal(audit.available, true);
  assert.equal(audit.candidatePolicyId, "candidate-replay-test");
  assert.equal(audit.replayedSnapshots, 6);
  assert.equal(audit.invalidSnapshots, 0);
  assert.equal(audit.comparisons.length, 6);
  assert.ok(audit.comparisons.every((item) => item.baselineTopIds.length === 5 && item.candidateTopIds.length === 5));
});
