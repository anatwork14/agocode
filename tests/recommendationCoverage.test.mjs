import assert from "node:assert/strict";
import test from "node:test";

import {
  buildRecommendationPolicyCoverageAudit,
  summarizeRecommendationCoverageSamples,
} from "../lib/learning/recommendation-coverage.ts";
import {
  buildRecommendationPolicyStabilityAudit,
  readRecommendationPolicySnapshotHistory,
  recordRecommendationPolicySnapshot,
} from "../lib/learning/recommendation-stability.ts";

function sample(index, overrides = {}) {
  const base = {
    snapshotId: `state-${index}`,
    targetDimension: index < 3 ? "trace" : "rebuild",
    topChoiceSame: true,
    topFiveOverlap: 80,
    baseline: {
      family: ["search-selection", "sorting-transform", "graph-traversal", "hashing", "dynamic-programming"],
      source: ["goodrich", "epi", "skiena", "goodrich", "epi"],
      domain: ["Search", "Sorting", "Graphs", "Hashing", "Dynamic programming"],
      level: ["foundation", "core", "advanced", "core", "advanced"],
    },
    candidate: {
      family: ["search-selection", "sorting-transform", "graph-traversal", "hashing", "dynamic-programming"],
      source: ["goodrich", "epi", "skiena", "goodrich", "epi"],
      domain: ["Search", "Sorting", "Graphs", "Hashing", "Dynamic programming"],
      level: ["foundation", "core", "advanced", "core", "advanced"],
    },
  };
  return { ...base, ...overrides };
}

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
    recommendationHistoryIds: [`coverage-state-${index}`],
    difficultyCalibration: { bias: 0 },
    problemIndependence: {},
    problemReview: {},
    limit: 5,
  };
}

test("coverage guardrail cannot pass with fewer than six replay states", () => {
  const audit = summarizeRecommendationCoverageSamples({
    candidatePolicyId: "candidate-test",
    samples: Array.from({ length: 5 }, (_, index) => sample(index)),
  });
  assert.equal(audit.status, "insufficient");
  assert.equal(audit.launchEligible, false);
  assert.equal(audit.replayedSnapshots, 5);
});

test("balanced candidate exposure passes family, source, domain, level, and mastery cohort guardrails", () => {
  const audit = summarizeRecommendationCoverageSamples({
    candidatePolicyId: "candidate-test",
    samples: Array.from({ length: 6 }, (_, index) => sample(index)),
  });
  assert.equal(audit.status, "balanced");
  assert.equal(audit.launchEligible, true);
  assert.equal(audit.imbalancedAxes, 0);
  assert.equal(audit.imbalancedCohorts, 0);
  assert.ok(audit.axes.every((axis) => axis.uniqueRetention === 100 && axis.distributionDrift === 0));
});

test("candidate that starves a meaningful source and structural family is blocked even with six states", () => {
  const samples = Array.from({ length: 6 }, (_, index) => sample(index, {
    candidate: {
      family: ["search-selection", "sorting-transform", "graph-traversal", "hashing", "hashing"],
      source: ["goodrich", "epi", "goodrich", "goodrich", "epi"],
      domain: ["Search", "Sorting", "Graphs", "Hashing", "Hashing"],
      level: ["foundation", "core", "core", "core", "advanced"],
    },
  }));
  const audit = summarizeRecommendationCoverageSamples({ candidatePolicyId: "candidate-collapse", samples });
  const source = audit.axes.find((axis) => axis.axis === "source");
  const family = audit.axes.find((axis) => axis.axis === "family");
  assert.equal(audit.status, "imbalanced");
  assert.equal(audit.launchEligible, false);
  assert.equal(source?.status, "imbalanced");
  assert.ok(source?.starvedValues.includes("skiena"));
  assert.equal(family?.status, "imbalanced");
  assert.ok(family?.starvedValues.includes("dynamic-programming"));
});

test("one weakest-mastery cohort cannot absorb disproportionate shortlist churn", () => {
  const samples = [
    sample(0, { targetDimension: "recall", topChoiceSame: false, topFiveOverlap: 40 }),
    sample(1, { targetDimension: "recall", topChoiceSame: false, topFiveOverlap: 40 }),
    sample(2, { targetDimension: "trace" }),
    sample(3, { targetDimension: "trace" }),
    sample(4, { targetDimension: "rebuild" }),
    sample(5, { targetDimension: "rebuild" }),
  ];
  const audit = summarizeRecommendationCoverageSamples({ candidatePolicyId: "candidate-cohort", samples });
  const recall = audit.cohorts.find((cohort) => cohort.dimensionId === "recall");
  assert.equal(audit.status, "imbalanced");
  assert.equal(audit.imbalancedAxes, 0);
  assert.equal(audit.imbalancedCohorts, 1);
  assert.equal(recall?.status, "imbalanced");
  assert.equal(recall?.meanTopFiveOverlap, 40);
});

test("coverage audit consumes real Phase 7 replay results without a second recommendation engine", () => {
  const storage = memoryStorage();
  for (let index = 0; index < 6; index += 1) {
    recordRecommendationPolicySnapshot(storage, plannerInput(index), `2026-09-${String(index + 1).padStart(2, "0")}T00:00:00.000Z`);
  }
  const snapshots = readRecommendationPolicySnapshotHistory(storage);
  const stability = buildRecommendationPolicyStabilityAudit({
    candidate: { id: "candidate-real-coverage", adjustments: { "combined-diversity": 2 } },
    snapshots,
  });
  const coverage = buildRecommendationPolicyCoverageAudit({ stability, snapshots });
  assert.equal(coverage.available, true);
  assert.equal(coverage.candidatePolicyId, "candidate-real-coverage");
  assert.equal(coverage.replayedSnapshots, stability.comparisons.length);
  assert.equal(coverage.axes.length, 4);
  assert.ok(coverage.cohorts.some((cohort) => cohort.dimensionId === "trace"));
});
