"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { sourceLabels } from "@/lib/knowledge/all-exercises";
import { readLearningEvidence, recordRecognitionCompletion } from "@/lib/learning/evidence";
import { recordProblemRecognitionSession } from "@/lib/learning/independence";
import {
  atlasPatterns,
  buildAtlasRecognitionSession,
  getAtlasRecognitionChoices,
  type AtlasPatternId,
  type ClassifiedAtlasExercise,
} from "@/lib/practice/atlas-recognition";

const STORAGE_KEY = "agocode.progress.transfer.atlas-recognition";
const SESSION_SIZE = 12;

type AnswerRecord = {
  selected: AtlasPatternId;
  correct: boolean;
  firstTry: boolean;
};

function saveCompletion(items: ClassifiedAtlasExercise[], answers: Record<string, AnswerRecord>) {
  const techniqueResults: Record<string, { totalScenarios: number; firstTryCorrect: number }> = {};
  const missedScenarioIds: string[] = [];
  let firstTryCorrect = 0;

  for (const item of items) {
    const answer = answers[item.exercise.id];
    if (!answer?.correct) continue;

    const family = techniqueResults[item.family.id] ?? { totalScenarios: 0, firstTryCorrect: 0 };
    family.totalScenarios += 1;
    if (answer.firstTry) {
      family.firstTryCorrect += 1;
      firstTryCorrect += 1;
    } else {
      missedScenarioIds.push(item.exercise.id);
    }
    techniqueResults[item.family.id] = family;
  }

  const completedAt = new Date().toISOString();
  recordRecognitionCompletion(localStorage, STORAGE_KEY, {
    exerciseId: "atlas-pattern-recognition",
    firstTryCorrect,
    totalScenarios: items.length,
    techniqueResults,
    missedScenarioIds,
    completedAt,
  });
  recordProblemRecognitionSession(
    localStorage,
    items.map((item) => ({
      exerciseId: item.exercise.id,
      firstTry: Boolean(answers[item.exercise.id]?.firstTry),
    })),
    completedAt,
  );
}

export function AtlasPatternRecognitionDrill() {
  const [seed, setSeed] = useState("atlas-session-0");
  const [priorMissedIds, setPriorMissedIds] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerRecord>>({});
  const [attempted, setAttempted] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const evidence = readLearningEvidence(localStorage, STORAGE_KEY);
      const recognition = evidence?.recognition;
      setSeed(`atlas-session-${recognition?.sessions ?? 0}`);
      setPriorMissedIds(recognition?.recentMissedScenarioIds ?? []);
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  const session = useMemo(
    () => buildAtlasRecognitionSession(seed, SESSION_SIZE, priorMissedIds),
    [priorMissedIds, seed],
  );
  const item = session.items[index];
  const answer = item ? answers[item.exercise.id] : undefined;
  const choices = useMemo(
    () => item ? getAtlasRecognitionChoices(item, seed, 6) : [],
    [item, seed],
  );
  const firstTryScore = useMemo(
    () => Object.values(answers).filter((entry) => entry.correct && entry.firstTry).length,
    [answers],
  );
  const completedCount = Object.values(answers).filter((entry) => entry.correct).length;

  if (!item) {
    return <div className="atlas-recognition-empty">No source-aware recognition items are available yet.</div>;
  }

  function choose(selected: AtlasPatternId) {
    if (answer?.correct) return;
    const correct = selected === item.family.id;
    const firstTry = !attempted[item.exercise.id];
    const nextRecord: AnswerRecord = { selected, correct, firstTry: correct ? firstTry : false };
    const nextAnswers = { ...answers, [item.exercise.id]: nextRecord };

    setAttempted((current) => ({ ...current, [item.exercise.id]: true }));
    setAnswers(nextAnswers);

    if (correct && completedCount + 1 === session.items.length) {
      saveCompletion(session.items, nextAnswers);
    }
  }

  function goTo(next: number) {
    setIndex(Math.max(0, Math.min(session.items.length - 1, next)));
  }

  function startAnotherSet() {
    const misses = session.items
      .filter((entry) => !answers[entry.exercise.id]?.firstTry)
      .map((entry) => entry.exercise.id);
    setPriorMissedIds(misses);
    setSeed(`atlas-session-${Date.now()}`);
    setIndex(0);
    setAnswers({});
    setAttempted({});
  }

  const selectedFamily = answer
    ? atlasPatterns.find((family) => family.id === answer.selected)
    : undefined;

  return (
    <div className="atlas-recognition">
      <div className="atlas-recognition__status">
        <div>
          <span className="eyebrow">Source-aware interleaving</span>
          <strong>{session.items.length} problems · {session.sourceCount} sources · {session.familyCount} pattern families</strong>
        </div>
        <span className="mono">{index + 1}/{session.items.length} · first-try {firstTryScore}</span>
      </div>

      {priorMissedIds.length && index === 0 ? (
        <div className="atlas-recognition__adaptive">
          <span className="eyebrow">Adaptive retry</span>
          <p>
            Up to four problems missed on the latest first attempt are brought forward before the sampler fills the set
            with different sources, domains, and pattern families.
          </p>
        </div>
      ) : null}

      <div className="atlas-recognition__prompt">
        <div className="atlas-recognition__prompt-meta">
          <span className="mono">PROBLEM {String(index + 1).padStart(2, "0")}</span>
          <span className="mono">SOURCE / CHAPTER / TAGS HIDDEN</span>
        </div>
        <h2>{item.exercise.title}</h2>
        <p>
          Read the named problem in your own source copy if needed. Before looking at its chapter label, choose the structural
          family whose first invariant or modeling question best organizes the solution.
        </p>
      </div>

      <div className="atlas-recognition__choices" role="group" aria-label="Choose the strongest structural family">
        {choices.map((family) => {
          const selected = answer?.selected === family.id;
          const correct = selected && answer?.correct;
          const wrong = selected && answer && !answer.correct;
          return (
            <button
              className={`atlas-recognition__choice ${correct ? "atlas-recognition__choice--correct" : ""} ${wrong ? "atlas-recognition__choice--wrong" : ""}`}
              type="button"
              onClick={() => choose(family.id)}
              disabled={Boolean(answer?.correct)}
              key={family.id}
            >
              <strong>{family.label}</strong>
              <span>{family.clue}</span>
            </button>
          );
        })}
      </div>

      {answer ? (
        <div className={answer.correct ? "atlas-recognition__feedback atlas-recognition__feedback--correct" : "atlas-recognition__feedback"} aria-live="polite">
          {answer.correct ? (
            <>
              <div className="atlas-recognition__feedback-head">
                <div>
                  <span className="eyebrow">Pattern recognized</span>
                  <h3>{item.family.label}</h3>
                </div>
                <span className="mono">{answer.firstTry ? "FIRST TRY" : "RECOVERED AFTER RETRY"}</span>
              </div>
              <p><strong>First question:</strong> {item.family.firstQuestion}</p>
              <div className="atlas-recognition__reveal">
                <div><span>Source</span><strong>{sourceLabels[item.exercise.source]}</strong></div>
                <div><span>Location</span><strong>{item.exercise.sourceChapter}</strong></div>
                <div><span>Domain</span><strong>{item.exercise.domain}</strong></div>
                <div><span>Matched clues</span><strong>{item.matchedTerms.join(" · ") || "structural fit"}</strong></div>
              </div>
              <p className="atlas-recognition__lens">{item.exercise.lens}</p>
              <Link className="button button--quiet" href={`/exercises/${item.exercise.id}`}>Open reasoning notebook →</Link>
            </>
          ) : (
            <>
              <span className="eyebrow">Not enough structural evidence yet</span>
              <p>
                {selectedFamily?.label ? `${selectedFamily.label} is plausible from the surface wording, but it is not the strongest classified structure here. ` : ""}
                Re-read the objective and constraints. Ask what state, ordering, representation, or proof obligation must remain true before choosing again.
              </p>
            </>
          )}
        </div>
      ) : null}

      <div className="atlas-recognition__progress" aria-label="Atlas recognition progress">
        {session.items.map((entry, itemIndex) => (
          <button
            className={`atlas-recognition__dot ${itemIndex === index ? "atlas-recognition__dot--current" : ""} ${answers[entry.exercise.id]?.correct ? "atlas-recognition__dot--done" : ""}`}
            type="button"
            onClick={() => goTo(itemIndex)}
            aria-label={`Go to recognition item ${itemIndex + 1}`}
            key={entry.exercise.id}
          >
            {itemIndex + 1}
          </button>
        ))}
      </div>

      <div className="lab-toolbar">
        <button className="button" type="button" onClick={() => goTo(index - 1)} disabled={index === 0}>← Previous</button>
        <button className="button button--primary" type="button" onClick={() => goTo(index + 1)} disabled={!answer?.correct || index === session.items.length - 1}>Next problem →</button>
      </div>

      {completedCount === session.items.length ? (
        <div className="atlas-recognition__complete">
          <div>
            <span className="eyebrow">Interleaved set complete</span>
            <h3>{firstTryScore}/{session.items.length} recognized on the first attempt.</h3>
            <p>
              This set sampled {session.familyCount} structural families from {session.sourceCount} source perspectives. Misses
              are saved as retrieval evidence and will be prioritized at the beginning of the next broad session. First-try
              problem outcomes are also timestamped so delayed recognition can count as problem-level recall evidence.
            </p>
          </div>
          <button className="button button--primary" type="button" onClick={startAnotherSet}>Build another mixed set →</button>
        </div>
      ) : null}
    </div>
  );
}
