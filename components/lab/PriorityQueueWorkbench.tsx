"use client";

import { useMemo, useState } from "react";
import {
  defaultPriorityQueueWorkload,
  evaluatePriorityQueues,
  priorityQueueCostLabels,
  priorityQueueOperations,
  type PriorityQueueWorkload,
} from "@/lib/knowledge/priority-queue-workbench";

const sizes = [16, 128, 1_024, 65_536] as const;

export function PriorityQueueWorkbench() {
  const [n, setN] = useState<number>(1_024);
  const [workload, setWorkload] = useState<PriorityQueueWorkload>(defaultPriorityQueueWorkload);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const evaluated = useMemo(() => evaluatePriorityQueues(workload, n), [n, workload]);
  const best = evaluated[0];

  function setWeight(operation: keyof PriorityQueueWorkload, value: number) {
    setWorkload((current) => ({ ...current, [operation]: value }));
    setRevealed(false);
  }

  return (
    <div className="advanced-workbench">
      <section className="advanced-workbench__panel">
        <span className="eyebrow">01 · Keep the ADT fixed</span>
        <h2>One contract: repeatedly expose the highest-priority item.</h2>
        <p>
          The representation is still undecided. Change how often the client inserts, peeks, extracts, and updates priorities before choosing a data structure.
        </p>
        <div className="advanced-workbench__sliders">
          {priorityQueueOperations.map((operation) => (
            <label key={operation.id}>
              <div><strong>{operation.label}</strong><span>{operation.question}</span></div>
              <input
                type="range"
                min="0"
                max="10"
                value={workload[operation.id]}
                onChange={(event) => setWeight(operation.id, Number(event.target.value))}
              />
              <output className="mono">{workload[operation.id]}</output>
            </label>
          ))}
        </div>
        <div className="advanced-workbench__sizes">
          {sizes.map((size) => (
            <button className={n === size ? "button button--selected" : "button"} type="button" key={size} onClick={() => { setN(size); setRevealed(false); }}>
              n = {size.toLocaleString()}
            </button>
          ))}
        </div>
      </section>

      <section className="advanced-workbench__panel">
        <span className="eyebrow">02 · Predict before ranking</span>
        <h2>Which representation should win this workload?</h2>
        <div className="advanced-workbench__prediction">
          {evaluated.map((candidate) => (
            <button
              type="button"
              className={prediction === candidate.id ? "button button--selected" : "button"}
              key={candidate.id}
              onClick={() => setPrediction(candidate.id)}
            >
              {candidate.label}
            </button>
          ))}
          <button className="button button--primary" type="button" disabled={!prediction} onClick={() => setRevealed(true)}>Reveal modeled ranking</button>
        </div>
      </section>

      {revealed ? (
        <section className="advanced-workbench__panel">
          <span className="eyebrow">03 · Inspect the trade-off</span>
          <h2>{prediction === best.id ? "Your prediction matches the modeled workload." : `${best.label} wins the modeled workload.`}</h2>
          <div className="advanced-comparison">
            {evaluated.map((candidate, index) => (
              <article className={index === 0 ? "advanced-comparison__row advanced-comparison__row--best" : "advanced-comparison__row"} key={candidate.id}>
                <div><strong>{candidate.label}</strong><span>{candidate.representation}</span></div>
                <div className="advanced-comparison__costs">
                  {priorityQueueOperations.map((operation) => <span className="mono" key={operation.id}>{operation.label}: {priorityQueueCostLabels[candidate.costs[operation.id]]}</span>)}
                </div>
                <div className="advanced-comparison__bar"><span style={{ width: `${Math.max(4, candidate.normalizedScore * 100)}%` }} /></div>
                <small>{candidate.invariant}</small>
                <p>{candidate.caveat}</p>
              </article>
            ))}
          </div>
          <div className="advanced-workbench__takeaway">
            <strong>Transfer question</strong>
            <p>Why does Dijkstra need a priority queue rather than a fully sorted list? What changes if priority updates are impossible, or if extraction happens only once?</p>
          </div>
        </section>
      ) : null}
    </div>
  );
}
