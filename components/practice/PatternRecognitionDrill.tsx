"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { recognitionScenarios, transferTechniques, type TransferTechniqueId } from "@/lib/practice/transfer";

const storageKey = "agocode.progress.transfer.mixed-recognition";

type AnswerRecord = {
  selected: TransferTechniqueId;
  correct: boolean;
  firstTry: boolean;
};

function saveCompletion(score: number, total: number) {
  try {
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        completedAt: new Date().toISOString(),
        exerciseId: "mixed-pattern-recognition",
        score,
        total,
      }),
    );
  } catch {
    // The drill stays usable even if browser storage is unavailable.
  }
}

export function PatternRecognitionDrill() {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerRecord>>({});
  const [attempted, setAttempted] = useState<Record<string, boolean>>({});
  const scenario = recognitionScenarios[index];
  const answer = answers[scenario.id];
  const technique = transferTechniques.find((item) => item.id === scenario.answer);
  const score = useMemo(
    () => recognitionScenarios.filter((item) => answers[item.id]?.correct && answers[item.id]?.firstTry).length,
    [answers],
  );
  const completedCount = recognitionScenarios.filter((item) => answers[item.id]?.correct).length;

  function choose(selected: TransferTechniqueId) {
    if (answer?.correct) return;
    const correct = selected === scenario.answer;
    const firstTry = !attempted[scenario.id];
    setAttempted((current) => ({ ...current, [scenario.id]: true }));
    setAnswers((current) => ({
      ...current,
      [scenario.id]: { selected, correct, firstTry: correct ? firstTry : false },
    }));

    if (correct && completedCount + 1 === recognitionScenarios.length) {
      saveCompletion(score + (firstTry ? 1 : 0), recognitionScenarios.length);
    }
  }

  function goTo(next: number) {
    setIndex(Math.max(0, Math.min(recognitionScenarios.length - 1, next)));
  }

  return (
    <div className="recognition-drill">
      <div className="recognition-drill__header">
        <div>
          <div className="eyebrow">Mixed recognition · no chapter label</div>
          <h2>{scenario.title}</h2>
        </div>
        <span className="mono">{index + 1}/{recognitionScenarios.length} · first-try {score}</span>
      </div>

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
        {recognitionScenarios.map((item, itemIndex) => (
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
        <button className="button button--primary" type="button" onClick={() => goTo(index + 1)} disabled={!answer?.correct || index === recognitionScenarios.length - 1}>Next scenario →</button>
      </div>

      {completedCount === recognitionScenarios.length ? (
        <div className="recognition-complete">
          <span className="eyebrow">Mixed set complete</span>
          <h3>{score}/{recognitionScenarios.length} recognized on the first attempt.</h3>
          <p>
            The first-try score matters because transfer means identifying a technique before feedback tells you what chapter you are in. Revisit misses after a delay rather than immediately memorizing the labels.
          </p>
        </div>
      ) : null}
    </div>
  );
}
