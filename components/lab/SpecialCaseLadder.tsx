"use client";

import { useMemo, useState } from "react";
import { specialCaseScenarios } from "@/lib/knowledge/special-case-ladder";

export function SpecialCaseLadder() {
  const [scenarioId, setScenarioId] = useState(specialCaseScenarios[0].id);
  const [stageIndex, setStageIndex] = useState(0);
  const [obstructionOpen, setObstructionOpen] = useState(false);

  const scenario = useMemo(
    () => specialCaseScenarios.find((item) => item.id === scenarioId) ?? specialCaseScenarios[0],
    [scenarioId],
  );
  const stage = scenario.stages[stageIndex] ?? scenario.stages[0];

  const selectScenario = (id: string) => {
    setScenarioId(id);
    setStageIndex(0);
    setObstructionOpen(false);
  };

  const selectStage = (index: number) => {
    setStageIndex(index);
    setObstructionOpen(false);
  };

  return (
    <div className="special-case-ladder">
      <section className="special-case-picker">
        <div>
          <span className="eyebrow">01 · Remove one source of difficulty</span>
          <h2>When the full problem is opaque, solve a meaningful restricted version first.</h2>
          <p>
            The goal is not to hide from the general case. A useful special case exposes which assumption makes an algorithm valid,
            then gives you a precise question to ask when that assumption is removed.
          </p>
        </div>
        <div className="special-case-tabs" role="tablist" aria-label="Special-case scenarios">
          {specialCaseScenarios.map((item) => (
            <button
              type="button"
              role="tab"
              aria-selected={item.id === scenario.id}
              className={item.id === scenario.id ? "special-case-tab special-case-tab--active" : "special-case-tab"}
              key={item.id}
              onClick={() => selectScenario(item.id)}
            >
              <span className="mono">{item.label}</span>
              <strong>{item.title}</strong>
            </button>
          ))}
        </div>
      </section>

      <section className="special-case-problem">
        <div>
          <span className="eyebrow">02 · Full problem</span>
          <h2>{scenario.fullProblem}</h2>
        </div>
        <aside>
          <span className="eyebrow">Question to keep asking</span>
          <strong>{scenario.question}</strong>
        </aside>
      </section>

      <section className="special-case-stages">
        <div className="special-case-section-head">
          <div>
            <span className="eyebrow">03 · Climb the generalization ladder</span>
            <h2>Each step removes one simplifying assumption.</h2>
          </div>
          <span className="mono">stage {stageIndex + 1} / {scenario.stages.length}</span>
        </div>

        <div className="special-case-stage-nav" role="tablist" aria-label={`${scenario.label} generalization stages`}>
          {scenario.stages.map((item, index) => (
            <button
              type="button"
              role="tab"
              aria-selected={index === stageIndex}
              className={index === stageIndex ? "special-stage-tab special-stage-tab--active" : "special-stage-tab"}
              key={item.id}
              onClick={() => selectStage(index)}
            >
              <span className="mono">{String(index + 1).padStart(2, "0")}</span>
              <strong>{item.restriction}</strong>
            </button>
          ))}
        </div>

        <div className="special-case-stage-card">
          <div className="special-case-stage-card__solution">
            <span className="eyebrow">Restricted case</span>
            <h3>{stage.algorithm}</h3>
            <span className="mono">{stage.complexity}</span>
            <p>{stage.whyItWorks}</p>
          </div>

          <div className="special-case-stage-card__lift">
            <span className="eyebrow">Lift one assumption</span>
            <strong>{stage.liftedConstraint}</strong>
            <button className="button" type="button" onClick={() => setObstructionOpen((open) => !open)}>
              {obstructionOpen ? "Hide what breaks" : "What breaks?"}
            </button>
          </div>

          {obstructionOpen ? (
            <div className="special-case-stage-card__obstruction">
              <div>
                <span className="eyebrow">Obstruction</span>
                <p>{stage.obstruction}</p>
              </div>
              <div>
                <span className="eyebrow">New machinery</span>
                <p>{stage.addedMachinery}</p>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="special-case-proof">
        <div>
          <span className="eyebrow">04 · Generalization check</span>
          <h2>Do not ask only whether the old code still runs. Ask whether its proof still holds.</h2>
        </div>
        <div className="special-case-proof__questions">
          <div><span className="mono">A</span><strong>Which assumption did the algorithm use?</strong></div>
          <div><span className="mono">B</span><strong>Which invariant or structural fact depended on it?</strong></div>
          <div><span className="mono">C</span><strong>What new state or search becomes necessary after removing it?</strong></div>
          <div><span className="mono">D</span><strong>Did the generalized problem become a different known problem family?</strong></div>
        </div>
      </section>

      <section className="special-case-takeaway">
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
