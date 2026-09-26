"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { sourceLabels } from "@/lib/knowledge/all-exercises";
import { recordRecognitionCompletion } from "@/lib/learning/evidence";
import { recordProblemRecognitionSession } from "@/lib/learning/independence";
import {
  atlasPatterns,
  classifiedAtlasExercises,
  getAtlasRecognitionChoices,
  type AtlasPatternId,
} from "@/lib/practice/atlas-recognition";

const ATLAS_RECOGNITION_KEY = "agocode.progress.transfer.atlas-recognition";

type RetrievalProps = { exerciseId: string };

export function ObjectiveProblemRetrieval({ exerciseId }: RetrievalProps) {
  const item = useMemo(
    () => classifiedAtlasExercises.find((entry) => entry.exercise.id === exerciseId),
    [exerciseId],
  );
  const seed = `problem-retrieval:${exerciseId}`;
  const choices = useMemo(() => item ? getAtlasRecognitionChoices(item, seed, 6) : [], [item, seed]);
  const [attempted, setAttempted] = useState(false);
  const [selected, setSelected] = useState<AtlasPatternId | null>(null);
  const [completed, setCompleted] = useState(false);
  const [firstTry, setFirstTry] = useState(false);

  if (!item) {
    return (
      <div className="objective-retrieval__empty">
        <strong>This problem does not yet have a reliable structural-family classification.</strong>
        <Link className="button" href={`/exercises/${exerciseId}`}>Open the reasoning notebook →</Link>
      </div>
    );
  }

  const selectedFamily = selected ? atlasPatterns.find((family) => family.id === selected) : undefined;

  function choose(familyId: AtlasPatternId) {
    if (completed) return;
    const wasFirstTry = !attempted;
    const correct = familyId === item.family.id;
    setSelected(familyId);
    setAttempted(true);
    if (!correct) return;

    setCompleted(true);
    setFirstTry(wasFirstTry);
    const completedAt = new Date().toISOString();
    recordRecognitionCompletion(window.localStorage, ATLAS_RECOGNITION_KEY, {
      exerciseId: "atlas-pattern-recognition",
      firstTryCorrect: wasFirstTry ? 1 : 0,
      totalScenarios: 1,
      techniqueResults: {
        [item.family.id]: { totalScenarios: 1, firstTryCorrect: wasFirstTry ? 1 : 0 },
      },
      missedScenarioIds: wasFirstTry ? [] : [item.exercise.id],
      completedAt,
    });
    recordProblemRecognitionSession(
      window.localStorage,
      [{ exerciseId: item.exercise.id, firstTry: wasFirstTry }],
      completedAt,
    );
  }

  return (
    <div className="objective-retrieval">
      <section className="objective-retrieval__prompt">
        <div className="objective-retrieval__meta mono">
          <span>OBJECTIVE RETRIEVAL</span>
          <span>SOURCE / CHAPTER / TAGS HIDDEN</span>
        </div>
        <h2>{item.exercise.title}</h2>
        <p>
          Do not reopen your previous reasoning log. Identify the structural family that should organize the solution, then state its first modeling or invariant question before continuing.
        </p>
      </section>

      <div className="objective-retrieval__choices" role="group" aria-label="Choose the structural family from memory">
        {choices.map((family) => {
          const isSelected = selected === family.id;
          const correct = isSelected && completed;
          const wrong = isSelected && !completed;
          return (
            <button
              key={family.id}
              type="button"
              className={`objective-retrieval__choice ${correct ? "objective-retrieval__choice--correct" : ""} ${wrong ? "objective-retrieval__choice--wrong" : ""}`}
              onClick={() => choose(family.id)}
              disabled={completed}
            >
              <strong>{family.label}</strong>
              <span>{family.clue}</span>
            </button>
          );
        })}
      </div>

      {selected ? (
        <section className={`objective-retrieval__feedback ${completed ? "objective-retrieval__feedback--correct" : ""}`} aria-live="polite">
          {completed ? (
            <>
              <span className="eyebrow">Objective retrieval recorded</span>
              <h3>{firstTry ? "Recognized on the first try." : "Recovered after a miss."}</h3>
              <p><strong>First structural question:</strong> {item.family.firstQuestion}</p>
              <div className="objective-retrieval__reveal">
                <div><span>Family</span><strong>{item.family.label}</strong></div>
                <div><span>Source</span><strong>{sourceLabels[item.exercise.source]}</strong></div>
                <div><span>Domain</span><strong>{item.exercise.domain}</strong></div>
                <div><span>Matched clues</span><strong>{item.matchedTerms.join(" · ") || "structural fit"}</strong></div>
              </div>
              <p>
                AgoCode has written this result into problem-level recognition history. The review scheduler will expand or contract the next interval automatically; no manual “remembered” button is required.
              </p>
              <div className="action-row">
                <Link className="button button--primary" href={`/exercises/${item.exercise.id}`}>Rebuild the solution independently →</Link>
                <Link className="button" href="/review">Back to review queue</Link>
              </div>
            </>
          ) : (
            <>
              <span className="eyebrow">First retrieval attempt missed</span>
              <h3>{selectedFamily?.label ?? "That family"} is not the strongest structural fit.</h3>
              <p>
                Keep the prior notes closed. Re-read only the problem name in your own source and ask what state, ordering, representation, or proof obligation must drive the solution. A later correct answer will be recorded as recovered-after-retry rather than first-try recall.
              </p>
            </>
          )}
        </section>
      ) : null}
    </div>
  );
}
