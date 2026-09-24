"use client";

import { useMemo, useReducer, useState } from "react";
import { GraphRenderer, type GraphRendererEdge, type GraphRendererNode } from "@/components/visualization/GraphRenderer";
import { buildDijkstraTrace, type WeightedGraph } from "@/lib/algorithms/dijkstra";
import { initialTimelineState, timelineReducer } from "@/lib/visualization/timeline";

const graph: WeightedGraph = {
  Start: { A: 6, B: 2 },
  A: { Finish: 1 },
  B: { A: 3, Finish: 5 },
  Finish: {},
};

const nodes: GraphRendererNode[] = [
  { id: "Start", label: "Start", x: 75, y: 180 },
  { id: "A", label: "A", x: 300, y: 80 },
  { id: "B", label: "B", x: 300, y: 280 },
  { id: "Finish", label: "Finish", x: 565, y: 180 },
];

const edges: GraphRendererEdge[] = Object.entries(graph).flatMap(([from, neighbors]) =>
  Object.entries(neighbors).map(([to, weight]) => ({ from, to, directed: true, label: weight })),
);

function formatCost(value: number) {
  return Number.isFinite(value) ? String(value) : "∞";
}

type Prediction = { selected: string; correct: boolean };

function labelForEvent(type: string) {
  if (type === "INIT") return "initialize";
  if (type === "SELECT") return "choose cheapest";
  if (type === "RELAX") return "test neighbor";
  if (type === "UPDATE") return "update cost + parent";
  if (type === "KEEP") return "keep current cost";
  if (type === "PROCESS") return "mark processed";
  return "reconstruct path";
}

export function DijkstraTrace() {
  const result = useMemo(() => buildDijkstraTrace(graph, "Start", "Finish"), []);
  const frames = result.frames;
  const [timeline, dispatch] = useReducer(timelineReducer, initialTimelineState);
  const [answers, setAnswers] = useState<Record<number, Prediction>>({});
  const frame = frames[timeline.index];
  const nextFrame = frames[timeline.index + 1];

  if (!frame) return null;

  const nextSelected = nextFrame?.event.type === "SELECT" ? nextFrame.event.node : null;
  const candidates = nextSelected
    ? Object.entries(frame.costs)
        .filter(([node, cost]) => !frame.processed.includes(node) && Number.isFinite(cost))
        .map(([node]) => node)
    : [];
  const answer = answers[timeline.index];
  const predictionLocked = Boolean(nextSelected && candidates.length > 1 && !answer?.correct);
  const activeEdgeKeys = frame.event.type === "RELAX" ? [`${frame.event.from}->${frame.event.to}`] : [];

  function chooseCandidate(node: string) {
    if (!nextSelected || answer?.correct) return;
    setAnswers((current) => ({
      ...current,
      [timeline.index]: { selected: node, correct: node === nextSelected },
    }));
  }

  function advance() {
    if (predictionLocked) return;
    dispatch({ type: "advance", length: frames.length });
  }

  function reset() {
    dispatch({ type: "reset" });
    setAnswers({});
  }

  const rows = Object.keys(frame.costs);

  return (
    <div className="dijkstra-trace-lab">
      <div className="dijkstra-lab__header">
        <div>
          <div className="eyebrow">Dijkstra execution trace</div>
          <h3>Choose the cheapest unfinished node, then relax its outgoing edges.</h3>
        </div>
        <span className="mono">{labelForEvent(frame.event.type)} · {timeline.index + 1}/{frames.length}</span>
      </div>

      <div className="dijkstra-trace-grid">
        <section>
          <div className="eyebrow">Weighted graph</div>
          <GraphRenderer
            nodes={nodes}
            edges={edges}
            ariaLabel="Weighted directed graph for Dijkstra's algorithm"
            currentId={frame.current}
            targetId="Finish"
            visitedIds={frame.processed}
            pathIds={frame.path ?? []}
            activeEdgeKeys={activeEdgeKeys}
          />
        </section>

        <section>
          <div className="eyebrow">Cost + parent table</div>
          <div className="dijkstra-table" role="table" aria-label="Dijkstra costs and parents">
            <div className="dijkstra-table__row dijkstra-table__row--head" role="row">
              <span>node</span><span>cost</span><span>parent</span><span>state</span>
            </div>
            {rows.map((node) => (
              <div className={`dijkstra-table__row ${node === frame.current ? "dijkstra-table__row--current" : ""}`} role="row" key={node}>
                <strong>{node}</strong>
                <span className="mono">{formatCost(frame.costs[node])}</span>
                <span className="mono">{frame.parents[node] ?? "—"}</span>
                <span>{frame.processed.includes(node) ? "processed" : "open"}</span>
              </div>
            ))}
          </div>
          {frame.path ? <div className="dijkstra-final-path mono">{frame.path.join(" → ")} · total {formatCost(frame.costs.Finish)}</div> : null}
        </section>
      </div>

      <div className="trace-note" aria-live="polite"><strong>What changed?</strong> {frame.note}</div>

      {nextSelected && candidates.length > 1 ? (
        <div className="prediction-gate" aria-live="polite">
          <div className="prediction-gate__label">Choose before the algorithm does</div>
          <p>Which unprocessed node has the smallest currently known cost?</p>
          <div className="prediction-options">
            {candidates.map((node) => {
              const selected = answer?.selected === node;
              const correct = selected && answer?.correct;
              const wrong = selected && answer && !answer.correct;
              return (
                <button
                  className={`prediction-option ${correct ? "prediction-option--correct" : ""} ${wrong ? "prediction-option--wrong" : ""}`}
                  type="button"
                  onClick={() => chooseCandidate(node)}
                  disabled={Boolean(answer?.correct)}
                  key={node}
                >
                  {node} · {formatCost(frame.costs[node])}
                </button>
              );
            })}
          </div>
          {answer ? (
            <p className={`prediction-feedback ${answer.correct ? "prediction-feedback--correct" : ""}`}>
              {answer.correct
                ? `${nextSelected} is the cheapest unprocessed node, so its cost is the next one Dijkstra can finalize.`
                : "Compare the current cost estimates, not the raw edge labels. Choose the smallest finite cost among unprocessed nodes."}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="trace-timeline" aria-label="Visited Dijkstra trace">
        <input
          type="range"
          min={0}
          max={Math.max(timeline.maxUnlocked, 0)}
          value={timeline.index}
          onChange={(event) => dispatch({ type: "scrub", index: Number(event.target.value) })}
          disabled={timeline.maxUnlocked === 0}
          aria-label="Scrub through visited Dijkstra steps"
        />
      </div>

      <div className="lab-toolbar">
        <button className="button" type="button" onClick={() => dispatch({ type: "back" })} disabled={timeline.index === 0}>← Back</button>
        <button className="button button--primary" type="button" onClick={advance} disabled={timeline.index === frames.length - 1 || predictionLocked}>Apply next step →</button>
        <button className="button button--quiet" type="button" onClick={reset}>Reset</button>
      </div>
    </div>
  );
}
