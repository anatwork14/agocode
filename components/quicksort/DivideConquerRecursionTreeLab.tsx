"use client";

import { useMemo, useState } from "react";
import { GraphRenderer } from "@/components/visualization/GraphRenderer";
import { LabHeader, MetricStrip } from "@/components/ui/LabPrimitives";
import { buildBalancedRecursionTree } from "@/lib/algorithms/recursionTree";

const sizes = [4, 8] as const;

export function DivideConquerRecursionTreeLab() {
  const [problemSize, setProblemSize] = useState<(typeof sizes)[number]>(8);
  const [prediction, setPrediction] = useState<"halves" | "same" | "doubles" | null>(null);
  const model = useMemo(() => buildBalancedRecursionTree(problemSize), [problemSize]);
  const correct = prediction === "same";

  return (
    <div className="lab-panel">
      <LabHeader
        eyebrow="Recursion tree"
        title="See branching and level work at the same time."
        meta={<span className="mono">T(n) = 2T(n/2) + n</span>}
      />

      <div className="lab-toolbar" role="group" aria-label="Recursion tree problem size">
        {sizes.map((size) => (
          <button
            className={`button ${problemSize === size ? "button--primary" : ""}`}
            type="button"
            aria-pressed={problemSize === size}
            key={size}
            onClick={() => {
              setProblemSize(size);
              setPrediction(null);
            }}
          >
            n = {size}
          </button>
        ))}
      </div>

      <GraphRenderer
        nodes={model.nodes}
        edges={model.edges}
        ariaLabel={`Balanced divide-and-conquer recursion tree for problem size ${problemSize}`}
      />

      <MetricStrip
        metrics={[
          { label: "tree depth", value: model.depth },
          { label: "levels", value: model.levels.length },
          { label: "work / level", value: problemSize },
          { label: "total modeled work", value: model.totalWork },
        ]}
      />

      <div className="prediction-gate" aria-live="polite">
        <div className="prediction-gate__label">Reason about one level before reading the conclusion</div>
        <p>
          One problem of size <span className="mono">n</span> becomes two problems of size <span className="mono">n/2</span>.
          If each node does work proportional to its subproblem size, what happens to the total work across that next level?
        </p>
        <div className="prediction-options">
          <button
            className={`prediction-option ${prediction === "halves" ? "prediction-option--wrong" : ""}`}
            type="button"
            onClick={() => setPrediction("halves")}
          >
            It halves
          </button>
          <button
            className={`prediction-option ${prediction === "same" ? "prediction-option--correct" : ""}`}
            type="button"
            onClick={() => setPrediction("same")}
          >
            It stays n
          </button>
          <button
            className={`prediction-option ${prediction === "doubles" ? "prediction-option--wrong" : ""}`}
            type="button"
            onClick={() => setPrediction("doubles")}
          >
            It doubles
          </button>
        </div>
        {prediction ? (
          <p className={`prediction-feedback ${correct ? "prediction-feedback--correct" : ""}`}>
            {correct
              ? `Correct. The node count doubles while work per node halves, so each level totals ${problemSize}. With ${model.levels.length} levels, this balanced model accumulates Θ(n log n) work.`
              : "Track both quantities together: twice as many nodes × half as much work per node leaves the level total unchanged."}
          </p>
        ) : null}
      </div>

      <div className="trace-note">
        <strong>Do not overgeneralize the shape.</strong> Merge sort guarantees this balanced split pattern. Quicksort only resembles it when pivots keep partitions reasonably balanced; a consistently extreme pivot can collapse the tree toward a chain and produce quadratic work.
      </div>

      <div className="table-wrap" role="region" aria-label="Recursion tree level accounting" tabIndex={0}>
        <table>
          <thead>
            <tr>
              <th>Level</th>
              <th>Nodes</th>
              <th>Size / node</th>
              <th>Work / node</th>
              <th>Total level work</th>
            </tr>
          </thead>
          <tbody>
            {model.levels.map((level) => (
              <tr key={level.depth}>
                <td>{level.depth}</td>
                <td>{level.nodeCount}</td>
                <td>{level.subproblemSize}</td>
                <td>{level.workPerNode}</td>
                <td>{level.totalWork}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
