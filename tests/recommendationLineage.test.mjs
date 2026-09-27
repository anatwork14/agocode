import assert from "node:assert/strict";
import test from "node:test";

import {
  BASELINE_RECOMMENDATION_POLICY_ID,
  RECOMMENDATION_POLICY_EXPERIMENT_KEY,
  RECOMMENDATION_POLICY_LINEAGE_LIMIT,
  emptyRecommendationPolicyExperimentState,
  pauseRecommendationPolicyExperiment,
  readRecommendationPolicyExperimentState,
  resolveRecommendationPlannerPolicy,
  resumeRecommendationPolicyExperiment,
  startRecommendationPolicyExperiment,
} from "../lib/learning/recommendation-experiment.ts";
import { recordRecommendationPolicySnapshot } from "../lib/learning/recommendation-stability.ts";

function memoryStorage() {
  const data = new Map();
  return {
    getItem(key) { return data.has(key) ? data.get(key) : null; },
    setItem(key, value) { data.set(key, value); },
    removeItem(key) { data.delete(key); },
  };
}

function candidate(id = "candidate-v1-old") {
  return {
    id,
    createdAt: "2026-09-01T00:00:00.000Z",
    baselinePolicyId: BASELINE_RECOMMENDATION_POLICY_ID,
    adjustments: { "retrieval-overdue": 2, "combined-diversity": -2 },
    source: { matureSnapshottedChoices: 20, baselineStrongEvidenceRate: 50, suggestedChanges: 2 },
  };
}

function state(status = "running", id = "candidate-v1-old") {
  const policy = candidate(id);
  return {
    version: 1,
    defaultPolicyId: BASELINE_RECOMMENDATION_POLICY_ID,
    candidate: policy,
    experiment: {
      id: `experiment-${id}`,
      candidatePolicyId: policy.id,
      status,
      startedAt: "2026-09-01T01:00:00.000Z",
      ...(status === "completed" ? { completedAt: "2026-09-02T01:00:00.000Z" } : {}),
    },
  };
}

function auditWithChanges() {
  const reasons = [
    ["retrieval-overdue", 2, 12, 24],
    ["recognition-miss", 2, 10, 18],
    ["combined-diversity", -2, 9, -17],
    ["repeated-friction", 2, 8, 15],
  ].map(([reasonId, suggestedScoreDelta, matureChoices, strongEvidenceLift]) => ({
    reasonId,
    label: String(reasonId),
    matureChoices,
    followedThrough: matureChoices,
    strongEvidence: Math.max(0, matureChoices - 1),
    noEvidence: 0,
    followThroughRate: 100,
    strongEvidenceRate: 80,
    smoothedFollowThroughRate: 95,
    smoothedStrongEvidenceRate: 75,
    strongEvidenceLift,
    status: suggestedScoreDelta > 0 ? "promising" : "weak",
    suggestedScoreDelta,
    explanation: "test",
  }));
  return {
    choices: 20,
    snapshottedChoices: 20,
    matureSnapshottedChoices: 20,
    metadataCoverageRate: 100,
    baselineFollowThroughRate: 80,
    baselineStrongEvidenceRate: 50,
    eligibleReasons: reasons.length,
    suggestedChanges: reasons.length,
    minimumMatureChoices: 8,
    minimumReasonChoices: 5,
    reasons,
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

function seedStablePlannerStates(storage, count = 6) {
  for (let index = 0; index < count; index += 1) {
    recordRecommendationPolicySnapshot(storage, {
      mastery: mastery(),
      obstacles: { version: 1, events: [], counts: {} },
      recentExerciseIds: [],
      missedExerciseIds: [],
      recommendationHistoryIds: [`lineage-state-${index}`],
      difficultyCalibration: { bias: 0 },
      problemIndependence: {},
      problemReview: {},
      limit: 5,
    }, `2026-09-${String(index + 10).padStart(2, "0")}T00:00:00.000Z`);
  }
}

test("legacy version-1 experiment state without lineage remains valid", () => {
  const storage = memoryStorage();
  storage.setItem(RECOMMENDATION_POLICY_EXPERIMENT_KEY, JSON.stringify(state("completed")));
  const parsed = readRecommendationPolicyExperimentState(storage);
  assert.equal(parsed.candidate?.id, "candidate-v1-old");
  assert.equal(parsed.experiment?.status, "completed");
  assert.equal(parsed.lineage, undefined);
});

test("malformed lineage entries are ignored while valid lifecycle entries survive", () => {
  const storage = memoryStorage();
  const payload = state("completed");
  payload.lineage = [
    { broken: true },
    {
      version: 1,
      id: "event-valid",
      event: "candidate-promoted",
      occurredAt: "2026-09-02T01:00:00.000Z",
      candidatePolicyId: payload.candidate.id,
      candidateCreatedAt: payload.candidate.createdAt,
      adjustments: payload.candidate.adjustments,
      experimentId: payload.experiment.id,
      experimentStatus: "completed",
      defaultPolicyId: payload.candidate.id,
    },
  ];
  storage.setItem(RECOMMENDATION_POLICY_EXPERIMENT_KEY, JSON.stringify(payload));
  const parsed = readRecommendationPolicyExperimentState(storage);
  assert.equal(parsed.lineage?.length, 1);
  assert.equal(parsed.lineage?.[0].event, "candidate-promoted");
});

test("paused experiment cannot be replaced by a new policy cycle", () => {
  const storage = memoryStorage();
  const paused = state("paused");
  storage.setItem(RECOMMENDATION_POLICY_EXPERIMENT_KEY, JSON.stringify(paused));
  const result = startRecommendationPolicyExperiment(storage, auditWithChanges(), "2026-09-27T01:00:00.000Z");
  assert.equal(result.experiment?.id, paused.experiment.id);
  assert.equal(result.experiment?.status, "paused");
  assert.equal(result.candidate?.id, paused.candidate.id);
  assert.equal(result.lineage, undefined);
});

test("new experiment archives a pre-lineage completed cycle and records the new start", () => {
  const storage = memoryStorage();
  const previous = state("completed", "candidate-v1-legacy-cycle");
  storage.setItem(RECOMMENDATION_POLICY_EXPERIMENT_KEY, JSON.stringify(previous));
  seedStablePlannerStates(storage);

  const next = startRecommendationPolicyExperiment(storage, auditWithChanges(), "2026-09-27T01:00:00.000Z");
  assert.equal(next.experiment?.status, "running");
  assert.notEqual(next.candidate?.id, previous.candidate.id);
  assert.deepEqual(next.lineage?.map((entry) => entry.event), ["cycle-archived", "experiment-started"]);
  assert.equal(next.lineage?.[0].candidatePolicyId, previous.candidate.id);
  assert.equal(next.lineage?.[1].candidatePolicyId, next.candidate?.id);
});

test("pause and resume lifecycle events are persisted and bounded", () => {
  const storage = memoryStorage();
  storage.setItem(RECOMMENDATION_POLICY_EXPERIMENT_KEY, JSON.stringify(state("running")));

  for (let index = 0; index < RECOMMENDATION_POLICY_LINEAGE_LIMIT + 4; index += 1) {
    const day = String((index % 20) + 1).padStart(2, "0");
    pauseRecommendationPolicyExperiment(storage, `2026-10-${day}T01:00:00.000Z`);
    resumeRecommendationPolicyExperiment(storage, `2026-10-${day}T02:00:00.000Z`);
  }

  const parsed = readRecommendationPolicyExperimentState(storage);
  assert.equal(parsed.experiment?.status, "running");
  assert.equal(parsed.lineage?.length, RECOMMENDATION_POLICY_LINEAGE_LIMIT);
  assert.ok(parsed.lineage?.every((entry) => entry.event === "experiment-paused" || entry.event === "experiment-resumed"));
  assert.equal(new Set(parsed.lineage?.map((entry) => entry.id)).size, RECOMMENDATION_POLICY_LINEAGE_LIMIT);
});

test("planner resolution ignores lineage metadata", () => {
  const baselineState = state("running");
  const withLineage = {
    ...baselineState,
    lineage: [{
      version: 1,
      id: "event-old",
      event: "experiment-started",
      occurredAt: "2026-09-01T01:00:00.000Z",
      candidatePolicyId: baselineState.candidate.id,
      candidateCreatedAt: baselineState.candidate.createdAt,
      adjustments: baselineState.candidate.adjustments,
      experimentId: baselineState.experiment.id,
      experimentStatus: "running",
      defaultPolicyId: BASELINE_RECOMMENDATION_POLICY_ID,
    }],
  };
  const history = { version: 1, entries: [] };
  assert.deepEqual(
    resolveRecommendationPlannerPolicy(withLineage, history),
    resolveRecommendationPlannerPolicy(baselineState, history),
  );
});

test("empty or unknown experiment storage still fails closed to the baseline", () => {
  const storage = memoryStorage();
  assert.deepEqual(readRecommendationPolicyExperimentState(storage), emptyRecommendationPolicyExperimentState());
  storage.setItem(RECOMMENDATION_POLICY_EXPERIMENT_KEY, JSON.stringify({ version: 999, lineage: [{ event: "candidate-promoted" }] }));
  assert.deepEqual(readRecommendationPolicyExperimentState(storage), emptyRecommendationPolicyExperimentState());
});
