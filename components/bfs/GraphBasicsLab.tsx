"use client";

import { useState } from "react";
import { GraphRenderer, type GraphRendererEdge, type GraphRendererNode } from "@/components/visualization/GraphRenderer";

const nodes: GraphRendererNode[] = [
  { id: "A", label: "A", x: 120, y: 180 },
  { id: "B", label: "B", x: 320, y: 90 },
  { id: "C", label: "C", x: 320, y: 270 },
  { id: "D", label: "D", x: 520, y: 180 },
];

const directed: GraphRendererEdge[] = [
  { from: "A", to: "B", directed: true },
  { from: "A", to: "C", directed: true },
  { from: "B", to: "D", directed: true },
  { from: "C", to: "D", directed: true },
];

const undirected: GraphRendererEdge[] = [
  { from: "A", to: "B" },
  { from: "A", to: "C" },
  { from: "B", to: "D" },
  { from: "C", to: "D" },
];

export function GraphBasicsLab() {
  const [mode, setMode] = useState<"directed" | "undirected">("directed");

  return (
    <div className="graph-basics-lab">
      <div className="graph-basics-lab__header">
        <div>
          <div className="eyebrow">Graph model</div>
          <h3>Nodes represent things; edges represent relationships between them.</h3>
        </div>
        <span className="mono">{mode}</span>
      </div>

      <div className="graph-mode-controls" aria-label="Graph relationship type">
        <button className={`button ${mode === "directed" ? "button--primary" : ""}`} type="button" onClick={() => setMode("directed")}>Directed relation</button>
        <button className={`button ${mode === "undirected" ? "button--primary" : ""}`} type="button" onClick={() => setMode("undirected")}>Undirected relation</button>
      </div>

      <GraphRenderer
        nodes={nodes}
        edges={mode === "directed" ? directed : undirected}
        ariaLabel={mode === "directed" ? "Directed graph with one-way relationships" : "Undirected graph with two-way relationships"}
      />

      <div className="trace-note">
        {mode === "directed" ? (
          <p><strong>Direction matters.</strong> An arrow from A to B says A has a relation to B; it does not automatically say B has the same relation back to A.</p>
        ) : (
          <p><strong>The relation goes both ways.</strong> If A is connected to B, each node can treat the other as a neighbor.</p>
        )}
      </div>
    </div>
  );
}
