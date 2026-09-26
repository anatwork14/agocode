"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { diagnosticPatterns } from "@/lib/knowledge/diagnostic-patterns";
import { stuckDiagnoses, type StuckStateId } from "@/lib/knowledge/stuck-router";

const actionOrder = { read: 0, workbench: 1, workspace: 2, practice: 3 } as const;

type StuckRouterProps = {
  returnHref?: string;
  returnLabel?: string;
};

export function StuckRouter({ returnHref, returnLabel = "Return to the current problem" }: StuckRouterProps = {}) {
  const [selectedId, setSelectedId] = useState<StuckStateId | null>(null);
  const selected = useMemo(
    () => stuckDiagnoses.find((item) => item.id === selectedId) ?? null,
    [selectedId],
  );
  const relatedPatterns = selected ? diagnosticPatterns[selected.id] : [];

  return (
    <section className="stuck-router" id="diagnose" aria-labelledby="stuck-router-title">
      <div className="stuck-router__intro">
        <div>
          <span className="eyebrow">Contextual help</span>
          <h2 id="stuck-router-title">Where exactly are you stuck?</h2>
          <p>
            Do not ask AgoCode for a technique before you know what kind of obstacle you have. Choose the sentence that
            best describes the current failure. The router sends you to a question set, a workbench, structural families,
            and transfer practice chosen for that obstacle.
          </p>
        </div>
        <div className="stuck-router__rule">
          <span className="mono">RULE</span>
          <strong>Diagnose the obstacle before revealing the tool.</strong>
          <p>The goal is to preserve productive struggle while avoiding random wandering.</p>
        </div>
      </div>

      <div className="stuck-router__grid" role="list" aria-label="Problem-solving obstacles">
        {stuckDiagnoses.map((item, index) => (
          <button
            className={selectedId === item.id ? "stuck-router__choice stuck-router__choice--selected" : "stuck-router__choice"}
            type="button"
            onClick={() => setSelectedId(item.id)}
            aria-pressed={selectedId === item.id}
            role="listitem"
            key={item.id}
          >
            <span className="mono">{String(index + 1).padStart(2, "0")}</span>
            <strong>{item.label}</strong>
            <small>{item.symptom}</small>
          </button>
        ))}
      </div>

      {selected ? (
        <div className="stuck-router__diagnosis" aria-live="polite">
          <div className="stuck-router__diagnosis-main">
            <span className="eyebrow">Diagnosis</span>
            <h3>{selected.label}</h3>
            <p>{selected.diagnosis}</p>

            <div className="stuck-router__first-move">
              <span className="mono">DO THIS BEFORE SEARCHING</span>
              <strong>{selected.firstMove}</strong>
            </div>

            <div className="stuck-router__questions">
              <span className="mono">QUESTIONS TO WRITE DOWN</span>
              <ol>
                {selected.questions.map((question) => <li key={question}>{question}</li>)}
              </ol>
            </div>
          </div>

          <aside className="stuck-router__path">
            <span className="eyebrow">Recommended path</span>
            {[...selected.actions]
              .sort((a, b) => actionOrder[a.kind] - actionOrder[b.kind])
              .map((action, index) => (
                <Link className="stuck-router__action" href={action.href} key={`${action.kind}-${action.href}`}>
                  <span className="mono">{String(index + 1).padStart(2, "0")} · {action.kind}</span>
                  <strong>{action.label}</strong>
                  <span aria-hidden="true">→</span>
                </Link>
              ))}

            <div className="stuck-router__patterns">
              <span className="mono">RELATED STRUCTURAL FAMILIES</span>
              {relatedPatterns.map((pattern) => (
                <Link href={`/patterns/${pattern.id}`} key={pattern.id}>
                  <strong>{pattern.label}</strong><span aria-hidden="true">→</span>
                </Link>
              ))}
              <Link href="/patterns">
                <strong>Browse all 16 families</strong><span aria-hidden="true">→</span>
              </Link>
            </div>

            {returnHref ? (
              <Link className="stuck-router__return" href={returnHref}>
                <span className="mono">RETURN</span>
                <strong>{returnLabel}</strong>
                <span aria-hidden="true">↩</span>
              </Link>
            ) : null}
            <button className="atlas-reset" type="button" onClick={() => setSelectedId(null)}>
              choose a different obstacle
            </button>
          </aside>
        </div>
      ) : (
        <div className="stuck-router__empty">
          <span className="mono">NO DIAGNOSIS SELECTED</span>
          <p>Choose the failure mode that matches what happened in your latest attempt.</p>
        </div>
      )}
    </section>
  );
}
