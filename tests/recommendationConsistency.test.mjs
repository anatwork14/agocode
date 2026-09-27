import assert from "node:assert/strict";
import test from "node:test";

import {
  buildRecommendationPolicyConsistencyAudit,
  enforceRecommendationPolicyConsistency,
} from "../lib/learning/recommendation-consistency.ts";
import { BASELINE_RECOMMENDATION_POLICY_ID } from "../lib/learning/recommendation-experiment.ts";

function cleanState() {
  const candidate = { id: "candidate-v1-clean", createdAt: "2026-09-27T00:00:00.000Z", baselinePolicyId: BASELINE_RECOMMENDATION_POLICY_ID, adjustments: { "retrieval-overdue": 2 }, source: { matureSnapshottedChoices: 12, suggestedChanges: 1 } };
  return {
    version: 1,
    defaultPolicyId: candidate.id,
    candidate,
    experiment: { id: "experiment-clean", candidatePolicyId: candidate.id, status: "completed", startedAt: "2026-09-27T00:10:00.000Z", completedAt: "2026-09-27T00:30:00.000Z", promotedAt: "2026-09-27T00:30:00.000Z" },
    lineage: [
      { version: 1, id: "event-start", event: "experiment-started", occurredAt: "2026-09-27T00:10:00.000Z", candidatePolicyId: candidate.id, candidateCreatedAt: candidate.createdAt, adjustments: { ...candidate.adjustments }, experimentId: "experiment-clean", experimentStatus: "running", defaultPolicyId: BASELINE_RECOMMENDATION_POLICY_ID },
      { version: 1, id: "event-promote", event: "candidate-promoted", occurredAt: "2026-09-27T00:30:00.000Z", candidatePolicyId: candidate.id, candidateCreatedAt: candidate.createdAt, adjustments: { ...candidate.adjustments }, experimentId: "experiment-clean", experimentStatus: "completed", defaultPolicyId: candidate.id },
    ],
  };
}

const emptySafety = () => ({ version: 1, events: [] });
const candidatePolicy = () => ({ mode: "candidate-default", policyId: "candidate-v1-clean", variant: "candidate", adjustments: { "retrieval-overdue": 2 } });

test("clean state remains healthy and candidate policy remains unchanged", () => {
  const state = cleanState();
  const audit = buildRecommendationPolicyConsistencyAudit({ state, safety: emptySafety(), recommendations: { version: 1, entries: [{ exerciseId: "p1", chosenAt: "2026-09-27T00:20:00.000Z", policyId: state.candidate.id, policyVariant: "candidate", experimentId: state.experiment.id }] } });
  assert.equal(audit.status, "healthy");
  assert.equal(audit.fallbackRequired, false);
  assert.deepEqual(enforceRecommendationPolicyConsistency(candidatePolicy(), audit), candidatePolicy());
});

test("candidate traffic attributed to baseline is critical and fails closed", () => {
  const state = cleanState();
  const audit = buildRecommendationPolicyConsistencyAudit({ state, safety: emptySafety(), recommendations: { version: 1, entries: [{ exerciseId: "p1", chosenAt: "2026-09-27T00:20:00.000Z", policyId: BASELINE_RECOMMENDATION_POLICY_ID, policyVariant: "candidate", experimentId: state.experiment.id }] } });
  assert.equal(audit.status, "critical");
  assert.equal(audit.fallbackRequired, true);
  assert.deepEqual(enforceRecommendationPolicyConsistency(candidatePolicy(), audit), { mode: "baseline-default", policyId: BASELINE_RECOMMENDATION_POLICY_ID, variant: "baseline", adjustments: {} });
});

test("stale safety state for a previous candidate is ignored by the current candidate", () => {
  const state = cleanState();
  const audit = buildRecommendationPolicyConsistencyAudit({ state, safety: { version: 1, candidatePolicyId: "candidate-old", suspension: { candidatePolicyId: "candidate-old", suspendedAt: "2026-09-27T01:00:00.000Z", reason: "coverage" }, events: [] }, recommendations: { version: 1, entries: [] } });
  assert.equal(audit.status, "healthy");
  assert.equal(audit.fallbackRequired, false);
  assert.deepEqual(enforceRecommendationPolicyConsistency(candidatePolicy(), audit), candidatePolicy());
});

test("internally contradictory safety state for the current candidate is critical", () => {
  const state = cleanState();
  const audit = buildRecommendationPolicyConsistencyAudit({
    state,
    safety: {
      version: 1,
      candidatePolicyId: state.candidate.id,
      suspension: { candidatePolicyId: "candidate-other", suspendedAt: "2026-09-27T01:00:00.000Z", reason: "coverage" },
      events: [],
    },
    recommendations: { version: 1, entries: [] },
  });
  assert.equal(audit.status, "critical");
  assert.equal(audit.fallbackRequired, true);
  assert.ok(audit.issues.some((issue) => issue.code === "suspension-candidate-mismatch"));
});

test("impossible lifecycle semantics and time regression are critical", () => {
  const state = cleanState();
  state.lineage = [{ ...state.lineage[0], occurredAt: "2026-09-27T00:30:00.000Z", experimentStatus: "paused" }, { ...state.lineage[1], occurredAt: "2026-09-27T00:20:00.000Z" }];
  const audit = buildRecommendationPolicyConsistencyAudit({ state, safety: emptySafety(), recommendations: { version: 1, entries: [] } });
  assert.equal(audit.fallbackRequired, true);
  assert.ok(audit.issues.some((issue) => issue.code === "lineage-event-semantic-mismatch"));
  assert.ok(audit.issues.some((issue) => issue.code === "lineage-time-regression"));
});

test("unknown old experiment attribution is warning-only because lineage is bounded", () => {
  const state = cleanState();
  const audit = buildRecommendationPolicyConsistencyAudit({ state, safety: emptySafety(), recommendations: { version: 1, entries: [{ exerciseId: "legacy-problem", chosenAt: "2026-08-01T00:00:00.000Z", policyId: BASELINE_RECOMMENDATION_POLICY_ID, policyVariant: "baseline", experimentId: "experiment-evicted-from-lineage" }] } });
  assert.equal(audit.status, "warning");
  assert.equal(audit.fallbackRequired, false);
  assert.equal(audit.warnings, 1);
  assert.deepEqual(enforceRecommendationPolicyConsistency(candidatePolicy(), audit), candidatePolicy());
});
