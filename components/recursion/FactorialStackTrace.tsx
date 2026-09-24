"use client";

import { FormEvent, useMemo, useReducer, useState } from "react";
import { buildFactorialTrace } from "@/lib/algorithms/factorialTrace";
import { initialTimelineState, timelineReducer } from "@/lib/visualization/timeline";

export function FactorialStackTrace() {
  const [n, setN] = useState(4);
  const [draft, setDraft] = useState("4");
  const [error, setError] = useState("");
  const [timeline, dispatchTimeline] = useReducer(timelineReducer, initialTimelineState);

  const frames = useMemo(() => buildFactorialTrace(n), [n]);
  const frame = frames[timeline.index];

  if (!frame) return null;

  function apply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = Number(draft);
    if (!Number.isInteger(next) || next < 1 || next > 7) {
      setError("Use an integer from 1 to 7 so the call stack remains readable.");
      return;
    }
    setError("");
    setN(next);
    dispatchTimeline({ type: "reset" });
  }

  const eventLabel = frame.event.type === "CALL"
    ? `call fact(${frame.event.n - 1})`
    : frame.event.type === "BASE"
      ? "base case"
      : frame.event.type === "RETURN"
        ? `return ${frame.event.result}`
        : `complete = ${frame.event.result}`;

  return (
    <div className="factorial-lab">
      <div className="factorial-lab__header">
        <div>
          <div className="eyebrow">Recursive call stack</div>
          <h3>Watch calls accumulate, then unwind in reverse order.</h3>
        </div>
        <span className="mono">{eventLabel}</span>
      </div>

      <form className="scenario-builder" onSubmit={apply}>
        <label className="scenario-builder__target">
          <span>n</span>
          <input value={draft} onChange={(event) => setDraft(event.target.value)} inputMode="numeric" />
        </label>
        <button className="button" type="submit">Trace factorial</button>
        <p className="scenario-builder__help">1 ≤ n ≤ 7</p>
        {error ? <p className="scenario-builder__error" role="alert">{error}</p> : null}
      </form>

      <div className="factorial-grid">
        <section>
          <div className="eyebrow">Call stack · top first</div>
          <div className="factorial-stack" aria-label="Factorial call stack">
            {frame.stack.length ? [...frame.stack].reverse().map((item, index) => (
              <div className={`factorial-frame factorial-frame--${item.state}`} key={`${item.n}-${index}`}>
                <div>
                  <span className="mono">fact({item.n})</span>
                  <strong>{item.state}</strong>
                </div>
                <span className="factorial-frame__local">local n = {item.n}</span>
              </div>
            )) : <div className="selection-empty">stack empty</div>}
          </div>
        </section>

        <section>
          <div className="eyebrow">State explanation</div>
          <div className="trace-note">
            <strong>What changed?</strong> {frame.note}
          </div>
          <dl className="lab-status">
            <div><dt>stack depth</dt><dd>{frame.stack.length}</dd></div>
            <div><dt>known result</dt><dd>{frame.result ?? "—"}</dd></div>
          </dl>
        </section>
      </div>

      <div className="trace-timeline" aria-label="Visited factorial trace">
        <input
          type="range"
          min={0}
          max={Math.max(timeline.maxUnlocked, 0)}
          value={timeline.index}
          onChange={(event) => dispatchTimeline({ type: "scrub", index: Number(event.target.value) })}
          disabled={timeline.maxUnlocked === 0}
          aria-label="Scrub through visited recursive-call steps"
        />
      </div>

      <div className="lab-toolbar">
        <button className="button" type="button" onClick={() => dispatchTimeline({ type: "back" })} disabled={timeline.index === 0}>← Back</button>
        <button
          className="button button--primary"
          type="button"
          onClick={() => dispatchTimeline({ type: "advance", length: frames.length })}
          disabled={timeline.index === frames.length - 1}
        >
          Step →
        </button>
        <button className="button button--quiet" type="button" onClick={() => dispatchTimeline({ type: "reset" })}>Reset</button>
      </div>
    </div>
  );
}
