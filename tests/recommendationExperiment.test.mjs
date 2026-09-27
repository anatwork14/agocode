import assert from "node:assert/strict";
import test from "node:test";

import {
  BASELINE_RECOMMENDATION_POLICY_ID,
  RECOMMENDATION_POLICY_EXPERIMENT_KEY,
  buildRecommendationPolicyCandidate,
  buildRecommendationPolicyExperimentEvaluation,
  emptyRecommendationPolicyExperimentState,
  pauseRecommendationPolicyExperiment,
  promoteRecommendationPolicyCandidate,
  readRecommendationPolicyExperimentState,
  resolveRecommendationPlannerPolicy,
  resumeRecommendationPolicyExperiment,
  rollbackRecommendationPolicyCandidate,
  startRecommendationPolicyExperiment,
} from "../lib/learning/recommendation-experiment.ts";
import { recordRecommendationSelection } from "../lib/learning/recommendation-policy.ts";
import { recordRecommendationPolicySnapshot } from "../lib/learning/recommendation-stability.ts";
import { buildAdaptiveRecommendations } from "../lib/learning/recommendations.ts";

function memoryStorage() {
  const data = new Map();
  return {
    getItem(key) { return data.has(key) ? data.get(key) : null; },
    setItem(key, value) { data.set(key, value); },
    removeItem(key) { data.delete(key); },
  };
}

function auditWithChanges() {
  const reasons = [
    ["retrieval-overdue", 2, 12, 24],
    ["recognition-miss", 2, 10, 18],
    ["combined-diversity", -2, 9, -17],
    ["repeated-friction", 2, 8, 15],
    ["weakest-dimension", -2, 7, -13],
    ["other", 2, 20, 30],
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

function candidateState(status = "running") {
  const candidate = {
    id: "candidate-v1-test",
    createdAt: "2026-09-27T00:00:00.000Z",
    baselinePolicyId: BASELINE_RECOMMENDATION_POLICY_ID,
    adjustments: { "retrieval-overdue": 2, "combined-diversity": -2 },
    source: { matureSnapshottedChoices: 20, baselineStrongEvidenceRate: 50, suggestedChanges: 2 },
  };
  return {
    version: 1,
    defaultPolicyId: BASELINE_RECOMMENDATION_POLICY_ID,
    candidate,
    experiment: {
      id: "experiment-test",
      candidatePolicyId: candidate.id,
      status,
      startedAt: "2026-09-27T00:00:00.000Z",
    },
  };
}

function outcome(entry, status, strongEvidence = false) {
  return {
    exerciseId: entry.exerciseId,
    chosenAt: entry.chosenAt,
    windowEndsAt: "2026-10-10T00:00:00.000Z",
    status,
    strongEvidence,
    detail: "test",
  };
}

function outcomeAudit(outcomes) {
  const mature = outcomes.filter((item) => item.status !== "waiting");
  const followed = mature.filter((item) => item.status !== "no-evidence");
  const strong = mature.filter((item) => item.strongEvidence);
  return {
    choices: outcomes.length,
    matureChoices: mature.length,
    waiting: outcomes.length - mature.length,
    followedThrough: followed.length,
    strongEvidence: strong.length,
    noEvidence: mature.filter((item) => item.status === "no-evidence").length,
    followThroughRate: mature.length ? Math.round((followed.length / mature.length) * 100) : undefined,
    strongEvidenceRate: mature.length ? Math.round((strong.length / mature.length) * 100) : undefined,
    outcomes,
  };
}

function experimentRows(experimentId, count = 8) {
  const baseline = Array.from({ length: count }, (_, index) => ({
    exerciseId: `baseline-${index}`,
    chosenAt: `2026-09-${String(index + 1).padStart(2, "0")}T00:00:00.000Z`,
    experimentId,
    policyVariant: "baseline",
    policyId: BASELINE_RECOMMENDATION_POLICY_ID,
  }));
  const candidate = Array.from({ length: count }, (_, index) => ({
    exerciseId: `candidate-${index}`,
    chosenAt: `2026-09-${String(index + 11).padStart(2, "0")}T00:00:00.000Z`,
    experimentId,
    policyVariant: "candidate",
    policyId: "candidate-v1-test",
  }));
  return { baseline, candidate, entries: [...baseline, ...candidate] };
}

function mastery(weakestId = "trace", overall = 52) {
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

function seedStablePlannerStates(storage, count = 6) {
  for (let index = 0; index < count; index += 1) {
    recordRecommendationPolicySnapshot(storage, {
      mastery: mastery("trace", 52),
      obstacles: { version: 1, events: [], counts: {} },
      recentExerciseIds: [],
      missedExerciseIds: [],
      recommendationHistoryIds: [`noncanonical-history-${index}`],
      difficultyCalibration: { bias: 0 },
      problemIndependence: {},
      problemReview: {},
      limit: 5,
    }, `2026-09-${String(index + 1).padStart(2, "0")}T00:00:00.000Z`);
  }
}

test("candidate generation freezes at most four eligible non-zero rationale previews and excludes unknown rationale", () => {
  const candidate = buildRecommendationPolicyCandidate(auditWithChanges(), "2026-09-27T00:00:00.000Z");
  assert.ok(candidate);
  assert.equal(candidate.baselinePolicyId, BASELINE_RECOMMENDATION_POLICY_ID);
  assert.equal(Object.keys(candidate.adjustments).length, 4);
  assert.equal(candidate.adjustments.other, undefined);
  assert.equal(candidate.adjustments["retrieval-overdue"], 2);
  assert.match(candidate.id, /^candidate-v1-[0-9a-f]{8}$/);
});

test("experiment launch fails closed when prospective stability evidence is missing", () => {
  const storage = memoryStorage();
  const state = startRecommendationPolicyExperiment(storage, auditWithChanges(), "2026-09-27T01:00:00.000Z");
  assert.deepEqual(state, emptyRecommendationPolicyExperimentState());
  assert.equal(storage.getItem(RECOMMENDATION_POLICY_EXPERIMENT_KEY), null);
});

test("starting an experiment freezes the candidate only after counterfactual stability passes", () => {
  const storage = memoryStorage();
  seedStablePlannerStates(storage);
  const state = startRecommendationPolicyExperiment(storage, auditWithChanges(), "2026-09-27T01:00:00.000Z");
  assert.equal(state.defaultPolicyId, BASELINE_RECOMMENDATION_POLICY_ID);
  assert.equal(state.experiment?.status, "running");
  assert.equal(state.experiment?.candidatePolicyId, state.candidate?.id);
  assert.ok(storage.getItem(RECOMMENDATION_POLICY_EXPERIMENT_KEY));
});

test("corrupt or unknown experiment storage fails closed to the deterministic baseline", () => {
  const storage = memoryStorage();
  storage.setItem(RECOMMENDATION_POLICY_EXPERIMENT_KEY, "{broken");
  assert.deepEqual(readRecommendationPolicyExperimentState(storage), emptyRecommendationPolicyExperimentState());

  storage.setItem(RECOMMENDATION_POLICY_EXPERIMENT_KEY, JSON.stringify({ version: 999, defaultPolicyId: "candidate" }));
  assert.deepEqual(readRecommendationPolicyExperimentState(storage), emptyRecommendationPolicyExperimentState());
});

test("running experiment assignments alternate deterministically and paused experiments fall back to baseline", () => {
  const state = candidateState("running");
  const first = resolveRecommendationPlannerPolicy(state, { version: 1, entries: [] });
  const firstEntry = {
    exerciseId: "p-1",
    chosenAt: "2026-09-27T01:00:00.000Z",
    experimentId: state.experiment.id,
    policyVariant: first.variant,
  };
  const second = resolveRecommendationPlannerPolicy(state, { version: 1, entries: [firstEntry] });
  assert.notEqual(first.variant, second.variant);
  assert.equal(first.experimentId, state.experiment.id);
  assert.equal(second.assignmentIndex, 1);

  const paused = resolveRecommendationPlannerPolicy(candidateState("paused"), { version: 1, entries: [firstEntry] });
  assert.equal(paused.mode, "baseline-default");
  assert.equal(paused.variant, "baseline");
  assert.deepEqual(paused.adjustments, {});
});

test("candidate policy deltas affect only surfaced rationales and remain capped per problem", () => {
  const recommendations = buildAdaptiveRecommendations({
    mastery: mastery("trace"),
    policyAdjustments: {
      "weakest-dimension": 2,
      "combined-diversity": 2,
      "difficulty-calibration": 2,
    },
    maxPolicyAdjustment: 4,
    limit: 8,
    seed: "phase6-policy-cap",
  });

  assert.equal(recommendations.length, 8);
  assert.ok(recommendations.some((item) => item.policyAdjustment > 0));
  assert.ok(recommendations.every((item) => Math.abs(item.policyAdjustment) <= 4));
});

test("experiment comparison requires both arm samples before candidate promotion can be considered", () => {
  const state = candidateState("running");
  const rows = experimentRows(state.experiment.id, 7);
  const outcomes = rows.entries.map((entry) => outcome(entry, "independent", true));
  const evaluation = buildRecommendationPolicyExperimentEvaluation({
    state,
    recommendations: { version: 1, entries: rows.entries },
    outcomes: outcomeAudit(outcomes),
  });

  assert.equal(evaluation.decision, "insufficient");
  assert.equal(evaluation.promotionEligible, false);
  assert.equal(evaluation.baseline.matureChoices, 7);
  assert.equal(evaluation.candidate.matureChoices, 7);
});

test("a clearly stronger frozen candidate becomes explicitly promotable and rollback restores baseline", () => {
  const storage = memoryStorage();
  const state = candidateState("running");
  storage.setItem(RECOMMENDATION_POLICY_EXPERIMENT_KEY, JSON.stringify(state));
  const rows = experimentRows(state.experiment.id, 8);
  const outcomes = [
    ...rows.baseline.map((entry, index) => outcome(entry, "solved", index < 4)),
    ...rows.candidate.map((entry) => outcome(entry, "independent", true)),
  ];
  const evaluation = buildRecommendationPolicyExperimentEvaluation({
    state,
    recommendations: { version: 1, entries: rows.entries },
    outcomes: outcomeAudit(outcomes),
  });

  assert.equal(evaluation.decision, "candidate-leading");
  assert.equal(evaluation.promotionEligible, true);
  assert.ok((evaluation.strongEvidenceLift ?? 0) >= 10);

  const promoted = promoteRecommendationPolicyCandidate(storage, evaluation, "2026-10-01T00:00:00.000Z");
  assert.equal(promoted.defaultPolicyId, state.candidate.id);
  assert.equal(promoted.experiment?.status, "completed");
  assert.equal(resolveRecommendationPlannerPolicy(promoted, { version: 1, entries: [] }).mode, "candidate-default");

  const rolledBack = rollbackRecommendationPolicyCandidate(storage, "2026-10-02T00:00:00.000Z");
  assert.equal(rolledBack.defaultPolicyId, BASELINE_RECOMMENDATION_POLICY_ID);
  assert.equal(rolledBack.lastRollbackAt, "2026-10-02T00:00:00.000Z");
  assert.equal(resolveRecommendationPlannerPolicy(rolledBack, { version: 1, entries: [] }).mode, "baseline-default");
});

test("pause and resume preserve the frozen candidate instead of regenerating policy weights", () => {
  const storage = memoryStorage();
  const state = candidateState("running");
  storage.setItem(RECOMMENDATION_POLICY_EXPERIMENT_KEY, JSON.stringify(state));
  const paused = pauseRecommendationPolicyExperiment(storage);
  assert.equal(paused.experiment?.status, "paused");
  assert.deepEqual(paused.candidate?.adjustments, state.candidate.adjustments);
  const resumed = resumeRecommendationPolicyExperiment(storage);
  assert.equal(resumed.experiment?.status, "running");
  assert.equal(resumed.candidate?.id, state.candidate.id);
});

test("selection history records the experiment arm and bounded candidate adjustment with the visible rationale", () => {
  const storage = memoryStorage();
  const recommendation = buildAdaptiveRecommendations({
    mastery: mastery("trace"),
    policyAdjustments: { "combined-diversity": 2 },
    limit: 1,
    seed: "phase6-snapshot",
  })[0];
  assert.ok(recommendation);
  recordRecommendationSelection(storage, recommendation, "2026-09-27T02:00:00.000Z", {
    policyId: "candidate-v1-test",
    policyVariant: "candidate",
    experimentId: "experiment-test",
    policyAdjustment: recommendation.policyAdjustment,
  });

  const stored = JSON.parse(storage.getItem("agocode.progress.next-problem-history"));
  const entry = stored.entries.at(-1);
  assert.equal(entry.policyId, "candidate-v1-test");
  assert.equal(entry.policyVariant, "candidate");
  assert.equal(entry.experimentId, "experiment-test");
  assert.equal(entry.policyAdjustment, recommendation.policyAdjustment);
  assert.deepEqual(entry.reasons, recommendation.reasons);
});
