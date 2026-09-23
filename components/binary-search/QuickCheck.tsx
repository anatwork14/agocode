"use client";

import { FormEvent, useState } from "react";

export function QuickCheck() {
  const [answer, setAnswer] = useState("");
  const [checked, setChecked] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setChecked(true);
  }

  const correct = Number(answer) === 7;

  return (
    <div className="exercise-panel">
      <div className="exercise-panel__header">
        <strong>Before continuing…</strong>
        <span>retrieval check</span>
      </div>
      <div className="exercise-panel__body">
        <p style={{ marginTop: 0, lineHeight: 1.65 }}>
          A sorted list contains <strong>128 names</strong>. Using binary search, what is the maximum number of
          guesses needed in the worst case?
        </p>
        <form onSubmit={submit} className="lab-toolbar">
          <input
            aria-label="Maximum number of guesses"
            inputMode="numeric"
            value={answer}
            onChange={(event) => {
              setAnswer(event.target.value);
              setChecked(false);
            }}
            style={{
              minHeight: 44,
              width: 130,
              border: "1px solid var(--ink)",
              borderRadius: "var(--radius-control)",
              background: "var(--surface)",
              padding: "8px 10px",
              fontFamily: "var(--font-mono)",
            }}
          />
          <button className="button button--primary" type="submit" disabled={!answer.trim()}>
            Check answer
          </button>
        </form>
        {checked ? (
          <p aria-live="polite" style={{ color: correct ? "var(--state-success)" : "var(--state-warning)", marginBottom: 0 }}>
            {correct
              ? "Correct. 2⁷ = 128, so at most 7 midpoint decisions are needed."
              : "Not yet. Ask: how many times can 128 be halved until only one candidate remains?"}
          </p>
        ) : null}
      </div>
    </div>
  );
}
