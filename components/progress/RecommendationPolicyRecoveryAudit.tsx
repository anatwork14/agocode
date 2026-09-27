"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { readProblemRecognitionHistory } from "@/lib/learning/independence";
import { readRecommendationPolicyExperimentState } from "@/lib/learning/recommendation-experiment";
import { buildPromotedRecommendationPolicyHealth } from "@/lib/learning/recommendation-health";
import {
  buildRecommendationPolicyProbationAudit,
  buildRecommendationPolicyRecoveryAudit,
  completeRecommendationPolicyProbation,
  reactivateRecommendationPolicyAfterRecovery,
  readRecommendationPolicySafetyState,
  synchronizeRecommendationPolicyProbationFailure,
  synchronizeRecommendationPolicySafety,
  type RecommendationPolicyProbationAudit,
  type RecommendationPolicyRecoveryAudit,
  type RecommendationPolicySafetyState,
} from "@/lib/learning/recommendation-recovery";
import { readRecommendationHistory } from "@/lib/learning/recommendations";
import { readReasoningAttemptHistory } from "@/lib/learning/reasoning-attempts";
import { readRecommendationPolicySnapshotHistory } from "@/lib/learning/recommendation-stability";
import { buildRecommendationOutcomeAudit } from "@/lib/learning/system-evaluation";

const statusLabels: Record<RecommendationPolicyRecoveryAudit["status"], string> = {
  inactive: "No suspension",
  observing: "Collecting recovery evidence",
  blocked: "Recovery blocked",
  ready: "Recovery ready",
};

const probationStatusLabels: Record<RecommendationPolicyProbationAudit["status"], string> = {
  inactive: "No probation",
  observing: "Canary collecting evidence",
  ready: "Canary ready",
  failed: "Canary failed",
};

const reasonLabels = {
  stability: "ranking stability",
  coverage: "curriculum coverage",
  "stability-and-coverage": "ranking stability + curriculum coverage",
  "probation-outcomes": "recovery probation outcomes",
} as const;

function collectRecovery() {
  const state = readRecommendationPolicyExperimentState(window.localStorage);
  const safety = readRecommendationPolicySafetyState(window.localStorage);
  const snapshots = readRecommendationPolicySnapshotHistory(window.localStorage);
  const recommendations = readRecommendationHistory(window.localStorage);
  const reasoningAttempts = readReasoningAttemptHistory(window.localStorage);
  const recognitionHistory = readProblemRecognitionHistory(window.localStorage);
  const outcomes = buildRecommendationOutcomeAudit({
    recommendations,
    reasoningAttempts,
    recognitionHistory,
    now: Date.now(),
  });
  const health = buildPromotedRecommendationPolicyHealth({ state, snapshots, safety });
  return {
    state,
    safety,
    snapshots,
    health,
    audit: buildRecommendationPolicyRecoveryAudit({ state, safety, snapshots }),
    probation: buildRecommendationPolicyProbationAudit({
      state,
      safety,
      recommendations,
      outcomes,
      health,
    }),
  };
}

function formatDate(value: string | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "Unknown date";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function eventLabel(event: RecommendationPolicySafetyState["events"][number]) {
  if (event.event === "candidate-suspended") return "Candidate suspended";
  if (event.event === "candidate-reactivated") return "Candidate reactivated";
  if (event.event === "candidate-probation-started") return "Recovery probation started";
  return "Recovery probation completed";
}

function metric(value: number | undefined, suffix = " pts") {
  if (value === undefined) return "—";
  return `${value > 0 ? "+" : ""}${value}${suffix}`;
}

export function RecommendationPolicyRecoveryAudit() {
  const [view, setView] = useState<ReturnType<typeof collectRecovery> | null>(null);

  useEffect(() => {
    const hydrate = () => setView(collectRecovery());
    const timer = window.setTimeout(hydrate, 0);
    let sameTabTimer: number | undefined;
    const handleStorage = (event: StorageEvent) => {
      if (!event.key || event.key.startsWith("agocode.")) hydrate();
    };
    const handleSameTabAction = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element) || !target.closest("#policy-recovery")) return;
      if (sameTabTimer !== undefined) window.clearTimeout(sameTabTimer);
      sameTabTimer = window.setTimeout(hydrate, 0);
    };
    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", hydrate);
    window.addEventListener("click", handleSameTabAction, true);
    return () => {
      window.clearTimeout(timer);
      if (sameTabTimer !== undefined) window.clearTimeout(sameTabTimer);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", hydrate);
      window.removeEventListener("click", handleSameTabAction, true);
    };
  }, []);

  useEffect(() => {
    if (!view) return;
    let updated = view.safety;
    if (view.health.fallbackRequired) {
      updated = synchronizeRecommendationPolicySafety(
        window.localStorage,
        view.state,
        view.health,
      );
    } else if (view.probation.failureReason === "outcomes") {
      updated = synchronizeRecommendationPolicyProbationFailure(
        window.localStorage,
        view.state,
        view.probation,
      );
    }
    if (JSON.stringify(updated) !== JSON.stringify(view.safety)) {
      const refreshTimer = window.setTimeout(() => setView(collectRecovery()), 0);
      return () => window.clearTimeout(refreshTimer);
    }
  }, [view]);

  const recentEvents = useMemo(() => [...(view?.safety.events ?? [])].reverse().slice(0, 8), [view]);

  if (!view) return <div className="system-audit-loading">Reading local recommendation-policy recovery state…</div>;

  const { audit, state, safety, probation } = view;
  const badgeClass = audit.status === "ready"
    ? "aligned"
    : audit.status === "blocked"
      ? "optimistic"
      : "insufficient";
  const probationBadgeClass = probation.status === "ready"
    ? "aligned"
    : probation.status === "failed"
      ? "optimistic"
      : "insufficient";
  const stability = audit.stability;
  const coverage = audit.coverage;
  const maxCoverageDrift = coverage?.axes.length
    ? Math.max(...coverage.axes.map((axis) => axis.distributionDrift))
    : undefined;

  function reactivate() {
    reactivateRecommendationPolicyAfterRecovery(
      window.localStorage,
      state,
      audit,
    );
    setView(collectRecovery());
  }

  function completeProbation() {
    completeRecommendationPolicyProbation(
      window.localStorage,
      state,
      probation,
    );
    setView(collectRecovery());
  }

  return (
    <section className="system-audit" id="policy-recovery" aria-labelledby="policy-recovery-title">
      <div className="section-heading">
        <div className="section-heading__index">SAFETY RECOVERY</div>
        <div>
          <h2 id="policy-recovery-title">Can a suspended promoted policy earn its way back without policy flapping?</h2>
          <p>
            A post-promotion safety breach is latched. Fresh replay evidence must first recover ranking stability and curriculum coverage.
            Explicit reactivation then starts a baseline-first probation canary; full candidate service returns only after the canary also clears objective-outcome parity.
          </p>
        </div>
      </div>

      <div className="system-audit__privacy">
        <div>
          <span className="eyebrow">Runtime safety state only</span>
          <strong>Suspension, probation, and recovery never become mastery evidence.</strong>
        </div>
        <p>
          The safety state stores only candidate identity, timestamps, failure reason, probation epoch, and a bounded runtime event log in this browser.
          Recommendation outcomes used by the canary already exist in AgoCode&apos;s normal evidence history; Phase 12 creates no parallel learner score.
        </p>
      </div>

      <article className="system-audit__panel" style={{ marginTop: 18 }}>
        <div className="system-audit__panel-heading">
          <div>
            <span className={`system-audit__calibration system-audit__calibration--${badgeClass}`}>{statusLabels[audit.status]}</span>
            <h3>Promoted candidate recovery gate</h3>
          </div>
          <Link href="/practice/next">Capture fresh planner state →</Link>
        </div>

        <div className="system-audit__metrics">
          <div><span>Fresh recovery states</span><strong>{audit.recoverySnapshots}/{audit.minimumSnapshots}</strong><small>only states after suspension count</small></div>
          <div><span>Suspension</span><strong>{safety.suspension ? "Latched" : "No"}</strong><small>{audit.reason ? reasonLabels[audit.reason] : "no active failure reason"}</small></div>
          <div><span>Top-choice retention</span><strong>{stability?.topChoiceRetention === undefined ? "—" : `${stability.topChoiceRetention}%`}</strong><small>fresh replay only</small></div>
          <div><span>Top-five overlap</span><strong>{stability?.meanTopFiveOverlap === undefined ? "—" : `${stability.meanTopFiveOverlap}%`}</strong><small>fresh ranking continuity</small></div>
          <div><span>Coverage drift</span><strong>{maxCoverageDrift === undefined ? "—" : `${maxCoverageDrift}%`}</strong><small>largest curriculum-axis drift</small></div>
          <div><span>Reactivation</span><strong>{audit.reactivationEligible ? "Canary available" : "Locked"}</strong><small>never restores full traffic directly</small></div>
        </div>

        <div className="system-audit__empty">
          <strong>{audit.status === "ready" ? "Fresh replay recovered; the candidate is still suspended until you start probation." : statusLabels[audit.status]}</strong>
          <p>{audit.explanation}</p>
          {audit.suspendedAt ? <small>Suspended {formatDate(audit.suspendedAt)}</small> : null}
        </div>

        {audit.reactivationEligible ? (
          <div className="system-audit__empty">
            <strong>Explicit recovery action</strong>
            <p>
              Reactivation does not restore full candidate traffic. It starts a new health epoch and a baseline-first canary that alternates
              baseline and candidate recommendations until objective outcomes plus fresh replay health are good enough to complete probation.
            </p>
            <button className="button button--primary" type="button" onClick={reactivate}>Start recovery probation</button>
          </div>
        ) : null}

        {probation.status !== "inactive" ? (
          <div className="system-audit__skills">
            <div className="system-audit__skill">
              <div>
                <span className={`system-audit__calibration system-audit__calibration--${probationBadgeClass}`}>{probationStatusLabels[probation.status]}</span>
                <strong>Baseline-first recovery canary</strong>
                <small className="mono">{probation.probationId}</small>
              </div>
              <div className="system-audit__skill-scores">
                <span>Baseline mature <strong>{probation.baseline.matureChoices}/{probation.minimumPerVariant}</strong></span>
                <span>Candidate mature <strong>{probation.candidate.matureChoices}/{probation.minimumPerVariant}</strong></span>
                <span>Strong-evidence lift <strong>{metric(probation.strongEvidenceLift)}</strong></span>
                <span>Follow-through lift <strong>{metric(probation.followThroughLift)}</strong></span>
                <span>Fresh health <strong>{probation.healthStatus ?? "—"}</strong></span>
              </div>
              <p>{probation.explanation}</p>
              {probation.completionEligible ? (
                <button className="button button--primary" type="button" onClick={completeProbation}>Complete probation and restore full candidate</button>
              ) : null}
            </div>
          </div>
        ) : null}

        {recentEvents.length ? (
          <div className="system-audit__skills">
            {recentEvents.map((event) => (
              <div className="system-audit__skill" key={event.id}>
                <div>
                  <span className={`system-audit__calibration system-audit__calibration--${event.event === "candidate-suspended" ? "optimistic" : "aligned"}`}>{eventLabel(event)}</span>
                  <strong>{formatDate(event.occurredAt)}</strong>
                  <small className="mono">{event.candidatePolicyId}</small>
                </div>
                <p>
                  {event.reason
                    ? `Safety reason: ${reasonLabels[event.reason]}.`
                    : event.event === "candidate-probation-started"
                      ? "Recovery entered a baseline-first canary; full candidate service remains unavailable."
                      : event.event === "candidate-probation-completed"
                        ? "Probation cleared both objective-outcome and fresh-health gates; full candidate service resumed explicitly."
                        : "Fresh recovery replay passed and the learner explicitly started the recovery canary."}
                </p>
              </div>
            ))}
          </div>
        ) : null}
      </article>
    </section>
  );
}
