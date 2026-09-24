"use client";

import { useMemo, useState } from "react";
import { buildQuicksortTrace, type PivotStrategy } from "@/lib/algorithms/quicksort";

function statsFor(values: number[], strategy: PivotStrategy) {
  const frames = buildQuicksortTrace(values, strategy);
  const maxDepth = Math.max(0, ...frames.map((frame) => frame.stack.length));
  const partitions = frames.filter((frame) => frame.event.type === "PARTITION").length;
  return { maxDepth, partitions };
}

export function PivotBalanceLab() {
  const [size, setSize] = useState(8);
  const values = useMemo(() => Array.from({ length: size }, (_, index) => index + 1), [size]);
  const first = useMemo(() => statsFor(values, "first"), [values]);
  const middle = useMemo(() => statsFor(values, "middle"), [values]);
  const maxDepth = Math.max(first.maxDepth, middle.maxDepth, 1);

  return (
    <div className="pivot-balance-lab">
      <div className="pivot-balance-lab__header">
        <div>
          <div className="eyebrow">Average vs. worst-case intuition</div>
          <h3>On sorted input, pivot choice can make the recursion chain tall or balanced.</h3>
        </div>
        <span className="mono">n = {size}</span>
      </div>

      <div className="pivot-size-controls" aria-label="Sorted input size">
        {[8, 16, 32].map((value) => (
          <button className={`button ${size === value ? "button--primary" : ""}`} type="button" onClick={() => setSize(value)} key={value}>n = {value}</button>
        ))}
      </div>

      <div className="pivot-comparison">
        {[
          {
            title: "Always choose the first item",
            detail: "On an already sorted array, one partition is empty and the other is almost the whole array.",
            stats: first,
          },
          {
            title: "Choose the middle item",
            detail: "On this sorted array, the split stays much closer to half-and-half, so the base case arrives sooner.",
            stats: middle,
          },
        ].map((item) => (
          <section className="pivot-case" key={item.title}>
            <div>
              <strong>{item.title}</strong>
              <p>{item.detail}</p>
            </div>
            <div className="pivot-depth-track" aria-label={`Maximum recursive depth ${item.stats.maxDepth}`}>
              <div className="pivot-depth-bar" style={{ width: `${(item.stats.maxDepth / maxDepth) * 100}%` }} />
            </div>
            <dl className="lab-status">
              <div><dt>max stack depth</dt><dd>{item.stats.maxDepth}</dd></div>
              <div><dt>partition calls</dt><dd>{item.stats.partitions}</dd></div>
            </dl>
          </section>
        ))}
      </div>

      <p className="pivot-caveat">
        This comparison uses sorted input to isolate the pivot effect. A middle position is not magically optimal for every input; the larger lesson is that balanced partitions keep recursion shallow, while repeatedly lopsided partitions create the quadratic worst case.
      </p>
    </div>
  );
}
