import assert from "node:assert/strict";
import test from "node:test";

import {
  buildPromotedRecommendationPolicyHealth,
  resolveRecommendationPlannerPolicyWithHealth,
  summarizePromotedPolicyHealth,
} from "../lib/learning/recommendation-health.ts";
import {
  RECOMMENDATION_POLICY_SAFETY_EVENT_LIMIT,
  RECOMMENDATION_POLICY_SAFETY_KEY,
  buildRecommendationPolicyRecoveryAudit,
  hasActiveRecommendationPolicySuspension,
  reactivateRecommendationPolicyAfterRecovery,
  readRecommendationPolicySafetyState,
  synchronizeRecommendationPolicySafety,
} from "../lib/learning/recommendation-recovery.ts";
import {
  readRecommendationPolicySnapshotHistory,
  recordRecommendationPolicySnapshot,
} from "../lib/learning/recommendation-stability.ts";

function memoryStorage() {
  const data = new Map();
  return {
    getItem(key) { return data.has(key) ? data.get(key) : null; },
    setItem(key, value) { data.set(key, value); },
    removeItem(key) { data.delete(key); },
  };
}

function promotedState(candidateId = "candidate-v1-recovery") {
  return {
    version: 1,
    defaultPolicyId: candidateId,
    candidate: {
      id: candidateId,
      createdAt: "2026-09-01T00:00:00.000Z",
      baselinePolicyId: "baseline-v1",
      adjustments: { "combined-diversity": 2 },
      source: {
        matureSnapshottedChoices: 20,
        baselineStrongEvidenceRate: 50,
        suggestedChanges: 1,
      },
    },
    experiment: {
      id: "experiment-recovery",
      candidatePolicyId: candidateId,
      status: "completed",
      startedAt: "2026-09-02T00:00:00.000Z",
      completedAt: "2026-09-10T00:00:00.000Z",
      promotedAt: "2026-09-10T00:00:00.000Z",
    },
  };
}

function health(overrides = {}) {
  return {
    status: "degraded",
    candidatePolicyId: "candidate-v1-recovery",
    promotedAt: "2026-09-10T00:00:00.000Z",
    monitoringSince: "2026-09-10T00:00:00.000Z",
    monitoringEpoch: "promotion",
    postPromotionSnapshots: 6,
    minimumSnapshots: 6,
    stability: { status: "unstable" },
    coverage: { status: "balanced" },
    fallbackRequired: true,
    explanation: "test",
    ...overrides,
  };
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

function plannerInput(index = 0) {
  return {
    mastery: mastery(),
    obstacles: { version: 1, events: [], counts: {} },
    recentExerciseIds: [],
    missedExerciseIds: [],
    recommendationHistoryIds: [`recovery-state-${index}`],
    difficultyCalibration: { bias: 0 },
    problemIndependence: {},
    problemReview: {},
    limit: 5,
  };
}

function seedRecoveryStates(storage, startDay = 12, count = 6) {
  for (let index = 0; index < count; index += 1) {
    recordRecommendationPolicySnapshot(
      storage,
      plannerInput(index),
      `2026-09-${String(startDay + index).padStart(2, "0")}T00:00:00.000Z`,
    );
  }
}

test("corrupt or unknown safety payload fails closed", () => {
  const storage = memoryStorage();
  storage.setItem(RECOMMENDATION_POLICY_SAFETY_KEY, "{broken");
  assert.deepEqual(readRecommendationPolicySafetyState(storage), { version: 1, events: [] });
  storage.setItem(RECOMMENDATION_POLICY_SAFETY_KEY, JSON.stringify({ version: 99, suspension: { candidatePolicyId: "bad" } }));
  assert.deepEqual(readRecommendationPolicySafetyState(storage), { version: 1, events: [] });
});

test("degradation latches exactly one suspension and repeated checks are idempotent", () => {
  const storage = memoryStorage();
  const state = promotedState();
  const first = synchronizeRecommendationPolicySafety(storage, state, health(), "2026-09-20T00:00:00.000Z");
  const second = synchronizeRecommendationPolicySafety(storage, state, health(), "2026-09-21T00:00:00.000Z");
  assert.equal(first.suspension?.reason, "stability");
  assert.equal(first.suspension?.suspendedAt, "2026-09-20T00:00:00.000Z");
  assert.equal(second.suspension?.suspendedAt, "2026-09-20T00:00:00.000Z");
  assert.equal(second.events.length, 1);
  assert.equal(second.events[0].event, "candidate-suspended");
});

test("a healthy later audit does not silently clear a latched suspension", () => {
  const storage = memoryStorage();
  const state = promotedState();
  synchronizeRecommendationPolicySafety(storage, state, health(), "2026-09-20T00:00:00.000Z");
  const before = storage.getItem(RECOMMENDATION_POLICY_SAFETY_KEY);
  const after = synchronizeRecommendationPolicySafety(storage, state, health({
    status: "healthy",
    stability: { status: "stable" },
    fallbackRequired: false,
  }), "2026-09-25T00:00:00.000Z");
  assert.equal(storage.getItem(RECOMMENDATION_POLICY_SAFETY_KEY), before);
  assert.equal(after.suspension?.suspendedAt, "2026-09-20T00:00:00.000Z");
});

test("latched suspension keeps planner on baseline even when the current health aggregate is healthy", () => {
  const state = promotedState();
  const safety = {
    version: 1,
    candidatePolicyId: state.candidate.id,
    suspension: {
      candidatePolicyId: state.candidate.id,
      suspendedAt: "2026-09-20T00:00:00.000Z",
      reason: "stability",
    },
    events: [],
  };
  const healthy = summarizePromotedPolicyHealth({
    candidatePolicyId: state.candidate.id,
    promotedAt: state.experiment.promotedAt,
    postPromotionSnapshots: 6,
    stability: { status: "stable" },
    coverage: { status: "balanced" },
  });
  const resolved = resolveRecommendationPlannerPolicyWithHealth(state, { version: 1, entries: [] }, healthy, safety);
  assert.equal(resolved.mode, "baseline-default");
  assert.equal(resolved.policyId, "baseline-v1");
});

test("recovery remains observing until six fresh post-suspension states exist", () => {
  const storage = memoryStorage();
  const state = promotedState();
  const safety = synchronizeRecommendationPolicySafety(storage, state, health(), "2026-09-11T00:00:00.000Z");
  seedRecoveryStates(storage, 12, 5);
  const recovery = buildRecommendationPolicyRecoveryAudit({
    state,
    safety,
    snapshots: readRecommendationPolicySnapshotHistory(storage),
  });
  assert.equal(recovery.status, "observing");
  assert.equal(recovery.recoverySnapshots, 5);
  assert.equal(recovery.reactivationEligible, false);
});

test("six fresh stable and balanced states make reactivation explicitly available", () => {
  const storage = memoryStorage();
  const state = promotedState();
  const safety = synchronizeRecommendationPolicySafety(storage, state, health(), "2026-09-11T00:00:00.000Z");
  seedRecoveryStates(storage, 12, 6);
  const recovery = buildRecommendationPolicyRecoveryAudit({
    state,
    safety,
    snapshots: readRecommendationPolicySnapshotHistory(storage),
  });
  assert.equal(recovery.status, "ready");
  assert.equal(recovery.recoverySnapshots, 6);
  assert.equal(recovery.reactivationEligible, true);
  assert.equal(recovery.stability?.status, "stable");
  assert.equal(recovery.coverage?.status, "balanced");
});

test("reactivation refuses insufficient evidence, then starts probation only after a ready audit", () => {
  const storage = memoryStorage();
  const state = promotedState();
  let safety = synchronizeRecommendationPolicySafety(storage, state, health(), "2026-09-11T00:00:00.000Z");
  const refused = reactivateRecommendationPolicyAfterRecovery(storage, state, {
    status: "observing",
    candidatePolicyId: state.candidate.id,
    suspendedAt: safety.suspension.suspendedAt,
    recoverySnapshots: 3,
    minimumSnapshots: 6,
    reactivationEligible: false,
    explanation: "test",
  }, "2026-09-19T00:00:00.000Z");
  assert.ok(refused.suspension);
  assert.equal(refused.probation, undefined);

  seedRecoveryStates(storage, 12, 6);
  const recovery = buildRecommendationPolicyRecoveryAudit({
    state,
    safety,
    snapshots: readRecommendationPolicySnapshotHistory(storage),
  });
  safety = reactivateRecommendationPolicyAfterRecovery(storage, state, recovery, "2026-09-20T00:00:00.000Z");
  assert.equal(safety.suspension, undefined);
  assert.equal(safety.lastReactivatedAt, "2026-09-20T00:00:00.000Z");
  assert.equal(safety.probation?.candidatePolicyId, state.candidate.id);
  assert.equal(safety.events.at(-2)?.event, "candidate-reactivated");
  assert.equal(safety.events.at(-1)?.event, "candidate-probation-started");
});

test("health after reactivation starts a fresh epoch and excludes earlier failure states", () => {
  const state = promotedState();
  const safety = {
    version: 1,
    candidatePolicyId: state.candidate.id,
    probation: {
      version: 1,
      id: "recovery-probation-test",
      candidatePolicyId: state.candidate.id,
      startedAt: "2026-09-20T00:00:00.000Z",
    },
    lastReactivatedAt: "2026-09-20T00:00:00.000Z",
    events: [],
  };
  const snapshots = {
    version: 1,
    entries: [
      { id: "old-failure", recordedAt: "2026-09-15T00:00:00.000Z" },
      { id: "new-a", recordedAt: "2026-09-21T00:00:00.000Z" },
      { id: "new-b", recordedAt: "2026-09-22T00:00:00.000Z" },
    ],
  };
  const audit = buildPromotedRecommendationPolicyHealth({ state, snapshots, safety });
  assert.equal(audit.monitoringEpoch, "reactivation");
  assert.equal(audit.monitoringSince, safety.lastReactivatedAt);
  assert.equal(audit.postPromotionSnapshots, 2);
  assert.equal(audit.status, "observing");
});

test("safety state for an old candidate is ignored by the current candidate", () => {
  const state = promotedState("candidate-new");
  const safety = {
    version: 1,
    candidatePolicyId: "candidate-old",
    suspension: {
      candidatePolicyId: "candidate-old",
      suspendedAt: "2026-09-20T00:00:00.000Z",
      reason: "coverage",
    },
    events: [],
  };
  assert.equal(hasActiveRecommendationPolicySuspension(safety, state.candidate.id), false);
  const resolved = resolveRecommendationPlannerPolicyWithHealth(
    state,
    { version: 1, entries: [] },
    summarizePromotedPolicyHealth({
      candidatePolicyId: state.candidate.id,
      promotedAt: state.experiment.promotedAt,
      postPromotionSnapshots: 2,
      stability: { status: "insufficient" },
      coverage: { status: "insufficient" },
    }),
    safety,
  );
  assert.equal(resolved.mode, "candidate-default");
});

test("safety lifecycle events remain bounded across repeated suspend/probation cycles", () => {
  const storage = memoryStorage();
  const state = promotedState();
  for (let index = 0; index < RECOMMENDATION_POLICY_SAFETY_EVENT_LIMIT + 4; index += 1) {
    const day = String((index % 7) + 11).padStart(2, "0");
    let safety = synchronizeRecommendationPolicySafety(storage, state, health(), `2026-10-${day}T00:00:00.000Z`);
    safety = reactivateRecommendationPolicyAfterRecovery(storage, state, {
      status: "ready",
      candidatePolicyId: state.candidate.id,
      suspendedAt: safety.suspension?.suspendedAt,
      reason: safety.suspension?.reason,
      recoverySnapshots: 6,
      minimumSnapshots: 6,
      reactivationEligible: true,
      explanation: "test",
    }, `2026-10-${day}T12:00:00.000Z`);
    assert.equal(safety.suspension, undefined);
    assert.ok(safety.probation);
  }
  const safety = readRecommendationPolicySafetyState(storage);
  assert.equal(safety.events.length, RECOMMENDATION_POLICY_SAFETY_EVENT_LIMIT);
});