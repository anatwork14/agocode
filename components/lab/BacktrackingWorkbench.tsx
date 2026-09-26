"use client";

import { useMemo, useState } from "react";
import {
  analyzeSubsetBacktracking,
  backtrackingScenarios,
  isSafePruningClaim,
  pruningRules,
  type PruningRuleId,
} from "@/lib/knowledge/backtracking-workbench";

export function BacktrackingWorkbench() {
  const [scenarioId, setScenarioId] = useState(backtrackingScenarios[0].id);
  const [rule, setRule] = useState<PruningRuleId>("none");
  const [claim, setClaim] = useState<"sum-exceeds" | "current-smaller" | "remaining-insufficient" | null>(null);
  const [revealed, setRevealed] = useState(false);
  const scenario = backtrackingScenarios.find((item) => item.id === scenarioId) ?? backtrackingScenarios[0];
  const analysis = useMemo(() => analyzeSubsetBacktracking(scenario, rule), [rule, scenario]);
  const baseline = useMemo(() => analyzeSubsetBacktracking(scenario, "none"), [scenario]);

  return (
    <div className="advanced-workbench">
      <section className="advanced-workbench__panel">
        <span className="eyebrow">01 · Define the search space</span>
        <h2>Every item creates an include / exclude decision.</h2>
        <div className="advanced-workbench__tabs">
          {backtrackingScenarios.map((item) => (
            <button className={scenario.id === item.id ? "button button--selected" : "button"} type="button" key={item.id} onClick={() => { setScenarioId(item.id); setRevealed(false); }}>
              {item.label}
            </button>
          ))}
        </div>
        <div className="advanced-workbench__story">
          <strong>{scenario.story}</strong>
          <p>Values: {scenario.values.join(", ")} · target = {scenario.target}</p>
        </div>
      </section>

      <section className="advanced-workbench__panel">
        <span className="eyebrow">02 · Choose a pruning contract</span>
        <h2>A branch may be cut only when you can prove it cannot contain a solution.</h2>
        <div className="advanced-rule-grid">
          {pruningRules.map((candidate) => (
            <button
              key={candidate.id}
              type="button"
              className={rule === candidate.id ? "advanced-rule-card advanced-rule-card--selected" : "advanced-rule-card"}
              onClick={() => { setRule(candidate.id); setRevealed(false); }}
            >
              <strong>{candidate.label}</strong>
              <span>{candidate.description}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="advanced-workbench__panel">
        <span className="eyebrow">03 · Defend a pruning claim</span>
        <h2>Which claims are logically safe for non-negative subset sum?</h2>
        <div className="advanced-workbench__prediction">
          <button className={claim === "sum-exceeds" ? "button button--selected" : "button"} type="button" onClick={() => setClaim("sum-exceeds")}>Current sum exceeds target</button>
          <button className={claim === "current-smaller" ? "button button--selected" : "button"} type="button" onClick={() => setClaim("current-smaller")}>Current sum is still small</button>
          <button className={claim === "remaining-insufficient" ? "button button--selected" : "button"} type="button" onClick={() => setClaim("remaining-insufficient")}>Even all remaining values cannot reach target</button>
          <button className="button button--primary" type="button" disabled={!claim} onClick={() => setRevealed(true)}>Evaluate claim + search</button>
        </div>
      </section>

      {revealed ? (
        <section className="advanced-workbench__panel">
          <span className="eyebrow">04 · Compare explored work</span>
          <h2>{claim && isSafePruningClaim(claim) ? "That pruning claim is safe under the stated non-negative assumption." : "That claim does not prove the branch is impossible."}</h2>
          <div className="advanced-metrics">
            <div><span>Brute-force nodes</span><strong>{baseline.visitedNodes}</strong></div>
            <div><span>Visited with rule</span><strong>{analysis.visitedNodes}</strong></div>
            <div><span>Pruned branches</span><strong>{analysis.prunedBranches}</strong></div>
            <div><span>Solutions</span><strong>{analysis.solutions.length}</strong></div>
          </div>
          <div className="advanced-workbench__search-results">
            <div>
              <span className="mono">SOLUTIONS</span>
              <strong>{analysis.solutions.length ? analysis.solutions.map((solution) => `{${solution.join(", ")}}`).join(" · ") : "none"}</strong>
            </div>
            <div>
              <span className="mono">PRUNE REASONS</span>
              <strong>overshoot {analysis.pruneReasons.overshoot} · remaining-bound {analysis.pruneReasons["cannot-reach"]}</strong>
            </div>
          </div>
          <div className="advanced-workbench__takeaway">
            <strong>Assumption boundary</strong>
            <p>If negative values were allowed, “sum already exceeds target” would no longer be a safe pruning rule. Pruning is a proof about the future search space, not a hunch that a branch looks bad.</p>
          </div>
        </section>
      ) : null}
    </div>
  );
}
