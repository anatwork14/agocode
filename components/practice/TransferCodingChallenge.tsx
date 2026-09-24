"use client";

import Link from "next/link";
import { useState } from "react";
import { PythonExercise, type PythonTestCase } from "@/components/code/PythonExercise";
import { transferTechniques, type TransferTechniqueId } from "@/lib/practice/transfer";

type TransferCodingChallengeProps = {
  eyebrow: string;
  title: string;
  problem: string;
  examples: readonly string[];
  constraints: readonly string[];
  correctTechnique: TransferTechniqueId;
  techniqueOptions: readonly TransferTechniqueId[];
  wrongFeedback: string;
  functionName: string;
  starterCode: string;
  tests: PythonTestCase[];
  hints: string[];
  successMessage: string;
  storageKey: string;
};

export function TransferCodingChallenge({
  eyebrow,
  title,
  problem,
  examples,
  constraints,
  correctTechnique,
  techniqueOptions,
  wrongFeedback,
  functionName,
  starterCode,
  tests,
  hints,
  successMessage,
  storageKey,
}: TransferCodingChallengeProps) {
  const [selected, setSelected] = useState<TransferTechniqueId | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const correct = transferTechniques.find((item) => item.id === correctTechnique);
  const options = techniqueOptions
    .map((id) => transferTechniques.find((item) => item.id === id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  function choose(id: TransferTechniqueId) {
    setSelected(id);
    if (id === correctTechnique) setUnlocked(true);
  }

  return (
    <div className="transfer-coding-challenge">
      <section className="transfer-problem">
        <div className="eyebrow">{eyebrow}</div>
        <h2>{title}</h2>
        <p>{problem}</p>
        <div className="example-strip" aria-label="Examples">
          {examples.map((example, index) => <span key={example}><strong>ex {index + 1}</strong> {example}</span>)}
        </div>
        <div className="transfer-constraints">
          {constraints.map((constraint) => <span key={constraint}>{constraint}</span>)}
        </div>
      </section>

      <section className="hypothesis-gate" aria-label="Technique hypothesis">
        <div className="hypothesis-gate__heading">
          <div>
            <div className="eyebrow">Hypothesis first</div>
            <p>Choose the technique because its invariant fits the constraints—not because a route name gave it away.</p>
          </div>
          <span className="mono">code locked until justified</span>
        </div>
        <div className="hypothesis-options">
          {options.map((option) => {
            const isSelected = selected === option.id;
            const isCorrect = isSelected && option.id === correctTechnique;
            const isWrong = isSelected && option.id !== correctTechnique;
            return (
              <button
                className={`hypothesis-option ${isCorrect ? "hypothesis-option--correct" : ""} ${isWrong ? "hypothesis-option--wrong" : ""}`}
                type="button"
                onClick={() => choose(option.id)}
                key={option.id}
              >
                <strong>{option.label}</strong>
                <span>{option.clue}</span>
              </button>
            );
          })}
        </div>

        {selected && !unlocked ? <p className="prediction-feedback">{wrongFeedback}</p> : null}
        {unlocked && correct ? (
          <div className="hypothesis-confirmed" aria-live="polite">
            <span className="eyebrow">Technique justified</span>
            <strong>{correct.invariant}</strong>
            <Link className="button button--quiet" href={correct.bookHref}>Reconnect to the concept →</Link>
          </div>
        ) : null}
      </section>

      {unlocked ? (
        <PythonExercise
          id={storageKey.replaceAll(".", "-")}
          title="Implement the transfer solution."
          description="The pattern is identified. Now rebuild the implementation from the invariant and let the tests expose edge cases."
          functionName={functionName}
          starterCode={starterCode}
          tests={tests}
          hints={hints}
          successMessage={successMessage}
          storageKey={storageKey}
        />
      ) : (
        <div className="transfer-locked">State the right mental model before the editor appears.</div>
      )}
    </div>
  );
}
