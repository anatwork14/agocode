import assert from "node:assert/strict";
import test from "node:test";

import { BASELINE_RECOMMENDATION_POLICY_ID } from "../lib/learning/recommendation-experiment.ts";
import { resolveRecommendationPlannerPolicyWithHealth } from "../lib/learning/recommendation-health.ts";

function candidateState() {
  const candidate = {
    id: "candidate-v1-consistency",
    createdAt: "2026-09-27T00:00:00.000Z",
    baselinePolicyId: BASELINE_RECOMMENDATION_POLICY_ID,
    adjustments: { "retrieval-overdue": 2 },
    source: { matureSnapshottedChoices: 12, suggestedChanges: 1 },
  };
  return {
    version: 1,
    defaultPolicyId: candidate.id,
    candidate,
    experiment: {
      id: "experiment-consistency",
      candidatePolicyId: candidate.id,
      status: "completed",
      startedAt: "2026-09-27T00:00:00.000Z",
      completedAt: "2026-09-27T00:30:00.000Z",
      promotedAt: "2026-09-27T00:30:00.000Z",
    },
    lineage: [{
      version: 1,
      id: "event-promoted",
      event: "candidate-promoted",
      occurredAt: "2026-09-27T00:30:00.000Z",
      candidatePolicyId: candidate.id,
      candidateCreatedAt: candidate.createdAt,
      adjustments: { ...candidate.adjustments },
      experimentId: "experiment-consistency",
      experimentStatus: "completed",
      defaultPolicyId: candidate.id,
    }],
  };
}

const inactiveHealth = {
  status: "inactive",
  postPromotionSnapshots: 0,
  minimumSnapshots: 6,
  fallbackRequired: false,
  explanation: "test",
};

const emptySafety = { version: 1, events: [] };

test("critical recommendation attribution contradiction overrides a promoted candidate to baseline", () => {
  const state = candidateState();
  const resolved = resolveRecommendationPlannerPolicyWithHealth(
    state,
    {
      version: 1,
      entries: [{
        exerciseId: "problem-a",
        chosenAt: "2026-09-27T01:00:00.000Z",
        policyVariant: "candidate",
        policyId: BASELINE_RECOMMENDATION_POLICY_ID,
        experimentId: state.experiment.id,
      }],
    },
    inactiveHealth,
    emptySafety,
  );
  assert.deepEqual(resolved, {
    mode: "baseline-default",
    policyId: BASELINE_RECOMMENDATION_POLICY_ID,
    variant: "baseline",
    adjustments: {},
  });
});

test("warning-only bounded-history attribution does not disable a healthy candidate", () => {
  const state = candidateState();
  const resolved = resolveRecommendationPlannerPolicyWithHealth(
    state,
    {
      version: 1,
      entries: [{
        exerciseId: "legacy-problem",
        chosenAt: "2026-08-01T00:00:00.000Z",
        policyVariant: "candidate",
        policyId: state.candidate.id,
        experimentId: "experiment-evicted-from-lineage",
      }],
    },
    inactiveHealth,
    emptySafety,
  );
  assert.equal(resolved.mode, "candidate-default");
  assert.equal(resolved.policyId, state.candidate.id);
  assert.deepEqual(resolved.adjustments, state.candidate.adjustments);
});
