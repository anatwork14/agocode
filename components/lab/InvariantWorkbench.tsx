"use client";

import { useMemo, useState } from "react";
import { invariantScenarios } from "@/lib/knowledge/invariant-workbench";

type ProofStage = "initialization" | "preservation" | "termination";

const proofLabels: Record<ProofStage, string> = {
  initialization: "Initialization",
  preservation: "Preservation",
  termination: "Termination",
};

export function InvariantWorkbench() {
  const [scenarioId, setScenarioId] = useState(invariantScenarios[0].id);
  const [claimId, setClaimId] = useState<string | null>(null);
  const [frameIndex, setFrameIndex] = useState(0);
  const [proofStage, setProofStage] = useState<ProofStage>("initialization");
  const [counterexampleOpen, setCounterexampleOpen] = useState(false);

  const scenario = useMemo(
    () => invariantScenarios.find((item) => item.id === scenarioId) ?? invariantScenarios[0],
    [scenarioId],
  );
  const selectedClaim = scenario.claims.find((claim) => claim.id === claimId) ?? null;
  const frame = scenario.frames[frameIndex] ?? scenario.frames[0];
  const correctClaim = scenario.claims.find((claim) => claim.valid)!;

  const chooseScenario = (id: string) => {
    setScenarioId(id);
    setClaimId(null);
    setFrameIndex(0);
    setProofStage("initialization");
    setCounterexampleOpen(false);
  };

  return (
    <div className="invariant-workbench">
      <section className="invariant-chooser">
        <div>
          <span className="eyebrow">01 · Pick an algorithm</span>
          <h2>Correctness needs a sentence that survives every state change.</h2>
          <p>
            An invariant is useful when it connects a local transition to the global result. Choose the strongest correctness-relevant
            claim, then test whether initialization, preservation, and termination support it.
          </p>
        </div>
        <div className="invariant-tabs" role="tablist" aria-label="Invariant scenarios">
          {invariantScenarios.map((item) => (
            <button
              type="button"
              role="tab"
              aria-selected={item.id === scenario.id}
              className={item.id === scenario.id ? "invariant-tab invariant-tab--active" : "invariant-tab"}
              onClick={() => chooseScenario(item.id)}
              key={item.id}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      <section className="invariant-problem">
        <div className="invariant-section-head">
          <div>
            <span className="eyebrow">02 · State the claim</span>
            <h2>{scenario.question}</h2>
            <p>{scenario.algorithm}</p>
          </div>
          <span className="mono">{scenario.label}</span>
        </div>

        <div className="invariant-claims" role="radiogroup" aria-label="Invariant claims">
          {scenario.claims.map((claim) => {
            const selected = claim.id === claimId;
            return (
              <button
                type="button"
                role="radio"
                aria-checked={selected}
                className={selected ? "invariant-claim invariant-claim--selected" : "invariant-claim"}
                onClick={() => setClaimId(claim.id)}
                key={claim.id}
              >
                <span className="mono">{claim.id.replaceAll("-", " ")}</span>
                <strong>{claim.text}</strong>
              </button>
            );
          })}
        </div>

        <div className={selectedClaim ? (selectedClaim.valid ? "invariant-feedback invariant-feedback--valid" : "invariant-feedback invariant-feedback--invalid") : "invariant-feedback"}>
          {selectedClaim ? (
            <>
              <strong>{selectedClaim.valid ? "This claim can support a proof." : "This claim breaks or proves the wrong thing."}</strong>
              <p>{selectedClaim.feedback}</p>
            </>
          ) : (
            <p>Choose a claim before opening the proof obligations.</p>
          )}
        </div>
      </section>

      <section className="invariant-proof">
        <div className="invariant-section-head">
          <div>
            <span className="eyebrow">03 · Test the three proof obligations</span>
            <h2>{selectedClaim?.valid ? "Now defend the invariant." : "The proof opens after the useful claim is identified."}</h2>
            <p>Each stage answers a different question: is the claim true at the start, preserved by one transition, and strong enough at the end?</p>
          </div>
        </div>

        <div className="invariant-proof__layout">
          <div className="invariant-proof__tabs" role="tablist" aria-label="Proof stages">
            {(Object.keys(proofLabels) as ProofStage[]).map((stage, index) => (
              <button
                type="button"
                role="tab"
                aria-selected={stage === proofStage}
                disabled={!selectedClaim?.valid}
                className={stage === proofStage ? "invariant-proof-tab invariant-proof-tab--active" : "invariant-proof-tab"}
                onClick={() => setProofStage(stage)}
                key={stage}
              >
                <span className="mono">{String(index + 1).padStart(2, "0")}</span>
                <strong>{proofLabels[stage]}</strong>
              </button>
            ))}
          </div>

          <div className="invariant-proof__answer">
            {selectedClaim?.valid ? (
              <>
                <span className="eyebrow">{proofLabels[proofStage]}</span>
                <p>{scenario.proof[proofStage]}</p>
              </>
            ) : (
              <p>Select the claim that actually describes preserved correctness state.</p>
            )}
          </div>
        </div>
      </section>

      <section className="invariant-trace">
        <div className="invariant-section-head">
          <div>
            <span className="eyebrow">04 · Watch the statement survive</span>
            <h2>Every transition should make the invariant inspectable.</h2>
            <p>Step through the state manually. The explanation names exactly why the transition preserves the useful claim.</p>
          </div>
          <span className="mono">step {frameIndex + 1}/{scenario.frames.length}</span>
        </div>

        <div className="invariant-trace__grid">
          <div className="invariant-state-card">
            <div className="invariant-state-card__head">
              <span className="mono">{String(frameIndex + 1).padStart(2, "0")}</span>
              <strong>{frame.step}</strong>
            </div>
            <div className="invariant-state-lines">
              {frame.state.map((line) => <code key={line}>{line}</code>)}
            </div>
          </div>

          <div className="invariant-transition-card">
            <span className="eyebrow">Transition</span>
            <h3>{frame.transition}</h3>
            <p>{frame.reason}</p>
            <div className="invariant-claim-reminder">
              <span className="mono">INVARIANT</span>
              <strong>{correctClaim.text}</strong>
            </div>
          </div>
        </div>

        <div className="invariant-trace__controls">
          <button className="button" type="button" disabled={frameIndex === 0} onClick={() => setFrameIndex((index) => Math.max(0, index - 1))}>
            ← Previous
          </button>
          <div className="invariant-dots" aria-label="Trace step selector">
            {scenario.frames.map((item, index) => (
              <button
                type="button"
                aria-label={`Open ${item.step}`}
                aria-current={index === frameIndex ? "step" : undefined}
                onClick={() => setFrameIndex(index)}
                key={item.step}
              >
                <span />
              </button>
            ))}
          </div>
          <button className="button button--primary" type="button" disabled={frameIndex === scenario.frames.length - 1} onClick={() => setFrameIndex((index) => Math.min(scenario.frames.length - 1, index + 1))}>
            Next transition →
          </button>
        </div>
      </section>

      <section className="invariant-breaker">
        <div>
          <span className="eyebrow">05 · Try to break a weaker claim</span>
          <h2>Counterexamples are faster than arguing with a false invariant.</h2>
          <p>{scenario.counterexample.weakClaim}</p>
        </div>
        <button className="button" type="button" onClick={() => setCounterexampleOpen((value) => !value)}>
          {counterexampleOpen ? "Hide counterexample" : "Reveal counterexample"}
        </button>

        {counterexampleOpen ? (
          <div className="invariant-counterexample">
            <div className="invariant-state-lines">
              {scenario.counterexample.state.map((line) => <code key={line}>{line}</code>)}
            </div>
            <p>{scenario.counterexample.explanation}</p>
          </div>
        ) : null}
      </section>

      <section className="invariant-transfer">
        <span className="eyebrow">06 · Transfer</span>
        <h2>Change the task; rewrite the invariant.</h2>
        <p>{scenario.transferQuestion}</p>
      </section>
    </div>
  );
}
