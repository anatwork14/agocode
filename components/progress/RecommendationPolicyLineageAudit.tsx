"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BASELINE_RECOMMENDATION_POLICY_ID,
  readRecommendationPolicyExperimentState,
  type RecommendationPolicyExperimentState,
  type RecommendationPolicyLifecycleEvent,
  type RecommendationPolicyLineageEntry,
} from "@/lib/learning/recommendation-experiment";
import { recommendationReasonLabel } from "@/lib/learning/recommendation-policy";
import type { RecommendationReasonId } from "@/lib/learning/recommendation-rationale";

const eventLabels: Record<RecommendationPolicyLifecycleEvent, string> = {
  "cycle-archived": "Legacy cycle archived",
  "experiment-started": "Experiment started",
  "experiment-paused": "Experiment paused",
  "experiment-resumed": "Experiment resumed",
  "candidate-promoted": "Candidate promoted",
  "candidate-rolled-back": "Rolled back to baseline",
};

function collectLineage() {
  return readRecommendationPolicyExperimentState(window.localStorage);
}

function formatDate(value: string) {
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

function adjustmentLabel(entry: RecommendationPolicyLineageEntry) {
  return Object.entries(entry.adjustments)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([reasonId, delta]) => `${recommendationReasonLabel(reasonId as RecommendationReasonId)} ${Number(delta) > 0 ? "+" : ""}${delta}`)
    .join(" · ");
}

function currentStatus(state: RecommendationPolicyExperimentState) {
  if (!state.candidate) return "Deterministic baseline only";
  if (state.defaultPolicyId === state.candidate.id) return "Candidate is the local default";
  if (state.experiment?.status === "running") return "Baseline-vs-candidate experiment running";
  if (state.experiment?.status === "paused") return "Experiment paused and frozen";
  if (state.experiment?.status === "completed") return "Experiment completed; baseline currently active";
  return "Candidate retained; deterministic baseline active";
}

export function RecommendationPolicyLineageAudit() {
  const [state, setState] = useState<RecommendationPolicyExperimentState | null>(null);

  useEffect(() => {
    const hydrate = () => setState(collectLineage());
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

  const entries = useMemo(() => [...(state?.lineage ?? [])].reverse(), [state]);
  const candidateIds = useMemo(() => new Set(entries.map((entry) => entry.candidatePolicyId)), [entries]);

  if (!state) {
    return <div className="system-audit-loading">Reading local recommendation-policy lineage…</div>;
  }

  return (
    <section className="system-audit" id="policy-lineage" aria-labelledby="policy-lineage-title">
      <div className="section-heading">
        <div className="section-heading__index">POLICY LINEAGE</div>
        <div>
          <h2 id="policy-lineage-title">What policy versions have existed locally, and what happened to each cycle?</h2>
          <p>
            AgoCode keeps a bounded lifecycle ledger inside the same versioned browser state as the live experiment. This preserves
            candidate provenance across later tuning cycles without turning lifecycle metadata into mastery or recommendation evidence.
          </p>
        </div>
      </div>

      <div className="system-audit__privacy">
        <div>
          <span className="eyebrow">Lifecycle metadata only</span>
          <strong>History is inspectable, portable, and ignored by the planner.</strong>
        </div>
        <p>
          The ledger records policy IDs, frozen rationale adjustments, experiment status, promotion, pause/resume, and rollback events.
          It never changes mastery, retrieval freshness, independence, recommendation scores, or the current policy decision.
        </p>
      </div>

      <article className="system-audit__panel" style={{ marginTop: 18 }}>
        <div className="system-audit__panel-heading">
          <div>
            <span className="system-audit__calibration system-audit__calibration--aligned">Current state</span>
            <h3>{currentStatus(state)}</h3>
          </div>
        </div>

        <div className="system-audit__metrics">
          <div><span>Current default</span><strong>{state.defaultPolicyId === BASELINE_RECOMMENDATION_POLICY_ID ? "Baseline" : "Candidate"}</strong><small className="mono">{state.defaultPolicyId}</small></div>
          <div><span>Current candidate</span><strong>{state.candidate ? "Present" : "None"}</strong><small className="mono">{state.candidate?.id ?? "—"}</small></div>
          <div><span>Experiment</span><strong>{state.experiment?.status ?? "None"}</strong><small className="mono">{state.experiment?.id ?? "—"}</small></div>
          <div><span>Lifecycle events</span><strong>{entries.length}</strong><small>bounded local history</small></div>
          <div><span>Policy versions seen</span><strong>{candidateIds.size}</strong><small>candidate IDs represented in lineage</small></div>
          <div><span>Last rollback</span><strong>{state.lastRollbackAt ? "Recorded" : "—"}</strong><small>{state.lastRollbackAt ? formatDate(state.lastRollbackAt) : "No rollback in live state"}</small></div>
        </div>

        {!entries.length ? (
          <div className="system-audit__empty">
            <strong>No Phase 10 lifecycle event has been recorded yet.</strong>
            <p>
              Existing version-1 policy state remains valid. The first new experiment lifecycle action will begin the bounded ledger;
              when a pre-Phase10 candidate is later replaced, AgoCode archives it once before starting the new cycle.
            </p>
          </div>
        ) : (
          <div className="system-audit__skills">
            {entries.map((entry) => (
              <div className="system-audit__skill" key={entry.id}>
                <div>
                  <span className={`system-audit__calibration system-audit__calibration--${entry.event === "candidate-rolled-back" ? "optimistic" : entry.event === "experiment-paused" || entry.event === "cycle-archived" ? "insufficient" : "aligned"}`}>{eventLabels[entry.event]}</span>
                  <strong>{formatDate(entry.occurredAt)}</strong>
                  <small className="mono">{entry.candidatePolicyId}</small>
                </div>
                <div className="system-audit__skill-scores">
                  <span>Experiment <strong>{entry.experimentStatus ?? "—"}</strong></span>
                  <span>Default <strong>{entry.defaultPolicyId === BASELINE_RECOMMENDATION_POLICY_ID ? "baseline" : "candidate"}</strong></span>
                  <span>Experiment ID <strong className="mono">{entry.experimentId ?? "—"}</strong></span>
                </div>
                <p>{adjustmentLabel(entry)}</p>
              </div>
            ))}
          </div>
        )}
      </article>
    </section>
  );
}
