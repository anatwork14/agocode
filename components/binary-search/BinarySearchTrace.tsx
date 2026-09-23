"use client";

import { useMemo, useState } from "react";
import { binarySearchExample, buildBinarySearchTrace } from "@/lib/algorithms/binarySearch";

const code = [
  "def binary_search(nums, target):",
  "    low = 0",
  "    high = len(nums) - 1",
  "    while low <= high:",
  "        mid = (low + high) // 2",
  "        guess = nums[mid]",
  "        if guess == target:",
  "            return mid",
  "        if guess > target:",
  "            high = mid - 1",
  "        else:",
  "            low = mid + 1",
  "    return None",
];

export function BinarySearchTrace() {
  const { values, target } = binarySearchExample;
  const steps = useMemo(() => buildBinarySearchTrace(values, target), [values, target]);
  const [index, setIndex] = useState(0);
  const step = steps[index];

  if (!step) return null;

  return (
    <div className="lab-panel">
      <div className="lab-panel__header">
        <strong>Deterministic execution trace</strong>
        <span>
          step {index + 1} / {steps.length}
        </span>
      </div>

      <div className="algorithm-grid">
        <section aria-label="Binary search visualization">
          <div className="eyebrow">Target {target}</div>
          <div className="array-visual">
            {values.map((value, cellIndex) => {
              const discarded = cellIndex < step.low || cellIndex > step.high;
              const isMid = step.mid === cellIndex;
              const isFound = Boolean(step.found && isMid);
              const classes = [
                "array-cell",
                discarded ? "array-cell--discarded" : "array-cell--candidate",
                isMid ? "array-cell--mid" : "",
                isFound ? "array-cell--found" : "",
              ]
                .filter(Boolean)
                .join(" ");

              const pointers = [
                cellIndex === step.low ? "low" : "",
                cellIndex === step.mid ? "mid" : "",
                cellIndex === step.high ? "high" : "",
              ]
                .filter(Boolean)
                .join(" · ");

              return (
                <div className={classes} key={value} aria-label={`Index ${cellIndex}, value ${value}${discarded ? ", discarded" : ""}`}>
                  {pointers ? <span className="array-cell__pointer">{pointers} ↓</span> : null}
                  {value}
                  <span className="array-cell__index">{cellIndex}</span>
                </div>
              );
            })}
          </div>

          <dl className="lab-status">
            <div>
              <dt>low</dt>
              <dd>{step.low}</dd>
            </div>
            <div>
              <dt>mid</dt>
              <dd>{step.mid ?? "—"}</dd>
            </div>
            <div>
              <dt>high</dt>
              <dd>{step.high}</dd>
            </div>
          </dl>

          <div className="trace-note" aria-live="polite">
            {step.comparison ? (
              <p className="mono" style={{ color: "var(--accent)", margin: "0 0 8px" }}>
                {step.comparison}
              </p>
            ) : null}
            <strong>What changed?</strong> {step.note}
          </div>

          <div className="lab-toolbar">
            <button type="button" className="button" onClick={() => setIndex((value) => Math.max(0, value - 1))} disabled={index === 0}>
              ← Back
            </button>
            <button
              type="button"
              className="button button--primary"
              onClick={() => setIndex((value) => Math.min(steps.length - 1, value + 1))}
              disabled={index === steps.length - 1}
            >
              Step →
            </button>
            <button type="button" className="button button--quiet" onClick={() => setIndex(0)}>
              Reset
            </button>
          </div>
        </section>

        <section aria-label="Synchronized Python code">
          <div className="eyebrow">Python 3</div>
          <ol className="code-listing" style={{ marginTop: 18 }}>
            {code.map((line, lineIndex) => {
              const number = lineIndex + 1;
              return (
                <li className={`code-line ${step.activeLine === number ? "code-line--active" : ""}`} key={`${number}-${line}`}>
                  <span className="code-line__number">{String(number).padStart(2, "0")}</span>
                  <code>{line}</code>
                </li>
              );
            })}
          </ol>
        </section>
      </div>
    </div>
  );
}
