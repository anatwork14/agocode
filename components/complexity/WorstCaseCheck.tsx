"use client";

import { useState } from "react";

const options = [
  { id: "constant", label: "O(1), because this particular lookup found the target immediately." },
  { id: "linear", label: "O(n), because we describe how the algorithm can grow in its worst case." },
  { id: "log", label: "O(log n), because the directory is ordered." },
] as const;

export function WorstCaseCheck() {
  const [answer, setAnswer] = useState<string | null>(null);
  const correct = answer === "linear";

  return (
    <div className="exercise-panel">
      <div className="exercise-panel__header">
        <strong>Best result, worst-case growth</strong>
        <span>reasoning check</span>
      </div>
      <div className="exercise-panel__body">
        <p style={{ marginTop: 0, lineHeight: 1.65 }}>
          A simple search checks a list from left to right. This time the target happens to be the very first item.
          In this introductory analysis, which Big O description still characterizes simple search?
        </p>
        <div className="prediction-options">
          {options.map((option) => (
            <button
              type="button"
              className={`prediction-option ${answer === option.id ? (correct ? "prediction-option--correct" : "prediction-option--wrong") : ""}`}
              key={option.id}
              onClick={() => setAnswer(option.id)}
              disabled={correct}
            >
              {option.label}
            </button>
          ))}
        </div>
        {answer ? (
          <p className={`prediction-feedback ${correct ? "prediction-feedback--correct" : ""}`} aria-live="polite">
            {correct
              ? "Correct. One lucky execution can finish immediately, but simple search can still require examining every item as n grows."
              : "Separate this one execution from the algorithm's growth bound. A best-case result does not remove the linear worst case. Try another choice."}
          </p>
        ) : null}
      </div>
    </div>
  );
}
