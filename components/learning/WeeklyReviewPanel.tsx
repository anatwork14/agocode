"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { buildAdaptiveCurriculumPlan, type AdaptiveCurriculumPlan } from "@/lib/learning/curriculum-planner";
import { getLatestDiagnosticResult, readDiagnosticState } from "@/lib/learning/diagnostic";
import { readProblemRecognitionHistory } from "@/lib/learning/independence";
import { readReasoningAttemptHistory } from "@/lib/learning/reasoning-attempts";
import {
  buildWeeklyReviewSnapshot,
  compareWeeklyReviews,
  getWeeklyReviewRates,
  readWeeklyReviewState,
  recordWeeklyReviewSnapshot,
  type WeeklyReviewComparison,
  type WeeklyReviewSnapshot,
} from "@/lib/learning/weekly-review";
import { ensureWeeklyMission, type WeeklyMission } from "@/lib/learning/weekly-mission";

type Snapshot = {
  current: WeeklyReviewSnapshot;
  previous?: WeeklyReviewSnapshot;
  comparison: WeeklyReviewComparison;
  plan: AdaptiveCurriculumPlan;
  mission: WeeklyMission;
  history: WeeklyReviewSnapshot[];
};

function collect(): Snapshot {
  const diagnostic = getLatestDiagnosticResult(readDiagnosticState(window.localStorage));
  const reasoningAttempts = readReasoningAttemptHistory(window.localStorage);
  const recognitionHistory = readProblemRecognitionHistory(window.localStorage);
  const plan = buildAdaptiveCurriculumPlan({ diagnostic, reasoningAttempts });
  const mission = ensureWeeklyMission(window.localStorage, plan);
  const before = readWeeklyReviewState(window.localStorage);
  const live = buildWeeklyReviewSnapshot({
    reasoningAttempts,
    recognitionHistory,
    curriculumPlan: plan,
    weeklyMission: mission,
    firstObservedAt: before.current?.weekKey === mission.weekKey ? before.current.firstObservedAt : undefined,
  });
  const state = recordWeeklyReviewSnapshot(window.localStorage, live);
  const current = state.current ?? live;
  const previous = state.history.at(-1);
  return {
    current,
    previous,
    comparison: compareWeeklyReviews(current, previous),
    plan,
    mission,
    history: state.history,
  };
}

function signed(value: number, suffix = "") {
  if (value === 0) return `0${suffix}`;
  return `${value > 0 ? "+" : ""}${value}${suffix}`;
}

export function WeeklyReviewPanel() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);

  useEffect(() => {
    const hydrate = () => setSnapshot(collect());
    const timer = window.setTimeout(hydrate, 0);
    const handleFocus = () => hydrate();
    const handleStorage = (event: StorageEvent) => {
      if (!event.key || event.key.startsWith("agocode.")) hydrate();
    };
    window.addEventListener("focus", handleFocus);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const targetTitles = useMemo(() => {
    if (!snapshot) return new Map<string, string>();
    return new Map(snapshot.plan.modules.map((moduleProfile) => [moduleProfile.id, moduleProfile.title]));
  }, [snapshot]);

  if (!snapshot) return <div className="weekly-review__loading">Deriving this week&apos;s evidence snapshot…</div>;

  const { current, previous, comparison } = snapshot;
  const rates = getWeeklyReviewRates(current);
  const previousRates = previous ? getWeeklyReviewRates(previous) : undefined;
  const missionRate = current.missionTotal ? Math.round((current.missionSatisfied / current.missionTotal) * 100) : 0;

  return (
    <div className="weekly-review">
      <section className="weekly-review__hero" aria-labelledby="weekly-review-title">
        <div>
          <span className="eyebrow">Week of {current.weekKey}</span>
          <h2 id="weekly-review-title">What actually changed in your learning evidence?</h2>
          <p>
            This review uses timestamped reasoning and recognition events from the current local week. Module-state trends are stored prospectively from the first week this review is observed—AgoCode does not fabricate earlier mastery transitions.
          </p>
        </div>
        <div className="weekly-review__hero-actions">
          <strong>{current.missionSatisfied}/{current.missionTotal}</strong>
          <span>weekly mission targets objectively advanced</span>
          <Link className="button button--primary" href="/plan">Open curriculum mission →</Link>
          <Link className="button" href="/practice/session">Continue today&apos;s session →</Link>
        </div>
      </section>

      <section className="weekly-review__metrics" aria-label="Current weekly evidence metrics">
        <article>
          <span>Finalized attempts</span>
          <strong>{current.finalizedAttempts}</strong>
          <small>{current.uniqueExercises} unique exercises</small>
        </article>
        <article>
          <span>Independent attempts</span>
          <strong>{current.independentAttempts}</strong>
          <small>{current.completedAttempts} completed attempts</small>
        </article>
        <article>
          <span>Support-free completion</span>
          <strong>{rates.supportFreeRate}%</strong>
          <small>{current.supportFreeCompleted} no-lens · {current.supportAssistedCompleted} supported</small>
        </article>
        <article>
          <span>Blind recognition</span>
          <strong>{rates.recognitionAccuracy}%</strong>
          <small>{current.firstTryRecognitions}/{current.recognitionChecks} first-try checks</small>
        </article>
        <article>
          <span>Mission progress</span>
          <strong>{missionRate}%</strong>
          <small>{current.missionSatisfied}/{current.missionTotal} objective targets</small>
        </article>
        <article>
          <span>Mastered modules</span>
          <strong>{current.curriculumCounts.mastered}</strong>
          <small>{current.curriculumCounts.developing} developing · {current.curriculumCounts.blocked} blocked</small>
        </article>
      </section>

      {comparison.hasPrevious && previous && previousRates ? (
        <section className="weekly-review__change" aria-labelledby="weekly-change-title">
          <div>
            <span className="eyebrow">Compared with {previous.weekKey}</span>
            <h2 id="weekly-change-title">Evidence movement, not activity points.</h2>
          </div>
          <div className="weekly-review__delta-grid">
            <article>
              <span>Independent attempts</span>
              <strong>{signed(comparison.independentDelta)}</strong>
              <small>{previous.independentAttempts} → {current.independentAttempts}</small>
            </article>
            <article>
              <span>Recognition accuracy</span>
              <strong>{signed(comparison.recognitionAccuracyDelta, " pp")}</strong>
              <small>{previousRates.recognitionAccuracy}% → {rates.recognitionAccuracy}%</small>
            </article>
            <article>
              <span>Support-free rate</span>
              <strong>{signed(comparison.supportFreeRateDelta, " pp")}</strong>
              <small>{previousRates.supportFreeRate}% → {rates.supportFreeRate}%</small>
            </article>
            <article>
              <span>Mastered modules</span>
              <strong>{signed(comparison.masteredDelta)}</strong>
              <small>{previous.curriculumCounts.mastered} → {current.curriculumCounts.mastered}</small>
            </article>
          </div>
        </section>
      ) : (
        <section className="weekly-review__boundary">
          <span className="eyebrow">Prospective tracking starts here</span>
          <h2>No previous curriculum snapshot is being invented.</h2>
          <p>
            Timestamped attempts from this week are valid to summarize immediately. Module-state deltas require a stored prior snapshot, so AgoCode will begin showing week-over-week curriculum movement after the next local-week rollover.
          </p>
        </section>
      )}

      <section className="weekly-review__targets" aria-labelledby="weekly-target-change-title">
        <div>
          <span className="eyebrow">Why the curriculum can change</span>
          <h2 id="weekly-target-change-title">Priority movement is inspectable.</h2>
        </div>
        {comparison.hasPrevious ? (
          <div className="weekly-review__target-columns">
            <article>
              <h3>Newly prioritized</h3>
              {comparison.newlyPrioritized.length ? comparison.newlyPrioritized.map((id) => (
                <p key={id}>+ {targetTitles.get(id) ?? id}</p>
              )) : <p>No new module entered the top curriculum targets.</p>}
            </article>
            <article>
              <h3>Moved out</h3>
              {comparison.deprioritized.length ? comparison.deprioritized.map((id) => (
                <p key={id}>− {targetTitles.get(id) ?? id}</p>
              )) : <p>No previous target left the priority set.</p>}
            </article>
          </div>
        ) : (
          <p className="weekly-review__target-note">
            The current top targets are {current.nextTargetIds.map((id) => targetTitles.get(id) ?? id).join(", ") || "not yet available"}. Once a prior snapshot exists, this section will show exactly which targets entered or left the priority set.
          </p>
        )}
      </section>

      {snapshot.history.length ? (
        <section className="weekly-review__history" aria-labelledby="weekly-review-history-title">
          <span className="eyebrow">Stored weekly snapshots</span>
          <h2 id="weekly-review-history-title">Prospective history</h2>
          <div>
            {snapshot.history.slice(-6).reverse().map((entry) => {
              const entryRates = getWeeklyReviewRates(entry);
              return (
                <article key={entry.weekKey}>
                  <strong>{entry.weekKey}</strong>
                  <span>{entry.independentAttempts} independent attempts</span>
                  <span>{entryRates.recognitionAccuracy}% recognition</span>
                  <span>{entryRates.supportFreeRate}% support-free</span>
                  <span>{entry.curriculumCounts.mastered} mastered modules</span>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}
    </div>
  );
}
