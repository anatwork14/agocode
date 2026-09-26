"use client";

import { useState } from "react";
import {
  evaluateGreedyRule,
  greedyCounterexampleScenarios,
} from "@/lib/knowledge/greedy-counterexample-workbench";

export function GreedyCounterexampleWorkbench() {
  const [scenarioId, setScenarioId] = useState(greedyCounterexampleScenarios[0].id);
  const [ruleId, setRuleId] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const scenario = greedyCounterexampleScenarios.find((item) => item.id === scenarioId) ?? greedyCounterexampleScenarios[0];
  const evaluation = ruleId ? evaluateGreedyRule(scenario.id, ruleId) : null;

  return (
    <div className="advanced-workbench">
      <section className="advanced-workbench__panel">
        <span className="eyebrow">01 · State the objective exactly</span>
        <div className="advanced-workbench__tabs">
          {greedyCounterexampleScenarios.map((item) => (
            <button
              className={scenario.id === item.id ? "button button--selected" : "button"}
              type="button"
              key={item.id}
              onClick={() => { setScenarioId(item.id); setRuleId(null); setRevealed(false); }}
            >{item.label}</button>
          ))}
        </div>
        <h2>{scenario.objective}</h2>
        <p>{scenario.instance}</p>
      </section>

      <section className="advanced-workbench__panel">
        <span className="eyebrow">02 · Propose a local rule</span>
        <h2>A plausible greedy choice is not yet an algorithm proof.</h2>
        <div className="advanced-rule-grid">
          {scenario.rules.map((rule) => (
            <button
              key={rule.id}
              type="button"
              className={ruleId === rule.id ? "advanced-rule-card advanced-rule-card--selected" : "advanced-rule-card"}
              onClick={() => { setRuleId(rule.id); setRevealed(false); }}
            >
              <strong>{rule.label}</strong>
              <span>{rule.rationale}</span>
            </button>
          ))}
        </div>
        <button className="button button--primary" type="button" disabled={!ruleId} onClick={() => setRevealed(true)}>Attack this rule</button>
      </section>

      {revealed && evaluation ? (
        <section className="advanced-workbench__panel">
          <span className="eyebrow">03 · Counterexample or proof boundary</span>
          <h2>{evaluation.valid ? "This choice has a defensible structural argument here." : "A small instance breaks this local rule."}</h2>
          <div className={evaluation.valid ? "advanced-verdict advanced-verdict--valid" : "advanced-verdict"}>
            <strong>{evaluation.rule.label}</strong>
            <p>{evaluation.explanation}</p>
          </div>
          {!evaluation.valid ? (
            <div className="advanced-workbench__takeaway">
              <strong>Counterexample</strong>
              <p>{evaluation.scenario.counterexample}</p>
            </div>
          ) : null}
          <div className="advanced-workbench__takeaway">
            <strong>Proof boundary</strong>
            <p>{evaluation.scenario.proofBoundary}</p>
          </div>
          <p>
            Transfer habit: before coding a greedy rule, try to construct the smallest adversarial instance. If you cannot prove an exchange, cut, matroid-like, or other safety property, the local choice remains a hypothesis.
          </p>
        </section>
      ) : null}
    </div>
  );
}
