"use client";

import { useState } from "react";
import { knnClassify, type KnnSample } from "@/lib/algorithms/knn";

type CitrusLabel = "orange" | "grapefruit";

const samples: KnnSample<CitrusLabel>[] = [
  { id: "a", features: [3.1, 3.2], label: "orange" },
  { id: "b", features: [3.8, 4.0], label: "orange" },
  { id: "c", features: [4.5, 3.5], label: "orange" },
  { id: "d", features: [5.0, 4.7], label: "orange" },
  { id: "e", features: [6.0, 6.6], label: "grapefruit" },
  { id: "f", features: [6.7, 7.1], label: "grapefruit" },
  { id: "g", features: [7.4, 6.4], label: "grapefruit" },
  { id: "h", features: [8.0, 8.0], label: "grapefruit" },
];

const target = [5.4, 5.1] as const;
const storageKey = "agocode.progress.knn.classification";

function x(value: number) {
  return 56 + ((value - 2) / 7) * 520;
}

function y(value: number) {
  return 310 - ((value - 2) / 7) * 260;
}

function markExplored() {
  try {
    if (localStorage.getItem(storageKey)) return;
    localStorage.setItem(storageKey, JSON.stringify({ completedAt: new Date().toISOString(), exerciseId: "knn-classification" }));
  } catch {
    // The learning interaction remains usable if browser storage is unavailable.
  }
}

export function CitrusClassificationLab() {
  const [k, setK] = useState(3);
  const [guess, setGuess] = useState<CitrusLabel | null>(null);
  const [revealed, setRevealed] = useState(false);
  const result = knnClassify(samples, target, k);
  const neighborIds = new Set(result.neighbors.map((neighbor) => neighbor.id));

  function changeK(nextK: number) {
    setK(nextK);
    setGuess(null);
    setRevealed(false);
  }

  function reveal() {
    setRevealed(true);
    markExplored();
  }

  return (
    <div className="knn-classification-lab">
      <div className="knn-lab__header">
        <div>
          <div className="eyebrow">Classification</div>
          <h3>Classify the unknown point by looking at its nearest labeled neighbors.</h3>
        </div>
        <span className="mono">k = {k}</span>
      </div>

      <div className="knn-k-switch" role="group" aria-label="Choose number of neighbors">
        {[1, 3, 5].map((value) => (
          <button className={`button ${k === value ? "button--primary" : ""}`} type="button" onClick={() => changeK(value)} key={value}>k = {value}</button>
        ))}
      </div>

      <div className="knn-scatter-wrap">
        <svg className="knn-scatter" viewBox="0 0 640 360" role="img" aria-label="Two-dimensional citrus feature space">
          <line className="knn-axis" x1="56" y1="310" x2="590" y2="310" />
          <line className="knn-axis" x1="56" y1="310" x2="56" y2="38" />
          <text className="knn-axis-label" x="320" y="342">size →</text>
          <text className="knn-axis-label" x="18" y="180" transform="rotate(-90 18 180)">redness →</text>

          {samples.map((sample) => {
            const nearby = revealed && neighborIds.has(sample.id);
            return (
              <g className={`knn-point knn-point--${sample.label} ${nearby ? "knn-point--neighbor" : ""}`} transform={`translate(${x(sample.features[0])} ${y(sample.features[1])})`} key={sample.id}>
                <circle r={nearby ? 13 : 9} />
                <text y="-16" textAnchor="middle">{sample.id.toUpperCase()}</text>
              </g>
            );
          })}

          {revealed ? result.neighbors.map((neighbor) => (
            <line
              className="knn-neighbor-line"
              x1={x(target[0])}
              y1={y(target[1])}
              x2={x(neighbor.features[0])}
              y2={y(neighbor.features[1])}
              key={`line-${neighbor.id}`}
            />
          )) : null}

          <g className="knn-target" transform={`translate(${x(target[0])} ${y(target[1])})`}>
            <circle r="14" />
            <text y="5" textAnchor="middle">?</text>
          </g>
        </svg>
      </div>

      <div className="knn-legend" aria-label="Classification legend">
        <span><i className="knn-legend__dot knn-legend__dot--orange" />orange</span>
        <span><i className="knn-legend__dot knn-legend__dot--grapefruit" />grapefruit</span>
        <span><i className="knn-legend__target">?</i>unknown</span>
      </div>

      {!revealed ? (
        <div className="prediction-gate">
          <div className="prediction-gate__label">Predict before revealing neighbors</div>
          <p>With k = {k}, which class should the unknown point inherit?</p>
          <div className="prediction-options">
            <button className={`prediction-option ${guess === "orange" ? "prediction-option--selected" : ""}`} type="button" onClick={() => setGuess("orange")}>orange</button>
            <button className={`prediction-option ${guess === "grapefruit" ? "prediction-option--selected" : ""}`} type="button" onClick={() => setGuess("grapefruit")}>grapefruit</button>
          </div>
          <button className="button button--primary" type="button" onClick={reveal} disabled={!guess}>Reveal {k} nearest →</button>
        </div>
      ) : (
        <div className="trace-note" aria-live="polite">
          <strong>{guess === result.label ? "Prediction confirmed:" : "Update your model:"}</strong>{" "}
          The {k} nearest neighbors vote {Object.entries(result.votes).map(([label, votes]) => `${label} ${votes}`).join(" · ")}. The classified label is <strong>{result.label}</strong>.
        </div>
      )}

      {revealed ? (
        <div className="knn-neighbor-list" aria-label="Nearest neighbors">
          {result.neighbors.map((neighbor, index) => (
            <div key={neighbor.id}><span className="mono">#{index + 1}</span><strong>{neighbor.id.toUpperCase()} · {neighbor.label}</strong><span className="mono">d={neighbor.distance.toFixed(2)}</span></div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
