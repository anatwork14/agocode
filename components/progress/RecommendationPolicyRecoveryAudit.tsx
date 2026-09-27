"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { readRecommendationPolicyExperimentState } from "@/lib/learning/recommendation-experiment";
import {
  buildRecommendationPolicyRecoveryAudit,
  reactivateRecommendationPolicyAfterRecovery,
  readRecommendationPolicySafetyState,
  type RecommendationPolicyRecoveryAudit,
  type RecommendationPolicySafetyState,
} from "@/lib/learning/recommendation-recovery";
import { readRecommendationPolicySnapshotHistory } from "@/lib/learning/recommendation-stability";

const statusLabels: Record<RecommendationPolicyRecoveryAudit["status"], string> = {
  inactive: "No suspension",
  observing: "Collecting recovery evidence",
  blocked: "Recovery blocked",
  ready: "Recovery ready",
};

const reasonLabels = {
  stability: "ranking stability",
  coverage: "curriculum coverage",
  "stability-and-coverage": "ranking stability + curriculum coverage",
} as const;

function collectRecovery() {
  const state = readRecommendationPolicyExperimentState(window.localStorage);
  const safety = readRecommendationPolicySafetyState(window.localStorage);
  const snapshots = readRecommendationPolicySnapshotHistory(window.localStorage);
  return {
    state,
    safety,
    audit: buildRecommendationPolicyRecoveryAudit({ state, safety, snapshots }),
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
  return event.event === "candidate-suspended" ? "Candidate suspended" : "Candidate reactivated";
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

  const recentEvents = useMemo(() => [...(view?.safety.events ?? [])].reverse().slice(0, 6), [view]);

  if (!view) return <div className="system-audit-loading">Reading local recommendation-policy recovery state…</div>;

  const { audit, state, safety } = view;
  const badgeClass = audit.status === "ready"
    ? "aligned"
    : audit.status === "blocked"
      ? "optimistic"
      : "insufficient";
  const stability = audit.stability;
  const coverage = audit.coverage;
  const maxCoverageDrift = coverage?.axes.length
    ? Math.max(...coverage.axes.map((axis) => axis.distributionDrift))
    : undefined;

  function reactivate() {
    const nextSafety = reactivateRecommendationPolicyAfterRecovery(
      window.localStorage,
      state,
      audit,
    );
    setView((current) => current ? {
      ...collectRecovery(),
      safety: nextSafety,
    } : current);
  }

  return (
    <section className="system-audit" id="policy-recovery" aria-labelledby="policy-recovery-title">
      <div className="section-heading">
        <div className="section-heading__index">SAFETY RECOVERY</div>
        <div>
          <h2 id="policy-recovery-title">Can a suspended promoted policy earn its way back without policy flapping?</h2>
          <p>
            A post-promotion safety breach is latched. Later aggregate improvement cannot silently reactivate the candidate.
            AgoCode waits for a fresh post-suspension replay window, requires both stability and coverage again, then still asks for an explicit local reactivation.
          </p>
        </div>
      </div>

      <div className="system-audit__privacy">
        <div>
          <span className="eyebrow">Runtime safety state only</span>
          <strong>Suspension and recovery never become mastery evidence.</strong>
        </div>
        <p>
          The safety latch stores only candidate identity, timestamps, failure reason, and a bounded runtime event log in this browser.
          The frozen experiment and policy-lineage ledger remain unchanged.
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
          <div><span>Reactivation</span><strong>{audit.reactivationEligible ? "Available" : "Locked"}</strong><small>always explicit</small></div>
        </div>

        <div className="system-audit__empty">
          <strong>{audit.status === "ready" ? "Fresh evidence has recovered, but the candidate is still suspended." : statusLabels[audit.status]}</strong>
          <p>{audit.explanation}</p>
          {audit.suspendedAt ? <small>Suspended {formatDate(audit.suspendedAt)}</small> : null}
        </div>

        {audit.reactivationEligible ? (
          <div className="system-audit__empty">
            <strong>Explicit recovery action</strong>
            <p>
              Reactivating restores the same frozen promoted candidate and starts a new health epoch at this moment.
              Old degraded snapshots remain inspectable but cannot immediately re-trigger the new epoch.
            </p>
            <button className="button button--primary" type="button" onClick={reactivate}>Reactivate candidate locally</button>
          </div>
        ) : null}

        {recentEvents.length ? (
          <div className="system-audit__skills">
            {recentEvents.map((event) => (
              <div className="system-audit__skill" key={event.id}>
                <div>
                  <span className={`system-audit__calibration system-audit__calibration--${event.event === "candidate-reactivated" ? "aligned" : "optimistic"}`}>{eventLabel(event)}</span>
                  <strong>{formatDate(event.occurredAt)}</strong>
                  <small className="mono">{event.candidatePolicyId}</small>
                </div>
                <p>{event.reason ? `Safety reason: ${reasonLabels[event.reason]}.` : "A fresh recovery gate passed and the learner explicitly reactivated this candidate."}</p>
              </div>
            ))}
          </div>
        ) : null}
      </article>
    </section>
  );
}
