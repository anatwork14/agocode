import assert from "node:assert/strict";
import test from "node:test";

import {
  buildPromotedRecommendationPolicyHealth,
  resolveRecommendationPlannerPolicyWithHealth,
  summarizePromotedPolicyHealth,
} from "../lib/learning/recommendation-health.ts";

function stability(status = "stable") {
  return {
    available: true,
    candidatePolicyId: "candidate-v1-health",
    storedSnapshots: 6,
    replayedSnapshots: 6,
    invalidSnapshots: 0,
    minimumSnapshots: 6,
    topChoiceRetention: status === "unstable" ? 20 : 100,
    meanTopFiveOverlap: status === "unstable" ? 40 : 100,
    meanFamilyOverlap: status === "unstable" ? 40 : 100,
    meanRankDisplacement: status === "unstable" ? 60 : 0,
    highChurnSnapshots: status === "unstable" ? 6 : 0,
    highChurnRate: status === "unstable" ? 100 : 0,
    effectfulSnapshots: status === "unstable" ? 6 : 0,
    status,
    launchEligible: status === "stable",
    explanation: status,
    comparisons: [],
  };
}

function coverage(status = "balanced") {
  return {
    available: true,
    candidatePolicyId: "candidate-v1-health",
    replayedSnapshots: 6,
    minimumSnapshots: 6,
    axes: [],
    cohorts: [],
    imbalancedAxes: status === "imbalanced" ? 1 : 0,
    imbalancedCohorts: 0,
    status,
    launchEligible: status === "balanced",
    explanation: status,
  };
}

function promotedState() {
  return {
    version: 1,
    defaultPolicyId: "candidate-v1-health",
    candidate: {
      id: "candidate-v1-health",
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
      id: "experiment-health",
      candidatePolicyId: "candidate-v1-health",
      status: "completed",
      startedAt: "2026-09-02T00:00:00.000Z",
      completedAt: "2026-09-10T00:00:00.000Z",
      promotedAt: "2026-09-10T00:00:00.000Z",
    },
  };
}

test("health is inactive when no promoted candidate is the local default", () => {
  const audit = summarizePromotedPolicyHealth({ postPromotionSnapshots: 0 });
  assert.equal(audit.status, "inactive");
  assert.equal(audit.fallbackRequired, false);
});

test("promoted policy remains observational until enough post-promotion states exist", () => {
  const audit = summarizePromotedPolicyHealth({
    candidatePolicyId: "candidate-v1-health",
    promotedAt: "2026-09-10T00:00:00.000Z",
    postPromotionSnapshots: 5,
    stability: stability("stable"),
    coverage: coverage("balanced"),
  });
  assert.equal(audit.status, "observing");
  assert.equal(audit.fallbackRequired, false);
  assert.equal(audit.minimumSnapshots, 6);
});

test("promoted policy is healthy only when post-promotion stability and coverage both pass", () => {
  const audit = summarizePromotedPolicyHealth({
    candidatePolicyId: "candidate-v1-health",
    promotedAt: "2026-09-10T00:00:00.000Z",
    postPromotionSnapshots: 6,
    stability: stability("stable"),
    coverage: coverage("balanced"),
  });
  assert.equal(audit.status, "healthy");
  assert.equal(audit.fallbackRequired, false);
});

test("either post-promotion ranking instability or coverage imbalance requires a safety fallback", () => {
  const unstable = summarizePromotedPolicyHealth({
    candidatePolicyId: "candidate-v1-health",
    promotedAt: "2026-09-10T00:00:00.000Z",
    postPromotionSnapshots: 6,
    stability: stability("unstable"),
    coverage: coverage("balanced"),
  });
  const imbalanced = summarizePromotedPolicyHealth({
    candidatePolicyId: "candidate-v1-health",
    promotedAt: "2026-09-10T00:00:00.000Z",
    postPromotionSnapshots: 6,
    stability: stability("stable"),
    coverage: coverage("imbalanced"),
  });
  assert.equal(unstable.status, "degraded");
  assert.equal(imbalanced.status, "degraded");
  assert.equal(unstable.fallbackRequired, true);
  assert.equal(imbalanced.fallbackRequired, true);
});

test("health reconstruction ignores all snapshots recorded before promotion", () => {
  const state = promotedState();
  const snapshots = {
    version: 1,
    entries: [
      { id: "before-a", recordedAt: "2026-09-08T00:00:00.000Z" },
      { id: "before-b", recordedAt: "2026-09-09T00:00:00.000Z" },
      { id: "after", recordedAt: "2026-09-11T00:00:00.000Z" },
    ],
  };
  const audit = buildPromotedRecommendationPolicyHealth({ state, snapshots });
  assert.equal(audit.status, "observing");
  assert.equal(audit.postPromotionSnapshots, 1);
  assert.equal(audit.fallbackRequired, false);
});

test("degraded candidate default resolves to baseline without mutating the frozen promotion state", () => {
  const state = promotedState();
  const before = JSON.stringify(state);
  const health = summarizePromotedPolicyHealth({
    candidatePolicyId: state.candidate.id,
    promotedAt: state.experiment.promotedAt,
    postPromotionSnapshots: 6,
    stability: stability("unstable"),
    coverage: coverage("balanced"),
  });
  const resolved = resolveRecommendationPlannerPolicyWithHealth(
    state,
    { version: 1, entries: [] },
    health,
  );
  assert.equal(resolved.mode, "baseline-default");
  assert.equal(resolved.policyId, "baseline-v1");
  assert.equal(resolved.variant, "baseline");
  assert.deepEqual(resolved.adjustments, {});
  assert.equal(JSON.stringify(state), before);
});

test("healthy or still-observing candidates remain the local candidate default", () => {
  const state = promotedState();
  for (const health of [
    summarizePromotedPolicyHealth({
      candidatePolicyId: state.candidate.id,
      promotedAt: state.experiment.promotedAt,
      postPromotionSnapshots: 2,
      stability: stability("insufficient"),
      coverage: coverage("insufficient"),
    }),
    summarizePromotedPolicyHealth({
      candidatePolicyId: state.candidate.id,
      promotedAt: state.experiment.promotedAt,
      postPromotionSnapshots: 6,
      stability: stability("stable"),
      coverage: coverage("balanced"),
    }),
  ]) {
    const resolved = resolveRecommendationPlannerPolicyWithHealth(state, { version: 1, entries: [] }, health);
    assert.equal(resolved.mode, "candidate-default");
    assert.equal(resolved.policyId, state.candidate.id);
  }
});
