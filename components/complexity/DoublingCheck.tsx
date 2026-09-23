"use client";

import { useState } from "react";

const options = [
  { id: "double-both", label: "Both algorithms need about twice as many steps." },
  { id: "linear-double-log-one", label: "Simple search doubles; binary search needs about one additional step." },
  { id: "linear-one-log-double", label: "Simple search adds one step; binary search doubles." },
] as const;

export function DoublingCheck() {
  const [answer, setAnswer] = useState<string | null>(null);
  const correct = answer === "linear-double-log-one";

  return (
    <div className="exercise-panel">
      <div className="exercise-panel__header">
        <strong>Predict before continuing</strong>
        <span>growth-rate check</span>
      </div>
      <div className="exercise-panel__body">
        <p style={{ marginTop: 0, lineHeight: 1.65 }}>
          Suppose the input size doubles from <span className="mono">n</span> to <span className="mono">2n</span>.
          What should happen to the worst-case number of checks?
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
              ? "Correct. O(n) scales directly with n. For binary search, doubling the candidates adds only one more halving because log₂(2n) = log₂(n) + 1."
              : "Not yet. Compare the operations, not a stopwatch. Linear search may inspect every new item, while one additional halving is enough to account for a doubled binary-search space. Try another choice."}
          </p>
        ) : null}
      </div>
    </div>
  );
}
