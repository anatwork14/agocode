import assert from "node:assert/strict";
import test from "node:test";

import {
  RECOMMENDATION_POLICY_REPAIR_KEY,
  buildRecommendationPolicyConsistencyAudit,
  readRecommendationPolicyRepairReceipt,
  repairRecommendationPolicyConsistency,
} from "../lib/learning/recommendation-consistency.ts";
import {
  BASELINE_RECOMMENDATION_POLICY_ID,
  RECOMMENDATION_POLICY_EXPERIMENT_KEY,
  readRecommendationPolicyExperimentState,
} from "../lib/learning/recommendation-experiment.ts";
import {
  RECOMMENDATION_POLICY_SAFETY_KEY,
  readRecommendationPolicySafetyState,
} from "../lib/learning/recommendation-recovery.ts";
import {
  RECOMMENDATION_HISTORY_KEY,
  readRecommendationHistory,
} from "../lib/learning/recommendations.ts";

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem(key) {
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      values.set(key, value);
    },
    raw(key) {
      return values.get(key) ?? null;
    },
  };
}

function promotedState() {
  const candidate = {
    id: "candidate-v1-repair",
    createdAt: "2026-09-28T00:00:00.000Z",
    baselinePolicyId: BASELINE_RECOMMENDATION_POLICY_ID,
    adjustments: { "combined-diversity": 2 },
    source: { matureSnapshottedChoices: 18, baselineStrongEvidenceRate: 50, suggestedChanges: 1 },
  };
  return {
    version: 1,
    defaultPolicyId: candidate.id,
    candidate,
    experiment: {
      id: "experiment-repair",
      candidatePolicyId: candidate.id,
      status: "completed",
      startedAt: "2026-09-28T00:05:00.000Z",
      completedAt: "2026-09-28T00:30:00.000Z",
      promotedAt: "2026-09-28T00:30:00.000Z",
    },
    lineage: [
      {
        version: 1,
        id: "repair-start",
        event: "experiment-started",
        occurredAt: "2026-09-28T00:05:00.000Z",
        candidatePolicyId: candidate.id,
        candidateCreatedAt: candidate.createdAt,
        adjustments: { ...candidate.adjustments },
        experimentId: "experiment-repair",
        experimentStatus: "running",
        defaultPolicyId: BASELINE_RECOMMENDATION_POLICY_ID,
      },
      {
        version: 1,
        id: "repair-promote",
        event: "candidate-promoted",
        occurredAt: "2026-09-28T00:30:00.000Z",
        candidatePolicyId: candidate.id,
        candidateCreatedAt: candidate.createdAt,
        adjustments: { ...candidate.adjustments },
        experimentId: "experiment-repair",
        experimentStatus: "completed",
        defaultPolicyId: candidate.id,
      },
    ],
  };
}

test("safe repair quarantines contradictory attribution while preserving recommendation evidence", () => {
  const state = promotedState();
  const storage = memoryStorage({
    [RECOMMENDATION_POLICY_EXPERIMENT_KEY]: JSON.stringify(state),
    [RECOMMENDATION_POLICY_SAFETY_KEY]: JSON.stringify({ version: 1, events: [] }),
    [RECOMMENDATION_HISTORY_KEY]: JSON.stringify({
      version: 1,
      entries: [
        {
          exerciseId: "repair-problem",
          chosenAt: "2026-09-28T01:00:00.000Z",
          reasons: ["adds source and domain diversity"],
          targetDimension: "transfer",
          score: 73,
          familyId: "graph-traversal",
          policyVariant: "candidate",
          policyId: BASELINE_RECOMMENDATION_POLICY_ID,
          experimentId: state.experiment.id,
          policyAdjustment: 2,
        },
      ],
    }),
  });

  const before = buildRecommendationPolicyConsistencyAudit({
    state: readRecommendationPolicyExperimentState(storage),
    safety: readRecommendationPolicySafetyState(storage),
    recommendations: readRecommendationHistory(storage),
  });
  assert.equal(before.fallbackRequired, true);

  const result = repairRecommendationPolicyConsistency(storage, "2026-09-28T02:00:00.000Z");
  assert.equal(result.changed, true);
  assert.equal(result.repaired, true);
  assert.equal(result.audit.fallbackRequired, false);
  assert.equal(result.audit.status, "healthy");

  const repairedState = readRecommendationPolicyExperimentState(storage);
  assert.equal(repairedState.defaultPolicyId, BASELINE_RECOMMENDATION_POLICY_ID);
  assert.equal(repairedState.candidate, undefined);
  assert.equal(repairedState.experiment, undefined);

  const repairedSafety = readRecommendationPolicySafetyState(storage);
  assert.equal(repairedSafety.candidatePolicyId, undefined);
  assert.deepEqual(repairedSafety.events, []);

  const repairedHistory = readRecommendationHistory(storage);
  assert.equal(repairedHistory.entries.length, 1);
  const repairedEntry = repairedHistory.entries[0];
  assert.equal(repairedEntry.exerciseId, "repair-problem");
  assert.equal(repairedEntry.chosenAt, "2026-09-28T01:00:00.000Z");
  assert.deepEqual(repairedEntry.reasons, ["adds source and domain diversity"]);
  assert.equal(repairedEntry.targetDimension, "transfer");
  assert.equal(repairedEntry.score, 73);
  assert.equal(repairedEntry.familyId, "graph-traversal");
  assert.equal(repairedEntry.policyVariant, undefined);
  assert.equal(repairedEntry.policyId, undefined);
  assert.equal(repairedEntry.experimentId, undefined);
  assert.equal(repairedEntry.policyAdjustment, undefined);

  const receipt = readRecommendationPolicyRepairReceipt(storage);
  assert.ok(receipt);
  assert.equal(receipt.previousCandidatePolicyId, state.candidate.id);
  assert.equal(receipt.previousExperimentId, state.experiment.id);
  assert.equal(receipt.criticalIssuesResolved, 1);
  assert.equal(receipt.quarantinedAttributions, 1);
  assert.equal(receipt.preservedRecommendationChoices, 1);
  assert.deepEqual(receipt.triggerCodes, ["candidate-attribution-policy-mismatch"]);
  assert.ok(storage.raw(RECOMMENDATION_POLICY_REPAIR_KEY));
});

test("safe repair clears contradictory lifecycle control state without deleting clean learner history", () => {
  const state = promotedState();
  state.lineage = [
    { ...state.lineage[0], occurredAt: "2026-09-28T00:40:00.000Z" },
    { ...state.lineage[1], occurredAt: "2026-09-28T00:20:00.000Z" },
  ];
  const history = {
    version: 1,
    entries: [{ exerciseId: "preserved-choice", chosenAt: "2026-09-28T01:00:00.000Z", reasons: ["builds transfer evidence"], familyId: "hashing" }],
  };
  const storage = memoryStorage({
    [RECOMMENDATION_POLICY_EXPERIMENT_KEY]: JSON.stringify(state),
    [RECOMMENDATION_POLICY_SAFETY_KEY]: JSON.stringify({ version: 1, events: [] }),
    [RECOMMENDATION_HISTORY_KEY]: JSON.stringify(history),
  });

  const result = repairRecommendationPolicyConsistency(storage, "2026-09-28T02:10:00.000Z");
  assert.equal(result.repaired, true);
  assert.equal(result.audit.fallbackRequired, false);
  assert.equal(result.receipt.quarantinedAttributions, 0);
  assert.deepEqual(readRecommendationHistory(storage).entries, history.entries);
});

test("warning-only bounded-history uncertainty does not trigger destructive repair", () => {
  const state = promotedState();
  const history = {
    version: 1,
    entries: [{
      exerciseId: "legacy-choice",
      chosenAt: "2026-08-01T00:00:00.000Z",
      policyVariant: "baseline",
      policyId: BASELINE_RECOMMENDATION_POLICY_ID,
      experimentId: "experiment-evicted",
    }],
  };
  const storage = memoryStorage({
    [RECOMMENDATION_POLICY_EXPERIMENT_KEY]: JSON.stringify(state),
    [RECOMMENDATION_POLICY_SAFETY_KEY]: JSON.stringify({ version: 1, events: [] }),
    [RECOMMENDATION_HISTORY_KEY]: JSON.stringify(history),
  });
  const frozenExperiment = storage.raw(RECOMMENDATION_POLICY_EXPERIMENT_KEY);
  const frozenHistory = storage.raw(RECOMMENDATION_HISTORY_KEY);

  const result = repairRecommendationPolicyConsistency(storage, "2026-09-28T02:20:00.000Z");
  assert.equal(result.changed, false);
  assert.equal(result.repaired, false);
  assert.equal(result.audit.status, "warning");
  assert.equal(storage.raw(RECOMMENDATION_POLICY_EXPERIMENT_KEY), frozenExperiment);
  assert.equal(storage.raw(RECOMMENDATION_HISTORY_KEY), frozenHistory);
  assert.equal(storage.raw(RECOMMENDATION_POLICY_REPAIR_KEY), null);
});
