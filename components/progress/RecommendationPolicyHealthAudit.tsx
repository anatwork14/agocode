"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { readRecommendationPolicyExperimentState } from "@/lib/learning/recommendation-experiment";
import {
  buildPromotedRecommendationPolicyHealth,
  type RecommendationPolicyHealthAudit,
} from "@/lib/learning/recommendation-health";
import {
  hasActiveRecommendationPolicySuspension,
  readRecommendationPolicySafetyState,
} from "@/lib/learning/recommendation-recovery";
import { readRecommendationPolicySnapshotHistory } from "@/lib/learning/recommendation-stability";

const statusLabels: Record<RecommendationPolicyHealthAudit["status"], string> = {
  inactive: "Baseline active",
  observing: "Monitoring",
  healthy: "Healthy",
  degraded: "Safety fallback",
};

function collectHealth() {
  const state = readRecommendationPolicyExperimentState(window.localStorage);
  const safety = readRecommendationPolicySafetyState(window.localStorage);
  return {
    state,
    safety,
    audit: buildPromotedRecommendationPolicyHealth({
      state,
      snapshots: readRecommendationPolicySnapshotHistory(window.localStorage),
      safety,
    }),
  };
}

function metric(value: number | undefined, suffix = "%") {
  return value === undefined ? "—" : `${value}${suffix}`;
}

export function RecommendationPolicyHealthAudit() {
  const [view, setView] = useState<ReturnType<typeof collectHealth> | null>(null);

  useEffect(() => {
    const hydrate = () => setView(collectHealth());
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

  if (!view) return <div className="system-audit-loading">Checking promoted policy health…</div>;

  const { audit, state, safety } = view;
  const latched = hasActiveRecommendationPolicySuspension(safety, state.candidate?.id);
  const badgeClass = audit.status === "healthy" && !latched
    ? "aligned"
    : audit.status === "degraded" || latched
      ? "optimistic"
      : "insufficient";
  const stability = audit.stability;
  const coverage = audit.coverage;
  const maxCoverageDrift = coverage?.axes.length
    ? Math.max(...coverage.axes.map((axis) => axis.distributionDrift))
    : undefined;
  const epochLabel = audit.monitoringEpoch === "reactivation" ? "Reactivation" : "Promotion";

  return (
    <section className="system-audit" id="policy-health" aria-labelledby="policy-health-title">
      <div className="section-heading">
        <div className="section-heading__index">POST-PROMOTION HEALTH</div>
        <div>
          <h2 id="policy-health-title">Does a promoted candidate remain safe as the learner state changes?</h2>
          <p>
            Promotion is not permanent trust. AgoCode replays a promoted candidate only on distinct planner states recorded in the
            current health epoch and rechecks both Phase 7 ranking stability and Phase 8 curriculum coverage against the deterministic baseline.
          </p>
        </div>
      </div>

      <div className="system-audit__privacy">
        <div>
          <span className="eyebrow">Derived locally · no learner score mutation</span>
          <strong>A safety fallback never deletes the frozen candidate.</strong>
        </div>
        <p>
          A hard breach now creates a persisted suspension latch. Later aggregate recovery cannot silently re-enable the candidate;
          recovery requires fresh post-suspension evidence and an explicit action in the Safety Recovery panel.
        </p>
      </div>

      <article className="system-audit__panel" style={{ marginTop: 18 }}>
        <div className="system-audit__panel-heading">
          <div>
            <span className={`system-audit__calibration system-audit__calibration--${badgeClass}`}>{latched ? "Suspended" : statusLabels[audit.status]}</span>
            <h3>Promoted policy guard</h3>
          </div>
          <Link href="/practice/next">Open adaptive planner →</Link>
        </div>

        <div className="system-audit__metrics">
          <div><span>Monitoring states</span><strong>{audit.postPromotionSnapshots}/{audit.minimumSnapshots}</strong><small>{epochLabel.toLowerCase()} epoch only</small></div>
          <div><span>Health epoch</span><strong>{audit.status === "inactive" ? "—" : epochLabel}</strong><small>{audit.monitoringSince ? `since ${new Date(audit.monitoringSince).toLocaleDateString()}` : "no active candidate"}</small></div>
          <div><span>Top-choice retention</span><strong>{metric(stability?.topChoiceRetention)}</strong><small>candidate vs baseline</small></div>
          <div><span>Top-five overlap</span><strong>{metric(stability?.meanTopFiveOverlap)}</strong><small>ranking continuity</small></div>
          <div><span>Coverage drift</span><strong>{metric(maxCoverageDrift)}</strong><small>largest curriculum-axis drift</small></div>
          <div><span>Planner fallback</span><strong>{audit.fallbackRequired || latched ? "Baseline" : "No"}</strong><small>{latched ? "suspension latched" : audit.fallbackRequired ? "breach detected" : "candidate may remain active"}</small></div>
        </div>

        <div className="system-audit__empty">
          <strong>{latched ? "The promoted candidate remains suspended until explicit recovery." : audit.status === "degraded" ? "The promoted candidate is no longer trusted for new recommendations." : statusLabels[audit.status]}</strong>
          <p>{latched ? "The immediate health aggregate may later recover, but the planner remains on baseline-v1 until fresh post-suspension replay passes and you explicitly reactivate the candidate." : audit.explanation}</p>
          {audit.candidatePolicyId ? <small className="mono">candidate: {audit.candidatePolicyId}</small> : null}
        </div>

        {audit.status === "degraded" || latched ? (
          <div className="system-audit__empty">
            <strong>Fail-safe behavior</strong>
            <p>
              New planner choices use baseline-v1. AgoCode does not rewrite mastery, remove the promoted candidate, or erase its
              experiment evidence. Recovery is deliberately hysteretic: a fresh evidence window must pass before manual reactivation.
            </p>
            <Link href="/progress#policy-recovery">Inspect safety recovery →</Link>
          </div>
        ) : null}
      </article>
    </section>
  );
}
