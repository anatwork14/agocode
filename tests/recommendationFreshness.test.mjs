import assert from "node:assert/strict";
import test from "node:test";

import {
  buildRecommendationCandidateFreshnessAudit,
  buildRecommendationPolicyAuditFingerprint,
} from "../lib/learning/recommendation-freshness.ts";

function audit({ mature = 20, retrieval = 2, diversity = -2, recognition = 0 } = {}) {
  const raw = [
    ["retrieval-overdue", retrieval, 12, retrieval > 0 ? 24 : retrieval < 0 ? -24 : 0],
    ["combined-diversity", diversity, 9, diversity > 0 ? 18 : diversity < 0 ? -18 : 0],
    ["recognition-miss", recognition, 8, recognition > 0 ? 16 : recognition < 0 ? -16 : 0],
  ];
  const reasons = raw.map(([reasonId, suggestedScoreDelta, matureChoices, strongEvidenceLift]) => ({
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
    status: suggestedScoreDelta > 0 ? "promising" : suggestedScoreDelta < 0 ? "weak" : "neutral",
    suggestedScoreDelta,
    explanation: "test",
  }));
  return {
    choices: mature,
    snapshottedChoices: mature,
    matureSnapshottedChoices: mature,
    metadataCoverageRate: 100,
    baselineFollowThroughRate: 80,
    baselineStrongEvidenceRate: 50,
    eligibleReasons: reasons.length,
    suggestedChanges: reasons.filter((reason) => reason.suggestedScoreDelta !== 0).length,
    minimumMatureChoices: 8,
    minimumReasonChoices: 5,
    reasons,
  };
}

function candidate(sourceMature = 20, adjustments = { "retrieval-overdue": 2, "combined-diversity": -2 }, fingerprint) {
  return {
    id: "candidate-v1-freshness",
    createdAt: "2026-09-01T00:00:00.000Z",
    adjustments,
    source: {
      matureSnapshottedChoices: sourceMature,
      ...(fingerprint ? { auditFingerprint: fingerprint } : {}),
    },
  };
}

test("policy audit fingerprint is deterministic and changes when objective audit evidence changes", () => {
  const first = audit();
  const same = audit();
  const changed = audit({ mature: 21 });
  assert.equal(buildRecommendationPolicyAuditFingerprint(first), buildRecommendationPolicyAuditFingerprint(same));
  assert.notEqual(buildRecommendationPolicyAuditFingerprint(first), buildRecommendationPolicyAuditFingerprint(changed));
});

test("exact provenance match keeps a paused candidate current", () => {
  const currentAudit = audit();
  const frozen = candidate(20, { "retrieval-overdue": 2, "combined-diversity": -2 }, buildRecommendationPolicyAuditFingerprint(currentAudit));
  const freshness = buildRecommendationCandidateFreshnessAudit({
    candidate: frozen,
    currentAudit,
    currentCandidateAdjustments: { "retrieval-overdue": 2, "combined-diversity": -2 },
  });
  assert.equal(freshness.status, "current");
  assert.equal(freshness.resumeEligible, true);
  assert.equal(freshness.newMatureChoices, 0);
});

test("changed audit remains observing until eight new mature outcomes accumulate", () => {
  const freshness = buildRecommendationCandidateFreshnessAudit({
    candidate: candidate(20),
    currentAudit: audit({ mature: 27, recognition: 2 }),
    currentCandidateAdjustments: { "retrieval-overdue": 2, "combined-diversity": -2, "recognition-miss": 2 },
  });
  assert.equal(freshness.status, "observing");
  assert.equal(freshness.resumeEligible, true);
  assert.equal(freshness.newMatureChoices, 7);
  assert.ok(freshness.changedReasons.includes("recognition-miss"));
});

test("eight new mature outcomes with a changed adjustment vector make the frozen candidate stale", () => {
  const freshness = buildRecommendationCandidateFreshnessAudit({
    candidate: candidate(20),
    currentAudit: audit({ mature: 28, recognition: 2 }),
    currentCandidateAdjustments: { "retrieval-overdue": 2, "combined-diversity": -2, "recognition-miss": 2 },
  });
  assert.equal(freshness.status, "stale");
  assert.equal(freshness.resumeEligible, false);
  assert.equal(freshness.newMatureChoices, 8);
  assert.deepEqual(freshness.changedReasons, ["recognition-miss"]);
});

test("eight new mature outcomes do not invalidate a candidate when the bounded vector is unchanged", () => {
  const freshness = buildRecommendationCandidateFreshnessAudit({
    candidate: candidate(20),
    currentAudit: audit({ mature: 31 }),
    currentCandidateAdjustments: { "retrieval-overdue": 2, "combined-diversity": -2 },
  });
  assert.equal(freshness.status, "current");
  assert.equal(freshness.resumeEligible, true);
  assert.equal(freshness.newMatureChoices, 11);
});

test("a paused candidate becomes stale when enough new evidence produces no candidate at all", () => {
  const freshness = buildRecommendationCandidateFreshnessAudit({
    candidate: candidate(20),
    currentAudit: audit({ mature: 30, retrieval: 0, diversity: 0, recognition: 0 }),
    currentCandidateAdjustments: undefined,
  });
  assert.equal(freshness.status, "stale");
  assert.equal(freshness.resumeEligible, false);
  assert.equal(freshness.currentAdjustmentSignature, undefined);
});
