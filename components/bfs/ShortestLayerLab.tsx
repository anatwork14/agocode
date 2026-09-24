"use client";

import { useState } from "react";
import { GraphRenderer, type GraphRendererEdge, type GraphRendererNode } from "@/components/visualization/GraphRenderer";

const nodes: GraphRendererNode[] = [
  { id: "Hill", label: "Hill", x: 65, y: 180 },
  { id: "Market", label: "Market", x: 215, y: 70 },
  { id: "Museum", label: "Museum", x: 215, y: 180 },
  { id: "Park", label: "Park", x: 215, y: 290 },
  { id: "Harbor", label: "Harbor", x: 390, y: 65 },
  { id: "Library", label: "Library", x: 390, y: 170 },
  { id: "Stadium", label: "Stadium", x: 390, y: 290 },
  { id: "Bridge", label: "Bridge", x: 560, y: 170 },
];

const edges: GraphRendererEdge[] = [
  ["Hill", "Market"], ["Hill", "Museum"], ["Hill", "Park"],
  ["Market", "Harbor"], ["Museum", "Library"], ["Park", "Stadium"],
  ["Harbor", "Bridge"], ["Library", "Bridge"], ["Stadium", "Bridge"],
].map(([from, to]) => ({ from, to }));

const layers = [
  { degree: 0, ids: ["Hill"], statement: "Begin at the starting point." },
  { degree: 1, ids: ["Market", "Museum", "Park"], statement: "Check every place reachable with one transfer." },
  { degree: 2, ids: ["Harbor", "Library", "Stadium"], statement: "Only after degree 1 is exhausted do we inspect degree 2." },
  { degree: 3, ids: ["Bridge"], statement: "The destination first appears here, so no route with fewer than three edges exists." },
] as const;

export function ShortestLayerLab() {
  const [layerIndex, setLayerIndex] = useState(0);
  const layer = layers[layerIndex];
  const revealed = layers.slice(0, layerIndex + 1).flatMap((item) => [...item.ids]);
  const found = revealed.includes("Bridge");

  return (
    <div className="bfs-layer-lab">
      <div className="bfs-layer-lab__header">
        <div>
          <div className="eyebrow">Fewest-transfer search</div>
          <h3>Ask one-edge, then two-edge, then three-edge questions in order.</h3>
        </div>
        <span className="mono">degree {layer.degree}</span>
      </div>

      <GraphRenderer
        nodes={nodes}
        edges={edges}
        ariaLabel="Transit-like graph explored in breadth-first layers"
        currentId={null}
        targetId="Bridge"
        visitedIds={revealed}
        queuedIds={[...layer.ids]}
        pathIds={found ? ["Hill", "Museum", "Library", "Bridge"] : []}
      />

      <div className="bfs-layer-lab__state" aria-live="polite">
        <div><span>Question</span><strong>Can Bridge be reached in {layer.degree} edge{layer.degree === 1 ? "" : "s"}?</strong></div>
        <div><span>Current frontier</span><strong className="mono">{layer.ids.join(" · ")}</strong></div>
        <p>{layer.statement}</p>
        {found ? <p className="bfs-layer-lab__found">Found at degree 3 → this is a shortest unweighted distance.</p> : null}
      </div>

      <div className="lab-toolbar">
        <button className="button" type="button" onClick={() => setLayerIndex((value) => Math.max(0, value - 1))} disabled={layerIndex === 0}>← Back</button>
        <button className="button button--primary" type="button" onClick={() => setLayerIndex((value) => Math.min(layers.length - 1, value + 1))} disabled={layerIndex === layers.length - 1}>Expand one layer →</button>
        <button className="button button--quiet" type="button" onClick={() => setLayerIndex(0)}>Reset</button>
      </div>
    </div>
  );
}
