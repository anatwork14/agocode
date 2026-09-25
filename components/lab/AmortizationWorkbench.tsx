"use client";

import { useMemo, useState } from "react";
import {
  compareGrowthPolicies,
  growthPolicies,
  simulateAppends,
  type GrowthPolicyId,
} from "@/lib/knowledge/amortization-workbench";

const appendCounts = [16, 32, 64, 128] as const;

function formatCost(value: number) {
  return value >= 100 ? value.toFixed(0) : value.toFixed(2).replace(/\.00$/, "");
}

export function AmortizationWorkbench() {
  const [policyId, setPolicyId] = useState<GrowthPolicyId>("double");
  const [appendCount, setAppendCount] = useState<number>(32);
  const [stepNumber, setStepNumber] = useState(8);

  const simulation = useMemo(() => simulateAppends(appendCount, policyId), [appendCount, policyId]);
  const comparison = useMemo(() => compareGrowthPolicies(appendCount), [appendCount]);
  const stepIndex = Math.min(Math.max(0, stepNumber - 1), Math.max(0, simulation.steps.length - 1));
  const step = simulation.steps[stepIndex];
  const maxCost = Math.max(1, simulation.maxSingleCost);

  const chooseCount = (count: number) => {
    setAppendCount(count);
    setStepNumber((current) => Math.min(current, count));
  };

  const choosePolicy = (id: GrowthPolicyId) => {
    setPolicyId(id);
    setStepNumber((current) => Math.min(current, appendCount));
  };

  return (
    <div className="amortization-workbench">
      <section className="amortization-chooser">
        <div>
          <span className="eyebrow">01 · Choose a growth rule</span>
          <h2>One append can be expensive. The sequence can still be cheap.</h2>
          <p>
            Model one primitive unit for writing the new element, plus one unit for every existing element copied during a resize.
            This deliberately ignores machine constants so the growth pattern stays visible.
          </p>
        </div>
        <div className="amortization-policy-tabs" role="tablist" aria-label="Capacity growth policy">
          {growthPolicies.map((policy) => (
            <button
              type="button"
              role="tab"
              aria-selected={policy.id === policyId}
              className={policy.id === policyId ? "amortization-policy amortization-policy--active" : "amortization-policy"}
              onClick={() => choosePolicy(policy.id)}
              key={policy.id}
            >
              <span className="mono">{policy.shortLabel}</span>
              <strong>{policy.label}</strong>
              <small>{policy.family}</small>
            </button>
          ))}
        </div>
      </section>

      <section className="amortization-sequence">
        <div className="amortization-section-head">
          <div>
            <span className="eyebrow">02 · Run a sequence</span>
            <h2>{simulation.policy.label}</h2>
            <p>{simulation.policy.description}</p>
          </div>
          <div className="amortization-counts" aria-label="Number of append operations">
            {appendCounts.map((count) => (
              <button
                type="button"
                className={appendCount === count ? "button button--selected" : "button"}
                onClick={() => chooseCount(count)}
                key={count}
              >
                {count} appends
              </button>
            ))}
          </div>
        </div>

        <div className="amortization-metrics">
          <div><span>Total modeled work</span><strong>{simulation.totalCost}</strong><small>write + copy units</small></div>
          <div><span>Average / append</span><strong>{formatCost(simulation.averageCost)}</strong><small>cumulative amortized view</small></div>
          <div><span>Resize events</span><strong>{simulation.resizeCount}</strong><small>expensive individual appends</small></div>
          <div><span>Final capacity</span><strong>{simulation.finalCapacity}</strong><small>{simulation.spareCapacity} unused cells</small></div>
        </div>

        <div className="amortization-spike-panel">
          <div className="amortization-spike-panel__head">
            <div>
              <span className="eyebrow">Actual cost per append</span>
              <strong>Resize spikes are visible; most appends stay cheap.</strong>
            </div>
            <span className="mono">max single cost = {simulation.maxSingleCost}</span>
          </div>
          <div className="amortization-spikes" aria-label={`Actual modeled append costs for ${simulation.policy.label}`}>
            {simulation.steps.map((item) => (
              <button
                type="button"
                title={`append ${item.appendNumber}: cost ${item.cost}${item.resized ? `, copied ${item.copies}` : ""}`}
                aria-label={`Append ${item.appendNumber}, cost ${item.cost}${item.resized ? `, resized and copied ${item.copies} elements` : ""}`}
                aria-current={item.appendNumber === stepNumber ? "step" : undefined}
                onClick={() => setStepNumber(item.appendNumber)}
                key={item.appendNumber}
              >
                <span
                  className={item.resized ? "amortization-spike amortization-spike--resize" : "amortization-spike"}
                  style={{ height: `${Math.max(5, (item.cost / maxCost) * 100)}%` }}
                />
              </button>
            ))}
          </div>
          <div className="amortization-axis">
            <span>append 1</span>
            <span>append {appendCount}</span>
          </div>
        </div>
      </section>

      {step ? (
        <section className="amortization-inspector">
          <div className="amortization-section-head">
            <div>
              <span className="eyebrow">03 · Inspect one append</span>
              <h2>Append {step.appendNumber}: {step.resized ? "resize, copy, then write" : "write into reserved capacity"}</h2>
              <p>
                Move across the sequence and watch expensive operations become separated by stretches of cheap appends under geometric growth.
              </p>
            </div>
            <span className="mono">cost = {step.cost}</span>
          </div>

          <input
            className="amortization-step-slider"
            type="range"
            min="1"
            max={appendCount}
            step="1"
            value={step.appendNumber}
            onChange={(event) => setStepNumber(Number(event.target.value))}
            aria-label="Append step"
          />

          <div className="amortization-inspector__grid">
            <article>
              <span className="eyebrow">Before</span>
              <h3>{step.sizeBefore} values / capacity {step.capacityBefore}</h3>
              <div className="capacity-track" aria-label={`${step.sizeBefore} of ${step.capacityBefore} cells occupied before append`}>
                <span style={{ width: `${step.capacityBefore ? (step.sizeBefore / step.capacityBefore) * 100 : 0}%` }} />
              </div>
              <p>{step.resized ? "No free cell remains, so the backing array cannot accept the new value directly." : "At least one reserved cell is available; no copying is required."}</p>
            </article>

            <article className={step.resized ? "amortization-resize-event amortization-resize-event--active" : "amortization-resize-event"}>
              <span className="eyebrow">Resize work</span>
              <h3>{step.resized ? `${step.copies} existing values copied` : "No resize"}</h3>
              <p>
                {step.resized
                  ? `Capacity changes from ${step.capacityBefore} to ${step.capacityAfter}; copying dominates this individual append.`
                  : "This append pays only the modeled unit cost for writing the new value."}
              </p>
            </article>

            <article>
              <span className="eyebrow">After</span>
              <h3>{step.sizeAfter} values / capacity {step.capacityAfter}</h3>
              <div className="capacity-track" aria-label={`${step.sizeAfter} of ${step.capacityAfter} cells occupied after append`}>
                <span style={{ width: `${(step.sizeAfter / step.capacityAfter) * 100}%` }} />
              </div>
              <p>Cumulative cost: {step.cumulativeCost}. Average so far: {formatCost(step.averageCost)} work units per append.</p>
            </article>
          </div>
        </section>
      ) : null}

      <section className="amortization-comparison">
        <div className="amortization-section-head">
          <div>
            <span className="eyebrow">04 · Compare policies</span>
            <h2>The growth rule changes both copying frequency and spare memory.</h2>
            <p>Compare all three policies on the same number of append operations. These are model counts, not runtime benchmarks.</p>
          </div>
        </div>

        <div className="amortization-table" role="table" aria-label={`Growth policy comparison after ${appendCount} appends`}>
          <div className="amortization-table__row amortization-table__row--head" role="row">
            <span role="columnheader">Policy</span>
            <span role="columnheader">Resizes</span>
            <span role="columnheader">Total work</span>
            <span role="columnheader">Avg.</span>
            <span role="columnheader">Spare cells</span>
          </div>
          {comparison.map((item) => (
            <div className={item.policy.id === policyId ? "amortization-table__row amortization-table__row--active" : "amortization-table__row"} role="row" key={item.policy.id}>
              <div role="cell"><strong>{item.policy.label}</strong><small>{item.policy.family}</small></div>
              <span className="mono" role="cell">{item.resizeCount}</span>
              <span className="mono" role="cell">{item.totalCost}</span>
              <span className="mono" role="cell">{formatCost(item.averageCost)}</span>
              <span className="mono" role="cell">{item.spareCapacity}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="amortization-takeaway">
        <span className="eyebrow">05 · Read the sequence, not the worst spike</span>
        <h2>{simulation.policy.sourceClaim}</h2>
        <p>
          Worst-case cost and amortized cost answer different questions. A resize can make one append expensive; amortized analysis asks how that cost spreads across a long valid sequence of operations.
        </p>
      </section>
    </div>
  );
}
