"use client";

import { useMemo, useState } from "react";

type Mode = "linear" | "binary";

type GuessRecord = {
  value: number;
  result: "low" | "high" | "correct";
};

const SECRET = 73;

export function GuessingLab() {
  const [mode, setMode] = useState<Mode>("linear");
  const [low, setLow] = useState(1);
  const [high, setHigh] = useState(100);
  const [guess, setGuess] = useState<number | null>(null);
  const [history, setHistory] = useState<GuessRecord[]>([]);

  const finished = history.at(-1)?.result === "correct";

  const rangeStyle = useMemo(() => {
    const left = ((low - 1) / 99) * 100;
    const width = Math.max(((high - low) / 99) * 100, 0.8);
    return { left: `${left}%`, width: `${width}%` };
  }, [low, high]);

  const guessStyle = useMemo(() => {
    if (guess === null) return undefined;
    return { left: `${((guess - 1) / 99) * 100}%` };
  }, [guess]);

  function reset(nextMode: Mode = mode) {
    setMode(nextMode);
    setLow(1);
    setHigh(100);
    setGuess(null);
    setHistory([]);
  }

  function makeGuess() {
    if (finished || low > high) return;

    const nextGuess = mode === "linear" ? low : Math.floor((low + high) / 2);
    const result: GuessRecord["result"] =
      nextGuess === SECRET ? "correct" : nextGuess < SECRET ? "low" : "high";

    setGuess(nextGuess);
    setHistory((current) => [...current, { value: nextGuess, result }]);

    if (result === "low") setLow(nextGuess + 1);
    if (result === "high") setHigh(nextGuess - 1);
  }

  const latest = history.at(-1);
  const message = !latest
    ? "The hidden number is fixed. Compare how much search space each strategy removes."
    : latest.result === "correct"
      ? `${latest.value} is correct.`
      : `${latest.value} is too ${latest.result}.`;

  return (
    <div className="lab-panel">
      <div className="lab-panel__header">
        <strong>Find the hidden number</strong>
        <span>1–100 · target stays fixed</span>
      </div>
      <div className="lab-panel__body">
        <div className="lab-toolbar" role="group" aria-label="Search strategy">
          <button
            type="button"
            className={`button ${mode === "linear" ? "button--primary" : ""}`}
            aria-pressed={mode === "linear"}
            onClick={() => reset("linear")}
          >
            One-by-one search
          </button>
          <button
            type="button"
            className={`button ${mode === "binary" ? "button--primary" : ""}`}
            aria-pressed={mode === "binary"}
            onClick={() => reset("binary")}
          >
            Midpoint search
          </button>
        </div>

        <div className="number-line" aria-label={`Remaining candidate range is ${low} to ${high}`}>
          <div className="number-line__range" style={rangeStyle} />
          {guessStyle ? <div className="number-line__guess" style={guessStyle} data-label={guess} /> : null}
          <span className="number-line__label number-line__label--left">1</span>
          <span className="number-line__label number-line__label--right">100</span>
        </div>

        <p aria-live="polite" style={{ margin: "8px 0 0", color: "var(--ink-secondary)" }}>
          {message}
        </p>

        <dl className="lab-status">
          <div>
            <dt>Remaining</dt>
            <dd>{Math.max(high - low + 1, 0)}</dd>
          </div>
          <div>
            <dt>Attempts</dt>
            <dd>{history.length}</dd>
          </div>
          <div>
            <dt>Next rule</dt>
            <dd>{mode === "linear" ? "take low" : "take midpoint"}</dd>
          </div>
        </dl>

        <div className="lab-toolbar">
          <button type="button" className="button button--accent" onClick={makeGuess} disabled={finished}>
            {finished ? "Found" : mode === "linear" ? "Try next number" : "Try midpoint"}
          </button>
          <button type="button" className="button button--quiet" onClick={() => reset()}>
            Reset
          </button>
        </div>

        {history.length ? (
          <div className="history-list" aria-label="Guess history">
            {history.map((item, index) => (
              <span className="history-chip" key={`${item.value}-${index}`}>
                {item.value} · {item.result === "correct" ? "yes" : `too ${item.result}`}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
