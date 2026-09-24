"use client";

import { useState } from "react";
import { GraphRenderer, type GraphRendererEdge, type GraphRendererNode } from "@/components/visualization/GraphRenderer";

const nodes: GraphRendererNode[] = [
  { id: "Start", label: "Start", x: 70, y: 180 },
  { id: "Poster", label: "Poster", x: 300, y: 90 },
  { id: "LP", label: "LP", x: 300, y: 280 },
  { id: "Drums", label: "Drums", x: 560, y: 180 },
];

const positiveEdges: GraphRendererEdge[] = [
  { from: "Start", to: "Poster", directed: true, label: 0 },
  { from: "Start", to: "LP", directed: true, label: 5 },
  { from: "Poster", to: "Drums", directed: true, label: 35 },
  { from: "LP", to: "Drums", directed: true, label: 30 },
];

const negativeEdges: GraphRendererEdge[] = [
  ...positiveEdges,
  { from: "LP", to: "Poster", directed: true, label: -7 },
];

export function NegativeWeightLab() {
  const [negative, setNegative] = useState(false);
  const directPosterCost = 0;
  const laterPosterCost = negative ? 5 - 7 : Number.POSITIVE_INFINITY;
  const finalizedTooEarly = negative && laterPosterCost < directPosterCost;

  return (
    <div className="negative-weight-lab">
      <div className="dijkstra-lab__header">
        <div>
          <div className="eyebrow">Algorithm boundary</div>
          <h3>Processed means “this cost cannot improve later.”</h3>
        </div>
        <span className="mono">weights {negative ? "include -7" : "non-negative"}</span>
      </div>

      <div className="negative-weight-lab__controls">
        <button className={`button ${!negative ? "button--primary" : ""}`} type="button" onClick={() => setNegative(false)}>All non-negative</button>
        <button className={`button ${negative ? "button--primary" : ""}`} type="button" onClick={() => setNegative(true)}>Add LP → Poster = -7</button>
      </div>

      <GraphRenderer
        nodes={nodes}
        edges={negative ? negativeEdges : positiveEdges}
        ariaLabel="Weighted trade-like graph demonstrating Dijkstra's negative-edge limitation"
        currentId={negative ? "LP" : "Poster"}
        visitedIds={["Start", "Poster"]}
        activeEdgeKeys={negative ? ["LP->Poster"] : []}
      />

      <div className="negative-weight-proof">
        <div><span>Poster when processed</span><strong className="mono">0</strong></div>
        <div><span>Later route via LP</span><strong className="mono">{negative ? "5 + (-7) = -2" : "no cheaper route"}</strong></div>
      </div>

      <p className={finalizedTooEarly ? "negative-weight-warning" : "negative-weight-safe"} aria-live="polite">
        {finalizedTooEarly
          ? "Contradiction: Poster was already finalized at 0, but a later negative edge discovers cost -2. Dijkstra's greedy finalization rule is no longer safe."
          : "With non-negative edges, reaching another unprocessed node already costs at least as much as the cheapest node, so a later route cannot come back and make that processed cost smaller."}
      </p>
    </div>
  );
}
