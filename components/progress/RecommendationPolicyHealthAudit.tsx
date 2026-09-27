"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { readRecommendationPolicyExperimentState } from "@/lib/learning/recommendation-experiment";
import {
  buildPromotedRecommendationPolicyHealth,
  type RecommendationPolicyHealthAudit,
} from "@/lib/learning/recommendation-health";
import { readRecommendationPolicySnapshotHistory } from "@/lib/learning/recommendation-stability";

const statusLabels: Record<RecommendationPolicyHealthAudit["status"], string> = {
  inactive: "Baseline active",
  observing: "Monitoring",
  healthy: "Healthy",
  degraded: "Safety fallback",
};

function collectHealth() {
  return buildPromotedRecommendationPolicyHealth({
    state: readRecommendationPolicyExperimentState(window.localStorage),
    snapshots: readRecommendationPolicySnapshotHistory(window.localStorage),
  });
}

function metric(value: number | undefined, suffix = "%") {
  return value === undefined ? "—" : `${value}${suffix}`;
}

export function RecommendationPolicyHealthAudit() {
  const [audit, setAudit] = useState<RecommendationPolicyHealthAudit | null>(null);

  useEffect(() => {
    const hydrate = () => setAudit(collectHealth());
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

  if (!audit) return <div className="system-audit-loading">Checking promoted policy health…</div>;

  const badgeClass = audit.status === "healthy"
    ? "aligned"
    : audit.status === "degraded"
      ? "optimistic"
      : "insufficient";
  const stability = audit.stability;
  const coverage = audit.coverage;
  const maxCoverageDrift = coverage?.axes.length
    ? Math.max(...coverage.axes.map((axis) => axis.distributionDrift))
    : undefined;

  return (
    <section className="system-audit" id="policy-health" aria-labelledby="policy-health-title">
      <div className="section-heading">
        <div className="section-heading__index">POST-PROMOTION HEALTH</div>
        <div>
          <h2 id="policy-health-title">Does a promoted candidate remain safe as the learner state changes?</h2>
          <p>
            Promotion is not permanent trust. AgoCode replays a promoted candidate only on distinct planner states recorded after
            promotion and rechecks both Phase 7 ranking stability and Phase 8 curriculum coverage against the deterministic baseline.
          </p>
        </div>
      </div>

      <div className="system-audit__privacy">
        <div>
          <span className="eyebrow">Derived locally · no new tracking key</span>
          <strong>A safety fallback never deletes the frozen candidate.</strong>
        </div>
        <p>
          If post-promotion health degrades, the adaptive planner uses the baseline for new choices while keeping the candidate,
          experiment record, and explicit rollback controls intact for inspection.
        </p>
      </div>

      <article className="system-audit__panel" style={{ marginTop: 18 }}>
        <div className="system-audit__panel-heading">
          <div>
            <span className={`system-audit__calibration system-audit__calibration--${badgeClass}`}>{statusLabels[audit.status]}</span>
            <h3>Promoted policy guard</h3>
          </div>
          <Link href="/practice/next">Open adaptive planner →</Link>
        </div>

        <div className="system-audit__metrics">
          <div><span>Post-promotion states</span><strong>{audit.postPromotionSnapshots}/{audit.minimumSnapshots}</strong><small>pre-promotion states excluded</small></div>
          <div><span>Top-choice retention</span><strong>{metric(stability?.topChoiceRetention)}</strong><small>candidate vs baseline</small></div>
          <div><span>Top-five overlap</span><strong>{metric(stability?.meanTopFiveOverlap)}</strong><small>post-promotion ranking continuity</small></div>
          <div><span>Family overlap</span><strong>{metric(stability?.meanFamilyOverlap)}</strong><small>structural continuity</small></div>
          <div><span>Coverage drift</span><strong>{metric(maxCoverageDrift)}</strong><small>largest curriculum-axis drift</small></div>
          <div><span>Planner fallback</span><strong>{audit.fallbackRequired ? "Baseline" : "No"}</strong><small>{audit.fallbackRequired ? "candidate suspended" : "candidate may remain active"}</small></div>
        </div>

        <div className="system-audit__empty">
          <strong>{audit.status === "degraded" ? "The promoted candidate is no longer trusted for new recommendations." : statusLabels[audit.status]}</strong>
          <p>{audit.explanation}</p>
          {audit.candidatePolicyId ? <small className="mono">candidate: {audit.candidatePolicyId}</small> : null}
        </div>

        {audit.status === "degraded" ? (
          <div className="system-audit__empty">
            <strong>Fail-safe behavior</strong>
            <p>
              New planner choices fall back to baseline-v1. AgoCode does not rewrite mastery, remove the promoted candidate, or erase
              its experiment evidence. Use the existing rollback control if you want to make the baseline the persisted local default again.
            </p>
            <Link href="/progress#policy-experiment">Inspect promotion and rollback controls →</Link>
          </div>
        ) : null}
      </article>
    </section>
  );
}
