"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getCanonicalExercise } from "@/lib/knowledge/all-exercises";
import { readDiagnosticState } from "@/lib/learning/diagnostic";
import { readProblemRecognitionHistory } from "@/lib/learning/independence";
import { readRecommendationHistory } from "@/lib/learning/recommendations";
import { readReasoningAttemptHistory } from "@/lib/learning/reasoning-attempts";
import {
  buildDiagnosticCalibrationAudit,
  buildRecommendationOutcomeAudit,
  type DiagnosticCalibrationAudit,
  type DiagnosticCalibrationStatus,
  type RecommendationAuditStatus,
  type RecommendationOutcomeAudit,
} from "@/lib/learning/system-evaluation";

type LearningSystemView = {
  recommendations: RecommendationOutcomeAudit;
  diagnostic: DiagnosticCalibrationAudit;
};

const recommendationStatusLabels: Record<RecommendationAuditStatus, string> = {
  waiting: "Waiting",
  "no-evidence": "No follow-through yet",
  guided: "Guided attempt",
  "retrieval-miss": "Retrieval miss",
  solved: "Solved",
  independent: "Independent",
  "retrieval-hit": "Retrieval hit",
};

const calibrationStatusLabels: Record<DiagnosticCalibrationStatus, string> = {
  aligned: "Aligned",
  optimistic: "Placement optimistic",
  conservative: "Placement conservative",
  insufficient: "Need more evidence",
};

function collectEvaluation(): LearningSystemView {
  const recommendations = readRecommendationHistory(window.localStorage);
  const reasoningAttempts = readReasoningAttemptHistory(window.localStorage);
  const recognitionHistory = readProblemRecognitionHistory(window.localStorage);
  const diagnosticState = readDiagnosticState(window.localStorage);
  const diagnosticAttempt = [...diagnosticState.attempts].reverse().find((attempt) => attempt.completedAt && attempt.result);

  return {
    recommendations: buildRecommendationOutcomeAudit({
      recommendations,
      reasoningAttempts,
      recognitionHistory,
      now: Date.now(),
    }),
    diagnostic: buildDiagnosticCalibrationAudit({
      diagnosticAttempt,
      reasoningAttempts,
    }),
  };
}

function formatDuration(value: number | undefined) {
  if (value === undefined) return "—";
  const minutes = value / (60 * 1000);
  if (minutes < 60) return `${Math.max(1, Math.round(minutes))} min`;
  const hours = minutes / 60;
  if (hours < 48) return `${Math.round(hours)} h`;
  const days = hours / 24;
  return `${days < 10 ? days.toFixed(1) : Math.round(days)} d`;
}

function formatDate(value: string | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "—";
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(date);
}

export function LearningSystemAudit() {
  const [view, setView] = useState<LearningSystemView | null>(null);

  useEffect(() => {
    const hydrate = () => setView(collectEvaluation());
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

  const recommendationRows = useMemo(() => view?.recommendations.outcomes.slice(0, 8) ?? [], [view]);

  if (!view) {
    return <div className="system-audit-loading">Auditing the local learning system from objective evidence…</div>;
  }

  const recommendation = view.recommendations;
  const diagnostic = view.diagnostic;

  return (
    <section className="system-audit" aria-labelledby="system-audit-title">
      <div className="section-heading">
        <div className="section-heading__index">SYSTEM AUDIT</div>
        <div>
          <h2 id="system-audit-title">Is AgoCode&apos;s guidance actually producing useful evidence?</h2>
          <p>
            This is a browser-local quality audit of the learning system itself. It never becomes mastery evidence, never sends telemetry,
            and never rewards a recommendation merely because it was clicked.
          </p>
        </div>
      </div>

      <div className="system-audit__privacy">
        <div>
          <span className="eyebrow">Local evaluation only</span>
          <strong>No analytics endpoint. No background tracking.</strong>
        </div>
        <p>
          AgoCode derives these diagnostics from the same timestamped recommendation, attempt, and recognition records already stored in this browser.
          A later event is credited to only one bounded recommendation window, so a single solve cannot make several old suggestions look successful.
        </p>
      </div>

      <div className="system-audit__grid">
        <article className="system-audit__panel" aria-labelledby="recommendation-audit-title">
          <div className="system-audit__panel-heading">
            <div>
              <span className="eyebrow">Recommendation outcome audit</span>
              <h3 id="recommendation-audit-title">Did a chosen next problem lead to objective work?</h3>
            </div>
            <Link href="/practice/next">Open planner →</Link>
          </div>

          <div className="system-audit__metrics">
            <div><span>Mature choices</span><strong>{recommendation.matureChoices}</strong><small>{recommendation.waiting} still waiting</small></div>
            <div><span>Follow-through</span><strong>{recommendation.followThroughRate === undefined ? "—" : `${recommendation.followThroughRate}%`}</strong><small>{recommendation.followedThrough} with objective evidence</small></div>
            <div><span>Strong evidence</span><strong>{recommendation.strongEvidenceRate === undefined ? "—" : `${recommendation.strongEvidenceRate}%`}</strong><small>independent solve or first-try retrieval</small></div>
            <div><span>Median latency</span><strong>{formatDuration(recommendation.medianLatencyMs)}</strong><small>choice → first objective event</small></div>
          </div>

          {recommendationRows.length ? (
            <div className="system-audit__recommendations">
              {recommendationRows.map((outcome, index) => {
                const exercise = getCanonicalExercise(outcome.exerciseId);
                return (
                  <div className="system-audit__recommendation" key={`${outcome.exerciseId}-${outcome.chosenAt}-${index}`}>
                    <div>
                      <span className={`system-audit__status system-audit__status--${outcome.status}`}>{recommendationStatusLabels[outcome.status]}</span>
                      <strong>{exercise?.title ?? outcome.exerciseId}</strong>
                      <small>chosen {formatDate(outcome.chosenAt)} · window ends {formatDate(outcome.windowEndsAt)}</small>
                    </div>
                    <div>
                      <p>{outcome.detail}</p>
                      <span>{outcome.latencyMs === undefined ? "No attributed objective event yet." : `First evidence after ${formatDuration(outcome.latencyMs)}.`}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="system-audit__empty">
              <strong>No recommendation choices to evaluate yet.</strong>
              <p>Choose a problem from the adaptive planner. The audit begins only when a recommendation is explicitly selected.</p>
            </div>
          )}
        </article>

        <article className="system-audit__panel" aria-labelledby="diagnostic-audit-title">
          <div className="system-audit__panel-heading">
            <div>
              <span className="eyebrow">Diagnostic calibration audit</span>
              <h3 id="diagnostic-audit-title">Did placement agree with later objective work?</h3>
            </div>
            <Link href="/diagnostic">Open diagnostic →</Link>
          </div>

          {!diagnostic.available ? (
            <div className="system-audit__empty">
              <strong>No completed diagnostic is available.</strong>
              <p>Complete the placement diagnostic first. AgoCode will compare it only with reasoning attempts finalized afterward.</p>
            </div>
          ) : (
            <>
              <div className="system-audit__diagnostic-summary">
                <div>
                  <span>Diagnostic baseline</span>
                  <strong>{formatDate(diagnostic.diagnosticCompletedAt)}</strong>
                  <small>only later objective attempts are eligible</small>
                </div>
                <div><span>Comparable skills</span><strong>{diagnostic.observedSkills}</strong><small>{diagnostic.insufficient} still need evidence</small></div>
                <div><span>Aligned</span><strong>{diagnostic.aligned}</strong><small>same broad evidence band</small></div>
                <div><span>Recalibration signals</span><strong>{diagnostic.optimistic + diagnostic.conservative}</strong><small>{diagnostic.optimistic} optimistic · {diagnostic.conservative} conservative</small></div>
              </div>

              <div className="system-audit__skills">
                {diagnostic.rows.map((row) => (
                  <div className="system-audit__skill" key={row.skillId}>
                    <div>
                      <span className={`system-audit__calibration system-audit__calibration--${row.status}`}>{calibrationStatusLabels[row.status]}</span>
                      <strong>{row.label}</strong>
                      <small>{row.observedExercises} post-diagnostic exercise{row.observedExercises === 1 ? "" : "s"} · {row.independentExercises} independent</small>
                    </div>
                    <div className="system-audit__skill-scores">
                      <span>Placement <strong>{row.diagnosticScore}%</strong></span>
                      <span>Later objective <strong>{row.objectiveScore === undefined ? "—" : `${row.objectiveScore}%`}</strong></span>
                    </div>
                    <p>{row.explanation}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </article>
      </div>

      <div className="system-audit__boundary">
        <span className="eyebrow">Interpretation boundary</span>
        <p>
          These are directional product-quality checks, not psychometric validation and not causal claims. Recommendation follow-through can be affected by timing and learner intent;
          diagnostic disagreement can reflect learning after the diagnostic as well as under- or over-placement. AgoCode therefore uses this page to expose uncertainty rather than silently retuning mastery.
        </p>
      </div>
    </section>
  );
}
