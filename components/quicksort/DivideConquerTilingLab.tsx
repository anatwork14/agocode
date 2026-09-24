"use client";

import { useMemo, useState } from "react";

type ReductionStep = {
  longSide: number;
  shortSide: number;
  quotient: number;
  remainder: number;
};

const scenarios = [
  { id: "studio", label: "84 × 36", width: 84, height: 36 },
  { id: "poster", label: "55 × 34", width: 55, height: 34 },
  { id: "floor", label: "96 × 40", width: 96, height: 40 },
] as const;

function buildReductions(width: number, height: number) {
  const steps: ReductionStep[] = [];
  let longSide = Math.max(width, height);
  let shortSide = Math.min(width, height);

  while (shortSide > 0) {
    const quotient = Math.floor(longSide / shortSide);
    const remainder = longSide % shortSide;
    steps.push({ longSide, shortSide, quotient, remainder });
    if (remainder === 0) break;
    longSide = shortSide;
    shortSide = remainder;
  }

  return steps;
}

export function DivideConquerTilingLab() {
  const [scenarioId, setScenarioId] = useState<(typeof scenarios)[number]["id"]>("studio");
  const [stepIndex, setStepIndex] = useState(0);
  const scenario = scenarios.find((item) => item.id === scenarioId) ?? scenarios[0];
  const steps = useMemo(() => buildReductions(scenario.width, scenario.height), [scenario]);
  const step = steps[stepIndex];
  const largestSquare = steps.at(-1)?.shortSide ?? 0;

  function chooseScenario(id: (typeof scenarios)[number]["id"]) {
    setScenarioId(id);
    setStepIndex(0);
  }

  const squareShare = Math.min(100, (step.shortSide / step.longSide) * 100);
  const remainderShare = (step.remainder / step.longSide) * 100;

  return (
    <div className="divide-lab">
      <div className="divide-lab__header">
        <div>
          <div className="eyebrow">Concrete D&C model</div>
          <h3>Reduce a rectangle until the largest square becomes obvious.</h3>
        </div>
        <span className="mono">answer = {largestSquare} × {largestSquare}</span>
      </div>

      <div className="divide-scenarios" aria-label="Rectangle examples">
        {scenarios.map((item) => (
          <button
            type="button"
            className={`button ${item.id === scenarioId ? "button--primary" : ""}`}
            key={item.id}
            onClick={() => chooseScenario(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="divide-lab__grid">
        <section>
          <div className="eyebrow">Current rectangle</div>
          <div className="divide-rectangle" aria-label={`Rectangle ${step.longSide} by ${step.shortSide}`}>
            {Array.from({ length: step.quotient }, (_, index) => (
              <div
                className="divide-rectangle__square"
                style={{ width: `${squareShare}%` }}
                key={`square-${index}`}
                aria-hidden="true"
              />
            ))}
            {step.remainder > 0 ? (
              <div
                className="divide-rectangle__remainder"
                style={{ width: `${remainderShare}%` }}
                aria-hidden="true"
              />
            ) : null}
          </div>
          <p className="mono divide-equation">
            {step.longSide} = {step.quotient} × {step.shortSide} + {step.remainder}
          </p>
        </section>

        <section>
          <div className="eyebrow">Reduction</div>
          <div className="trace-note">
            {step.remainder === 0 ? (
              <p><strong>Base case.</strong> The shorter side divides the longer side exactly, so a {step.shortSide} × {step.shortSide} square tiles the remaining rectangle perfectly.</p>
            ) : (
              <p><strong>Recursive case.</strong> Ignore the square blocks that already fit. The only unresolved region is {step.shortSide} × {step.remainder}, a strictly smaller version of the same problem.</p>
            )}
          </div>
          <dl className="lab-status">
            <div><dt>long side</dt><dd>{step.longSide}</dd></div>
            <div><dt>short side</dt><dd>{step.shortSide}</dd></div>
            <div><dt>remainder</dt><dd>{step.remainder}</dd></div>
          </dl>
        </section>
      </div>

      <div className="lab-toolbar">
        <button className="button" type="button" onClick={() => setStepIndex((value) => Math.max(0, value - 1))} disabled={stepIndex === 0}>← Back</button>
        <button className="button button--primary" type="button" onClick={() => setStepIndex((value) => Math.min(steps.length - 1, value + 1))} disabled={stepIndex === steps.length - 1}>Reduce problem →</button>
        <button className="button button--quiet" type="button" onClick={() => setStepIndex(0)}>Reset</button>
      </div>
    </div>
  );
}
