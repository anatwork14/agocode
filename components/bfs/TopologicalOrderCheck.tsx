"use client";

import { useMemo, useState } from "react";

const dependencies: [string, string][] = [
  ["Wake", "Brew"],
  ["Wake", "Pack"],
  ["Brew", "Eat"],
  ["Pack", "Leave"],
  ["Eat", "Leave"],
];

const candidateOrders = [
  ["Wake", "Brew", "Pack", "Eat", "Leave"],
  ["Wake", "Pack", "Brew", "Eat", "Leave"],
  ["Wake", "Brew", "Eat", "Leave", "Pack"],
] as const;

function isValidOrder(order: readonly string[]) {
  const position = new Map(order.map((task, index) => [task, index]));
  return dependencies.every(([before, after]) => (position.get(before) ?? Infinity) < (position.get(after) ?? -1));
}

export function TopologicalOrderCheck() {
  const [selected, setSelected] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const order = candidateOrders[selected];
  const valid = useMemo(() => isValidOrder(order), [order]);

  return (
    <div className="topological-check">
      <div className="topological-check__header">
        <div>
          <div className="eyebrow">Dependency ordering</div>
          <h3>A graph can also encode “must happen before” relationships.</h3>
        </div>
      </div>

      <div className="topological-dependencies" aria-label="Task dependencies">
        {dependencies.map(([before, after]) => (
          <span className="mono" key={`${before}-${after}`}>{before} → {after}</span>
        ))}
      </div>

      <div className="topological-candidates" role="radiogroup" aria-label="Candidate task orders">
        {candidateOrders.map((candidate, index) => (
          <label className={`topological-candidate ${selected === index ? "topological-candidate--selected" : ""}`} key={candidate.join("-")}>
            <input
              type="radio"
              name="topological-order"
              checked={selected === index}
              onChange={() => { setSelected(index); setSubmitted(false); }}
            />
            <span className="mono">{candidate.join(" → ")}</span>
          </label>
        ))}
      </div>

      <button className="button button--primary" type="button" onClick={() => setSubmitted(true)}>Check this order</button>

      {submitted ? (
        <p className={valid ? "reasoning-feedback reasoning-feedback--correct" : "reasoning-feedback"} aria-live="polite">
          {valid
            ? "Valid. Every prerequisite appears before the task that depends on it. More than one topological order can be correct."
            : "Invalid. At least one task appears before one of its prerequisites. Read each directed edge as a before/after constraint."}
        </p>
      ) : null}

      <p className="topological-check__note">
        This is a dependency-ordering idea introduced in the chapter, not a claim that ordinary BFS by itself computes every topological order.
      </p>
    </div>
  );
}
