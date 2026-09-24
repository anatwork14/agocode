"use client";

import { FormEvent, useMemo, useReducer, useState } from "react";
import { buildSelectionSortTrace, selectionSortExample } from "@/lib/algorithms/selectionSort";
import { initialTimelineState, timelineReducer } from "@/lib/visualization/timeline";

export function SelectionSortTrace() {
  const [values, setValues] = useState<number[]>(selectionSortExample);
  const [draft, setDraft] = useState(selectionSortExample.join(", "));
  const [error, setError] = useState("");
  const [timeline, dispatchTimeline] = useReducer(timelineReducer, initialTimelineState);
  const [predictions, setPredictions] = useState<Record<number, number>>({});

  const frames = useMemo(() => buildSelectionSortTrace(values), [values]);
  const frame = frames[timeline.index];

  if (!frame) return null;

  const predictionRequired = frame.event.type === "START_PASS" && frame.remaining.length > 1;
  const predictedIndex = predictions[timeline.index];
  const correctSmallestIndex = predictionRequired
    ? frame.remaining.reduce((best, value, index, array) => value < array[best] ? index : best, 0)
    : null;
  const predictionCorrect = predictedIndex !== undefined && predictedIndex === correctSmallestIndex;

  function reset() {
    dispatchTimeline({ type: "reset" });
    setPredictions({});
  }

  function applyScenario(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = draft
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .map(Number);

    if (!parsed.length || parsed.some((value) => !Number.isFinite(value))) {
      setError("Enter at least one number separated by commas.");
      return;
    }
    if (parsed.length > 8) {
      setError("Use at most 8 values so each scan remains easy to follow.");
      return;
    }

    setError("");
    setValues(parsed);
    reset();
  }

  function selectPrediction(index: number) {
    setPredictions((current) => ({ ...current, [timeline.index]: index }));
  }

  const locked = Boolean(predictionRequired && !predictionCorrect);

  return (
    <div className="selection-lab">
      <div className="selection-lab__header">
        <div>
          <div className="eyebrow">Selection Sort lab</div>
          <h3>Find one smallest value, move it, then repeat.</h3>
        </div>
        <span className="mono">step {timeline.index + 1}/{frames.length}</span>
      </div>

      <form className="scenario-builder" onSubmit={applyScenario}>
        <label>
          <span>Values</span>
          <input value={draft} onChange={(event) => setDraft(event.target.value)} />
        </label>
        <button className="button" type="submit">Run scenario</button>
        <p className="scenario-builder__help">Numbers only · max 8 values</p>
        {error ? <p className="scenario-builder__error" role="alert">{error}</p> : null}
      </form>

      <div className="selection-columns">
        <section>
          <div className="eyebrow">Still unsorted</div>
          <div className="selection-values">
            {frame.remaining.length ? frame.remaining.map((value, index) => {
              const smallest = frame.smallestIndex === index;
              const scanning = frame.scanIndex === index;
              const predicted = predictedIndex === index;
              return (
                <button
                  type="button"
                  key={`${value}-${index}`}
                  className={`selection-value ${smallest ? "selection-value--smallest" : ""} ${scanning ? "selection-value--scan" : ""} ${predicted ? "selection-value--predicted" : ""}`}
                  onClick={() => predictionRequired ? selectPrediction(index) : undefined}
                  disabled={!predictionRequired || predictionCorrect}
                  aria-label={`Value ${value} at position ${index}`}
                >
                  <span className="mono">{index}</span>
                  <strong>{value}</strong>
                </button>
              );
            }) : <span className="selection-empty">empty</span>}
          </div>
        </section>

        <section>
          <div className="eyebrow">Sorted output</div>
          <div className="selection-values selection-values--output">
            {frame.sorted.length ? frame.sorted.map((value, index) => (
              <div className="selection-value selection-value--sorted" key={`${value}-${index}`}>
                <span className="mono">{index}</span>
                <strong>{value}</strong>
              </div>
            )) : <span className="selection-empty">nothing selected yet</span>}
          </div>
        </section>
      </div>

      {predictionRequired ? (
        <div className="prediction-gate">
          <div className="prediction-gate__label">Predict the next selected value</div>
          <p>Before scanning is revealed, click the value that should move into the sorted output on this pass.</p>
          {predictedIndex !== undefined ? (
            <p className={`prediction-feedback ${predictionCorrect ? "prediction-feedback--correct" : ""}`}>
              {predictionCorrect
                ? `Correct. ${frame.remaining[correctSmallestIndex ?? 0]} is the smallest remaining value, so this pass can safely place it next.`
                : "Not yet. Selection sort must inspect the whole remaining list before it can prove which value is smallest."}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="trace-note" aria-live="polite">
        <strong>What changed?</strong> {frame.note}
      </div>

      <div className="trace-timeline" aria-label="Visited selection-sort timeline">
        <input
          type="range"
          min={0}
          max={Math.max(timeline.maxUnlocked, 0)}
          value={timeline.index}
          onChange={(event) => dispatchTimeline({ type: "scrub", index: Number(event.target.value) })}
          disabled={timeline.maxUnlocked === 0}
          aria-label="Scrub through visited selection-sort steps"
        />
      </div>

      <div className="lab-toolbar">
        <button className="button" type="button" onClick={() => dispatchTimeline({ type: "back" })} disabled={timeline.index === 0}>
          ← Back
        </button>
        <button
          className="button button--primary"
          type="button"
          onClick={() => dispatchTimeline({ type: "advance", length: frames.length, locked })}
          disabled={timeline.index === frames.length - 1 || locked}
        >
          Step →
        </button>
        <button className="button button--quiet" type="button" onClick={reset}>Reset</button>
      </div>
    </div>
  );
}
