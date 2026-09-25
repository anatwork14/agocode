"use client";

import { useMemo, useState } from "react";
import {
  optimizationScenarios,
  strategyFits,
  type OptimizationRequirement,
  type OptimizationScale,
  type StrategyClass,
} from "@/lib/knowledge/optimization-strategy-workbench";

const requirementLabels: Record<OptimizationRequirement, string> = {
  exact: "Exact optimum required",
  guaranteed: "Bounded approximation acceptable",
  "best-effort": "Fast best effort acceptable",
};

const scaleLabels: Record<OptimizationScale, string> = {
  tiny: "Tiny / oracle-sized",
  moderate: "Moderate",
  large: "Large",
};

const classLabels: Record<StrategyClass, string> = {
  exact: "Exact",
  approximation: "Approximation",
  heuristic: "Heuristic",
};

export function OptimizationStrategyWorkbench() {
  const [scenarioId, setScenarioId] = useState(optimizationScenarios[0].id);
  const [requirement, setRequirement] = useState<OptimizationRequirement>("guaranteed");
  const [scale, setScale] = useState<OptimizationScale>("large");
  const [selectedStrategyId, setSelectedStrategyId] = useState<string | null>(null);
  const [oracleOpen, setOracleOpen] = useState(false);

  const scenario = useMemo(
    () => optimizationScenarios.find((item) => item.id === scenarioId) ?? optimizationScenarios[0],
    [scenarioId],
  );

  const evaluated = useMemo(
    () => scenario.strategies.map((strategy) => ({ strategy, fit: strategyFits(strategy, requirement, scale) })),
    [scenario, requirement, scale],
  );

  const selected = scenario.strategies.find((strategy) => strategy.id === selectedStrategyId) ?? null;
  const matching = evaluated.filter((item) => item.fit.fits);

  const chooseScenario = (id: string) => {
    setScenarioId(id);
    setSelectedStrategyId(null);
    setOracleOpen(false);
  };

  return (
    <div className="optimization-workbench">
      <section className="optimization-picker">
        <div>
          <span className="eyebrow">01 · Name the optimization problem</span>
          <h2>Hardness changes the product conversation.</h2>
          <p>
            When exact optimization is expensive, “find a faster algorithm” is incomplete. State the required quality, realistic scale,
            exploitable assumptions, and acceptable compute budget before choosing exact search, an approximation, or a heuristic.
          </p>
        </div>
        <div className="optimization-tabs" role="tablist" aria-label="Optimization scenarios">
          {optimizationScenarios.map((item) => (
            <button
              type="button"
              role="tab"
              aria-selected={item.id === scenario.id}
              className={item.id === scenario.id ? "optimization-tab optimization-tab--active" : "optimization-tab"}
              onClick={() => chooseScenario(item.id)}
              key={item.id}
            >
              <span className="mono">{item.label}</span>
              <strong>{item.problem}</strong>
            </button>
          ))}
        </div>
      </section>

      <section className="optimization-contract">
        <div>
          <span className="eyebrow">02 · Fix the contract before comparing methods</span>
          <h2>{scenario.objective}</h2>
          <p>{scenario.hardnessNote}</p>
        </div>
        <div className="optimization-contract__controls">
          <fieldset>
            <legend className="eyebrow">Required solution quality</legend>
            {(Object.keys(requirementLabels) as OptimizationRequirement[]).map((item) => (
              <button
                type="button"
                className={requirement === item ? "button button--selected" : "button"}
                aria-pressed={requirement === item}
                onClick={() => setRequirement(item)}
                key={item}
              >
                {requirementLabels[item]}
              </button>
            ))}
          </fieldset>
          <fieldset>
            <legend className="eyebrow">Representative scale</legend>
            {(Object.keys(scaleLabels) as OptimizationScale[]).map((item) => (
              <button
                type="button"
                className={scale === item ? "button button--selected" : "button"}
                aria-pressed={scale === item}
                onClick={() => setScale(item)}
                key={item}
              >
                {scaleLabels[item]}
              </button>
            ))}
          </fieldset>
        </div>
      </section>

      <section className="optimization-oracle">
        <div>
          <span className="eyebrow">03 · Keep a tiny exact oracle</span>
          <h2>Hard does not mean unverifiable.</h2>
          <p>Use an intentionally expensive exact method on tiny instances to test the behavior and empirical quality of faster strategies.</p>
        </div>
        <button className="button" type="button" onClick={() => setOracleOpen((open) => !open)}>
          {oracleOpen ? "Hide oracle" : "Reveal tiny oracle"}
        </button>
        {oracleOpen ? (
          <div className="optimization-oracle__answer">
            <strong>{scenario.smallOracle}</strong>
            <p><span className="mono">Stress it:</span> {scenario.stressCase}</p>
          </div>
        ) : null}
      </section>

      <section className="optimization-strategies">
        <div className="optimization-section-head">
          <div>
            <span className="eyebrow">04 · Compare strategy classes</span>
            <h2>{matching.length ? `${matching.length} strategy ${matching.length === 1 ? "fits" : "options fit"} the selected teaching contract.` : "No listed strategy fits both constraints cleanly."}</h2>
            <p>
              “Fit” here is a reasoning filter, not a production benchmark. Real thresholds depend on constants, solver quality, instance structure,
              hardware, latency, and how strongly the application needs its guarantee.
            </p>
          </div>
        </div>

        <div className="optimization-strategy-grid">
          {evaluated.map(({ strategy, fit }) => (
            <button
              type="button"
              aria-pressed={selectedStrategyId === strategy.id}
              className={selectedStrategyId === strategy.id ? "optimization-strategy optimization-strategy--selected" : "optimization-strategy"}
              onClick={() => setSelectedStrategyId(strategy.id)}
              key={strategy.id}
            >
              <div className="optimization-strategy__head">
                <span className={`optimization-class optimization-class--${strategy.class}`}>{classLabels[strategy.class]}</span>
                <span className={fit.fits ? "optimization-fit optimization-fit--yes" : "optimization-fit"}>{fit.fits ? "fits" : "conflict"}</span>
              </div>
              <strong>{strategy.label}</strong>
              <span className="mono">{strategy.complexity}</span>
              <div className="optimization-fit-reasons">
                <span>{fit.guaranteeFits ? "✓ quality contract" : "× quality contract"}</span>
                <span>{fit.scaleFits ? "✓ scale band" : "× scale band"}</span>
              </div>
            </button>
          ))}
        </div>

        {selected ? (
          <div className="optimization-strategy-detail">
            <div className="optimization-strategy-detail__head">
              <div>
                <span className="eyebrow">Inspect strategy</span>
                <h3>{selected.label}</h3>
              </div>
              <span className="mono">{selected.complexity}</span>
            </div>
            <div className="optimization-strategy-detail__grid">
              <div><span>Guarantee</span><strong>{selected.guarantee}</strong></div>
              <div><span>Strength</span><strong>{selected.strength}</strong></div>
              <div><span>Limitation</span><strong>{selected.limitation}</strong></div>
              <div><span>Requires</span><strong>{selected.requires.join(" · ")}</strong></div>
            </div>
          </div>
        ) : null}
      </section>

      <section className="optimization-reasoning">
        <div>
          <span className="eyebrow">05 · Requirement negotiation is algorithm design</span>
          <h2>Exactness, scale, and guarantees are variables—not background details.</h2>
          <p>
            If the selected contract yields no practical method, revisit the contract explicitly: reduce the instance, exploit a special case,
            accept a quality bound, use a time-budgeted heuristic, or move the optimization into a stronger solver.
          </p>
        </div>
        <div className="optimization-checklist">
          <div><span className="mono">A</span><strong>Can a special case make exact solution tractable?</strong></div>
          <div><span className="mono">B</span><strong>Can a lower/upper bound certify useful quality?</strong></div>
          <div><span className="mono">C</span><strong>Does the approximation rely on an assumption such as metric distances?</strong></div>
          <div><span className="mono">D</span><strong>Can the tiny oracle expose adversarial heuristic failures?</strong></div>
        </div>
      </section>

      <section className="optimization-transfer">
        <span className="eyebrow">Transfer question</span>
        <h2>{scenario.transferQuestion}</h2>
      </section>
    </div>
  );
}
