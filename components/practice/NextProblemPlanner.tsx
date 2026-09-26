"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { sourceLabels } from "@/lib/knowledge/all-exercises";
import { stuckDiagnoses } from "@/lib/knowledge/stuck-router";
import {
  buildDifficultyCalibrationProfile,
  readDifficultyCalibrationHistory,
  type DifficultyCalibrationProfile,
} from "@/lib/learning/calibration";
import { readLearningEvidence, type LearningEvidence } from "@/lib/learning/evidence";
import {
  buildProblemIndependenceProfile,
  readProblemRecognitionHistory,
  type ProblemIndependenceProfile,
} from "@/lib/learning/independence";
import { buildMasterySnapshot, type MasterySnapshot } from "@/lib/learning/mastery";
import { getMostFrequentObstacles, readObstacleEvidence, type ObstacleEvidence } from "@/lib/learning/obstacles";
import { progressEvidenceKeys } from "@/lib/learning/progressCatalog";
import {
  buildAdaptiveRecommendations,
  readRecommendationHistory,
  recordRecommendationChoice,
  type AdaptiveRecommendation,
} from "@/lib/learning/recommendations";
import { readReasoningAttemptHistory } from "@/lib/learning/reasoning-attempts";

const REASONING_EVIDENCE_KEY = "agocode.progress.design.reasoning-notebooks";
const ATLAS_RECOGNITION_KEY = "agocode.progress.transfer.atlas-recognition";

type PlannerSnapshot = {
  mastery: MasterySnapshot;
  obstacles: ObstacleEvidence;
  recentExerciseIds: string[];
  missedExerciseIds: string[];
  recommendationHistoryIds: string[];
  calibration: DifficultyCalibrationProfile;
  independence: ProblemIndependenceProfile;
};

function collectPlannerSnapshot(): PlannerSnapshot {
  const evidenceMap: Record<string, LearningEvidence | null> = {};
  for (const key of progressEvidenceKeys) evidenceMap[key] = readLearningEvidence(window.localStorage, key);

  const reasoning = readLearningEvidence(window.localStorage, REASONING_EVIDENCE_KEY);
  const attemptHistory = readReasoningAttemptHistory(window.localStorage);
  const latestAttemptIds = [...attemptHistory.entries]
    .sort((a, b) => b.finalizedAt.localeCompare(a.finalizedAt))
    .map((entry) => entry.exerciseId);
  const latestNotebookIds = Object.entries(reasoning?.reasoning?.byExercise ?? {})
    .sort(([, a], [, b]) => b.updatedAt.localeCompare(a.updatedAt))
    .map(([exerciseId]) => exerciseId);
  const recentExerciseIds = Array.from(new Set([...latestAttemptIds, ...latestNotebookIds])).slice(0, 10);

  const atlasRecognition = readLearningEvidence(window.localStorage, ATLAS_RECOGNITION_KEY);
  const missedExerciseIds = atlasRecognition?.recognition?.recentMissedScenarioIds ?? [];
  const recommendationHistory = readRecommendationHistory(window.localStorage);
  const recommendationHistoryIds = recommendationHistory.entries
    .slice(-12)
    .reverse()
    .map((entry) => entry.exerciseId);
  const calibration = buildDifficultyCalibrationProfile(readDifficultyCalibrationHistory(window.localStorage));
  const independence = buildProblemIndependenceProfile({
    reasoning: reasoning?.reasoning,
    reasoningAttempts: attemptHistory,
    recommendationHistory,
    recognitionHistory: readProblemRecognitionHistory(window.localStorage),
  });

  return {
    mastery: buildMasterySnapshot(evidenceMap),
    obstacles: readObstacleEvidence(window.localStorage),
    recentExerciseIds,
    missedExerciseIds,
    recommendationHistoryIds,
    calibration,
    independence,
  };
}

function RecommendationReasons({ item }: { item: AdaptiveRecommendation }) {
  return (
    <ul className="next-problem__reasons">
      {item.reasons.map((reason) => <li key={reason}>{reason}</li>)}
    </ul>
  );
}

export function NextProblemPlanner() {
  const router = useRouter();
  const [snapshot, setSnapshot] = useState<PlannerSnapshot | null>(null);
  const [mix, setMix] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => setSnapshot(collectPlannerSnapshot()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const recommendations = useMemo(() => {
    if (!snapshot) return [];
    return buildAdaptiveRecommendations({
      mastery: snapshot.mastery,
      obstacles: snapshot.obstacles,
      recentExerciseIds: snapshot.recentExerciseIds,
      missedExerciseIds: snapshot.missedExerciseIds,
      recommendationHistoryIds: snapshot.recommendationHistoryIds,
      difficultyCalibration: snapshot.calibration,
      problemIndependence: snapshot.independence.states,
      limit: 5,
      seed: `planner-mix-${mix}`,
    });
  }, [mix, snapshot]);

  const primary = recommendations[0];
  const frequentObstacle = useMemo(() => {
    if (!snapshot) return null;
    const [top] = getMostFrequentObstacles(snapshot.obstacles, 1);
    if (!top) return null;
    return {
      ...top,
      label: stuckDiagnoses.find((item) => item.id === top.id)?.label ?? top.id,
    };
  }, [snapshot]);

  function choose(item: AdaptiveRecommendation) {
    recordRecommendationChoice(window.localStorage, item.exercise.id);
    router.push(`/exercises/${item.exercise.id}`);
  }

  if (!snapshot) {
    return <div className="next-problem__loading">Reading mastery, friction, calibration, attempt history, independence, transfer misses, and recent practice from this browser…</div>;
  }

  if (!primary) {
    return (
      <div className="empty-state">
        <h2>No source-aware recommendation is available yet.</h2>
        <p>Open the Problem Atlas and start one reasoning notebook so AgoCode has an exercise context to work from.</p>
        <Link className="button button--primary" href="/exercises">Open Problem Atlas →</Link>
      </div>
    );
  }

  const calibrationLabel = snapshot.calibration.bias > 0
    ? "Raise challenge"
    : snapshot.calibration.bias < 0
      ? "Gentler step"
      : "Hold steady";
  const primaryIndependence = snapshot.independence.states[primary.exercise.id];

  return (
    <div className="next-problem">
      <section className="next-problem__signals" aria-label="Recommendation signals">
        <div>
          <span>Priority dimension</span>
          <strong>{snapshot.mastery.weakest.label}</strong>
          <small>{snapshot.mastery.weakest.score}% evidence strength</small>
        </div>
        <div>
          <span>Repeated friction</span>
          <strong>{frequentObstacle?.label ?? "Not enough data"}</strong>
          <small>{frequentObstacle ? `${frequentObstacle.count} explicit help request${frequentObstacle.count === 1 ? "" : "s"}` : "use contextual help during a real attempt"}</small>
        </div>
        <div>
          <span>Difficulty calibration</span>
          <strong>{calibrationLabel}</strong>
          <small>
            {snapshot.calibration.evidenceSamples
              ? `${snapshot.calibration.evidenceSamples} rated recommendation${snapshot.calibration.evidenceSamples === 1 ? "" : "s"} cross-checked with attempt evidence`
              : "rate a recommended problem after attempting it"}
          </small>
        </div>
        <div>
          <span>Problem independence</span>
          <strong>{snapshot.independence.independentOrBetter}/{snapshot.independence.tracked || 0}</strong>
          <small>{snapshot.independence.recalled} recalled · {snapshot.independence.transferredOrBetter} transferred+</small>
        </div>
      </section>

      <section className="next-problem__hero">
        <div className="next-problem__rank mono">NEXT 01</div>
        <div className="next-problem__hero-main">
          <div className="next-problem__meta mono">
            <span>{sourceLabels[primary.exercise.source]}</span>
            <span>{primary.exercise.level}</span>
            <span>{primary.exercise.kind}</span>
          </div>
          <h2>{primary.exercise.title}</h2>
          <p>{primary.exercise.lens}</p>
          <RecommendationReasons item={primary} />
          <div className="next-problem__tags">
            <span>{primary.familyLabel}</span>
            <span>targets {snapshot.mastery.weakest.label}</span>
            {primaryIndependence ? <span>{primaryIndependence.label.toLowerCase()} evidence</span> : <span>new problem</span>}
            {snapshot.calibration.bias !== 0 ? <span>calibrated {snapshot.calibration.direction}</span> : null}
            {primary.novelty.source ? <span>new source</span> : null}
            {primary.novelty.domain ? <span>new domain</span> : null}
          </div>
          <div className="action-row">
            <button className="button button--primary" type="button" onClick={() => choose(primary)}>I&apos;ll solve this →</button>
            <Link className="button" href={`/patterns/${primary.familyId}`}>Study the structural family</Link>
          </div>
        </div>
        <aside className="next-problem__why">
          <span className="eyebrow">Why this problem?</span>
          <p>
            The planner does not recommend the globally “best” exercise. It chooses a useful next attempt from your local
            evidence: weakest learning dimension, repeated help requests, calibrated difficulty, best-ever problem independence,
            recent blind misses, and source/domain/family diversity.
          </p>
          <button className="atlas-reset" type="button" onClick={() => setMix((value) => value + 1)}>show a different mix</button>
        </aside>
      </section>

      <section className="next-problem__alternates">
        <div className="section-heading">
          <div className="section-heading__index">ALTERNATES</div>
          <div>
            <h2>Different routes toward the same learning gap.</h2>
            <p>The shortlist is diversified so one recommendation set does not collapse into five problems from the same source or family.</p>
          </div>
        </div>

        <div className="next-problem__list">
          {recommendations.slice(1).map((item, index) => (
            <article className="next-problem__row" key={item.exercise.id}>
              <span className="mono">{String(index + 2).padStart(2, "0")}</span>
              <div>
                <div className="next-problem__meta mono">
                  <span>{sourceLabels[item.exercise.source]}</span>
                  <span>{item.familyLabel}</span>
                </div>
                <h3>{item.exercise.title}</h3>
                <RecommendationReasons item={item} />
              </div>
              <div className="next-problem__row-actions">
                <button className="button button--quiet" type="button" onClick={() => choose(item)}>Choose →</button>
                <Link href={`/patterns/${item.familyId}`}>pattern</Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="next-problem__method">
        <span className="eyebrow">Recommendation boundary</span>
        <h2>Adaptive does not mean opaque.</h2>
        <p>
          AgoCode shows the signals behind every recommendation and keeps the scoring deterministic. Friction is used as a routing
          clue, not as a penalty; self-authored notebook confidence is not treated as mastery; difficulty ratings only affect
          sequencing after they are cross-checked against recorded attempt evidence; problem-level states are derived from the
          strongest finalized attempt, so a later weak retry remains diagnostically visible without erasing independence already proved.
        </p>
        <div className="action-row">
          <Link className="button" href="/progress">Inspect your evidence →</Link>
          <Link className="button" href="/practice/atlas">Run blind recognition →</Link>
          <Link className="button" href="/exercises">Browse manually →</Link>
        </div>
      </section>
    </div>
  );
}
