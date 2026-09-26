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

const REASONING_EVIDENCE_KEY = "agocode.progress.design.reasoning-notebooks";
const stageOrder: ProblemIndependenceStage[] = ["seen", "guided", "solved", "independent", "transferred", "recalled"];

function collectProfile() {
  const reasoning = readLearningEvidence(window.localStorage, REASONING_EVIDENCE_KEY)?.reasoning;
  return buildProblemIndependenceProfile({
    reasoning,
    recommendationHistory: readRecommendationHistory(window.localStorage),
    recognitionHistory: readProblemRecognitionHistory(window.localStorage),
  });
}

export function ProblemIndependenceProgress() {
  const [profile, setProfile] = useState<ProblemIndependenceProfile | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setProfile(collectProfile()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const rows = useMemo(() => {
    if (!profile) return [];
    return Object.values(profile.states)
      .sort((a, b) => b.rank - a.rank || a.exerciseId.localeCompare(b.exerciseId))
      .slice(0, 12);
  }, [profile]);

  if (!profile) {
    return <div className="independence-loading">Deriving problem-level independence from local learning evidence…</div>;
  }

  return (
    <section className="problem-independence" aria-labelledby="problem-independence-title">
      <div className="section-heading">
        <div className="section-heading__index">INDEPENDENCE</div>
        <div>
          <h2 id="problem-independence-title">A problem is not mastered just because it was completed once.</h2>
          <p>
            AgoCode now tracks each problem through a stricter evidence ladder: seen → guided → solved → independent → transferred → recalled after delay.
          </p>
        </div>
      </div>

      <div className="independence-summary">
        <div><span>Tracked problems</span><strong>{profile.tracked}</strong><small>recommended, attempted, or recognized</small></div>
        <div><span>Independent+</span><strong>{profile.independentOrBetter}</strong><small>solved without structural-lens support</small></div>
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
            return (
              <article className="independence-row" key={state.exerciseId}>
                <div>
                  <span className={`independence-row__stage independence-row__stage--${state.stage}`}>{state.label}</span>
                  <h4>{exercise?.title ?? state.exerciseId}</h4>
                  <p>{state.explanation}</p>
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

      <div className="independence-boundary">
        <span className="eyebrow">Evidence boundary</span>
        <p>
          Self-confidence and difficulty ratings never advance this ladder by themselves. Independence requires a completed attempt without the structural lens; transfer requires another independent solve in the same structural family but a changed source or domain; recall requires later first-try blind recognition.
        </p>
      </div>
    </section>
  );
}
