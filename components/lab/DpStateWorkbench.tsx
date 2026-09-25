"use client";

import { useMemo, useState } from "react";
import {
  dpStateScenarios,
  type DpChoice,
  type DpStateScenario,
} from "@/lib/knowledge/dp-state-workbench";

type DecisionKey = "state" | "dimensions" | "dependencies" | "base" | "order";
type Selections = Record<DecisionKey, string | null>;

const emptySelections: Selections = {
  state: null,
  dimensions: null,
  dependencies: null,
  base: null,
  order: null,
};

const decisionOrder: { key: DecisionKey; number: string; title: string; gate?: DecisionKey[] }[] = [
  { key: "state", number: "01", title: "What does one DP state mean?" },
  { key: "dimensions", number: "02", title: "Which variables identify a subproblem?", gate: ["state"] },
  { key: "dependencies", number: "03", title: "Which smaller states determine this state?", gate: ["state", "dimensions"] },
  { key: "base", number: "04", title: "Which smallest states are known immediately?", gate: ["state", "dimensions", "dependencies"] },
  { key: "order", number: "05", title: "In what order can the table be filled safely?", gate: ["state", "dimensions", "dependencies", "base"] },
];

function choicesFor(scenario: DpStateScenario, key: DecisionKey) {
  if (key === "state") return scenario.stateChoices;
  if (key === "dimensions") return scenario.dimensionChoices;
  if (key === "dependencies") return scenario.dependencyChoices;
  if (key === "base") return scenario.baseChoices;
  return scenario.orderChoices;
}

function selectedChoice(choices: DpChoice[], id: string | null) {
  return choices.find((choice) => choice.id === id) ?? null;
}

function DpTablePreview({ scenario }: { scenario: DpStateScenario }) {
  const dependencyCells = new Map(
    scenario.table.dependencies.map((dependency) => [
      `${scenario.table.targetRow + dependency.rowDelta}:${scenario.table.targetCol + dependency.colDelta}`,
      dependency.label,
    ]),
  );

  return (
    <div
      className="dp-state-table"
      role="table"
      aria-label={`State table geometry for ${scenario.title}`}
      style={{ gridTemplateColumns: `96px repeat(${scenario.table.colLabels.length}, minmax(42px, 1fr))` }}
    >
      <div className="dp-state-table__corner" />
      {scenario.table.colLabels.map((label, index) => (
        <div className="dp-state-table__label dp-state-table__label--column" role="columnheader" key={`c-${index}`}>
          {label}
        </div>
      ))}
      {scenario.table.rowLabels.map((rowLabel, row) => (
        <div className="dp-state-table__row" role="row" key={`r-${row}`}>
          <div className="dp-state-table__label dp-state-table__label--row" role="rowheader">{rowLabel}</div>
          {scenario.table.colLabels.map((_, col) => {
            const isTarget = row === scenario.table.targetRow && col === scenario.table.targetCol;
            const dependency = dependencyCells.get(`${row}:${col}`);
            return (
              <div
                className={isTarget ? "dp-state-cell dp-state-cell--target" : dependency ? "dp-state-cell dp-state-cell--dependency" : "dp-state-cell"}
                role="cell"
                aria-label={isTarget ? "target state" : dependency ? `dependency: ${dependency}` : `state row ${row} column ${col}`}
                key={`${row}-${col}`}
              >
                {isTarget ? <span>?</span> : dependency ? <span title={dependency}>←</span> : null}
              </div>
            );
          })}
        </div>
      ))}
      <div className="dp-state-table__legend">
        <span><i className="dp-state-legend-target" /> target state</span>
        <span><i className="dp-state-legend-dependency" /> states it reads</span>
      </div>
    </div>
  );
}

export function DpStateWorkbench() {
  const [scenarioId, setScenarioId] = useState(dpStateScenarios[0].id);
  const [selections, setSelections] = useState<Selections>(emptySelections);
  const [recurrenceOpen, setRecurrenceOpen] = useState(false);

  const scenario = dpStateScenarios.find((item) => item.id === scenarioId) ?? dpStateScenarios[0];

  const correctness = useMemo(() => {
    return Object.fromEntries(
      decisionOrder.map(({ key }) => {
        const choice = selectedChoice(choicesFor(scenario, key), selections[key]);
        return [key, Boolean(choice?.correct)];
      }),
    ) as Record<DecisionKey, boolean>;
  }, [scenario, selections]);

  const correctCount = decisionOrder.filter(({ key }) => correctness[key]).length;
  const designComplete = decisionOrder.every(({ key }) => correctness[key]);
  const geometryReady = correctness.state && correctness.dimensions && correctness.dependencies;

  const chooseScenario = (id: string) => {
    setScenarioId(id);
    setSelections(emptySelections);
    setRecurrenceOpen(false);
  };

  const choose = (key: DecisionKey, id: string) => {
    setSelections((current) => {
      const next = { ...current, [key]: id };
      const index = decisionOrder.findIndex((decision) => decision.key === key);
      for (let cursor = index + 1; cursor < decisionOrder.length; cursor += 1) {
        next[decisionOrder[cursor].key] = null;
      }
      return next;
    });
    setRecurrenceOpen(false);
  };

  return (
    <div className="dp-state-workbench">
      <section className="dp-state-picker">
        <div>
          <span className="eyebrow">01 · Change the problem shape</span>
          <h2>Define the subproblem before writing the recurrence.</h2>
          <p>
            A DP table is not the idea. The idea is a compact statement of what one cached answer means, which variables identify
            that subproblem, and which smaller answers are sufficient to construct it.
          </p>
        </div>
        <div className="dp-state-tabs" role="tablist" aria-label="Dynamic programming state-design scenarios">
          {dpStateScenarios.map((item) => (
            <button
              type="button"
              role="tab"
              aria-selected={item.id === scenario.id}
              className={item.id === scenario.id ? "dp-state-tab dp-state-tab--active" : "dp-state-tab"}
              onClick={() => chooseScenario(item.id)}
              key={item.id}
            >
              <span>{item.title}</span>
              <small>{item.eyebrow}</small>
            </button>
          ))}
        </div>
      </section>

      <section className="dp-state-story">
        <div>
          <span className="eyebrow">02 · State the objective</span>
          <h2>{scenario.title}</h2>
          <p className="dp-state-story__problem">{scenario.story}</p>
          <p><strong>Objective:</strong> {scenario.objective}</p>
        </div>
        <div className="dp-state-progress">
          <span className="mono">STATE DESIGN</span>
          <strong>{correctCount}/{decisionOrder.length}</strong>
          <div aria-label={`${correctCount} of ${decisionOrder.length} DP design decisions correct`}>
            <span style={{ width: `${(correctCount / decisionOrder.length) * 100}%` }} />
          </div>
        </div>
      </section>

      <section className="dp-state-decisions">
        {decisionOrder.map((decision) => {
          const choices = choicesFor(scenario, decision.key);
          const selected = selectedChoice(choices, selections[decision.key]);
          const locked = Boolean(decision.gate?.some((key) => !correctness[key]));
          return (
            <article className={locked ? "dp-state-decision dp-state-decision--locked" : "dp-state-decision"} key={decision.key}>
              <div className="dp-state-decision__head">
                <span className="mono">{decision.number}</span>
                <div>
                  <h3>{decision.title}</h3>
                  {locked ? <p>Resolve the earlier state-design decision first.</p> : null}
                </div>
              </div>

              <div className="dp-state-options" role="radiogroup" aria-label={decision.title}>
                {choices.map((choice) => (
                  <button
                    type="button"
                    role="radio"
                    aria-checked={selections[decision.key] === choice.id}
                    disabled={locked}
                    className={selections[decision.key] === choice.id ? "dp-state-option dp-state-option--selected" : "dp-state-option"}
                    onClick={() => choose(decision.key, choice.id)}
                    key={choice.id}
                  >
                    {choice.label}
                  </button>
                ))}
              </div>

              {selected ? (
                <div className={selected.correct ? "dp-state-feedback dp-state-feedback--correct" : "dp-state-feedback dp-state-feedback--wrong"}>
                  <strong>{selected.correct ? "This preserves exactly the information future states need." : "This state design loses information or remembers too much."}</strong>
                  <p>{selected.feedback}</p>
                </div>
              ) : null}
            </article>
          );
        })}
      </section>

      <section className={geometryReady ? "dp-state-geometry dp-state-geometry--ready" : "dp-state-geometry"}>
        <div className="dp-state-section-head">
          <div>
            <span className="eyebrow">03 · Inspect the dependency geometry</span>
            <h2>{geometryReady ? "One cell is a named subproblem, not a mysterious box." : "The table stays abstract until state + dimensions + dependencies agree."}</h2>
          </div>
          <span className="mono">{geometryReady ? scenario.summary.dimensions : "define state first"}</span>
        </div>

        {geometryReady ? (
          <div className="dp-state-geometry__grid">
            <DpTablePreview scenario={scenario} />
            <dl className="dp-state-summary">
              <div><dt>State</dt><dd>{scenario.summary.state}</dd></div>
              <div><dt>Dimensions</dt><dd>{scenario.summary.dimensions}</dd></div>
              <div><dt>Reads</dt><dd>{scenario.summary.dependencies}</dd></div>
              <div><dt>Base</dt><dd>{correctness.base ? scenario.summary.base : "Choose the base cases next."}</dd></div>
              <div><dt>Order</dt><dd>{correctness.order ? scenario.summary.order : "Choose an order after dependencies and bases are clear."}</dd></div>
            </dl>
          </div>
        ) : (
          <p className="dp-state-geometry__locked-copy">
            A two-dimensional array is not automatically dynamic programming. First say what a cell means and which smaller cells make it solvable.
          </p>
        )}
      </section>

      <section className={designComplete ? "dp-state-recurrence dp-state-recurrence--ready" : "dp-state-recurrence"}>
        <div>
          <span className="eyebrow">04 · Recurrence comes last</span>
          <h2>{designComplete ? "Now the recurrence is almost a translation of the state definition." : "Finish the state design before revealing the recurrence."}</h2>
          <p>
            The recurrence should feel unsurprising after the subproblem meaning, dependency set, base cases, and evaluation order are explicit.
          </p>
        </div>
        <button className="button button--primary" type="button" disabled={!designComplete} onClick={() => setRecurrenceOpen((value) => !value)}>
          {recurrenceOpen ? "Hide recurrence" : designComplete ? "Reveal recurrence reasoning" : "Complete all five decisions"}
        </button>

        {recurrenceOpen && designComplete ? (
          <div className="dp-state-recurrence__answer">
            <div>
              <span className="mono">RECURRENCE</span>
              <strong>{scenario.summary.recurrence}</strong>
            </div>
            <div>
              <span className="mono">COST</span>
              <strong>{scenario.summary.complexity}</strong>
            </div>
          </div>
        ) : null}
      </section>

      <section className="dp-state-transfer">
        <span className="eyebrow">05 · Change one assumption</span>
        <h2>When the problem changes, the state may need to change before the code does.</h2>
        <p>{scenario.transferQuestion}</p>
      </section>
    </div>
  );
}
