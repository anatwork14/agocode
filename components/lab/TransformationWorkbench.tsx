"use client";

import { useMemo, useState } from "react";
import {
  transformationScenarios,
  type TransformationOption,
  type TransformationVerdict,
} from "@/lib/knowledge/transformation-workbench";

const verdictLabels: Record<TransformationVerdict, string> = {
  strong: "Strong fit",
  viable: "Viable trade-off",
  mismatch: "Primitive mismatch",
};

function OptionDetails({ option }: { option: TransformationOption }) {
  return (
    <div className={`transform-option-details transform-option-details--${option.verdict}`}>
      <div className="transform-option-details__head">
        <div>
          <span className="eyebrow">{verdictLabels[option.verdict]}</span>
          <h3>{option.label}</h3>
        </div>
        <div className="transform-option-details__cost mono">
          <span>{option.time}</span>
          <span>{option.extraSpace} extra</span>
        </div>
      </div>
      <p>{option.explanation}</p>
      <div className="transform-option-details__claim">
        <strong>What becomes visible?</strong>
        <p>{option.exposes}</p>
      </div>
      <div className="transform-strip" aria-label={`Transformed representation for ${option.label}`}>
        {option.transformed.map((item, index) => (
          <span key={`${option.id}-${index}`}>{item}</span>
        ))}
      </div>
    </div>
  );
}

export function TransformationWorkbench() {
  const [scenarioId, setScenarioId] = useState(transformationScenarios[0].id);
  const [optionId, setOptionId] = useState<string | null>(null);
  const [baselineOpen, setBaselineOpen] = useState(false);

  const scenario = useMemo(
    () => transformationScenarios.find((item) => item.id === scenarioId) ?? transformationScenarios[0],
    [scenarioId],
  );
  const selected = scenario.options.find((option) => option.id === optionId) ?? null;

  const chooseScenario = (id: string) => {
    setScenarioId(id);
    setOptionId(null);
    setBaselineOpen(false);
  };

  return (
    <div className="transformation-workbench">
      <section className="transformation-scenario-picker" aria-label="Choose transformation scenario">
        <div>
          <span className="eyebrow">01 · Start from the unhelpful representation</span>
          <h2>What relationship is expensive only because the input hides it?</h2>
          <p>
            Do not choose an algorithm name first. Read the goal, inspect the constraints, and identify what the baseline repeatedly
            searches for before selecting a transformation.
          </p>
        </div>
        <div className="transformation-tabs" role="tablist" aria-label="Transformation scenarios">
          {transformationScenarios.map((item) => (
            <button
              type="button"
              role="tab"
              aria-selected={item.id === scenario.id}
              className={item.id === scenario.id ? "transform-tab transform-tab--active" : "transform-tab"}
              key={item.id}
              onClick={() => chooseScenario(item.id)}
            >
              <span>{item.label}</span>
              <strong>{item.title}</strong>
            </button>
          ))}
        </div>
      </section>

      <section className="transformation-problem">
        <div className="transformation-problem__story">
          <span className="eyebrow">02 · Name the goal</span>
          <h2>{scenario.title}</h2>
          <p>{scenario.prompt}</p>
          <div className="transform-input" aria-label={scenario.inputLabel}>
            <span className="mono">{scenario.inputLabel}</span>
            <div>
              {scenario.input.map((item, index) => (
                <span key={`${scenario.id}-input-${index}`}>{item}</span>
              ))}
            </div>
          </div>
        </div>
        <aside className="transformation-problem__constraints">
          <span className="eyebrow">Goal</span>
          <strong>{scenario.goal}</strong>
          <ul>
            {scenario.constraints.map((constraint) => <li key={constraint}>{constraint}</li>)}
          </ul>
        </aside>
      </section>

      <section className="transformation-baseline">
        <div>
          <span className="eyebrow">03 · Baseline before optimization</span>
          <h2>Make the waste explicit.</h2>
          <p>
            A simple correct baseline is useful because it tells you what work the improved design must remove. Reveal it only after
            you have tried to describe the literal solution yourself.
          </p>
        </div>
        <button className="button" type="button" onClick={() => setBaselineOpen((open) => !open)}>
          {baselineOpen ? "Hide baseline" : "Reveal baseline"}
        </button>
        {baselineOpen ? (
          <div className="transformation-baseline__answer">
            <div><span>Method</span><strong>{scenario.baseline.method}</strong></div>
            <div><span>Time</span><strong className="mono">{scenario.baseline.time}</strong></div>
            <div><span>Extra space</span><strong className="mono">{scenario.baseline.extraSpace}</strong></div>
            <div className="transformation-baseline__waste"><span>Named waste</span><strong>{scenario.baseline.waste}</strong></div>
          </div>
        ) : null}
      </section>

      <section className="transformation-options">
        <div className="transformation-section-head">
          <div>
            <span className="eyebrow">04 · Choose a structural move</span>
            <h2>What should become easy after preprocessing?</h2>
            <p>Several moves may be correct. Judge them by the relation they expose, the operation they make cheap, and the constraints they consume.</p>
          </div>
          <span className="mono">choose one to inspect</span>
        </div>

        <div className="transformation-option-grid">
          {scenario.options.map((option) => (
            <button
              className={selected?.id === option.id ? "transform-option transform-option--selected" : "transform-option"}
              type="button"
              aria-pressed={selected?.id === option.id}
              key={option.id}
              onClick={() => setOptionId(option.id)}
            >
              <span className="mono">{option.time}</span>
              <strong>{option.label}</strong>
              <p>{option.move}</p>
            </button>
          ))}
        </div>

        {selected ? <OptionDetails option={selected} /> : (
          <div className="transformation-empty">
            <strong>Predict before reveal.</strong>
            <p>Choose the move whose primitive best matches the hidden relationship: adjacency, exact membership, order statistics, range order, or another property.</p>
          </div>
        )}
      </section>

      <section className="transformation-comparison">
        <div className="transformation-section-head">
          <div>
            <span className="eyebrow">05 · Compare, do not memorize</span>
            <h2>The same problem can admit multiple good representations.</h2>
          </div>
        </div>
        <div className="transformation-table" role="table" aria-label={`${scenario.title} transformation comparison`}>
          <div className="transformation-table__row transformation-table__row--head" role="row">
            <span role="columnheader">Move</span>
            <span role="columnheader">Time</span>
            <span role="columnheader">Space</span>
            <span role="columnheader">Fit</span>
          </div>
          {scenario.options.map((option) => (
            <button
              type="button"
              className="transformation-table__row"
              role="row"
              onClick={() => setOptionId(option.id)}
              key={option.id}
            >
              <strong role="cell">{option.label}</strong>
              <span className="mono" role="cell">{option.time}</span>
              <span className="mono" role="cell">{option.extraSpace}</span>
              <span role="cell" className={`transform-verdict transform-verdict--${option.verdict}`}>{verdictLabels[option.verdict]}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="transformation-takeaway">
        <div>
          <span className="eyebrow">Durable idea</span>
          <h2>{scenario.durableInsight}</h2>
        </div>
        <div>
          <span className="eyebrow">Transfer question</span>
          <p>{scenario.transferQuestion}</p>
        </div>
      </section>
    </div>
  );
}
