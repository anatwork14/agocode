"use client";

import { useMemo, useState } from "react";
import type { AlgorithmCaseStudy } from "@/lib/knowledge/casebook";

const stageLabels = {
  request: "Raw request",
  baseline: "Baseline",
  model: "Model",
  failure: "Rejected idea",
  pivot: "Pivot",
  design: "Design",
  verification: "Verification",
  postmortem: "Postmortem",
} as const;

export function CaseStudyReader({ caseStudy }: { caseStudy: AlgorithmCaseStudy }) {
  const [predictionId, setPredictionId] = useState<string | null>(null);
  const [revealedThrough, setRevealedThrough] = useState(0);
  const [activeStage, setActiveStage] = useState(0);

  const prediction = caseStudy.prediction.choices.find((choice) => choice.id === predictionId) ?? null;
  const stage = caseStudy.stages[activeStage];
  const revealedStages = useMemo(
    () => caseStudy.stages.slice(0, Math.min(revealedThrough + 1, caseStudy.stages.length)),
    [caseStudy.stages, revealedThrough],
  );

  const revealNext = () => {
    setRevealedThrough((current) => Math.min(current + 1, caseStudy.stages.length - 1));
    setActiveStage((current) => Math.min(Math.max(current + 1, revealedThrough + 1), caseStudy.stages.length - 1));
  };

  return (
    <div className="case-reader">
      <section className="case-prediction">
        <div>
          <span className="eyebrow">Before the case unfolds</span>
          <h2>Make the strategic call first.</h2>
          <p>{caseStudy.prediction.prompt}</p>
        </div>
        <div className="case-prediction__choices">
          {caseStudy.prediction.choices.map((choice) => (
            <button
              type="button"
              className={predictionId === choice.id ? "case-choice case-choice--selected" : "case-choice"}
              aria-pressed={predictionId === choice.id}
              key={choice.id}
              onClick={() => setPredictionId(choice.id)}
            >
              {choice.label}
            </button>
          ))}
          {prediction ? (
            <div className={prediction.correct ? "case-feedback case-feedback--correct" : "case-feedback"}>
              <strong>{prediction.correct ? "Good strategic question." : "Useful false start."}</strong>
              <p>{prediction.feedback}</p>
            </div>
          ) : null}
        </div>
      </section>

      <section className="case-timeline">
        <div className="case-timeline__rail" aria-label="Case-study stages">
          {caseStudy.stages.map((item, index) => {
            const revealed = index <= revealedThrough;
            const active = index === activeStage;
            return (
              <button
                type="button"
                key={item.id}
                disabled={!revealed}
                aria-current={active ? "step" : undefined}
                className={active ? "case-stage-tab case-stage-tab--active" : "case-stage-tab"}
                onClick={() => setActiveStage(index)}
              >
                <span className="mono">{String(index + 1).padStart(2, "0")}</span>
                <span>{revealed ? stageLabels[item.kind] : "Locked"}</span>
              </button>
            );
          })}
        </div>

        <article className={`case-stage case-stage--${stage.kind}`}>
          <div className="case-stage__head">
            <div>
              <span className="eyebrow">{stageLabels[stage.kind]} · {String(activeStage + 1).padStart(2, "0")}</span>
              <h2>{stage.title}</h2>
            </div>
            <span className="mono">{activeStage + 1}/{caseStudy.stages.length}</span>
          </div>

          <div className="case-stage__question">
            <span>Question</span>
            <strong>{stage.question}</strong>
          </div>

          <div className="case-stage__body">
            {stage.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>

          {stage.evidence?.length ? (
            <div className="case-evidence">
              <span className="eyebrow">Evidence / contract</span>
              {stage.evidence.map((item) => <div key={item}>{item}</div>)}
            </div>
          ) : null}

          <div className="case-stage__actions">
            {activeStage > 0 ? (
              <button className="button" type="button" onClick={() => setActiveStage((index) => Math.max(0, index - 1))}>← Previous</button>
            ) : <span />}
            {activeStage < revealedThrough ? (
              <button className="button button--primary" type="button" onClick={() => setActiveStage((index) => Math.min(revealedThrough, index + 1))}>Next revealed →</button>
            ) : activeStage < caseStudy.stages.length - 1 ? (
              <button className="button button--primary" type="button" onClick={revealNext}>Reveal next decision →</button>
            ) : null}
          </div>
        </article>
      </section>

      <section className="case-reveal-ledger">
        <div>
          <span className="eyebrow">Design log</span>
          <h2>{revealedStages.length} of {caseStudy.stages.length} reasoning stages exposed.</h2>
          <p>The point is not to guess the final algorithm instantly. Preserve the chain of decisions that made the final design defensible.</p>
        </div>
        <ol>
          {revealedStages.map((item, index) => (
            <li key={item.id}>
              <span className="mono">{String(index + 1).padStart(2, "0")}</span>
              <div><strong>{item.title}</strong><small>{item.question}</small></div>
            </li>
          ))}
        </ol>
      </section>

      {revealedThrough === caseStudy.stages.length - 1 ? (
        <section className="case-conclusion">
          <div>
            <span className="eyebrow">Final design</span>
            <h2>What survived the reasoning process</h2>
            <ol>{caseStudy.finalDesign.map((item) => <li key={item}>{item}</li>)}</ol>
          </div>
          <div>
            <span className="eyebrow">Transfer</span>
            <h2>Change the assumptions.</h2>
            <ul>{caseStudy.transferQuestions.map((question) => <li key={question}>{question}</li>)}</ul>
          </div>
        </section>
      ) : null}
    </div>
  );
}
