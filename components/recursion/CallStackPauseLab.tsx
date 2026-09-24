"use client";

import { useState } from "react";

const steps = [
  {
    label: "Call welcome('Ada')",
    stack: [{ name: "welcome", local: "name = 'Ada'", state: "active" }],
    note: "A new call frame stores the local value for welcome.",
  },
  {
    label: "welcome calls emphasize(name)",
    stack: [
      { name: "welcome", local: "name = 'Ada'", state: "paused" },
      { name: "emphasize", local: "name = 'Ada'", state: "active" },
    ],
    note: "The caller is not finished. Its frame stays in memory while the child function runs.",
  },
  {
    label: "emphasize returns",
    stack: [{ name: "welcome", local: "name = 'Ada'", state: "active" }],
    note: "The top frame is popped. welcome resumes exactly after the function call that paused it.",
  },
  {
    label: "welcome returns",
    stack: [],
    note: "When the outer function finishes, its frame is popped too. The call stack is empty again.",
  },
] as const;

export function CallStackPauseLab() {
  const [index, setIndex] = useState(0);
  const step = steps[index];

  return (
    <div className="call-stack-lab">
      <div className="call-stack-lab__header">
        <div>
          <div className="eyebrow">The call stack</div>
          <h3>A caller pauses; its local state does not disappear.</h3>
        </div>
        <span className="mono">{index + 1}/{steps.length}</span>
      </div>

      <div className="call-stack-lab__grid">
        <section>
          <pre className="recursion-code"><code>{`def emphasize(name):\n    return name.upper()\n\ndef welcome(name):\n    loud = emphasize(name)\n    return "HELLO " + loud`}</code></pre>
        </section>
        <section>
          <div className="eyebrow">Stack · top first</div>
          <div className="factorial-stack">
            {step.stack.length ? [...step.stack].reverse().map((frame) => (
              <div className={`factorial-frame factorial-frame--${frame.state}`} key={frame.name}>
                <div><span className="mono">{frame.name}()</span><strong>{frame.state}</strong></div>
                <span className="factorial-frame__local">{frame.local}</span>
              </div>
            )) : <div className="selection-empty">stack empty</div>}
          </div>
        </section>
      </div>

      <div className="trace-note" aria-live="polite"><strong>{step.label}.</strong> {step.note}</div>

      <div className="lab-toolbar">
        <button className="button" type="button" onClick={() => setIndex((value) => Math.max(0, value - 1))} disabled={index === 0}>← Back</button>
        <button className="button button--primary" type="button" onClick={() => setIndex((value) => Math.min(steps.length - 1, value + 1))} disabled={index === steps.length - 1}>Step →</button>
        <button className="button button--quiet" type="button" onClick={() => setIndex(0)}>Reset</button>
      </div>
    </div>
  );
}
