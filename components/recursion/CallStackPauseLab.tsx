"use client";

import { useState } from "react";
import { StackRenderer } from "@/components/visualization/StackRenderer";

const steps = [
  {
    label: "Call welcome('Ada')",
    stack: [{ id: "welcome", title: "welcome()", detail: "name = 'Ada'", state: "active" as const }],
    note: "A new call frame stores the local value for welcome.",
  },
  {
    label: "welcome calls emphasize(name)",
    stack: [
      { id: "welcome", title: "welcome()", detail: "name = 'Ada'", state: "paused" as const },
      { id: "emphasize", title: "emphasize()", detail: "name = 'Ada'", state: "active" as const },
    ],
    note: "The caller is not finished. Its frame stays in memory while the child function runs.",
  },
  {
    label: "emphasize returns",
    stack: [{ id: "welcome", title: "welcome()", detail: "name = 'Ada'", state: "active" as const }],
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
          <StackRenderer items={step.stack} ariaLabel="Function call stack" />
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
