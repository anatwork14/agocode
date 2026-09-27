"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { readProblemRecognitionHistory } from "@/lib/learning/independence";
import {
  buildRecommendationPolicyCandidate,
  readRecommendationPolicyExperimentState,
} from "@/lib/learning/recommendation-experiment";
import {
  buildRecommendationPolicyCoverageAudit,
  type RecommendationPolicyCoverageAudit,
} from "@/lib/learning/recommendation-coverage";
import { buildRecommendationPolicyAudit } from "@/lib/learning/recommendation-policy";
import {
  buildRecommendationPolicyStabilityAudit,
  readRecommendationPolicySnapshotHistory,
} from "@/lib/learning/recommendation-stability";
import { readRecommendationHistory } from "@/lib/learning/recommendations";
import { readReasoningAttemptHistory } from "@/lib/learning/reasoning-attempts";
import { buildRecommendationOutcomeAudit } from "@/lib/learning/system-evaluation";

const axisLabels: Record<RecommendationPolicyCoverageAudit["axes"][number]["axis"], string> = {
  family: "Structural family",
  source: "Book source",
  domain: "Problem domain",
  level: "Difficulty level",
};

const statusLabels: Record<RecommendationPolicyCoverageAudit["status"], string> = {
  insufficient: "Need more replay states",
  balanced: "Coverage passed",
  imbalanced: "Launch blocked",
};

function collectCoverage() {
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
  const stability = buildRecommendationPolicyStabilityAudit({ candidate, snapshots });
  return {
    audit: buildRecommendationPolicyCoverageAudit({ stability, snapshots }),
    experimentStatus: experimentState.experiment?.status,
    frozenCandidateId: experimentState.candidate?.id,
  };
}

function signed(value: number) {
  return value > 0 ? `+${value}` : String(value);
}

export function RecommendationCoverageAudit() {
  const [view, setView] = useState<ReturnType<typeof collectCoverage> | null>(null);

  useEffect(() => {
    const hydrate = () => setView(collectCoverage());
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

  const starvedValues = useMemo(() => (
    view?.audit.axes.flatMap((axis) => axis.starvedValues.map((value) => `${axisLabels[axis.axis]}: ${value}`)) ?? []
  ), [view]);

  if (!view) {
    return <div className="system-audit-loading">Checking candidate exposure across curriculum coverage…</div>;
  }

  const audit = view.audit;
  const badgeClass = audit.status === "balanced"
    ? "aligned"
    : audit.status === "imbalanced"
      ? "optimistic"
      : "insufficient";
  const balancedAxes = audit.axes.filter((axis) => axis.status === "balanced").length;
  const observedCohorts = audit.cohorts.filter((cohort) => cohort.status !== "observing");
  const balancedCohorts = observedCohorts.filter((cohort) => cohort.status === "balanced").length;
  const maxDrift = Math.max(0, ...audit.axes.map((axis) => axis.distributionDrift));
  const maxConcentration = Math.max(0, ...audit.axes.map((axis) => axis.concentrationDelta));
  const existingExperiment = Boolean(view.experimentStatus && view.experimentStatus !== "completed");

  return (
    <section className="system-audit" id="policy-coverage" aria-labelledby="policy-coverage-title">
      <div className="section-heading">
        <div className="section-heading__index">COVERAGE GUARDRAILS</div>
        <div>
          <h2 id="policy-coverage-title">Does a candidate preserve broad learning exposure instead of collapsing onto a narrow slice?</h2>
          <p>
            A candidate can be globally stable yet still over-concentrate recommendations. AgoCode therefore compares aggregate
            exposure to the deterministic baseline across structural families, book sources, domains, difficulty levels, and the
            learner&apos;s observed weakest-mastery cohorts before a new experiment can start.
          </p>
        </div>
      </div>

      <div className="system-audit__privacy">
        <div>
          <span className="eyebrow">Curriculum coverage, not demographic profiling</span>
          <strong>Only local learning-state and exercise metadata are used.</strong>
        </div>
        <p>
          This guardrail is about recommendation coverage inside the curriculum. It does not infer protected traits or demographic
          groups. Candidate distributions are compared only with what the baseline would have shown for the same saved learner states.
        </p>
      </div>

      <article className="system-audit__panel" style={{ marginTop: 18 }}>
        <div className="system-audit__panel-heading">
          <div>
            <span className={`system-audit__calibration system-audit__calibration--${badgeClass}`}>{statusLabels[audit.status]}</span>
            <h3>Baseline-relative recommendation coverage</h3>
          </div>
          <Link href="/practice/next">Capture another learner state →</Link>
        </div>

        <div className="system-audit__metrics">
          <div><span>Replay states</span><strong>{audit.replayedSnapshots}/{audit.minimumSnapshots}</strong><small>same Phase 7 counterfactual states</small></div>
          <div><span>Coverage axes</span><strong>{balancedAxes}/{audit.axes.length || 4}</strong><small>{audit.imbalancedAxes} imbalanced</small></div>
          <div><span>Observed mastery cohorts</span><strong>{balancedCohorts}/{observedCohorts.length}</strong><small>{audit.imbalancedCohorts} imbalanced · {audit.cohorts.length - observedCohorts.length} observing</small></div>
          <div><span>Max distribution drift</span><strong>{audit.axes.length ? `${maxDrift}%` : "—"}</strong><small>lower stays closer to baseline exposure</small></div>
          <div><span>Max concentration change</span><strong>{audit.axes.length ? `${signed(maxConcentration)} pts` : "—"}</strong><small>largest axis-level concentration increase</small></div>
          <div><span>Starved categories</span><strong>{starvedValues.length}</strong><small>meaningful baseline categories removed entirely</small></div>
        </div>

        <div className="system-audit__empty">
          <strong>{audit.launchEligible ? "Coverage permits the candidate to reach the live experiment gate." : "A new live experiment cannot start on coverage evidence yet."}</strong>
          <p>{audit.explanation}</p>
          {audit.candidatePolicyId ? <small className="mono">candidate: {audit.candidatePolicyId}</small> : null}
        </div>

        {starvedValues.length ? (
          <div className="system-audit__empty">
            <strong>Meaningful baseline exposure removed by the candidate</strong>
            <p>{starvedValues.join(" · ")}</p>
          </div>
        ) : null}

        {audit.axes.length ? (
          <div className="system-audit__skills">
            {audit.axes.map((axis) => (
              <div className="system-audit__skill" key={axis.axis}>
                <div>
                  <span className={`system-audit__calibration system-audit__calibration--${axis.status === "balanced" ? "aligned" : "optimistic"}`}>{axis.status === "balanced" ? "Balanced" : "Imbalanced"}</span>
                  <strong>{axisLabels[axis.axis]}</strong>
                  <small>{axis.baselineUnique} baseline categories → {axis.candidateUnique} candidate categories</small>
                </div>
                <div className="system-audit__skill-scores">
                  <span>Retention <strong>{axis.uniqueRetention}%</strong></span>
                  <span>Distribution drift <strong>{axis.distributionDrift}%</strong></span>
                  <span>Baseline max share <strong>{axis.baselineMaxShare}%</strong></span>
                  <span>Candidate max share <strong>{axis.candidateMaxShare}%</strong></span>
                  <span>Concentration Δ <strong>{signed(axis.concentrationDelta)} pts</strong></span>
                </div>
                <p>{axis.explanation}</p>
              </div>
            ))}
          </div>
        ) : null}

        {audit.cohorts.length ? (
          <div className="system-audit__skills">
            {audit.cohorts.map((cohort) => (
              <div className="system-audit__skill" key={cohort.dimensionId}>
                <div>
                  <span className={`system-audit__calibration system-audit__calibration--${cohort.status === "balanced" ? "aligned" : cohort.status === "imbalanced" ? "optimistic" : "insufficient"}`}>{cohort.status === "observing" ? "Observing" : cohort.status === "balanced" ? "Balanced" : "Imbalanced"}</span>
                  <strong>Weakest mastery · {cohort.dimensionId}</strong>
                  <small>{cohort.snapshots} saved learner state{cohort.snapshots === 1 ? "" : "s"}</small>
                </div>
                <div className="system-audit__skill-scores">
                  <span>Top-choice retention <strong>{cohort.topChoiceRetention}%</strong></span>
                  <span>Top-five overlap <strong>{cohort.meanTopFiveOverlap}%</strong></span>
                </div>
                <p>{cohort.explanation}</p>
              </div>
            ))}
          </div>
        ) : null}

        {existingExperiment ? (
          <div className="system-audit__empty">
            <strong>An experiment was already frozen before this coverage result.</strong>
            <p>
              Phase 8 does not rewrite an experiment already in progress. The coverage gate applies when starting a new candidate;
              the existing Phase 6 comparison remains auditable and reversible.
            </p>
            {view.frozenCandidateId ? <small className="mono">frozen candidate: {view.frozenCandidateId}</small> : null}
          </div>
        ) : null}
      </article>
    </section>
  );
}
