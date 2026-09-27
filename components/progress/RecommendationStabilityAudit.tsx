"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { readProblemRecognitionHistory } from "@/lib/learning/independence";
import {
  buildRecommendationPolicyCandidate,
  readRecommendationPolicyExperimentState,
} from "@/lib/learning/recommendation-experiment";
import { buildRecommendationPolicyAudit } from "@/lib/learning/recommendation-policy";
import {
  buildRecommendationPolicyStabilityAudit,
  readRecommendationPolicySnapshotHistory,
  type RecommendationPolicyStabilityAudit,
} from "@/lib/learning/recommendation-stability";
import { readRecommendationHistory } from "@/lib/learning/recommendations";
import { readReasoningAttemptHistory } from "@/lib/learning/reasoning-attempts";
import { buildRecommendationOutcomeAudit } from "@/lib/learning/system-evaluation";

type StabilityView = {
  audit: RecommendationPolicyStabilityAudit;
  experimentStatus?: "running" | "paused" | "completed";
  frozenCandidateId?: string;
};

const statusLabels: Record<RecommendationPolicyStabilityAudit["status"], string> = {
  insufficient: "Need more saved states",
  stable: "Preflight passed",
  unstable: "Launch blocked",
};

function collectStability(): StabilityView {
  const recommendations = readRecommendationHistory(window.localStorage);
  const outcomes = buildRecommendationOutcomeAudit({
    recommendations,
    reasoningAttempts: readReasoningAttemptHistory(window.localStorage),
    recognitionHistory: readProblemRecognitionHistory(window.localStorage),
    now: Date.now(),
  });
  const policy = buildRecommendationPolicyAudit({ recommendations, outcomes });
  const experimentState = readRecommendationPolicyExperimentState(window.localStorage);
  const candidate = experimentState.candidate ?? buildRecommendationPolicyCandidate(policy);
  const snapshots = readRecommendationPolicySnapshotHistory(window.localStorage);
  return {
    audit: buildRecommendationPolicyStabilityAudit({ candidate, snapshots }),
    experimentStatus: experimentState.experiment?.status,
    frozenCandidateId: experimentState.candidate?.id,
  };
}

function formatDate(value: string) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "Unknown date";
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(date);
}

export function RecommendationStabilityAudit() {
  const [view, setView] = useState<StabilityView | null>(null);

  useEffect(() => {
    const hydrate = () => setView(collectStability());
    const timer = window.setTimeout(hydrate, 0);
    const handleStorage = (event: StorageEvent) => {
      if (!event.key || event.key.startsWith("agocode.")) hydrate();
    };
    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", hydrate);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", hydrate);
    };
  }, []);

  const worstComparisons = useMemo(() => (
    [...(view?.audit.comparisons ?? [])]
      .sort((left, right) => (
        left.topFiveOverlap - right.topFiveOverlap
        || right.rankDisplacement - left.rankDisplacement
        || left.recordedAt.localeCompare(right.recordedAt)
      ))
      .slice(0, 3)
  ), [view]);

  if (!view) {
    return <div className="system-audit-loading">Replaying candidate policy against saved learner states…</div>;
  }

  const audit = view.audit;
  const badgeClass = audit.status === "stable"
    ? "aligned"
    : audit.status === "unstable"
      ? "optimistic"
      : "insufficient";
  const runningLegacyExperiment = Boolean(view.experimentStatus && view.experimentStatus !== "completed");

  return (
    <section className="system-audit" id="policy-stability" aria-labelledby="policy-stability-title">
      <div className="section-heading">
        <div className="section-heading__index">POLICY PREFLIGHT</div>
        <div>
          <h2 id="policy-stability-title">Will a candidate remain stable across learner states before we test it live?</h2>
          <p>
            AgoCode replays the deterministic baseline and the proposed candidate against the same prospective planner-state snapshots.
            Excessive top-choice, shortlist, structural-family, or rank churn blocks a new live experiment before the learner is exposed to it.
          </p>
        </div>
      </div>

      <div className="system-audit__privacy">
        <div>
          <span className="eyebrow">Counterfactual only</span>
          <strong>No synthetic mastery. No telemetry. No retroactive learner states.</strong>
        </div>
        <p>
          Planner states are captured only when the learner actually visits the adaptive planner and recommendation-relevant evidence has changed.
          Refreshing the page, changing the UI mix seed, or switching an experiment arm does not create a new replay sample.
        </p>
      </div>

      <article className="system-audit__panel" style={{ marginTop: 18 }}>
        <div className="system-audit__panel-heading">
          <div>
            <span className={`system-audit__calibration system-audit__calibration--${badgeClass}`}>{statusLabels[audit.status]}</span>
            <h3>Baseline-vs-candidate ranking stability</h3>
          </div>
          <Link href="/practice/next">Capture current planner state →</Link>
        </div>

        <div className="system-audit__metrics">
          <div><span>Replay states</span><strong>{audit.replayedSnapshots}/{audit.minimumSnapshots}</strong><small>{audit.storedSnapshots} stored · {audit.invalidSnapshots} invalid</small></div>
          <div><span>Top-choice retention</span><strong>{audit.topChoiceRetention === undefined ? "—" : `${audit.topChoiceRetention}%`}</strong><small>same #1 recommendation</small></div>
          <div><span>Top-five overlap</span><strong>{audit.meanTopFiveOverlap === undefined ? "—" : `${audit.meanTopFiveOverlap}%`}</strong><small>mean problem overlap</small></div>
          <div><span>Family overlap</span><strong>{audit.meanFamilyOverlap === undefined ? "—" : `${audit.meanFamilyOverlap}%`}</strong><small>mean structural-family overlap</small></div>
          <div><span>Rank displacement</span><strong>{audit.meanRankDisplacement === undefined ? "—" : `${audit.meanRankDisplacement}%`}</strong><small>lower is more stable</small></div>
          <div><span>High-churn states</span><strong>{audit.highChurnRate === undefined ? "—" : `${audit.highChurnRate}%`}</strong><small>{audit.highChurnSnapshots} replay state{audit.highChurnSnapshots === 1 ? "" : "s"}</small></div>
        </div>

        <div className="system-audit__empty">
          <strong>{audit.launchEligible ? "Candidate may proceed to Phase 6's live experiment gate." : "A new live experiment cannot start yet."}</strong>
          <p>{audit.explanation}</p>
          {audit.candidatePolicyId ? <small className="mono">candidate: {audit.candidatePolicyId}</small> : null}
        </div>

        {runningLegacyExperiment ? (
          <div className="system-audit__empty">
            <strong>An experiment was already frozen before this preflight result.</strong>
            <p>
              Phase 7 never rewrites an experiment already in progress. The stability gate applies when starting a new experiment;
              the existing frozen comparison remains auditable and reversible under Phase 6.
            </p>
            {view.frozenCandidateId ? <small className="mono">frozen candidate: {view.frozenCandidateId}</small> : null}
          </div>
        ) : null}

        {worstComparisons.length ? (
          <div className="system-audit__skills">
            {worstComparisons.map((comparison) => (
              <div className="system-audit__skill" key={comparison.snapshotId}>
                <div>
                  <span className="system-audit__calibration system-audit__calibration--insufficient">Replay state</span>
                  <strong>{formatDate(comparison.recordedAt)}</strong>
                  <small className="mono">{comparison.snapshotId}</small>
                </div>
                <div className="system-audit__skill-scores">
                  <span>Top choice <strong>{comparison.topChoiceSame ? "same" : "changed"}</strong></span>
                  <span>Top-five overlap <strong>{comparison.topFiveOverlap}%</strong></span>
                  <span>Family overlap <strong>{comparison.familyOverlap}%</strong></span>
                  <span>Rank movement <strong>{comparison.rankDisplacement}%</strong></span>
                </div>
                <p>
                  Baseline and candidate are replayed with the same saved learner state and deterministic replay seed. Any difference here is therefore attributable to the candidate rationale deltas, not to a different learner state or random reshuffle.
                </p>
              </div>
            ))}
          </div>
        ) : null}
      </article>
    </section>
  );
}
