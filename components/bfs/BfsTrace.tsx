"use client";

import { useMemo, useReducer, useState } from "react";
import { GraphRenderer, type GraphRendererEdge, type GraphRendererNode } from "@/components/visualization/GraphRenderer";
import { QueueRenderer } from "@/components/visualization/QueueRenderer";
import { buildBfsTrace, type Graph } from "@/lib/algorithms/bfs";
import { recordPredictionAttempt } from "@/lib/learning/evidence";
import { initialTimelineState, timelineReducer } from "@/lib/visualization/timeline";

const graph: Graph = {
  You: ["Mira", "Bao", "Chloe"],
  Mira: ["Niko", "Lina"],
  Bao: ["Lina", "Omar"],
  Chloe: ["Tess"],
  Niko: [],
  Lina: ["Iris"],
  Omar: [],
  Tess: ["Iris"],
  Iris: [],
};

const nodes: GraphRendererNode[] = [
  { id: "You", label: "You", x: 70, y: 180 },
  { id: "Mira", label: "Mira", x: 220, y: 70 },
  { id: "Bao", label: "Bao", x: 220, y: 180 },
  { id: "Chloe", label: "Chloe", x: 220, y: 290 },
  { id: "Niko", label: "Niko", x: 390, y: 45 },
  { id: "Lina", label: "Lina", x: 390, y: 125 },
  { id: "Omar", label: "Omar", x: 390, y: 205 },
  { id: "Tess", label: "Tess", x: 390, y: 295 },
  { id: "Iris", label: "Iris", x: 555, y: 155 },
];

const edges: GraphRendererEdge[] = Object.entries(graph).flatMap(([from, neighbors]) =>
  neighbors.map((to) => ({ from, to, directed: true })),
);

const targets = ["Iris", "Omar", "Niko", "Tess"] as const;
const predictionStorageKey = "agocode.progress.bfs.prediction";

type PredictionAnswer = { selected: string; correct: boolean; firstTryCorrect: boolean };

function eventLabel(type: string) {
  if (type === "INIT") return "initialize";
  if (type === "DEQUEUE") return "dequeue";
  if (type === "VISIT") return "visit";
  if (type === "ENQUEUE") return "enqueue neighbors";
  if (type === "FOUND") return "found shortest path";
  if (type === "COMPLETE") return "complete";
  return "skip";
}

export function BfsTrace() {
  const [target, setTarget] = useState<(typeof targets)[number]>("Iris");
  const [timeline, dispatchTimeline] = useReducer(timelineReducer, initialTimelineState);
  const [answers, setAnswers] = useState<Record<number, PredictionAnswer>>({});
  const [predictionSessionId] = useState(
    () => `bfs-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );
  const frames = useMemo(() => buildBfsTrace(graph, "You", target), [target]);
  const frame = frames[timeline.index];

  if (!frame) return null;

  function resetTrace() {
    dispatchTimeline({ type: "reset" });
    setAnswers({});
  }

  function chooseTarget(next: (typeof targets)[number]) {
    setTarget(next);
    resetTrace();
  }

  const nextFrame = frames[timeline.index + 1];
  const nextNode = nextFrame?.event.type === "DEQUEUE" ? nextFrame.event.node : null;
  const predictionChoices = nextNode && frame.queue.length >= 2 ? frame.queue.map((item) => item.node) : [];
  const answer = answers[timeline.index];
  const predictionLocked = Boolean(nextNode && predictionChoices.length && !answer?.correct);

  function answerPrediction(node: string) {
    if (!nextNode || answer?.correct) return;

    const correct = node === nextNode;
    const firstAttempt = answer === undefined;

    if (firstAttempt) {
      recordPredictionAttempt(localStorage, predictionStorageKey, {
        exerciseId: "bfs-fifo-prediction",
        sessionId: predictionSessionId,
        correct,
        completeAfterQuestions: 3,
      });
    }

    setAnswers((current) => ({
      ...current,
      [timeline.index]: {
        selected: node,
        correct,
        firstTryCorrect: current[timeline.index]?.firstTryCorrect ?? correct,
      },
    }));
  }

  function advance() {
    if (predictionLocked) return;
    dispatchTimeline({ type: "advance", length: frames.length });
  }

  const queuedIds = frame.queue.map((item) => item.node);
  const queueItems = frame.queue.map((item) => ({
    id: `${item.node}-${item.depth}`,
    label: item.node,
    detail: `degree ${item.depth}`,
    state: "queued" as const,
  }));
  const depth = "depth" in frame.event ? frame.event.depth : null;

  return (
    <div className="bfs-lab">
      <div className="bfs-lab__header">
        <div>
          <div className="eyebrow">Breadth-first execution</div>
          <h3>Search one degree at a time by keeping discovery order in a queue.</h3>
        </div>
        <span className="mono">{eventLabel(frame.event.type)}</span>
      </div>

      <div className="bfs-targets" aria-label="Search target">
        <span>Find shortest path to</span>
        {targets.map((node) => (
          <button
            className={`button ${target === node ? "button--primary" : ""}`}
            type="button"
            onClick={() => chooseTarget(node)}
            key={node}
          >
            {node}
          </button>
        ))}
      </div>

      <div className="bfs-lab__grid">
        <section>
          <div className="eyebrow">Graph</div>
          <GraphRenderer
            nodes={nodes}
            edges={edges}
            ariaLabel={`Directed social graph searching from You to ${target}`}
            currentId={frame.current}
            targetId={target}
            queuedIds={queuedIds}
            visitedIds={frame.visited}
            pathIds={frame.path ?? []}
          />
        </section>

        <section>
          <div className="eyebrow">Search queue</div>
          <QueueRenderer items={queueItems} ariaLabel="Breadth-first search queue" />
          <dl className="lab-status bfs-status">
            <div><dt>visited</dt><dd>{frame.visited.length}</dd></div>
            <div><dt>queue</dt><dd>{frame.queue.length}</dd></div>
            <div><dt>current degree</dt><dd>{depth ?? "—"}</dd></div>
          </dl>
          {frame.path ? <div className="bfs-path mono">{frame.path.join(" → ")}</div> : null}
        </section>
      </div>

      <div className="trace-note" aria-live="polite"><strong>What changed?</strong> {frame.note}</div>

      {nextNode && predictionChoices.length ? (
        <div className="prediction-gate" aria-live="polite">
          <div className="prediction-gate__label">Predict the queue</div>
          <p>Which node must be processed next if this remains a FIFO search?</p>
          <div className="prediction-options">
            {predictionChoices.map((node) => {
              const selected = answer?.selected === node;
              const correct = selected && answer?.correct;
              const wrong = selected && answer && !answer.correct;
              return (
                <button
                  type="button"
                  className={`prediction-option ${correct ? "prediction-option--correct" : ""} ${wrong ? "prediction-option--wrong" : ""}`}
                  onClick={() => answerPrediction(node)}
                  disabled={Boolean(answer?.correct)}
                  key={node}
                >
                  {node}
                </button>
              );
            })}
          </div>
          {answer ? (
            <p className={`prediction-feedback ${answer.correct ? "prediction-feedback--correct" : ""}`}>
              {answer.correct
                ? `${nextNode} is at the front because it was discovered before every node behind it.${answer.firstTryCorrect ? " First-try prediction recorded." : " You recovered after feedback; only the first attempt counts toward prediction evidence."}`
                : "Use queue order, not which node looks visually closer. Breadth-first search removes from the front."}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="trace-timeline" aria-label="Visited BFS trace">
        <input
          type="range"
          min={0}
          max={Math.max(timeline.maxUnlocked, 0)}
          value={timeline.index}
          onChange={(event) => dispatchTimeline({ type: "scrub", index: Number(event.target.value) })}
          disabled={timeline.maxUnlocked === 0}
          aria-label="Scrub through visited breadth-first search steps"
        />
      </div>

      <div className="lab-toolbar">
        <button className="button" type="button" onClick={() => dispatchTimeline({ type: "back" })} disabled={timeline.index === 0}>← Back</button>
        <button className="button button--primary" type="button" onClick={advance} disabled={timeline.index === frames.length - 1 || predictionLocked}>Apply next step →</button>
        <button className="button button--quiet" type="button" onClick={resetTrace}>Reset</button>
      </div>
    </div>
  );
}
