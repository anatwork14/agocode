"use client";

import { useEffect, useState } from "react";
import {
  evaluateDifficultyCalibrationEntry,
  readDifficultyCalibrationHistory,
  recordDifficultyCalibration,
  summarizeReasoningAttempt,
  type DifficultyCalibrationEntry,
  type DifficultyRating,
} from "@/lib/learning/calibration";
import { readLearningEvidence, type ReasoningExerciseEvidence } from "@/lib/learning/evidence";
import { readRecommendationHistory, type RecommendationHistoryEntry } from "@/lib/learning/recommendations";

const REASONING_EVIDENCE_KEY = "agocode.progress.design.reasoning-notebooks";

const ratingLabels: Record<DifficultyRating, string> = {
  "too-easy": "Too easy",
  "productive-stretch": "Productive stretch",
  "too-hard": "Too hard",
};

type CalibrationView = {
  choice: RecommendationHistoryEntry;
  existing?: DifficultyCalibrationEntry;
  evidence?: ReasoningExerciseEvidence;
};

function latestRecommendationForExercise(exerciseId: string) {
  const entries = readRecommendationHistory(window.localStorage).entries;
  for (let index = entries.length - 1; index >= 0; index -= 1) {
    if (entries[index].exerciseId === exerciseId) return entries[index];
  }
  return undefined;
}

function readCalibrationView(exerciseId: string): CalibrationView | null {
  const choice = latestRecommendationForExercise(exerciseId);
  if (!choice) return null;

  const history = readDifficultyCalibrationHistory(window.localStorage);
  const existing = history.entries.find((entry) => (
    entry.exerciseId === exerciseId && entry.recommendationChosenAt === choice.chosenAt
  ));
  const evidence = readLearningEvidence(window.localStorage, REASONING_EVIDENCE_KEY)?.reasoning?.byExercise[exerciseId];

  return { choice, existing, evidence };
}

export function DifficultyCalibration({ exerciseId }: { exerciseId: string }) {
  const [view, setView] = useState<CalibrationView | null | undefined>(undefined);

  useEffect(() => {
    const timer = window.setTimeout(() => setView(readCalibrationView(exerciseId)), 0);
    return () => window.clearTimeout(timer);
  }, [exerciseId]);

  if (view === undefined || view === null) return null;

  const objective = summarizeReasoningAttempt(view.evidence);
  const evaluation = view.existing ? evaluateDifficultyCalibrationEntry(view.existing) : null;

  function rate(rating: DifficultyRating) {
    recordDifficultyCalibration(window.localStorage, {
      exerciseId,
      recommendationChosenAt: view!.choice.chosenAt,
      rating,
      evidence: view!.evidence,
    });
    setView(readCalibrationView(exerciseId));
  }

  return (
    <section className="difficulty-calibration" aria-labelledby="difficulty-calibration-title">
      <div className="difficulty-calibration__intro">
        <span className="eyebrow">Adaptive sequencing · calibration</span>
        <h3 id="difficulty-calibration-title">How did this recommended problem feel?</h3>
        <p>
          This rating does not count as mastery. AgoCode cross-checks it against the work recorded in this notebook before it can
          raise or lower the difficulty of later recommendations.
        </p>
      </div>

      <div className="difficulty-calibration__body">
        <div className="difficulty-calibration__choices" role="group" aria-label="Recommended problem difficulty">
          {(Object.keys(ratingLabels) as DifficultyRating[]).map((rating) => (
            <button
              className={view.existing?.rating === rating ? "button button--selected" : "button"}
              type="button"
              aria-pressed={view.existing?.rating === rating}
              onClick={() => rate(rating)}
              key={rating}
            >
              {ratingLabels[rating]}
            </button>
          ))}
        </div>

        <div className="difficulty-calibration__evidence" aria-label="Calibration evidence">
          <div>
            <span>Reasoning stages</span>
            <strong>{objective ? `${objective.developedStages}/${objective.totalStages}` : "No attempt yet"}</strong>
          </div>
          <div>
            <span>Completion</span>
            <strong>{objective?.completed ? "Marked complete" : "Not complete"}</strong>
          </div>
          <div>
            <span>Structural lens</span>
            <strong>{objective?.lensRevealed ? "Used" : "Not used"}</strong>
          </div>
        </div>

        {evaluation ? (
          <div className={`difficulty-calibration__result difficulty-calibration__result--${evaluation.signal}`} aria-live="polite">
            <span className="mono">PLANNER INTERPRETATION</span>
            <strong>
              {evaluation.signal === "raise"
                ? "Raise the challenge"
                : evaluation.signal === "lower"
                  ? "Use a gentler next step"
                  : evaluation.signal === "waiting"
                    ? "Waiting for attempt evidence"
                    : "Hold the current difficulty"}
            </strong>
            <p>{evaluation.reason}</p>
          </div>
        ) : (
          <p className="difficulty-calibration__note">
            Choose a rating after a real attempt. With no observable notebook work, the rating is stored but remains inactive.
          </p>
        )}
      </div>
    </section>
  );
}
