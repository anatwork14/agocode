"use client";

import { useEffect, useState } from "react";
import {
  buildRecommendationPolicyConsistencyAudit,
  readRecommendationPolicyRepairReceipt,
  repairRecommendationPolicyConsistency,
  type RecommendationPolicyRepairReceipt,
} from "@/lib/learning/recommendation-consistency";
import { readRecommendationPolicyExperimentState } from "@/lib/learning/recommendation-experiment";
import { readRecommendationPolicySafetyState } from "@/lib/learning/recommendation-recovery";
import { readRecommendationHistory } from "@/lib/learning/recommendations";

const statusLabels = { healthy: "Consistent", warning: "History warning", critical: "Baseline required" } as const;

function collectConsistency() {
  return buildRecommendationPolicyConsistencyAudit({
    state: readRecommendationPolicyExperimentState(window.localStorage),
    safety: readRecommendationPolicySafetyState(window.localStorage),
    recommendations: readRecommendationHistory(window.localStorage),
  });
}

export function RecommendationPolicyConsistencyAudit() {
  const [audit, setAudit] = useState<ReturnType<typeof collectConsistency> | null>(null);
  const [repairReceipt, setRepairReceipt] = useState<RecommendationPolicyRepairReceipt | null>(null);
  const [confirmRepair, setConfirmRepair] = useState(false);
  const [repairMessage, setRepairMessage] = useState<string | null>(null);

  useEffect(() => {
    const hydrate = () => {
      setAudit(collectConsistency());
      setRepairReceipt(readRecommendationPolicyRepairReceipt(window.localStorage) ?? null);
    };
    const timer = window.setTimeout(hydrate, 0);
    const handleStorage = (event: StorageEvent) => { if (!event.key || event.key.startsWith("agocode.")) hydrate(); };
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

  const handleRepair = () => {
    const result = repairRecommendationPolicyConsistency(window.localStorage);
    setAudit(result.audit);
    setRepairReceipt(result.receipt ?? readRecommendationPolicyRepairReceipt(window.localStorage) ?? null);
    setConfirmRepair(false);
    setRepairMessage(result.repaired
      ? "Policy control state returned to baseline-v1. Learner recommendation choices and learning evidence were preserved."
      : "The repair could not establish a consistent persisted state. AgoCode remains fail-closed on baseline-v1.");
  };

  return (
    <section className="system-audit" id="policy-consistency" aria-labelledby="policy-consistency-title">
      <div className="section-heading">
        <div className="section-heading__index">POLICY CONSISTENCY</div>
        <div>
          <h2 id="policy-consistency-title">Do lifecycle, safety, and recommendation-attribution records still agree?</h2>
          <p>AgoCode cross-checks the live policy state, bounded lineage, safety latch/probation state, and policy metadata written with recommendation choices. Critical contradictions require deterministic-baseline fallback; bounded-history gaps are warnings only.</p>
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

        {audit.fallbackRequired ? (
          <div className="system-audit__empty" style={{ marginTop: 12 }}>
            <strong>Safe repair is available.</strong>
            <p>
              The repair removes only contradictory experiment attribution from affected recommendation choices, resets candidate / experiment / safety control metadata to baseline-v1, and keeps the learner&apos;s exercise choices, rationale snapshots, outcomes, mastery, and other learning evidence intact.
            </p>
            {!confirmRepair ? (
              <div className="action-row" style={{ marginTop: 12 }}>
                <button className="button" type="button" onClick={() => { setConfirmRepair(true); setRepairMessage(null); }}>Repair policy state</button>
              </div>
            ) : (
              <div style={{ marginTop: 12 }}>
                <p><strong>Confirm baseline reset?</strong> The current candidate and experiment metadata will be retired because their integrity can no longer be proven.</p>
                <div className="action-row" style={{ marginTop: 10 }}>
                  <button className="button button--primary" type="button" onClick={handleRepair}>Confirm repair</button>
                  <button className="button" type="button" onClick={() => setConfirmRepair(false)}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        ) : null}

        {repairMessage ? <p aria-live="polite" style={{ marginTop: 12 }}>{repairMessage}</p> : null}

        {repairReceipt ? (
          <div className="system-audit__empty" style={{ marginTop: 12 }} data-testid="policy-repair-receipt">
            <strong>Last safe repair · {new Date(repairReceipt.repairedAt).toLocaleString()}</strong>
            <p>
              Resolved {repairReceipt.criticalIssuesResolved} critical consistency issue{repairReceipt.criticalIssuesResolved === 1 ? "" : "s"}; quarantined {repairReceipt.quarantinedAttributions} contradictory attribution record{repairReceipt.quarantinedAttributions === 1 ? "" : "s"}; preserved {repairReceipt.preservedRecommendationChoices} recommendation choice{repairReceipt.preservedRecommendationChoices === 1 ? "" : "s"}. Remaining warnings: {repairReceipt.remainingWarnings}.
            </p>
            {repairReceipt.previousCandidatePolicyId ? <small className="mono">retired candidate: {repairReceipt.previousCandidatePolicyId}</small> : null}
          </div>
        ) : null}

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
