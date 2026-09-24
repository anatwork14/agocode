"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { readLearningEvidence, recordRecognitionCompletion } from "@/lib/learning/evidence";
import {
  recognitionScenarios,
  transferTechniques,
  type RecognitionScenario,
  type TransferTechniqueId,
} from "@/lib/practice/transfer";

const storageKey = "agocode.progress.transfer.mixed-recognition";

type AnswerRecord = {
  selected: TransferTechniqueId;
  correct: boolean;
  firstTry: boolean;
};

function saveCompletion(answers: Record<string, AnswerRecord>) {
  const techniqueResults: Record<string, { totalScenarios: number; firstTryCorrect: number }> = {};
  const missedScenarioIds: string[] = [];
  let firstTryCorrect = 0;

  for (const scenario of recognitionScenarios) {
    const answer = answers[scenario.id];
    if (!answer?.correct) continue;

    const technique = techniqueResults[scenario.answer] ?? { totalScenarios: 0, firstTryCorrect: 0 };
    technique.totalScenarios += 1;
    if (answer.firstTry) {
      technique.firstTryCorrect += 1;
      firstTryCorrect += 1;
    } else {
      missedScenarioIds.push(scenario.id);
    }
    techniqueResults[scenario.answer] = technique;
  }

  recordRecognitionCompletion(localStorage, storageKey, {
    exerciseId: "mixed-pattern-recognition",
    firstTryCorrect,
    totalScenarios: recognitionScenarios.length,
    techniqueResults,
    missedScenarioIds,
  });
}

function reorderForPriorMisses(missedIds: string[]): RecognitionScenario[] {
  if (!missedIds.length) return [...recognitionScenarios];
  const missed = new Set(missedIds);
  return [
    ...recognitionScenarios.filter((scenario) => missed.has(scenario.id)),
    ...recognitionScenarios.filter((scenario) => !missed.has(scenario.id)),
  ];
}

export function PatternRecognitionDrill() {
  const [scenarios, setScenarios] = useState<RecognitionScenario[]>(() => [...recognitionScenarios]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerRecord>>({});
  const [attempted, setAttempted] = useState<Record<string, boolean>>({});
  const [priorMissCount, setPriorMissCount] = useState(0);
  const scenario = scenarios[index];
  const answer = answers[scenario.id];
  const technique = transferTechniques.find((item) => item.id === scenario.answer);
  const score = useMemo(
    () => Object.values(answers).filter((item) => item.correct && item.firstTry).length,
    [answers],
  );
  const completedCount = Object.values(answers).filter((item) => item.correct).length;

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const evidence = readLearningEvidence(localStorage, storageKey);
      const misses = evidence?.recognition?.recentMissedScenarioIds ?? [];
      if (misses.length) {
        setScenarios(reorderForPriorMisses(misses));
        setPriorMissCount(misses.length);
      }
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  function choose(selected: TransferTechniqueId) {
    if (answer?.correct) return;
    const correct = selected === scenario.answer;
    const firstTry = !attempted[scenario.id];
    const nextRecord: AnswerRecord = { selected, correct, firstTry: correct ? firstTry : false };
    const nextAnswers = { ...answers, [scenario.id]: nextRecord };

    setAttempted((current) => ({ ...current, [scenario.id]: true }));
    setAnswers(nextAnswers);

    if (correct && completedCount + 1 === scenarios.length) {
      saveCompletion(nextAnswers);
    }
  }

  function goTo(next: number) {
    setIndex(Math.max(0, Math.min(scenarios.length - 1, next)));
  }

  return (
    <div className="recognition-drill">
      <div className="recognition-drill__header">
        <div>
          <div className="eyebrow">Mixed recognition · no chapter label</div>
          <h2>{scenario.title}</h2>
        </div>
        <span className="mono">
          {index + 1}/{scenarios.length} · first-try {score}
          {priorMissCount > 0 ? ` · ${priorMissCount} prior miss${priorMissCount === 1 ? "" : "es"} first` : ""}
        </span>
      </div>

      {priorMissCount > 0 && index === 0 ? (
        <div className="recognition-adaptive-note">
          <span className="eyebrow">Adaptive retry</span>
          <p>
            Your previous session missed {priorMissCount} scenario{priorMissCount === 1 ? "" : "s"}. Those scenarios are
            placed first this time, while their technique labels remain hidden.
          </p>
        </div>
      ) : null}

      <div className="recognition-problem">
        <p>{scenario.prompt}</p>
        <div className="recognition-constraints" aria-label="Problem constraints">
          {scenario.constraints.map((constraint) => <span key={constraint}>{constraint}</span>)}
        </div>
      </div>

      <div className="recognition-question">
        <div className="recognition-question__prompt">
          <span className="eyebrow">Choose the technique before coding</span>
          <strong>Which mental model gives you the strongest invariant for this problem?</strong>
        </div>
        <div className="recognition-techniques" role="group" aria-label="Choose a technique">
          {transferTechniques.map((item) => {
            const selected = answer?.selected === item.id;
            const correct = selected && answer?.correct;
            const wrong = selected && answer && !answer.correct;
            return (
              <button
                className={`recognition-technique ${correct ? "recognition-technique--correct" : ""} ${wrong ? "recognition-technique--wrong" : ""}`}
                type="button"
                onClick={() => choose(item.id)}
                disabled={Boolean(answer?.correct)}
                key={item.id}
              >
                <strong>{item.label}</strong>
                <span>{item.clue}</span>
              </button>
            );
          })}
        </div>
      </div>

      {answer ? (
        <div className={answer.correct ? "recognition-feedback recognition-feedback--correct" : "recognition-feedback"} aria-live="polite">
          {answer.correct ? (
            <>
              <span className="eyebrow">Pattern recognized</span>
              <h3>{technique?.label}</h3>
              <p>{scenario.explanation}</p>
              <div className="recognition-invariant"><span>Invariant</span><strong>{technique?.invariant}</strong></div>
              <p className="recognition-trap"><strong>Why another plausible idea fails:</strong> {scenario.trap}</p>
              {technique ? <Link className="button button--quiet" href={technique.bookHref}>Reconnect to Book Track →</Link> : null}
            </>
          ) : (
            <>
              <span className="eyebrow">Not enough justification yet</span>
              <p>{scenario.trap}</p>
              <p>Use the constraints to rule out techniques that optimize the wrong quantity or cannot preserve the required state.</p>
            </>
          )}
        </div>
      ) : null}

      <div className="recognition-progress" aria-label="Recognition drill progress">
        {scenarios.map((item, itemIndex) => (
          <button
            className={`recognition-progress__dot ${itemIndex === index ? "recognition-progress__dot--current" : ""} ${answers[item.id]?.correct ? "recognition-progress__dot--done" : ""}`}
            type="button"
            onClick={() => goTo(itemIndex)}
            aria-label={`Go to scenario ${itemIndex + 1}: ${item.title}`}
            key={item.id}
          >
            {itemIndex + 1}
          </button>
        ))}
      </div>

      <div className="lab-toolbar">
        <button className="button" type="button" onClick={() => goTo(index - 1)} disabled={index === 0}>← Previous</button>
        <button className="button button--primary" type="button" onClick={() => goTo(index + 1)} disabled={!answer?.correct || index === scenarios.length - 1}>Next scenario →</button>
      </div>

      {completedCount === scenarios.length ? (
        <div className="recognition-complete">
          <span className="eyebrow">Mixed set complete</span>
          <h3>{score}/{scenarios.length} recognized on the first attempt.</h3>
          <p>
            AgoCode now keeps both the aggregate score and technique-level evidence. On your next session, scenarios missed
            this time will move to the front so retrieval pressure follows the gaps instead of repeating a fixed order.
          </p>
          <Link className="button button--quiet" href="/progress">Inspect recognition evidence →</Link>
        </div>
      ) : null}
    </div>
  );
}
