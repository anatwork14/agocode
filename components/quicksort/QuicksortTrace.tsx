"use client";

import { FormEvent, useMemo, useReducer, useState } from "react";
import { StackRenderer } from "@/components/visualization/StackRenderer";
import { buildQuicksortTrace, type PivotStrategy } from "@/lib/algorithms/quicksort";
import { initialTimelineState, timelineReducer } from "@/lib/visualization/timeline";

type PredictionAnswer = {
  selected: "left" | "right";
  correct: boolean;
};

export function QuicksortTrace() {
  const [values, setValues] = useState([7, 3, 9, 2, 5, 8]);
  const [draft, setDraft] = useState("7, 3, 9, 2, 5, 8");
  const [strategy, setStrategy] = useState<PivotStrategy>("first");
  const [error, setError] = useState("");
  const [timeline, dispatchTimeline] = useReducer(timelineReducer, initialTimelineState);
  const [answers, setAnswers] = useState<Record<number, PredictionAnswer>>({});

  const frames = useMemo(() => buildQuicksortTrace(values, strategy), [values, strategy]);
  const frame = frames[timeline.index];
  if (!frame) return null;

  function resetTrace() {
    dispatchTimeline({ type: "reset" });
    setAnswers({});
  }

  function apply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = draft
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .map(Number);

    if (parsed.some((value) => !Number.isFinite(value))) {
      setError("Use numbers separated by commas.");
      return;
    }
    if (parsed.length > 10) {
      setError("Use at most 10 values so the recursive state remains readable.");
      return;
    }

    setError("");
    setValues(parsed);
    resetTrace();
  }

  function chooseStrategy(next: PivotStrategy) {
    setStrategy(next);
    resetTrace();
  }

  const partition = frame.event.type === "PARTITION" ? frame.event : null;
  const probe = partition
    ? partition.less.length
      ? { value: partition.less[0], side: "left" as const }
      : { value: partition.greater[0], side: "right" as const }
    : null;
  const answer = answers[timeline.index];
  const predictionLocked = Boolean(partition && probe && !answer?.correct);

  function answerPrediction(side: "left" | "right") {
    if (!probe || answer?.correct) return;
    setAnswers((current) => ({
      ...current,
      [timeline.index]: { selected: side, correct: side === probe.side },
    }));
  }

  function advance() {
    if (predictionLocked) return;
    dispatchTimeline({ type: "advance", length: frames.length });
  }

  const stackItems = frame.stack.map((item) => ({
    id: item.id,
    title: `qsort([${item.values.join(", ")}])`,
    detail: `${item.values.length} item${item.values.length === 1 ? "" : "s"}`,
    state: item.state,
  }));

  const eventLabel = frame.event.type === "ENTER"
    ? "enter call"
    : frame.event.type === "BASE"
      ? "base case"
      : frame.event.type === "PARTITION"
        ? `pivot ${frame.event.pivot}`
        : frame.event.type === "COMBINE"
          ? "combine"
          : "complete";

  return (
    <div className="quicksort-lab">
      <div className="quicksort-lab__header">
        <div>
          <div className="eyebrow">Quicksort execution</div>
          <h3>Partition, recurse on smaller arrays, then combine.</h3>
        </div>
        <span className="mono">{eventLabel}</span>
      </div>

      <form className="scenario-builder" onSubmit={apply}>
        <label>
          <span>Values</span>
          <input value={draft} onChange={(event) => setDraft(event.target.value)} />
        </label>
        <button className="button" type="submit">Trace input</button>
        <p className="scenario-builder__help">comma-separated numbers · max 10</p>
        {error ? <p className="scenario-builder__error" role="alert">{error}</p> : null}
      </form>

      <div className="pivot-strategy" aria-label="Pivot strategy">
        <span>Pivot strategy</span>
        <button type="button" className={`button ${strategy === "first" ? "button--primary" : ""}`} onClick={() => chooseStrategy("first")}>first item</button>
        <button type="button" className={`button ${strategy === "middle" ? "button--primary" : ""}`} onClick={() => chooseStrategy("middle")}>middle item</button>
      </div>

      <div className="quicksort-lab__grid">
        <section>
          <div className="eyebrow">Current recursive stack · top first</div>
          <StackRenderer items={stackItems} ariaLabel="Quicksort recursive call stack" />
        </section>

        <section>
          <div className="eyebrow">Current state</div>
          <div className="quicksort-current-array mono">[{frame.activeArray.join(", ")}]</div>
          {partition ? (
            <div className="partition-board" aria-label="Current partition">
              <div className="partition-group">
                <span>≤ pivot</span>
                <strong className="mono">[{partition.less.join(", ")}]</strong>
              </div>
              <div className="partition-group partition-group--pivot">
                <span>pivot</span>
                <strong className="mono">{partition.pivot}</strong>
              </div>
              <div className="partition-group">
                <span>&gt; pivot</span>
                <strong className="mono">[{partition.greater.join(", ")}]</strong>
              </div>
            </div>
          ) : frame.result ? (
            <div className="partition-result">
              <span>known result</span>
              <strong className="mono">[{frame.result.join(", ")}]</strong>
            </div>
          ) : null}
          <div className="trace-note"><strong>What changed?</strong> {frame.note}</div>
        </section>
      </div>

      {partition && probe ? (
        <div className="prediction-gate" aria-live="polite">
          <div className="prediction-gate__label">Predict the partition</div>
          <p>For pivot <span className="mono">{partition.pivot}</span>, where must <span className="mono">{probe.value}</span> go?</p>
          <div className="prediction-options">
            {[
              ["left", "Left: value ≤ pivot"],
              ["right", "Right: value > pivot"],
            ].map(([id, label]) => {
              const side = id as "left" | "right";
              const selected = answer?.selected === side;
              const correct = selected && answer?.correct;
              const wrong = selected && answer && !answer.correct;
              return (
                <button
                  type="button"
                  className={`prediction-option ${correct ? "prediction-option--correct" : ""} ${wrong ? "prediction-option--wrong" : ""}`}
                  key={id}
                  onClick={() => answerPrediction(side)}
                  disabled={Boolean(answer?.correct)}
                >
                  {label}
                </button>
              );
            })}
          </div>
          {answer ? (
            <p className={`prediction-feedback ${answer.correct ? "prediction-feedback--correct" : ""}`}>
              {answer.correct
                ? "Correct. The pivot comparison decides which smaller sorting subproblem receives this value."
                : "Compare the value directly with the pivot; this partition uses ≤ on the left and > on the right."}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="trace-timeline" aria-label="Visited Quicksort trace">
        <input
          type="range"
          min={0}
          max={Math.max(timeline.maxUnlocked, 0)}
          value={timeline.index}
          onChange={(event) => dispatchTimeline({ type: "scrub", index: Number(event.target.value) })}
          disabled={timeline.maxUnlocked === 0}
          aria-label="Scrub through visited Quicksort steps"
        />
      </div>

      <div className="lab-toolbar">
        <button className="button" type="button" onClick={() => dispatchTimeline({ type: "back" })} disabled={timeline.index === 0}>← Back</button>
        <button className="button button--primary" type="button" onClick={advance} disabled={timeline.index === frames.length - 1 || predictionLocked}>Apply next step →</button>
        <button className="button button--quiet" type="button" onClick={resetTrace}>Reset</button>
      </div>
    </div>
  );
}
