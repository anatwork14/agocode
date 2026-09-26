"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { sourceLabels } from "@/lib/knowledge/all-exercises";
import { buildDifficultyCalibrationProfile, readDifficultyCalibrationHistory } from "@/lib/learning/calibration";
import { readLearningEvidence, type LearningEvidence } from "@/lib/learning/evidence";
import { buildProblemIndependenceProfile, readProblemRecognitionHistory } from "@/lib/learning/independence";
import { buildMasterySnapshot, type MasterySnapshot } from "@/lib/learning/mastery";
import { readObstacleEvidence } from "@/lib/learning/obstacles";
import { buildProblemReviewProfile, readProblemReviewHistory, type ProblemReviewProfile } from "@/lib/learning/problem-review";
import { progressEvidenceKeys } from "@/lib/learning/progressCatalog";
import { readReasoningAttemptHistory } from "@/lib/learning/reasoning-attempts";
import { readRecommendationHistory } from "@/lib/learning/recommendations";
import {
  DAILY_PRACTICE_SESSION_KEY,
  ensureDailyPracticeSession,
  getDailyPracticeProgress,
  getLocalDayKey,
  readDailyPracticeState,
  regenerateDailyPracticeSession,
  updateDailyPracticeItemStatus,
  type DailyPracticeItemStatus,
  type DailyPracticeSession,
  type DailyPracticeSessionSummary,
} from "@/lib/practice/daily-session";
import { buildMixedPracticeSession } from "@/lib/practice/mixed-session";
import { classifiedAtlasExercises } from "@/lib/practice/atlas-recognition";

const REASONING_EVIDENCE_KEY = "agocode.progress.design.reasoning-notebooks";
const ATLAS_RECOGNITION_KEY = "agocode.progress.transfer.atlas-recognition";

type MixedSnapshot = {
  session: DailyPracticeSession;
  mastery: MasterySnapshot;
  review: ProblemReviewProfile;
  history: DailyPracticeSessionSummary[];
};

function collect(seed: string, regenerate = false): MixedSnapshot {
  const evidenceMap: Record<string, LearningEvidence | null> = {};
  for (const key of progressEvidenceKeys) evidenceMap[key] = readLearningEvidence(window.localStorage, key);
  const mastery = buildMasterySnapshot(evidenceMap);
  const reasoning = readLearningEvidence(window.localStorage, REASONING_EVIDENCE_KEY);
  const attempts = readReasoningAttemptHistory(window.localStorage);
  const recognitionHistory = readProblemRecognitionHistory(window.localStorage);
  const recommendationHistory = readRecommendationHistory(window.localStorage);
  const independence = buildProblemIndependenceProfile({
    reasoning: reasoning?.reasoning,
    reasoningAttempts: attempts,
    recommendationHistory,
    recognitionHistory,
  });
  const review = buildProblemReviewProfile({
    independence,
    reviewHistory: readProblemReviewHistory(window.localStorage),
    recognitionHistory,
  });
  const recentExerciseIds = [...attempts.entries]
    .sort((a, b) => b.finalizedAt.localeCompare(a.finalizedAt))
    .map((entry) => entry.exerciseId)
    .slice(0, 10);
  const missedExerciseIds = readLearningEvidence(window.localStorage, ATLAS_RECOGNITION_KEY)
    ?.recognition?.recentMissedScenarioIds ?? [];

  const mixed = buildMixedPracticeSession({
    mastery,
    obstacles: readObstacleEvidence(window.localStorage),
    recentExerciseIds,
    missedExerciseIds,
    recommendationHistoryIds: recommendationHistory.entries.slice(-12).map((entry) => entry.exerciseId),
    difficultyCalibration: buildDifficultyCalibrationProfile(readDifficultyCalibrationHistory(window.localStorage)),
    problemIndependence: independence.states,
    problemReview: review.statuses,
    reviewStatuses: review.statuses,
    sessionSize: 6,
    seed,
  });

  const now = new Date();
  const session = regenerate
    ? regenerateDailyPracticeSession(window.localStorage, mixed, now)
    : ensureDailyPracticeSession(window.localStorage, mixed, now);
  const state = readDailyPracticeState(window.localStorage);
  return { session, mastery, review, history: state.history };
}

const roleLabels = {
  retrieve: "Retrieve",
  "repair-recognition": "Repair recognition",
  "remove-support": "Remove support",
  transfer: "Transfer",
  "weak-dimension": "Build weakness",
  diversify: "Diversify",
} as const;

const statusLabels: Record<DailyPracticeItemStatus, string> = {
  pending: "Pending",
  done: "Done today",
  skipped: "Skipped",
};

export function AdaptiveMixedSession() {
  const [snapshot, setSnapshot] = useState<MixedSnapshot | null>(null);

  useEffect(() => {
    const hydrate = () => setSnapshot(collect(`daily-${getLocalDayKey()}`));
    const timer = window.setTimeout(hydrate, 0);
    const handleStorage = (event: StorageEvent) => {
      if (!event.key || event.key === DAILY_PRACTICE_SESSION_KEY || event.key.startsWith("agocode.")) hydrate();
    };
    window.addEventListener("storage", handleStorage);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const classifiedById = useMemo(
    () => new Map(classifiedAtlasExercises.map((item) => [item.exercise.id, item])),
    [],
  );

  if (!snapshot) return <div className="mixed-session__loading">Restoring today&apos;s local practice plan…</div>;

  const progress = getDailyPracticeProgress(snapshot.session);
  const nextPending = snapshot.session.items.find((item) => item.status === "pending");
  const recentHistory = snapshot.history.slice(-5).reverse();

  function updateStatus(exerciseId: string, status: DailyPracticeItemStatus) {
    const session = updateDailyPracticeItemStatus(window.localStorage, exerciseId, status);
    if (!session) return;
    setSnapshot((current) => current ? { ...current, session } : current);
  }

  function regenerate() {
    setSnapshot(collect(`daily-${getLocalDayKey()}-${Date.now()}`, true));
  }

  return (
    <div className="mixed-session">
      <section className="mixed-session__today" aria-labelledby="today-session-title">
        <div>
          <span className="eyebrow">Today&apos;s plan · {snapshot.session.dayKey}</span>
          <h2 id="today-session-title">
            {progress.isComplete ? "Today&apos;s queue is cleared." : "Resume the same evidence plan all day."}
          </h2>
          <p>
            This plan is frozen in your browser for the local calendar day. Refreshing or leaving the page will not silently reshuffle it.
            Session status is only workflow bookkeeping; mastery still comes from objective evidence recorded inside each linked activity.
          </p>
        </div>
        <div className="mixed-session__today-action">
          <strong>{progress.cleared}/{progress.total}</strong>
          <span>{progress.pending} remaining · {progress.done} done · {progress.skipped} skipped</span>
          <progress max={Math.max(1, progress.total)} value={progress.cleared} aria-label="Daily practice session progress" />
          {nextPending ? (
            <Link className="button button--primary" href={nextPending.href}>Continue next task →</Link>
          ) : (
            <Link className="button" href="/progress">Inspect today&apos;s evidence →</Link>
          )}
        </div>
      </section>

      <div className="mixed-session__summary">
        <div><span>Problems</span><strong>{progress.total}</strong><small>bounded daily session</small></div>
        <div><span>Cleared</span><strong>{progress.cleared}</strong><small>{progress.done} done · {progress.skipped} skipped</small></div>
        <div><span>Families</span><strong>{snapshot.session.familyCount}</strong><small>{snapshot.session.sourceCount} source surfaces</small></div>
        <div><span>Due retrieval</span><strong>{snapshot.session.dueRetrievalCount}</strong><small>{snapshot.review.overdue} total overdue</small></div>
      </div>

      <div className="mixed-session__intro">
        <div>
          <span className="eyebrow">Adaptive interleaving</span>
          <h2>One session, several kinds of evidence.</h2>
        </div>
        <p>
          The session deliberately mixes overdue retrieval, recent recognition misses, support removal, transfer, and your weakest mastery dimension.
          Completed rows stay stable locally; a manual rebuild only changes the remaining mix and preserves completed items that reappear.
        </p>
      </div>

      <div className="mixed-session__list">
        {snapshot.session.items.map((item, index) => {
          const classified = classifiedById.get(item.exerciseId);
          return (
            <article className={`mixed-session__row mixed-session__row--${item.role} mixed-session__row--status-${item.status}`} key={item.exerciseId}>
              <div className="mixed-session__index mono">{String(index + 1).padStart(2, "0")}</div>
              <div>
                <div className="mixed-session__meta mono">
                  <span>{roleLabels[item.role]}</span>
                  <span>{item.familyLabel}</span>
                  {classified ? <span>{sourceLabels[classified.exercise.source]}</span> : null}
                  <span className={`mixed-session__status mixed-session__status--${item.status}`}>{statusLabels[item.status]}</span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.reason}</p>
              </div>
              <div className="mixed-session__actions">
                <Link className={item.role === "retrieve" && item.status === "pending" ? "button button--primary" : "button"} href={item.href}>
                  {item.role === "retrieve" ? "Open retrieval →" : "Open attempt →"}
                </Link>
                {item.status === "pending" ? (
                  <>
                    <button className="mixed-session__text-action" type="button" onClick={() => updateStatus(item.exerciseId, "done")}>mark done</button>
                    <button className="mixed-session__text-action" type="button" onClick={() => updateStatus(item.exerciseId, "skipped")}>skip today</button>
                  </>
                ) : (
                  <button className="mixed-session__text-action" type="button" onClick={() => updateStatus(item.exerciseId, "pending")}>
                    {item.status === "done" ? "reopen" : "requeue"}
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <div className="mixed-session__footer">
        <div>
          <span className="eyebrow">Stable by default</span>
          <p>
            Today&apos;s ordering survives refreshes through versioned localStorage. Rebuild only when you intentionally want a different remaining mix;
            completed overlap is preserved, skipped overlap is re-queued, and no session action writes mastery evidence.
          </p>
        </div>
        <button className="button" type="button" onClick={regenerate}>
          Rebuild remaining mix{snapshot.session.regenerationCount ? ` · ${snapshot.session.regenerationCount}` : ""}
        </button>
      </div>

      {recentHistory.length ? (
        <section className="mixed-session__history" aria-labelledby="session-history-title">
          <div>
            <span className="eyebrow">Local history</span>
            <h2 id="session-history-title">Recent archived daily sessions</h2>
          </div>
          <div className="mixed-session__history-list">
            {recentHistory.map((entry) => (
              <div key={entry.dayKey}>
                <strong>{entry.dayKey}</strong>
                <span>{entry.done}/{entry.total} done · {entry.skipped} skipped</span>
                <small>{entry.completedAt ? "queue cleared" : "unfinished"}{entry.regenerationCount ? ` · ${entry.regenerationCount} rebuilds` : ""}</small>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
