import assert from "node:assert/strict";
import test from "node:test";

import { BASELINE_RECOMMENDATION_POLICY_ID } from "../lib/learning/recommendation-experiment.ts";
import { resolveRecommendationPlannerPolicyWithHealth } from "../lib/learning/recommendation-health.ts";
import {
  RECOMMENDATION_POLICY_SAFETY_KEY,
  buildRecommendationPolicyProbationAudit,
  completeRecommendationPolicyProbation,
  reactivateRecommendationPolicyAfterRecovery,
  readRecommendationPolicySafetyState,
  synchronizeRecommendationPolicyProbationFailure,
} from "../lib/learning/recommendation-recovery.ts";

function memoryStorage() {
  const data = new Map();
  return {
    getItem(key) { return data.has(key) ? data.get(key) : null; },
    setItem(key, value) { data.set(key, value); },
    removeItem(key) { data.delete(key); },
  };
}

function promotedState() {
  const candidate = {
    id: "candidate-v1-probation",
    createdAt: "2026-09-01T00:00:00.000Z",
    baselinePolicyId: BASELINE_RECOMMENDATION_POLICY_ID,
    adjustments: { "retrieval-overdue": 2 },
    source: { matureSnapshottedChoices: 20, baselineStrongEvidenceRate: 50, suggestedChanges: 1 },
  };
  return {
    version: 1,
    defaultPolicyId: candidate.id,
    candidate,
    experiment: {
      id: "experiment-probation",
      candidatePolicyId: candidate.id,
      status: "completed",
      startedAt: "2026-09-01T00:00:00.000Z",
      completedAt: "2026-09-10T00:00:00.000Z",
      promotedAt: "2026-09-10T00:00:00.000Z",
    },
  };
}

function recoveryReady(state) {
  return {
    status: "ready",
    candidatePolicyId: state.candidate.id,
    suspendedAt: "2026-09-12T00:00:00.000Z",
    reason: "stability",
    recoverySnapshots: 6,
    minimumSnapshots: 6,
    reactivationEligible: true,
    explanation: "ready",
  };
}

function initialSafety(state) {
  return {
    version: 1,
    candidatePolicyId: state.candidate.id,
    suspension: {
      candidatePolicyId: state.candidate.id,
      suspendedAt: "2026-09-12T00:00:00.000Z",
      reason: "stability",
    },
    events: [],
  };
}

function health(status = "healthy") {
  return {
    status,
    candidatePolicyId: "candidate-v1-probation",
    promotedAt: "2026-09-10T00:00:00.000Z",
    monitoringSince: "2026-09-20T00:00:00.000Z",
    monitoringEpoch: "reactivation",
    postPromotionSnapshots: status === "healthy" ? 6 : 1,
    minimumSnapshots: 6,
    fallbackRequired: status === "degraded",
    explanation: status,
  };
}

function outcome(entry, status = "independent", strongEvidence = true) {
  return {
    exerciseId: entry.exerciseId,
    chosenAt: entry.chosenAt,
    windowEndsAt: "2026-10-20T00:00:00.000Z",
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

function probationRows(probationId, baselineStrong = 4, candidateStrong = 4) {
  const baseline = Array.from({ length: 4 }, (_, index) => ({
    exerciseId: `baseline-${index}`,
    chosenAt: `2026-09-${String(index + 21).padStart(2, "0")}T00:00:00.000Z`,
    probationId,
    policyVariant: "baseline",
    policyId: BASELINE_RECOMMENDATION_POLICY_ID,
  }));
  const candidate = Array.from({ length: 4 }, (_, index) => ({
    exerciseId: `candidate-${index}`,
    chosenAt: `2026-09-${String(index + 25).padStart(2, "0")}T00:00:00.000Z`,
    probationId,
    policyVariant: "candidate",
    policyId: "candidate-v1-probation",
  }));
  const outcomes = [
    ...baseline.map((entry, index) => outcome(entry, "independent", index < baselineStrong)),
    ...candidate.map((entry, index) => outcome(entry, "independent", index < candidateStrong)),
  ];
  return { history: { version: 1, entries: [...baseline, ...candidate] }, outcomes: outcomeAudit(outcomes) };
}

test("explicit recovery starts a persisted probation canary instead of restoring full candidate service", () => {
  const storage = memoryStorage();
  const state = promotedState();
  storage.setItem(RECOMMENDATION_POLICY_SAFETY_KEY, JSON.stringify(initialSafety(state)));
  const safety = reactivateRecommendationPolicyAfterRecovery(
    storage,
    state,
    recoveryReady(state),
    "2026-09-20T00:00:00.000Z",
  );

  assert.equal(safety.suspension, undefined);
  assert.equal(safety.lastReactivatedAt, "2026-09-20T00:00:00.000Z");
  assert.equal(safety.probation?.candidatePolicyId, state.candidate.id);
  assert.match(safety.probation?.id ?? "", /^recovery-probation-/);
  assert.deepEqual(safety.events.map((entry) => entry.event), ["candidate-reactivated", "candidate-probation-started"]);
  assert.deepEqual(readRecommendationPolicySafetyState(storage), safety);
});

test("recovery probation serves baseline first and alternates deterministically", () => {
  const state = promotedState();
  const safety = {
    version: 1,
    candidatePolicyId: state.candidate.id,
    probation: { version: 1, id: "probation-1", candidatePolicyId: state.candidate.id, startedAt: "2026-09-20T00:00:00.000Z" },
    lastReactivatedAt: "2026-09-20T00:00:00.000Z",
    events: [],
  };
  const first = resolveRecommendationPlannerPolicyWithHealth(state, { version: 1, entries: [] }, health(), safety);
  assert.equal(first.mode, "recovery-probation");
  assert.equal(first.variant, "baseline");
  assert.equal(first.probationId, "probation-1");
  assert.equal(first.assignmentIndex, 0);

  const second = resolveRecommendationPlannerPolicyWithHealth(state, {
    version: 1,
    entries: [{ exerciseId: "p1", chosenAt: "2026-09-21T00:00:00.000Z", probationId: "probation-1", policyVariant: "baseline" }],
  }, health(), safety);
  assert.equal(second.mode, "recovery-probation");
  assert.equal(second.variant, "candidate");
  assert.equal(second.policyId, state.candidate.id);
  assert.deepEqual(second.adjustments, state.candidate.adjustments);
});

test("probation stays observing until four mature outcomes exist in each arm and health is healthy", () => {
  const state = promotedState();
  const safety = {
    version: 1,
    candidatePolicyId: state.candidate.id,
    probation: { version: 1, id: "probation-1", candidatePolicyId: state.candidate.id, startedAt: "2026-09-20T00:00:00.000Z" },
    lastReactivatedAt: "2026-09-20T00:00:00.000Z",
    events: [],
  };
  const rows = probationRows("probation-1");
  const audit = buildRecommendationPolicyProbationAudit({
    state,
    safety,
    recommendations: { version: 1, entries: rows.history.entries.slice(0, 6) },
    outcomes: outcomeAudit(rows.outcomes.outcomes.slice(0, 6)),
    health: health("observing"),
  });
  assert.equal(audit.status, "observing");
  assert.equal(audit.completionEligible, false);
  assert.equal(audit.fallbackRequired, false);
});

test("healthy probation with objective outcome parity becomes explicitly completable", () => {
  const state = promotedState();
  const storage = memoryStorage();
  const safety = {
    version: 1,
    candidatePolicyId: state.candidate.id,
    probation: { version: 1, id: "probation-1", candidatePolicyId: state.candidate.id, startedAt: "2026-09-20T00:00:00.000Z" },
    lastReactivatedAt: "2026-09-20T00:00:00.000Z",
    events: [],
  };
  storage.setItem(RECOMMENDATION_POLICY_SAFETY_KEY, JSON.stringify(safety));
  const rows = probationRows("probation-1", 3, 3);
  const audit = buildRecommendationPolicyProbationAudit({
    state,
    safety,
    recommendations: rows.history,
    outcomes: rows.outcomes,
    health: health("healthy"),
  });
  assert.equal(audit.status, "ready");
  assert.equal(audit.completionEligible, true);
  assert.equal(audit.fallbackRequired, false);

  const completed = completeRecommendationPolicyProbation(storage, state, audit, "2026-09-30T00:00:00.000Z");
  assert.equal(completed.probation, undefined);
  assert.equal(completed.suspension, undefined);
  assert.equal(completed.events.at(-1)?.event, "candidate-probation-completed");
});

test("material candidate underperformance re-latches baseline with probation-outcomes reason", () => {
  const state = promotedState();
  const storage = memoryStorage();
  const safety = {
    version: 1,
    candidatePolicyId: state.candidate.id,
    probation: { version: 1, id: "probation-1", candidatePolicyId: state.candidate.id, startedAt: "2026-09-20T00:00:00.000Z" },
    lastReactivatedAt: "2026-09-20T00:00:00.000Z",
    events: [],
  };
  storage.setItem(RECOMMENDATION_POLICY_SAFETY_KEY, JSON.stringify(safety));
  const rows = probationRows("probation-1", 4, 0);
  const audit = buildRecommendationPolicyProbationAudit({
    state,
    safety,
    recommendations: rows.history,
    outcomes: rows.outcomes,
    health: health("healthy"),
  });
  assert.equal(audit.status, "failed");
  assert.equal(audit.failureReason, "outcomes");
  assert.equal(audit.fallbackRequired, true);

  const latched = synchronizeRecommendationPolicyProbationFailure(
    storage,
    state,
    audit,
    "2026-09-30T01:00:00.000Z",
  );
  assert.equal(latched.probation, undefined);
  assert.equal(latched.suspension?.reason, "probation-outcomes");
  assert.equal(latched.events.at(-1)?.event, "candidate-suspended");
});

test("fresh health degradation overrides an active canary immediately", () => {
  const state = promotedState();
  const safety = {
    version: 1,
    candidatePolicyId: state.candidate.id,
    probation: { version: 1, id: "probation-1", candidatePolicyId: state.candidate.id, startedAt: "2026-09-20T00:00:00.000Z" },
    lastReactivatedAt: "2026-09-20T00:00:00.000Z",
    events: [],
  };
  const audit = {
    status: "failed",
    candidatePolicyId: state.candidate.id,
    probationId: "probation-1",
    baseline: { matureChoices: 0, followedThrough: 0, strongEvidence: 0 },
    candidate: { matureChoices: 0, followedThrough: 0, strongEvidence: 0 },
    minimumPerVariant: 4,
    healthStatus: "degraded",
    completionEligible: false,
    fallbackRequired: true,
    failureReason: "health",
    explanation: "degraded",
  };
  const resolved = resolveRecommendationPlannerPolicyWithHealth(
    state,
    { version: 1, entries: [] },
    health("degraded"),
    safety,
    audit,
  );
  assert.equal(resolved.mode, "baseline-default");
  assert.equal(resolved.policyId, BASELINE_RECOMMENDATION_POLICY_ID);
  assert.deepEqual(resolved.adjustments, {});
});
