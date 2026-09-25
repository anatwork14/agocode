"use client";

import { useMemo, useState } from "react";
import {
  adtScenarios,
  complexityLabels,
  defaultWorkload,
  evaluateImplementations,
  type WorkloadWeights,
} from "@/lib/knowledge/adt-workbench";

const sizes = [10, 100, 1_000, 100_000] as const;

export function AdtWorkbench() {
  const [scenarioId, setScenarioId] = useState(adtScenarios[0].id);
  const [n, setN] = useState<number>(1_000);
  const scenario = adtScenarios.find((item) => item.id === scenarioId) ?? adtScenarios[0];
  const [workloads, setWorkloads] = useState<Record<string, WorkloadWeights>>(() =>
    Object.fromEntries(adtScenarios.map((item) => [item.id, defaultWorkload(item)])),
  );
  const weights = workloads[scenario.id] ?? defaultWorkload(scenario);

  const evaluated = useMemo(() => evaluateImplementations(scenario, weights, n), [n, scenario, weights]);
  const best = evaluated[0];
  const totalWeight = scenario.operations.reduce((sum, operation) => sum + (weights[operation.id] ?? 0), 0);

  const setWeight = (operationId: string, value: number) => {
    setWorkloads((current) => ({
      ...current,
      [scenario.id]: {
        ...(current[scenario.id] ?? defaultWorkload(scenario)),
        [operationId]: value,
      },
    }));
  };

  const resetScenario = () => {
    setWorkloads((current) => ({ ...current, [scenario.id]: defaultWorkload(scenario) }));
  };

  return (
    <div className="adt-workbench">
      <section className="adt-workbench__chooser" aria-label="Choose abstract data type">
        <div>
          <span className="eyebrow">01 · Choose the contract</span>
          <h2>Start with what the client needs, not a favorite structure.</h2>
          <p>{scenario.contract}</p>
        </div>
        <div className="adt-workbench__tabs" role="tablist" aria-label="Abstract data types">
          {adtScenarios.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={item.id === scenario.id}
              className={item.id === scenario.id ? "adt-tab adt-tab--active" : "adt-tab"}
              onClick={() => setScenarioId(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      <section className="adt-workbench__workload">
        <div className="adt-workbench__section-head">
          <div>
            <span className="eyebrow">02 · Describe the workload</span>
            <h2>{scenario.designQuestion}</h2>
            <p>Move the sliders by relative frequency. The values are workload weights, not measured milliseconds.</p>
          </div>
          <button className="button button--quiet" type="button" onClick={resetScenario}>Equalize workload</button>
        </div>

        <div className="adt-workload-grid">
          {scenario.operations.map((operation) => {
            const weight = weights[operation.id] ?? 0;
            return (
              <label className="adt-workload-row" key={operation.id}>
                <div>
                  <strong>{operation.label}</strong>
                  <span>{operation.question}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={weight}
                  onChange={(event) => setWeight(operation.id, Number(event.target.value))}
                  aria-label={`${operation.label} workload weight`}
                />
                <output className="mono">{weight}</output>
              </label>
            );
          })}
        </div>

        <div className="adt-size-picker">
          <span className="eyebrow">Representative collection size</span>
          <div>
            {sizes.map((size) => (
              <button
                className={n === size ? "button button--selected" : "button"}
                type="button"
                onClick={() => setN(size)}
                key={size}
              >
                n = {size.toLocaleString()}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="adt-workbench__comparison">
        <div className="adt-workbench__section-head">
          <div>
            <span className="eyebrow">03 · Compare representations</span>
            <h2>{totalWeight ? `${best.label} has the lowest modeled weighted cost.` : "Add workload weight to compare candidates."}</h2>
            <p>
              This is a teaching model: O(1), O(log n), and O(n) are converted into coarse relative costs at the selected n.
              Constants, cache locality, language/runtime behavior, and implementation details can change real performance.
            </p>
          </div>
        </div>

        <div className="adt-comparison-table" role="table" aria-label={`${scenario.label} implementation comparison`}>
          <div className="adt-comparison-table__row adt-comparison-table__row--head" role="row">
            <span role="columnheader">Representation</span>
            {scenario.operations.map((operation) => <span role="columnheader" key={operation.id}>{operation.label}</span>)}
            <span role="columnheader">Modeled load</span>
          </div>
          {evaluated.map((implementation, index) => (
            <div className={index === 0 && totalWeight ? "adt-comparison-table__row adt-comparison-table__row--best" : "adt-comparison-table__row"} role="row" key={implementation.id}>
              <div role="cell">
                <strong>{implementation.label}</strong>
                <small>{implementation.representation}</small>
              </div>
              {scenario.operations.map((operation) => (
                <span className="mono" role="cell" key={operation.id}>
                  {complexityLabels[implementation.costs[operation.id]]}
                </span>
              ))}
              <div className="adt-load" role="cell">
                <div className="adt-load__bar"><span style={{ width: `${Math.max(4, implementation.normalizedScore * 100)}%` }} /></div>
                <span className="mono">{implementation.score.toFixed(1)}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="adt-workbench__reasoning">
        <span className="eyebrow">04 · Defend the choice</span>
        <div className="adt-reasoning-grid">
          {evaluated.map((implementation, index) => (
            <article key={implementation.id}>
              <div className="adt-reasoning-card__head">
                <span className="mono">{String(index + 1).padStart(2, "0")}</span>
                <h3>{implementation.label}</h3>
              </div>
              <p>{implementation.notes}</p>
              {implementation.caveat ? <small>{implementation.caveat}</small> : null}
            </article>
          ))}
        </div>
        <div className="adt-workbench__takeaway">
          <strong>Transfer question</strong>
          <p>
            If the workload changed tomorrow, which operation would have to become dominant before your preferred representation changed?
            The ADT contract stays stable; the representation decision can change with the workload.
          </p>
        </div>
      </section>
    </div>
  );
}
