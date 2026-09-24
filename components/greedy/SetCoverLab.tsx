"use client";

import { useMemo, useState } from "react";
import { greedySetCover } from "@/lib/algorithms/greedy";

const required = ["mt", "wa", "or", "id", "nv", "ut", "ca", "az"] as const;
const stations = {
  kone: ["id", "nv", "ut"],
  ktwo: ["wa", "id", "mt"],
  kthree: ["or", "nv", "ca"],
  kfour: ["nv", "ut"],
  kfive: ["ca", "az"],
} as const;

export function SetCoverLab() {
  const result = useMemo(() => greedySetCover(required, stations), []);
  const [step, setStep] = useState(0);
  const visible = result.steps.slice(0, step);
  const chosen = new Set(visible.map((item) => item.chosen));
  const covered = new Set(visible.flatMap((item) => item.newlyCovered));
  const current = result.steps[step];

  function advance() {
    setStep((value) => {
      const nextStep = Math.min(result.steps.length, value + 1);
      if (nextStep === result.steps.length) {
        localStorage.setItem(
          "agocode.progress.greedy.set-cover",
          JSON.stringify({ completedAt: new Date().toISOString(), exerciseId: "greedy-set-cover" }),
        );
      }
      return nextStep;
    });
  }

  return (
    <div className="set-cover-lab">
      <div className="greedy-lab__header">
        <div>
          <div className="eyebrow">Approximation</div>
          <h3>Repeatedly choose the station that covers the most states still missing.</h3>
        </div>
        <span className="mono">{covered.size}/{required.length} covered</span>
      </div>

      <div className="set-cover-state-grid">
        <section>
          <div className="eyebrow">States needed</div>
          <div className="state-chip-grid">
            {required.map((state) => <span className={covered.has(state) ? "state-chip state-chip--covered" : "state-chip"} key={state}>{state.toUpperCase()}</span>)}
          </div>
        </section>
        <section>
          <div className="eyebrow">Stations</div>
          <div className="station-list">
            {Object.entries(stations).map(([name, states]) => (
              <div className={`station-row ${chosen.has(name) ? "station-row--chosen" : current?.chosen === name ? "station-row--current" : ""}`} key={name}>
                <strong>{name}</strong>
                <span className="mono">{states.join(" · ")}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="trace-note" aria-live="polite">
        <strong>{step === 0 ? "Start:" : `Choice ${step}:`}</strong>{" "}
        {step === 0
          ? "Look only at states that are still uncovered. A station gets credit for new coverage, not for states already handled."
          : `${visible[visible.length - 1]?.chosen} added ${visible[visible.length - 1]?.newlyCovered.map((state) => state.toUpperCase()).join(", ")}.`}
      </div>

      <div className="lab-toolbar">
        <button className="button" type="button" onClick={() => setStep((value) => Math.max(0, value - 1))} disabled={step === 0}>← Back</button>
        <button className="button button--primary" type="button" onClick={advance} disabled={step === result.steps.length}>
          {step === result.steps.length ? "All states covered" : "Choose best station →"}
        </button>
        <button className="button button--quiet" type="button" onClick={() => setStep(0)}>Reset</button>
      </div>

      {step === result.steps.length ? <div className="greedy-result mono">Approximation: {result.selected.join(" · ")}</div> : null}
    </div>
  );
}
