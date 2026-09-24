"use client";

import { useState } from "react";

const items = [
  { id: "stereo", label: "Stereo", weight: 35, value: 3000 },
  { id: "laptop", label: "Laptop", weight: 20, value: 2000 },
  { id: "guitar", label: "Guitar", weight: 15, value: 1500 },
] as const;

const strategies = {
  greedy: { label: "Greedy by highest value first", chosen: ["stereo"] },
  better: { label: "Compare another feasible combination", chosen: ["laptop", "guitar"] },
} as const;

export function KnapsackGreedyCounterexample() {
  const [strategy, setStrategy] = useState<keyof typeof strategies>("greedy");
  const chosen = new Set(strategies[strategy].chosen);
  const selectedItems = items.filter((item) => chosen.has(item.id));
  const totalWeight = selectedItems.reduce((sum, item) => sum + item.weight, 0);
  const totalValue = selectedItems.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="greedy-knapsack-lab">
      <div className="greedy-lab__header">
        <div>
          <div className="eyebrow">Counterexample</div>
          <h3>A locally attractive choice does not always produce the global optimum.</h3>
        </div>
        <span className="mono">capacity 35 lb</span>
      </div>

      <div className="greedy-knapsack-controls" role="group" aria-label="Knapsack strategy">
        <button className={`button ${strategy === "greedy" ? "button--primary" : ""}`} type="button" onClick={() => setStrategy("greedy")}>Take most valuable item first</button>
        <button className={`button ${strategy === "better" ? "button--primary" : ""}`} type="button" onClick={() => setStrategy("better")}>Try laptop + guitar</button>
      </div>

      <div className="greedy-item-grid">
        {items.map((item) => (
          <article className={`greedy-item ${chosen.has(item.id) ? "greedy-item--chosen" : ""}`} key={item.id}>
            <span>{chosen.has(item.id) ? "selected" : "available"}</span>
            <strong>{item.label}</strong>
            <div className="mono">{item.weight} lb · ${item.value.toLocaleString()}</div>
          </article>
        ))}
      </div>

      <div className="greedy-knapsack-meter" aria-label="Knapsack capacity used">
        <div className="greedy-knapsack-meter__track"><span style={{ width: `${Math.min(100, (totalWeight / 35) * 100)}%` }} /></div>
        <div className="greedy-knapsack-meter__labels"><span>{totalWeight}/35 lb</span><strong>${totalValue.toLocaleString()}</strong></div>
      </div>

      <p className={strategy === "greedy" ? "greedy-warning" : "greedy-success"} aria-live="polite">
        {strategy === "greedy"
          ? "The stereo is the single highest-value item, but choosing it fills the bag and leaves a total of $3,000. This greedy rule is not optimal here."
          : "The laptop and guitar exactly fill the bag and reach $3,500. The example shows why Chapter 9 needs a stronger method for optimal knapsack solutions."}
      </p>
    </div>
  );
}
