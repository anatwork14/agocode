"use client";

import { FormEvent, useMemo, useReducer, useState } from "react";
import { StackRenderer } from "@/components/visualization/StackRenderer";
import { buildRecursiveSumTrace } from "@/lib/algorithms/recursiveSumTrace";
import { initialTimelineState, timelineReducer } from "@/lib/visualization/timeline";

export function RecursiveSumTrace() {
  const [values, setValues] = useState([2, 4, 6, 8]);
  const [draft, setDraft] = useState("2, 4, 6, 8");
  const [error, setError] = useState("");
  const [timeline, dispatchTimeline] = useReducer(timelineReducer, initialTimelineState);

  const frames = useMemo(() => buildRecursiveSumTrace(values), [values]);
  const frame = frames[timeline.index];
  if (!frame) return null;

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
    if (parsed.length > 8) {
      setError("Use at most 8 values so the recursive stack remains readable.");
      return;
    }

    setError("");
    setValues(parsed);
    dispatchTimeline({ type: "reset" });
  }

  const stackItems = frame.stack.map((item, index) => ({
    id: `sum-${item.values.length}-${index}`,
    title: `sum([${item.values.join(", ")}])`,
    detail: item.values.length ? `head = ${item.values[0]}` : "empty list",
    state: item.state,
  }));

  const eventLabel = frame.event.type === "CALL"
    ? "smaller subproblem"
    : frame.event.type === "BASE"
      ? "base case"
      : frame.event.type === "RETURN"
        ? `return ${frame.event.result}`
        : `complete = ${frame.event.result}`;

  return (
    <div className="recursive-sum-lab">
      <div className="recursive-sum-lab__header">
        <div>
          <div className="eyebrow">D&C on an array</div>
          <h3>Turn one list into the same problem on a shorter list.</h3>
        </div>
        <span className="mono">{eventLabel}</span>
      </div>

      <form className="scenario-builder" onSubmit={apply}>
        <label>
          <span>Values</span>
          <input value={draft} onChange={(event) => setDraft(event.target.value)} />
        </label>
        <button className="button" type="submit">Trace sum</button>
        <p className="scenario-builder__help">comma-separated numbers · max 8</p>
        {error ? <p className="scenario-builder__error" role="alert">{error}</p> : null}
      </form>

      <div className="recursive-sum-lab__grid">
        <section>
          <div className="eyebrow">Call stack · top first</div>
          <StackRenderer items={stackItems} ariaLabel="Recursive sum call stack" />
        </section>
        <section>
          <div className="eyebrow">State explanation</div>
          <div className="trace-note"><strong>What changed?</strong> {frame.note}</div>
          <dl className="lab-status">
            <div><dt>stack depth</dt><dd>{frame.stack.length}</dd></div>
            <div><dt>known result</dt><dd>{frame.result ?? "—"}</dd></div>
          </dl>
        </section>
      </div>

      <div className="trace-timeline" aria-label="Visited recursive sum trace">
        <input
          type="range"
          min={0}
          max={Math.max(timeline.maxUnlocked, 0)}
          value={timeline.index}
          onChange={(event) => dispatchTimeline({ type: "scrub", index: Number(event.target.value) })}
          disabled={timeline.maxUnlocked === 0}
          aria-label="Scrub through visited recursive sum steps"
        />
      </div>

      <div className="lab-toolbar">
        <button className="button" type="button" onClick={() => dispatchTimeline({ type: "back" })} disabled={timeline.index === 0}>← Back</button>
        <button className="button button--primary" type="button" onClick={() => dispatchTimeline({ type: "advance", length: frames.length })} disabled={timeline.index === frames.length - 1}>Step →</button>
        <button className="button button--quiet" type="button" onClick={() => dispatchTimeline({ type: "reset" })}>Reset</button>
      </div>
    </div>
  );
}
