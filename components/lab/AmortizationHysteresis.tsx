"use client";

import { useMemo, useState } from "react";
import {
  amortizedExplanationModes,
  compareShrinkPolicies,
  type ShrinkPolicyId,
} from "@/lib/knowledge/amortization-hysteresis";

export function AmortizationHysteresis() {
  const [cycles, setCycles] = useState(6);
  const [policyId, setPolicyId] = useState<ShrinkPolicyId>("shrink-quarter");
  const [explanationId, setExplanationId] = useState<(typeof amortizedExplanationModes)[number]["id"]>("aggregate");
  const simulations = useMemo(() => compareShrinkPolicies(cycles), [cycles]);
  const selected = simulations.find((item) => item.policyId === policyId) ?? simulations[0];
  const explanation = amortizedExplanationModes.find((item) => item.id === explanationId) ?? amortizedExplanationModes[0];

  return (
    <section className="hysteresis-lab">
      <div className="amortization-section-head">
        <div>
          <span className="eyebrow">06 · Grow and shrink without thrashing</span>
          <h2>Resize thresholds need separation, not symmetry.</h2>
          <p>
            Start at size 9 / capacity 16, then alternate pop and push. Shrinking as soon as the table reaches half full causes repeated shrink-grow copying. Waiting until one-quarter full creates hysteresis.
          </p>
        </div>
        <div className="hysteresis-controls">
          {[4, 6, 10, 16].map((value) => (
            <button className={cycles === value ? "button button--selected" : "button"} type="button" onClick={() => setCycles(value)} key={value}>{value} cycles</button>
          ))}
        </div>
      </div>

      <div className="hysteresis-comparison">
        {simulations.map((simulation) => (
          <button
            type="button"
            className={simulation.policyId === policyId ? "hysteresis-card hysteresis-card--active" : "hysteresis-card"}
            onClick={() => setPolicyId(simulation.policyId)}
            key={simulation.policyId}
          >
            <span className="mono">{simulation.label}</span>
            <strong>{simulation.resizeCount} resizes</strong>
            <small>{simulation.totalCopies} copied values · {simulation.totalCost} total work</small>
          </button>
        ))}
      </div>

      <div className="hysteresis-trace" aria-label={`${selected.label} operation trace`}>
        {selected.steps.map((step) => (
          <div className={step.resized ? "hysteresis-step hysteresis-step--resize" : "hysteresis-step"} key={step.index}>
            <span className="mono">{String(step.index).padStart(2, "0")}</span>
            <strong>{step.operation}</strong>
            <small>{step.sizeBefore}/{step.capacityBefore} → {step.sizeAfter}/{step.capacityAfter}</small>
            <span>{step.resized ? `${step.resized} · copy ${step.copies}` : "no resize"}</span>
          </div>
        ))}
      </div>

      <div className="amortization-explanation-modes">
        <div className="amortization-explanation-tabs" role="tablist" aria-label="Amortized analysis explanation mode">
          {amortizedExplanationModes.map((mode) => (
            <button
              type="button"
              role="tab"
              aria-selected={mode.id === explanation.id}
              className={mode.id === explanation.id ? "button button--selected" : "button"}
              onClick={() => setExplanationId(mode.id)}
              key={mode.id}
            >
              {mode.label}
            </button>
          ))}
        </div>
        <div className="amortization-explanation">
          <span className="eyebrow">{explanation.label} view</span>
          <p>{explanation.explanation}</p>
        </div>
      </div>
    </section>
  );
}
