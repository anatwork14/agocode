"use client";

import { useEffect, useState } from "react";
import { buildRecommendationPolicyConsistencyAudit } from "@/lib/learning/recommendation-consistency";
import { readRecommendationPolicyExperimentState } from "@/lib/learning/recommendation-experiment";
import { readRecommendationPolicySafetyState } from "@/lib/learning/recommendation-recovery";
import { readRecommendationHistory } from "@/lib/learning/recommendations";

const statusLabels = {
  healthy: "Consistent",
  warning: "History warning",
  critical: "Baseline required",
} as const;

function collectConsistency() {
  return buildRecommendationPolicyConsistencyAudit({
    state: readRecommendationPolicyExperimentState(window.localStorage),
    safety: readRecommendationPolicySafetyState(window.localStorage),
    recommendations: readRecommendationHistory(window.localStorage),
  });
}

export function RecommendationPolicyConsistencyAudit() {
  const [audit, setAudit] = useState<ReturnType<typeof collectConsistency> | null>(null);

  useEffect(() => {
    const hydrate = () => setAudit(collectConsistency());
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

  if (!audit) return <div className="system-audit-loading">Checking recommendation-policy consistency…</div>;
  const badgeClass = audit.status === "healthy" ? "aligned" : audit.status === "critical" ? "optimistic" : "insufficient";

  return (
    <section className="system-audit" id="policy-consistency" aria-labelledby="policy-consistency-title">
      <div className="section-heading">
        <div className="section-heading__index">POLICY CONSISTENCY</div>
        <div>
          <h2 id="policy-consistency-title">Do lifecycle, safety, and recommendation-attribution records still agree?</h2>
          <p>
            AgoCode cross-checks the live policy state, bounded lineage, safety latch/probation state, and policy metadata written with
            recommendation choices. Critical contradictions require deterministic-baseline fallback; bounded-history gaps are warnings only.
          </p>
        </div>
      </div>

      <article className="system-audit__panel" style={{ marginTop: 18 }}>
        <div className="system-audit__panel-heading">
          <div>
            <span className={`system-audit__calibration system-audit__calibration--${badgeClass}`}>{statusLabels[audit.status]}</span>
            <h3>Local policy-state integrity</h3>
          </div>
        </div>

        <div className="system-audit__metrics">
          <div><span>Critical issues</span><strong>{audit.criticalIssues}</strong><small>{audit.fallbackRequired ? "candidate traffic must fail closed" : "no hard contradiction"}</small></div>
          <div><span>Warnings</span><strong>{audit.warnings}</strong><small>bounded-history uncertainty</small></div>
          <div><span>Known candidates</span><strong>{audit.knownCandidateIds.length}</strong><small>live + retained lineage</small></div>
          <div><span>Known experiments</span><strong>{audit.knownExperimentIds.length}</strong><small>live + retained lineage</small></div>
        </div>

        <div className="system-audit__empty">
          <strong>{audit.fallbackRequired ? "Candidate traffic is not trustworthy until state is repaired or reset." : "Policy state is internally usable."}</strong>
          <p>{audit.explanation}</p>
        </div>

        {audit.issues.length ? (
          <div className="system-audit__skills">
            {audit.issues.map((issue, index) => (
              <div className="system-audit__skill" key={`${issue.code}-${issue.relatedId ?? index}`}>
                <div>
                  <span className={`system-audit__calibration system-audit__calibration--${issue.severity === "critical" ? "optimistic" : "insufficient"}`}>{issue.severity}</span>
                  <strong>{issue.code.replaceAll("-", " ")}</strong>
                  <small className="mono">{issue.relatedId ?? "local state"}</small>
                </div>
                <p>{issue.message}</p>
              </div>
            ))}
          </div>
        ) : null}
      </article>
    </section>
  );
}
