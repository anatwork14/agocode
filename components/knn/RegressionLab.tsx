"use client";

import { useState } from "react";
import { knnRegress, type KnnSample } from "@/lib/algorithms/knn";

const samples: KnnSample[] = [
  { id: "A", features: [4, 1, 1], response: 230 },
  { id: "B", features: [5, 1, 0], response: 210 },
  { id: "C", features: [2, 0, 1], response: 120 },
  { id: "D", features: [4, 0, 1], response: 180 },
  { id: "E", features: [3, 1, 1], response: 205 },
  { id: "F", features: [1, 0, 0], response: 90 },
];

const target = [4.5, 1, 1] as const;

export function RegressionLab() {
  const [k, setK] = useState(3);
  const result = knnRegress(samples, target, k);
  const selected = new Set(result.neighbors.map((neighbor) => neighbor.id));

  return (
    <div className="knn-regression-lab">
      <div className="knn-lab__header">
        <div>
          <div className="eyebrow">Regression</div>
          <h3>Nearest neighbors can predict a number by averaging their known responses.</h3>
        </div>
        <span className="mono">prediction {result.prediction.toFixed(1)}</span>
      </div>

      <div className="knn-regression-target">
        <div><span>weather</span><strong>4.5 / 5</strong></div>
        <div><span>weekend</span><strong>yes</strong></div>
        <div><span>campus event</span><strong>yes</strong></div>
        <div><span>predict</span><strong>pastries sold</strong></div>
      </div>

      <div className="knn-k-switch" role="group" aria-label="Choose k for regression">
        {[2, 3, 4].map((value) => (
          <button className={`button ${k === value ? "button--primary" : ""}`} type="button" onClick={() => setK(value)} key={value}>k = {value}</button>
        ))}
      </div>

      <div className="regression-neighbor-table" role="table" aria-label="Historical days used for regression">
        <div className="regression-neighbor-row regression-neighbor-row--head" role="row">
          <span>day</span><span>features</span><span>distance</span><span>sold</span>
        </div>
        {samples.map((sample) => {
          const neighbor = result.neighbors.find((item) => item.id === sample.id);
          return (
            <div className={`regression-neighbor-row ${selected.has(sample.id) ? "regression-neighbor-row--selected" : ""}`} role="row" key={sample.id}>
              <strong>{sample.id}</strong>
              <span className="mono">[{sample.features.join(", ")}]</span>
              <span className="mono">{neighbor ? neighbor.distance.toFixed(2) : "farther"}</span>
              <span className="mono">{sample.response}</span>
            </div>
          );
        })}
      </div>

      <div className="regression-average" aria-live="polite">
        <span className="eyebrow">Average the {k} nearest responses</span>
        <strong className="mono">
          ({result.neighbors.map((neighbor) => neighbor.response).join(" + ")}) / {k} = {result.prediction.toFixed(1)}
        </strong>
        <p>Classification asks neighbors to vote for a category. Regression keeps the same neighbor-search step but combines numeric responses instead.</p>
      </div>
    </div>
  );
}
