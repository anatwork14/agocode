"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getCanonicalExercise } from "@/lib/knowledge/all-exercises";
import { readLearningEvidence } from "@/lib/learning/evidence";
import {
  buildProblemIndependenceProfile,
  problemIndependenceStageLabels,
  readProblemRecognitionHistory,
  type ProblemIndependenceProfile,
  type ProblemIndependenceStage,
} from "@/lib/learning/independence";
import { readRecommendationHistory } from "@/lib/learning/recommendations";
import {
  buildReasoningAttemptSummaries,
  readReasoningAttemptHistory,
  reasoningAttemptStageLabels,
  type ReasoningAttemptSummary,
} from "@/lib/learning/reasoning-attempts";

const REASONING_EVIDENCE_KEY = "agocode.progress.design.reasoning-notebooks";
const stageOrder: ProblemIndependenceStage[] = ["seen", "guided", "solved", "independent", "transferred", "recalled"];

type IndependenceView = {
  profile: ProblemIndependenceProfile;
  attempts: Record<string, ReasoningAttemptSummary>;
};

function collectProfile(): IndependenceView {
  const reasoning = readLearningEvidence(window.localStorage, REASONING_EVIDENCE_KEY)?.reasoning;
  const attemptHistory = readReasoningAttemptHistory(window.localStorage);
  return {
    profile: buildProblemIndependenceProfile({
      reasoning,
      reasoningAttempts: attemptHistory,
      recommendationHistory: readRecommendationHistory(window.localStorage),
      recognitionHistory: readProblemRecognitionHistory(window.localStorage),
    }),
    attempts: buildReasoningAttemptSummaries(attemptHistory),
  };
}

function formatDuration(value: number | undefined) {
  if (value === undefined) return "—";
  const hours = value / (60 * 60 * 1000);
  if (hours < 1) return `${Math.max(1, Math.round(hours * 60))} min`;
  if (hours < 24) return `${Math.round(hours)} h`;
  const days = hours / 24;
  return `${days < 10 ? days.toFixed(1) : Math.round(days)} d`;
}

export function ProblemIndependenceProgress() {
  const [view, setView] = useState<IndependenceView | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setView(collectProfile()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const rows = useMemo(() => {
    if (!view) return [];
    return Object.values(view.profile.states)
      .sort((a, b) => b.rank - a.rank || a.exerciseId.localeCompare(b.exerciseId))
      .slice(0, 12);
  }, [view]);

  const attemptRows = useMemo(() => {
    if (!view) return [];
    return Object.values(view.attempts)
      .sort((a, b) => b.latest.finalizedAt.localeCompare(a.latest.finalizedAt))
      .slice(0, 10);
  }, [view]);

  if (!view) {
    return <div className="independence-loading">Deriving problem-level independence from local learning evidence…</div>;
  }

  const { profile } = view;
  const totalFinalizedAttempts = Object.values(view.attempts).reduce((sum, item) => sum + item.attempts, 0);
  const supportReductions = Object.values(view.attempts).filter((item) => item.supportRemoved).length;
  const belowPeak = Object.values(view.attempts).filter((item) => item.belowPeak).length;

  return (
    <section className="problem-independence" aria-labelledby="problem-independence-title">
      <div className="section-heading">
        <div className="section-heading__index">INDEPENDENCE</div>
        <div>
          <h2 id="problem-independence-title">A problem is not mastered just because it was completed once.</h2>
          <p>
            AgoCode tracks each problem through a stricter evidence ladder: seen → guided → solved → independent → transferred → recalled after delay.
          </p>
        </div>
      </div>

      <div className="independence-summary">
        <div><span>Tracked problems</span><strong>{profile.tracked}</strong><small>recommended, attempted, or recognized</small></div>
        <div><span>Independent+</span><strong>{profile.independentOrBetter}</strong><small>best-ever evidence survives later weaker attempts</small></div>
        <div><span>Transferred+</span><strong>{profile.transferredOrBetter}</strong><small>independent structural neighbor also solved</small></div>
        <div><span>Recalled</span><strong>{profile.recalled}</strong><small>first-try blind recognition after delay</small></div>
      </div>

      <div className="independence-ladder" aria-label="Problem independence stages">
        {stageOrder.map((stage, index) => (
          <div className={`independence-ladder__step independence-ladder__step--${stage}`} key={stage}>
            <span className="mono">{String(index + 1).padStart(2, "0")}</span>
            <strong>{problemIndependenceStageLabels[stage]}</strong>
            <small>{profile.counts[stage]} problem{profile.counts[stage] === 1 ? "" : "s"}</small>
          </div>
        ))}
      </div>

      {rows.length ? (
        <div className="independence-list">
          <div className="independence-list__heading">
            <div>
              <span className="eyebrow">Problem evidence</span>
              <h3>What would move each problem forward?</h3>
            </div>
            <Link className="button button--quiet" href="/practice/next">Choose the next evidence gap →</Link>
          </div>

          {rows.map((state) => {
            const exercise = getCanonicalExercise(state.exerciseId);
            const attempts = view.attempts[state.exerciseId];
            return (
              <article className="independence-row" key={state.exerciseId}>
                <div>
                  <span className={`independence-row__stage independence-row__stage--${state.stage}`}>{state.label}</span>
                  <h4>{exercise?.title ?? state.exerciseId}</h4>
                  <p>{state.explanation}</p>
                  {attempts ? (
                    <div className="independence-row__attempt-meta">
                      <span>{attempts.attempts} finalized attempt{attempts.attempts === 1 ? "" : "s"}</span>
                      <span>best {reasoningAttemptStageLabels[attempts.bestStage].toLowerCase()}</span>
                      {attempts.supportRemoved ? <span>support removed</span> : null}
                      {attempts.belowPeak ? <span>latest below peak · evidence retained</span> : null}
                    </div>
                  ) : null}
                </div>
                <div className="independence-row__next">
                  <span className="mono">NEXT EVIDENCE</span>
                  <p>{state.nextRequirement}</p>
                  <Link href={`/exercises/${state.exerciseId}`}>Open problem →</Link>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="independence-empty">
          <strong>No problem-level history yet.</strong>
          <p>Choose a problem from the adaptive planner and AgoCode will start building this evidence ladder.</p>
          <Link className="button button--primary" href="/practice/next">Choose my first problem →</Link>
        </div>
      )}

      {attemptRows.length ? (
        <div className="attempt-progression">
          <div className="attempt-progression__heading">
            <div>
              <span className="eyebrow">Attempt ledger</span>
              <h3>Progress should survive a bad retry.</h3>
            </div>
            <p>
              Finalized attempts are immutable evidence snapshots. AgoCode derives problem strength from the strongest attempt while still showing later weaker attempts as useful diagnostic history.
            </p>
          </div>

          <div className="attempt-progression__metrics">
            <div><span>Finalized attempts</span><strong>{totalFinalizedAttempts}</strong></div>
            <div><span>Support removed</span><strong>{supportReductions}</strong></div>
            <div><span>Below-peak retries</span><strong>{belowPeak}</strong></div>
          </div>

          <div className="attempt-progression__list">
            {attemptRows.map((summary) => {
              const exercise = getCanonicalExercise(summary.exerciseId);
              return (
                <article className="attempt-progression__row" key={summary.exerciseId}>
                  <div className="attempt-progression__problem">
                    <strong>{exercise?.title ?? summary.exerciseId}</strong>
                    <span>{summary.attempts} attempt{summary.attempts === 1 ? "" : "s"}</span>
                  </div>
                  <div className="attempt-progression__stages">
                    <span className="mono">LATEST</span>
                    <strong>{reasoningAttemptStageLabels[summary.latestStage]}</strong>
                    <span className="mono">BEST</span>
                    <strong>{reasoningAttemptStageLabels[summary.bestStage]}</strong>
                  </div>
                  <div className="attempt-progression__proof">
                    <span>{summary.supportRemoved ? "support removed across attempts" : "support reduction not yet shown"}</span>
                    <span>{summary.attemptsToIndependence ? `independent on attempt ${summary.attemptsToIndependence}` : "independence not yet established"}</span>
                    <span>{summary.firstIndependentAt ? `time to independence ${formatDuration(summary.timeToIndependenceMs)}` : ""}</span>
                    {summary.belowPeak ? <strong>Later retry is weaker; historical evidence is preserved.</strong> : null}
                  </div>
                  <Link href={`/exercises/${summary.exerciseId}`}>Open →</Link>
                </article>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="independence-boundary">
        <span className="eyebrow">Evidence boundary</span>
        <p>
          Self-confidence and difficulty ratings never advance this ladder by themselves. Finalized reasoning attempts are kept separately from the editable notebook snapshot; the strongest objective attempt is monotonic, while weaker later attempts remain visible for diagnosis instead of deleting earned evidence.
        </p>
      </div>
    </section>
  );
}
