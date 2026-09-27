import type { RecommendationPolicyAudit } from "./recommendation-policy.ts";
import type { RecommendationScoreAdjustments } from "./recommendation-rationale.ts";

export const DEFAULT_CANDIDATE_FRESHNESS_MIN_NEW_MATURE_CHOICES = 8;

export type RecommendationCandidateFreshnessStatus = "current" | "observing" | "stale";

export type RecommendationCandidateFreshnessCandidate = {
  id: string;
  createdAt: string;
  adjustments: RecommendationScoreAdjustments;
  source: {
    matureSnapshottedChoices: number;
    auditFingerprint?: string;
  };
};

export type RecommendationCandidateFreshnessAudit = {
  status: RecommendationCandidateFreshnessStatus;
  resumeEligible: boolean;
  frozenMatureChoices: number;
  currentMatureChoices: number;
  newMatureChoices: number;
  minimumNewMatureChoices: number;
  frozenFingerprint?: string;
  currentFingerprint: string;
  frozenAdjustmentSignature: string;
  currentAdjustmentSignature?: string;
  changedReasons: string[];
  explanation: string;
};

function stableHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function shortHash(value: string) {
  return stableHash(value).toString(16).padStart(8, "0");
}

export function recommendationAdjustmentSignature(adjustments: RecommendationScoreAdjustments | undefined) {
  if (!adjustments) return "none";
  const entries = Object.entries(adjustments)
    .filter(([, delta]) => delta === -2 || delta === 2)
    .sort(([left], [right]) => left.localeCompare(right));
  return entries.length ? entries.map(([reasonId, delta]) => `${reasonId}:${delta}`).join("|") : "none";
}

/**
 * Fingerprints the objective policy-audit state that produced a candidate. The fingerprint is
 * provenance only: it never enters recommendation scoring or mastery evidence.
 */
export function buildRecommendationPolicyAuditFingerprint(audit: RecommendationPolicyAudit) {
  const compact = {
    matureSnapshottedChoices: audit.matureSnapshottedChoices,
    baselineFollowThroughRate: audit.baselineFollowThroughRate ?? null,
    baselineStrongEvidenceRate: audit.baselineStrongEvidenceRate ?? null,
    reasons: audit.reasons
      .map((reason) => ({
        reasonId: reason.reasonId,
        matureChoices: reason.matureChoices,
        status: reason.status,
        suggestedScoreDelta: reason.suggestedScoreDelta,
        smoothedStrongEvidenceRate: reason.smoothedStrongEvidenceRate ?? null,
      }))
      .sort((left, right) => left.reasonId.localeCompare(right.reasonId)),
  };
  return `policy-audit-${shortHash(JSON.stringify(compact))}`;
}

function changedReasons(
  frozen: RecommendationScoreAdjustments,
  current: RecommendationScoreAdjustments | undefined,
) {
  const keys = new Set([...Object.keys(frozen), ...Object.keys(current ?? {})]);
  return [...keys]
    .filter((reasonId) => frozen[reasonId as keyof RecommendationScoreAdjustments] !== current?.[reasonId as keyof RecommendationScoreAdjustments])
    .sort();
}

export function buildRecommendationCandidateFreshnessAudit(input: {
  candidate: RecommendationCandidateFreshnessCandidate;
  currentAudit: RecommendationPolicyAudit;
  currentCandidateAdjustments?: RecommendationScoreAdjustments;
  minimumNewMatureChoices?: number;
}): RecommendationCandidateFreshnessAudit {
  const minimumNewMatureChoices = Math.max(
    2,
    Math.floor(input.minimumNewMatureChoices ?? DEFAULT_CANDIDATE_FRESHNESS_MIN_NEW_MATURE_CHOICES),
  );
  const frozenMatureChoices = Math.max(0, Math.floor(input.candidate.source.matureSnapshottedChoices));
  const currentMatureChoices = Math.max(0, Math.floor(input.currentAudit.matureSnapshottedChoices));
  const newMatureChoices = Math.max(0, currentMatureChoices - frozenMatureChoices);
  const frozenAdjustmentSignature = recommendationAdjustmentSignature(input.candidate.adjustments);
  const currentAdjustmentSignature = input.currentCandidateAdjustments
    ? recommendationAdjustmentSignature(input.currentCandidateAdjustments)
    : undefined;
  const frozenFingerprint = input.candidate.source.auditFingerprint;
  const currentFingerprint = buildRecommendationPolicyAuditFingerprint(input.currentAudit);
  const reasons = changedReasons(input.candidate.adjustments, input.currentCandidateAdjustments);

  if (frozenFingerprint && frozenFingerprint === currentFingerprint) {
    return {
      status: "current",
      resumeEligible: true,
      frozenMatureChoices,
      currentMatureChoices,
      newMatureChoices,
      minimumNewMatureChoices,
      frozenFingerprint,
      currentFingerprint,
      frozenAdjustmentSignature,
      currentAdjustmentSignature,
      changedReasons: reasons,
      explanation: "The current recommendation-policy audit exactly matches the provenance snapshot that produced this frozen candidate.",
    };
  }

  if (newMatureChoices < minimumNewMatureChoices) {
    return {
      status: "observing",
      resumeEligible: true,
      frozenMatureChoices,
      currentMatureChoices,
      newMatureChoices,
      minimumNewMatureChoices,
      frozenFingerprint,
      currentFingerprint,
      frozenAdjustmentSignature,
      currentAdjustmentSignature,
      changedReasons: reasons,
      explanation: `Only ${newMatureChoices} new mature recommendation outcome${newMatureChoices === 1 ? "" : "s"} have accumulated since this candidate was frozen. At least ${minimumNewMatureChoices} are required before a changed audit can invalidate a paused candidate.`,
    };
  }

  if (currentAdjustmentSignature === frozenAdjustmentSignature) {
    return {
      status: "current",
      resumeEligible: true,
      frozenMatureChoices,
      currentMatureChoices,
      newMatureChoices,
      minimumNewMatureChoices,
      frozenFingerprint,
      currentFingerprint,
      frozenAdjustmentSignature,
      currentAdjustmentSignature,
      changedReasons: reasons,
      explanation: `${newMatureChoices} new mature outcomes were available, but the current bounded recommendation adjustments still match the frozen candidate. Resume remains eligible.`,
    };
  }

  return {
    status: "stale",
    resumeEligible: false,
    frozenMatureChoices,
    currentMatureChoices,
    newMatureChoices,
    minimumNewMatureChoices,
    frozenFingerprint,
    currentFingerprint,
    frozenAdjustmentSignature,
    currentAdjustmentSignature,
    changedReasons: reasons,
    explanation: currentAdjustmentSignature
      ? `${newMatureChoices} new mature outcomes now produce a different candidate adjustment vector. This paused candidate is stale and must not re-enter the live experiment; start a new policy cycle instead.`
      : `${newMatureChoices} new mature outcomes no longer produce any eligible candidate adjustments. This paused candidate is stale and must not resume.`,
  };
}
