"use client";

import { useState } from "react";
import { traceBstSearch, type BstNode } from "@/lib/algorithms/nextTopics";

const tree: BstNode = {
  value: "Mina",
  left: {
    value: "Iris",
    left: { value: "Dara" },
    right: { value: "Lina" },
  },
  right: {
    value: "Ravi",
    left: { value: "Omar" },
    right: { value: "Tess" },
  },
};

const positions: Record<string, [number, number]> = {
  Mina: [320, 55],
  Iris: [175, 145],
  Ravi: [465, 145],
  Dara: [100, 245],
  Lina: [245, 245],
  Omar: [395, 245],
  Tess: [540, 245],
};

const edges = [
  ["Mina", "Iris"], ["Mina", "Ravi"],
  ["Iris", "Dara"], ["Iris", "Lina"],
  ["Ravi", "Omar"], ["Ravi", "Tess"],
] as const;

export function BstSearchLab() {
  const [target, setTarget] = useState("Lina");
  const [step, setStep] = useState(0);
  const trace = traceBstSearch(tree, target);
  const visited = new Set(trace.slice(0, step).map((item) => item.value));
  const current = trace[step];
  const finished = step === trace.length;

  function changeTarget(next: string) {
    setTarget(next);
    setStep(0);
  }

  return (
    <div className="next-bst-lab">
      <div className="next-lab__header">
        <div>
          <div className="eyebrow">Binary search tree</div>
          <h3>Use ordering at each node to choose one branch and ignore the other.</h3>
        </div>
        <span className="mono">target: {target}</span>
      </div>

      <div className="next-topic-switch" role="group" aria-label="Choose a name to search">
        {["Dara", "Lina", "Omar", "Tess"].map((name) => (
          <button className={`button ${target === name ? "button--primary" : ""}`} type="button" onClick={() => changeTarget(name)} key={name}>{name}</button>
        ))}
      </div>

      <svg className="bst-tree" viewBox="0 0 640 310" role="img" aria-label={`Binary search tree search for ${target}`}>
        {edges.map(([from, to]) => {
          const [x1, y1] = positions[from];
          const [x2, y2] = positions[to];
          const active = visited.has(from) && (visited.has(to) || current?.value === to);
          return <line className={active ? "bst-edge bst-edge--active" : "bst-edge"} x1={x1} y1={y1} x2={x2} y2={y2} key={`${from}-${to}`} />;
        })}
        {Object.entries(positions).map(([name, [nodeX, nodeY]]) => {
          const isCurrent = current?.value === name;
          const isVisited = visited.has(name);
          const isTarget = name === target;
          return (
            <g className={`bst-node ${isVisited ? "bst-node--visited" : ""} ${isCurrent ? "bst-node--current" : ""} ${finished && isTarget ? "bst-node--found" : ""}`} transform={`translate(${nodeX} ${nodeY})`} key={name}>
              <circle r="28" />
              <text textAnchor="middle" dominantBaseline="central">{name}</text>
            </g>
          );
        })}
      </svg>

      <div className="trace-note" aria-live="polite">
        <strong>{finished ? "Found:" : current ? `At ${current.value}:` : "Start at the root:"}</strong>{" "}
        {finished
          ? `${target} was reached after ${trace.length} node${trace.length === 1 ? "" : "s"}.`
          : current?.comparison === "left"
            ? `${target} comes before ${current.value}, so the entire right subtree can be ignored.`
            : current?.comparison === "right"
              ? `${target} comes after ${current.value}, so the entire left subtree can be ignored.`
              : current?.comparison === "found"
                ? `The current node matches ${target}. One more step completes the trace.`
                : "Compare the target with the root value."}
      </div>

      <div className="lab-toolbar">
        <button className="button" type="button" onClick={() => setStep((value) => Math.max(0, value - 1))} disabled={step === 0}>← Back</button>
        <button className="button button--primary" type="button" onClick={() => setStep((value) => Math.min(trace.length, value + 1))} disabled={finished}>{finished ? "Search complete" : "Follow comparison →"}</button>
        <button className="button button--quiet" type="button" onClick={() => setStep(0)}>Reset</button>
      </div>
    </div>
  );
}
