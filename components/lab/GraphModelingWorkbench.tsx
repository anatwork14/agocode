"use client";

import { useMemo, useState } from "react";
import {
  graphModelingScenarios,
  type GraphChoice,
  type GraphModelingScenario,
} from "@/lib/knowledge/graph-modeling-workbench";

type DecisionKey = "vertices" | "edges" | "direction" | "weight" | "algorithm";
type Selections = Record<DecisionKey, string | null>;

const emptySelections: Selections = {
  vertices: null,
  edges: null,
  direction: null,
  weight: null,
  algorithm: null,
};

const decisionOrder: { key: DecisionKey; number: string; label: string }[] = [
  { key: "vertices", number: "01", label: "What are the vertices?" },
  { key: "edges", number: "02", label: "What does an edge mean?" },
  { key: "direction", number: "03", label: "Does direction carry information?" },
  { key: "weight", number: "04", label: "Does an edge need a numeric weight?" },
  { key: "algorithm", number: "05", label: "Only now: which algorithmic question matches?" },
];

function choicesFor(scenario: GraphModelingScenario, key: DecisionKey) {
  if (key === "vertices") return scenario.vertexChoices;
  if (key === "edges") return scenario.edgeChoices;
  if (key === "direction") return scenario.directionChoices;
  if (key === "weight") return scenario.weightChoices;
  return scenario.algorithmChoices;
}

function selectedChoice(choices: GraphChoice[], id: string | null) {
  return choices.find((choice) => choice.id === id) ?? null;
}

function GraphPreview({ scenario }: { scenario: GraphModelingScenario }) {
  const nodeMap = useMemo(
    () => Object.fromEntries(scenario.graph.nodes.map((node) => [node.id, node])),
    [scenario],
  );

  return (
    <svg className="graph-model-preview" viewBox="0 0 410 220" role="img" aria-label={`Original graph model preview for ${scenario.title}`}>
      <defs>
        <marker id="graph-model-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
        </marker>
      </defs>
      {scenario.graph.edges.map((edge, index) => {
        const from = nodeMap[edge.from];
        const to = nodeMap[edge.to];
        if (!from || !to) return null;
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const length = Math.max(1, Math.hypot(dx, dy));
        const ux = dx / length;
        const uy = dy / length;
        const startX = from.x + ux * 24;
        const startY = from.y + uy * 24;
        const endX = to.x - ux * 24;
        const endY = to.y - uy * 24;
        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2;
        return (
          <g className="graph-model-edge" key={`${edge.from}-${edge.to}-${index}`}>
            <line
              x1={startX}
              y1={startY}
              x2={endX}
              y2={endY}
              markerEnd={scenario.graph.directed ? "url(#graph-model-arrow)" : undefined}
            />
            {edge.weight ? (
              <g className="graph-model-weight" transform={`translate(${midX} ${midY})`}>
                <rect x="-12" y="-10" width="24" height="20" rx="3" />
                <text textAnchor="middle" dominantBaseline="middle">{edge.weight}</text>
              </g>
            ) : null}
          </g>
        );
      })}
      {scenario.graph.nodes.map((node) => (
        <g className="graph-model-node" transform={`translate(${node.x} ${node.y})`} key={node.id}>
          <circle r="23" />
          <text textAnchor="middle" dominantBaseline="middle">{node.label}</text>
        </g>
      ))}
    </svg>
  );
}

export function GraphModelingWorkbench() {
  const [scenarioId, setScenarioId] = useState(graphModelingScenarios[0].id);
  const [selections, setSelections] = useState<Selections>(emptySelections);
  const scenario = graphModelingScenarios.find((item) => item.id === scenarioId) ?? graphModelingScenarios[0];

  const correctness = useMemo(() => {
    return Object.fromEntries(
      decisionOrder.map(({ key }) => {
        const choice = selectedChoice(choicesFor(scenario, key), selections[key]);
        return [key, Boolean(choice?.correct)];
      }),
    ) as Record<DecisionKey, boolean>;
  }, [scenario, selections]);

  const modelReady = correctness.vertices && correctness.edges && correctness.direction && correctness.weight;
  const complete = modelReady && correctness.algorithm;
  const correctCount = decisionOrder.filter(({ key }) => correctness[key]).length;

  const chooseScenario = (id: string) => {
    setScenarioId(id);
    setSelections(emptySelections);
  };

  const choose = (key: DecisionKey, id: string) => {
    setSelections((current) => ({ ...current, [key]: id }));
  };

  return (
    <div className="graph-model-workbench">
      <section className="graph-model-scenario-picker">
        <div>
          <span className="eyebrow">01 · Change the application story</span>
          <h2>Do not start by naming BFS, Dijkstra, or MST.</h2>
          <p>
            First decide what the vertices and edges mean, whether relationships have direction, whether cost belongs on edges,
            and what quantity the application actually asks you to compute.
          </p>
        </div>
        <div className="graph-model-tabs" role="tablist" aria-label="Graph modeling scenarios">
          {graphModelingScenarios.map((item) => (
            <button
              type="button"
              role="tab"
              aria-selected={item.id === scenario.id}
              className={item.id === scenario.id ? "graph-model-tab graph-model-tab--active" : "graph-model-tab"}
              onClick={() => chooseScenario(item.id)}
              key={item.id}
            >
              <span>{item.title}</span>
              <small>{item.eyebrow}</small>
            </button>
          ))}
        </div>
      </section>

      <section className="graph-model-story">
        <div className="graph-model-story__copy">
          <span className="eyebrow">02 · Model the story</span>
          <h2>{scenario.title}</h2>
          <p className="graph-model-story__prompt">{scenario.story}</p>
          <p>{scenario.modelingQuestion}</p>
        </div>
        <div className="graph-model-progress" aria-label={`${correctCount} of ${decisionOrder.length} modeling decisions correct`}>
          <span className="mono">MODEL PROGRESS</span>
          <strong>{correctCount}/{decisionOrder.length}</strong>
          <div><span style={{ width: `${(correctCount / decisionOrder.length) * 100}%` }} /></div>
        </div>
      </section>

      <section className="graph-model-decisions">
        {decisionOrder.map((decision) => {
          const choices = choicesFor(scenario, decision.key);
          const selected = selectedChoice(choices, selections[decision.key]);
          const algorithmLocked = decision.key === "algorithm" && !modelReady;
          return (
            <article className={algorithmLocked ? "graph-model-decision graph-model-decision--locked" : "graph-model-decision"} key={decision.key}>
              <div className="graph-model-decision__head">
                <span className="mono">{decision.number}</span>
                <div>
                  <h3>{decision.label}</h3>
                  {algorithmLocked ? <p>Finish the graph model before selecting an algorithm.</p> : null}
                </div>
              </div>
              <div className="graph-model-options" role="radiogroup" aria-label={decision.label}>
                {choices.map((choice) => (
                  <button
                    type="button"
                    role="radio"
                    aria-checked={selections[decision.key] === choice.id}
                    disabled={algorithmLocked}
                    className={selections[decision.key] === choice.id ? "graph-model-option graph-model-option--selected" : "graph-model-option"}
                    onClick={() => choose(decision.key, choice.id)}
                    key={choice.id}
                  >
                    {choice.label}
                  </button>
                ))}
              </div>
              {selected ? (
                <div className={selected.correct ? "graph-model-feedback graph-model-feedback--correct" : "graph-model-feedback graph-model-feedback--wrong"}>
                  <strong>{selected.correct ? "Fits the model." : "Try a different abstraction."}</strong>
                  <p>{selected.feedback}</p>
                </div>
              ) : null}
            </article>
          );
        })}
      </section>

      <section className={modelReady ? "graph-model-reveal graph-model-reveal--ready" : "graph-model-reveal"}>
        <div className="graph-model-reveal__head">
          <div>
            <span className="eyebrow">03 · Inspect the graph you just defined</span>
            <h2>{modelReady ? "The application has become a graph problem." : "The graph stays hidden until the model is coherent."}</h2>
          </div>
          <span className="mono">{modelReady ? scenario.modelSummary.graphType : "model first"}</span>
        </div>

        {modelReady ? (
          <div className="graph-model-reveal__grid">
            <div className="graph-model-canvas">
              <GraphPreview scenario={scenario} />
              <p>Diagram is an original teaching instance; it visualizes the model, not the source-book example.</p>
            </div>
            <dl className="graph-model-summary">
              <div><dt>Vertices</dt><dd>{scenario.modelSummary.vertices}</dd></div>
              <div><dt>Edges</dt><dd>{scenario.modelSummary.edges}</dd></div>
              <div><dt>Graph</dt><dd>{scenario.modelSummary.graphType}</dd></div>
              <div><dt>Objective</dt><dd>{scenario.modelSummary.objective}</dd></div>
            </dl>
          </div>
        ) : (
          <p className="graph-model-reveal__locked-copy">Correct the first four modeling decisions. Choosing an algorithm before the representation is clear is exactly the habit this lab is designed to prevent.</p>
        )}
      </section>

      <section className={complete ? "graph-model-conclusion graph-model-conclusion--complete" : "graph-model-conclusion"}>
        <span className="eyebrow">04 · Algorithm follows the model</span>
        {complete ? (
          <>
            <h2>{scenario.modelSummary.algorithm}</h2>
            <p>{scenario.modelSummary.reason}</p>
            <div className="graph-model-transfer">
              <span className="mono">TRANSFER</span>
              <strong>{scenario.transferQuestion}</strong>
            </div>
          </>
        ) : (
          <>
            <h2>Finish the model and algorithm choice.</h2>
            <p>The completion state should feel earned: the algorithm name is a consequence of what the vertices, edges, and objective mean.</p>
          </>
        )}
      </section>
    </div>
  );
}
