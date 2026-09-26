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
import { buildMixedPracticeSession, type MixedPracticeSession } from "@/lib/practice/mixed-session";
import { classifiedAtlasExercises } from "@/lib/practice/atlas-recognition";

const REASONING_EVIDENCE_KEY = "agocode.progress.design.reasoning-notebooks";
const ATLAS_RECOGNITION_KEY = "agocode.progress.transfer.atlas-recognition";

type MixedSnapshot = {
  session: MixedPracticeSession;
  mastery: MasterySnapshot;
  review: ProblemReviewProfile;
};

function collect(seed: string): MixedSnapshot {
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

  const session = buildMixedPracticeSession({
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
  return { session, mastery, review };
}

const roleLabels = {
  retrieve: "Retrieve",
  "repair-recognition": "Repair recognition",
  "remove-support": "Remove support",
  transfer: "Transfer",
  "weak-dimension": "Build weakness",
  diversify: "Diversify",
} as const;

export function AdaptiveMixedSession() {
  const [seed, setSeed] = useState("mixed-session-0");
  const [snapshot, setSnapshot] = useState<MixedSnapshot | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setSnapshot(collect(seed)), 0);
    return () => window.clearTimeout(timer);
  }, [seed]);

  const classifiedById = useMemo(
    () => new Map(classifiedAtlasExercises.map((item) => [item.exercise.id, item])),
    [],
  );

  if (!snapshot) return <div className="mixed-session__loading">Building a diversified session from local evidence…</div>;

  return (
    <div className="mixed-session">
      <div className="mixed-session__summary">
        <div><span>Problems</span><strong>{snapshot.session.items.length}</strong><small>bounded mixed session</small></div>
        <div><span>Families</span><strong>{snapshot.session.familyCount}</strong><small>structural diversity</small></div>
        <div><span>Sources</span><strong>{snapshot.session.sourceCount}</strong><small>surface diversity</small></div>
        <div><span>Due retrieval</span><strong>{snapshot.session.dueRetrievalCount}</strong><small>{snapshot.review.overdue} total overdue</small></div>
      </div>

      <div className="mixed-session__intro">
        <div>
          <span className="eyebrow">Adaptive interleaving</span>
          <h2>One session, several kinds of evidence.</h2>
        </div>
        <p>
          The session deliberately mixes overdue retrieval, recent recognition misses, support removal, transfer, and your weakest mastery dimension. It does not count opening a problem as learning evidence; each linked surface records its own objective attempt evidence.
        </p>
      </div>

      <div className="mixed-session__list">
        {snapshot.session.items.map((item, index) => {
          const classified = classifiedById.get(item.exerciseId);
          return (
            <article className={`mixed-session__row mixed-session__row--${item.role}`} key={item.exerciseId}>
              <div className="mixed-session__index mono">{String(index + 1).padStart(2, "0")}</div>
              <div>
                <div className="mixed-session__meta mono">
                  <span>{roleLabels[item.role]}</span>
                  <span>{item.familyLabel}</span>
                  {classified ? <span>{sourceLabels[classified.exercise.source]}</span> : null}
                </div>
                <h3>{item.title}</h3>
                <p>{item.reason}</p>
              </div>
              <Link className={item.role === "retrieve" ? "button button--primary" : "button"} href={item.href}>
                {item.role === "retrieve" ? "Retrieve →" : "Attempt →"}
              </Link>
            </article>
          );
        })}
      </div>

      <div className="mixed-session__footer">
        <div>
          <span className="eyebrow">Why this order?</span>
          <p>
            Retrieval debt is handled first, then the remaining slots are diversified across families and sources. Weakness is targeted without collapsing the session into six near-identical exercises.
          </p>
        </div>
        <button className="button" type="button" onClick={() => setSeed(`mixed-session-${Date.now()}`)}>Build a different mix</button>
      </div>
    </div>
  );
}
