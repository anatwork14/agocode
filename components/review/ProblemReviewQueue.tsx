"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getCanonicalExercise } from "@/lib/knowledge/all-exercises";
import { readLearningEvidence } from "@/lib/learning/evidence";
import { buildProblemIndependenceProfile, readProblemRecognitionHistory } from "@/lib/learning/independence";
import {
  buildProblemReviewProfile,
  readProblemReviewHistory,
  recordProblemReviewOutcome,
  type ProblemReviewProfile,
  type ProblemReviewStatus,
} from "@/lib/learning/problem-review";
import { readReasoningAttemptHistory } from "@/lib/learning/reasoning-attempts";
import { readRecommendationHistory } from "@/lib/learning/recommendations";

const REASONING_EVIDENCE_KEY = "agocode.progress.design.reasoning-notebooks";
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

type QueueSnapshot = {
  profile: ProblemReviewProfile;
  now: number;
};

function collectSnapshot(): QueueSnapshot {
  const reasoning = readLearningEvidence(window.localStorage, REASONING_EVIDENCE_KEY)?.reasoning;
  const recognitionHistory = readProblemRecognitionHistory(window.localStorage);
  const independence = buildProblemIndependenceProfile({
    reasoning,
    reasoningAttempts: readReasoningAttemptHistory(window.localStorage),
    recommendationHistory: readRecommendationHistory(window.localStorage),
    recognitionHistory,
  });
  const now = Date.now();
  return {
    now,
    profile: buildProblemReviewProfile({
      independence,
      reviewHistory: readProblemReviewHistory(window.localStorage),
      recognitionHistory,
      now,
    }),
  };
}

function formatWait(ms: number) {
  const absolute = Math.abs(ms);
  if (absolute >= DAY_MS) {
    const days = Math.max(1, Math.ceil(absolute / DAY_MS));
    return `${days} day${days === 1 ? "" : "s"}`;
  }
  const hours = Math.max(1, Math.ceil(absolute / HOUR_MS));
  return `${hours} hour${hours === 1 ? "" : "s"}`;
}

function statusLabel(status: ProblemReviewStatus, now: number) {
  const remaining = new Date(status.nextReviewAt).getTime() - now;
  if (status.dueState === "overdue") return `Overdue by ${formatWait(remaining)}`;
  if (status.dueState === "due") return "Due now";
  return `Due in ${formatWait(remaining)}`;
}

export function ProblemReviewQueue() {
  const [snapshot, setSnapshot] = useState<QueueSnapshot | null>(null);

  function refresh() {
    setSnapshot(collectSnapshot());
  }

  useEffect(() => {
    const timer = window.setTimeout(refresh, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const rows = useMemo(() => {
    if (!snapshot) return [];
    return Object.values(snapshot.profile.statuses)
      .sort((a, b) => b.priority - a.priority || a.nextReviewAt.localeCompare(b.nextReviewAt));
  }, [snapshot]);

  function record(status: ProblemReviewStatus, outcome: "remembered" | "needs-work") {
    recordProblemReviewOutcome(window.localStorage, {
      exerciseId: status.exerciseId,
      outcome,
    });
    refresh();
  }

  if (!snapshot) {
    return <div className="review-loading">Deriving problem-level retrieval intervals from local evidence…</div>;
  }

  if (!rows.length) {
    return (
      <div className="problem-review-empty">
        <strong>No independent problem proofs to schedule yet.</strong>
        <p>Complete a problem independently first. AgoCode will then schedule retrieval instead of asking you to repeat it immediately.</p>
        <Link className="button button--primary" href="/practice/next">Choose the next problem →</Link>
      </div>
    );
  }

  const dueNow = snapshot.profile.due + snapshot.profile.overdue;
  const freshnessPercent = Math.round(snapshot.profile.averageFreshness * 100);

  return (
    <div className="problem-review-queue">
      <div className="problem-review-summary" aria-label="Adaptive problem retrieval summary">
        <div><span>Scheduled</span><strong>{snapshot.profile.scheduled}</strong><small>independent-or-better problem proofs</small></div>
        <div><span>Due now</span><strong>{dueNow}</strong><small>{snapshot.profile.overdue} overdue</small></div>
        <div><span>Due soon</span><strong>{snapshot.profile.dueSoon}</strong><small>inside the next 24 hours</small></div>
        <div><span>Average freshness</span><strong>{freshnessPercent}%</strong><small>spacing freshness, not mastery</small></div>
      </div>

      <div className="problem-review-list">
        {rows.map((status) => {
          const exercise = getCanonicalExercise(status.exerciseId);
          const due = status.dueState === "due" || status.dueState === "overdue";
          const freshness = Math.round(status.freshness * 100);
          return (
            <article className={`problem-review-row problem-review-row--${status.dueState}`} key={status.exerciseId}>
              <div className="problem-review-row__body">
                <div className="problem-review-row__meta">
                  <span className={`review-row__status ${due ? "review-row__status--due" : ""}`}>{statusLabel(status, snapshot.now)}</span>
                  <span className="mono">{status.independenceStage} · {status.recommendedMode.replace("-", " ")}</span>
                </div>
                <h2>{exercise?.title ?? status.exerciseId}</h2>
                <p>{status.explanation}</p>
                <div className="problem-review-row__facts">
                  <span>freshness {freshness}%</span>
                  <span>interval {status.intervalDays}d</span>
                  <span>{status.sessions} retrieval session{status.sessions === 1 ? "" : "s"}</span>
                  {status.successful ? <span>{status.successful} remembered</span> : null}
                  {status.failed ? <span>{status.failed} needs work</span> : null}
                </div>
                <div className="problem-review-row__meter" aria-label={`${freshness}% retrieval freshness`}>
                  <span style={{ width: `${freshness}%` }} />
                </div>
              </div>

              <div className="problem-review-row__actions">
                <Link className={due ? "button button--primary" : "button"} href={`/exercises/${status.exerciseId}`}>
                  {due ? "Retrieve now →" : "Preview problem"}
                </Link>
                {status.recommendedMode === "blind-recognition" ? (
                  <Link className="button button--quiet" href="/practice/atlas">Run blind recognition</Link>
                ) : null}
                {due ? (
                  <div className="review-row__outcome" aria-label={`Record retrieval outcome for ${exercise?.title ?? status.exerciseId}`}>
                    <span>After a real attempt · scheduling only</span>
                    <button className="button button--quiet" type="button" onClick={() => record(status, "remembered")}>Remembered</button>
                    <button className="button button--quiet" type="button" onClick={() => record(status, "needs-work")}>Needs work</button>
                  </div>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>

      <div className="problem-review-boundary">
        <span className="eyebrow">Scheduling boundary</span>
        <p>
          Retrieval freshness never demotes historical independence. Manual “remembered / needs work” buttons only change the next interval;
          blind first-try Atlas recognition is incorporated automatically as stronger objective retrieval evidence.
        </p>
      </div>
    </div>
  );
}
