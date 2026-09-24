"use client";

import { useState } from "react";
import { buildKnapsackGrid, type KnapsackItem } from "@/lib/algorithms/dynamicProgramming";

const items: KnapsackItem[] = [
  { id: "camera", label: "Camera", weight: 1, value: 1500 },
  { id: "projector", label: "Projector", weight: 4, value: 3000 },
  { id: "laptop", label: "Laptop", weight: 3, value: 2000 },
];

const result = buildKnapsackGrid(items, 4);

function money(value: number) {
  return `$${value.toLocaleString("en-US")}`;
}

export function KnapsackGridLab() {
  const [step, setStep] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const nextFrame = result.frames[step];
  const lastFrame = step > 0 ? result.frames[step - 1] : null;
  const finished = step === result.frames.length;

  function advance() {
    if (!nextFrame) return;
    setFeedback(null);
    setStep((value) => Math.min(result.frames.length, value + 1));
  }

  function predict(decision: "carry" | "take") {
    if (!nextFrame) return;
    if (decision === nextFrame.cell.decision) {
      setFeedback("Correct. That is the better value for this subproblem.");
      setStep((value) => Math.min(result.frames.length, value + 1));
    } else {
      setFeedback(
        nextFrame.cell.withItem === null
          ? "This item does not fit, so the previous best must carry forward."
          : `Compare ${money(nextFrame.cell.withoutItem)} with ${money(nextFrame.cell.withItem)} before choosing.`,
      );
    }
  }

  return (
    <div className="dp-knapsack-lab">
      <div className="dp-lab__header">
        <div>
          <div className="eyebrow">Build the grid</div>
          <h3>Each cell asks one question: keep the old best, or take this item and reuse a smaller solved capacity?</h3>
        </div>
        <span className="mono">{step}/{result.frames.length} cells</span>
      </div>

      <div className="dp-item-strip" aria-label="Available items">
        {items.map((item) => (
          <div className={nextFrame?.item.id === item.id ? "dp-item-card dp-item-card--current" : "dp-item-card"} key={item.id}>
            <span>{item.label}</span>
            <strong>{money(item.value)}</strong>
            <small className="mono">{item.weight} unit{item.weight === 1 ? "" : "s"}</small>
          </div>
        ))}
      </div>

      <div className="dp-grid-wrap">
        <div className="dp-grid" role="table" aria-label="Dynamic programming knapsack grid">
          <div className="dp-grid__corner" />
          {Array.from({ length: result.capacity }, (_, index) => (
            <div className="dp-grid__capacity mono" role="columnheader" key={index + 1}>{index + 1}</div>
          ))}

          {result.grid.map((row, rowIndex) => [
            <div className="dp-grid__row-label" role="rowheader" key={`label-${items[rowIndex].id}`}>
              <strong>{items[rowIndex].label}</strong>
              <span className="mono">w {items[rowIndex].weight}</span>
            </div>,
            ...row.slice(1).map((cell, columnIndex) => {
              const flatIndex = rowIndex * result.capacity + columnIndex;
              const revealed = flatIndex < step;
              const current = flatIndex === step;
              return (
                <div
                  className={`dp-grid__cell ${revealed ? "dp-grid__cell--revealed" : ""} ${current ? "dp-grid__cell--current" : ""}`}
                  role="cell"
                  key={`${rowIndex}-${columnIndex}`}
                >
                  <strong className="mono">{revealed ? money(cell.value) : "?"}</strong>
                  {revealed && cell.itemIds.length ? <small>{cell.itemIds.map((id) => items.find((item) => item.id === id)?.label).join(" + ")}</small> : null}
                </div>
              );
            }),
          ])}
        </div>
      </div>

      <div className="trace-note" aria-live="polite">
        <strong>{finished ? "Grid complete:" : lastFrame ? `Filled capacity ${lastFrame.capacity}:` : "Start small:"}</strong>{" "}
        {finished
          ? `The best value at capacity ${result.capacity} is ${money(result.bestValue)} using ${result.selectedItemIds.map((id) => items.find((item) => item.id === id)?.label).join(" + ")}.`
          : lastFrame?.note ?? "Solve smaller capacities first. Later cells will reuse those answers instead of recomputing them from scratch."}
      </div>

      {!finished && nextFrame ? (
        <div className="dp-prediction" aria-live="polite">
          <div>
            <span className="eyebrow">Next subproblem</span>
            <strong>{nextFrame.item.label} · capacity {nextFrame.capacity}</strong>
          </div>
          {nextFrame.cell.withItem === null ? (
            <button className="button button--primary" type="button" onClick={advance}>It does not fit · carry old best →</button>
          ) : (
            <div className="dp-prediction__choices">
              <button className="button" type="button" onClick={() => predict("carry")}>Keep {money(nextFrame.cell.withoutItem)}</button>
              <button className="button button--primary" type="button" onClick={() => predict("take")}>
                Take item → {money(nextFrame.cell.withItem)}
              </button>
            </div>
          )}
          {feedback ? <p className="prediction-feedback">{feedback}</p> : null}
        </div>
      ) : null}

      <div className="lab-toolbar">
        <button className="button" type="button" onClick={() => { setStep((value) => Math.max(0, value - 1)); setFeedback(null); }} disabled={step === 0}>← Back</button>
        <button className="button button--quiet" type="button" onClick={() => { setStep(0); setFeedback(null); }}>Reset grid</button>
      </div>
    </div>
  );
}
