"use client";

import { useState } from "react";
import { GraphRenderer, type GraphRendererEdge, type GraphRendererNode } from "@/components/visualization/GraphRenderer";

const nodes: GraphRendererNode[] = [
  { id: "Start", label: "Start", x: 70, y: 180 },
  { id: "Express", label: "Express", x: 300, y: 85 },
  { id: "Local1", label: "Local 1", x: 235, y: 270 },
  { id: "Local2", label: "Local 2", x: 405, y: 270 },
  { id: "Finish", label: "Finish", x: 570, y: 180 },
];

const edges: GraphRendererEdge[] = [
  { from: "Start", to: "Express", directed: true, label: 5 },
  { from: "Express", to: "Finish", directed: true, label: 4 },
  { from: "Start", to: "Local1", directed: true, label: 2 },
  { from: "Local1", to: "Local2", directed: true, label: 2 },
  { from: "Local2", to: "Finish", directed: true, label: 2 },
];

const routes = {
  edges: { label: "Fewest edges", path: ["Start", "Express", "Finish"], edges: 2, weight: 9 },
  weight: { label: "Lowest total weight", path: ["Start", "Local1", "Local2", "Finish"], edges: 3, weight: 6 },
} as const;

export function WeightedPathComparison() {
  const [goal, setGoal] = useState<keyof typeof routes>("edges");
  const route = routes[goal];

  return (
    <div className="weighted-path-lab">
      <div className="dijkstra-lab__header">
        <div>
          <div className="eyebrow">What does “shortest” mean?</div>
          <h3>Fewest segments and cheapest route can disagree.</h3>
        </div>
        <span className="mono">{route.edges} edges · cost {route.weight}</span>
      </div>

      <div className="weighted-path-lab__controls" role="group" aria-label="Path objective">
        <button className={`button ${goal === "edges" ? "button--primary" : ""}`} type="button" onClick={() => setGoal("edges")}>Minimize edge count</button>
        <button className={`button ${goal === "weight" ? "button--primary" : ""}`} type="button" onClick={() => setGoal("weight")}>Minimize total weight</button>
      </div>

      <GraphRenderer
        nodes={nodes}
        edges={edges}
        ariaLabel="Weighted directed graph with a shorter-edge route and a lower-weight route"
        pathIds={route.path}
        targetId="Finish"
      />

      <div className="weighted-path-lab__summary" aria-live="polite">
        <div><span>Objective</span><strong>{route.label}</strong></div>
        <div><span>Path</span><strong className="mono">{route.path.join(" → ")}</strong></div>
        <div><span>Total</span><strong className="mono">{goal === "edges" ? `${route.edges} edges` : `${route.weight} weight`}</strong></div>
      </div>

      <p className="dijkstra-note">
        BFS optimizes the number of edges in an unweighted graph. Once edges carry different costs, Dijkstra's algorithm targets minimum total non-negative weight instead.
      </p>
    </div>
  );
}
