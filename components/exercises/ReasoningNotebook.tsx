"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getReasoningStageHelp } from "@/lib/knowledge/notebook-help";
import { recordReasoningNotebookEvidence } from "@/lib/learning/evidence";

const REASONING_EVIDENCE_KEY = "agocode.progress.design.reasoning-notebooks";

const notebookSteps = [
  {
    id: "understand",
    number: "01",
    title: "Understand",
    prompt: "State the input, output, objective, constraints, and realistic scale in your own words. What would count as a correct answer?",
    placeholder: "Input…\nOutput…\nObjective…\nConstraints / scale…",
  },
  {
    id: "examples",
    number: "02",
    title: "Solve tiny and extreme cases",
    prompt: "Work one tiny ordinary case and one adversarial or extreme case by hand. Record the decisions, not only the final answer.",
    placeholder: "Tiny case…\nExtreme case…\nWhat changed in my reasoning…",
  },
  {
    id: "baseline",
    number: "03",
    title: "Establish a baseline",
    prompt: "Describe the simplest obviously correct method. It can be slow. Why is it correct, and what does it cost?",
    placeholder: "Brute-force / direct method…\nWhy it is correct…\nTime… Space…",
  },
  {
    id: "waste",
    number: "04",
    title: "Name the waste",
    prompt: "What does the baseline repeatedly scan, compare, recompute, sort, copy, or enumerate? Optimization should remove a named source of waste.",
    placeholder: "The repeated work is…\nIt dominates because…",
  },
  {
    id: "strategy",
    number: "05",
    title: "Choose a strategy before tactics",
    prompt: "Can you transform the input or model it differently? Consider sorting, hashing, a heap, a tree, a graph, recursion, dynamic programming, greedy choice, or a special case. Only then choose implementation details.",
    placeholder: "Possible model / transformation…\nWhy this strategy fits…\nTactical representation choice…",
  },
  {
    id: "invariant",
    number: "06",
    title: "Write the invariant",
    prompt: "What sentence must remain true after every important state transition? Try to construct the smallest counterexample to your claim.",
    placeholder: "Invariant…\nInitialization…\nPreservation…\nCounterexample attempt…",
  },
  {
    id: "analyze",
    number: "07",
    title: "Analyze the real cost",
    prompt: "State time and space bounds in terms of the actual input size. Include hidden storage such as recursion, indexes, caches, copies, or preprocessing.",
    placeholder: "Time…\nSpace…\nDominant operation…\nAssumptions behind the bound…",
  },
  {
    id: "vary",
    number: "08",
    title: "Vary and transfer",
    prompt: "Change one assumption. What breaks if the input becomes weighted, online, duplicated, unsorted, memory-limited, or if the requested output changes?",
    placeholder: "Variant…\nWhat survives…\nWhat breaks…\nWhat new state / structure is needed…",
  },
] as const;

type NotebookStepId = (typeof notebookSteps)[number]["id"];
type Confidence = "stuck" | "developing" | "solid";

type NotebookState = {
  version: 1;
  responses: Record<NotebookStepId, string>;
  revealedLens: boolean;
  confidence?: Confidence;
  completedAt?: string;
  updatedAt?: string;
};

const emptyResponses = Object.fromEntries(notebookSteps.map((step) => [step.id, ""])) as Record<NotebookStepId, string>;

function storageKey(exerciseId: string) {
  return `agocode:reasoning-notebook:${exerciseId}`;
}

export function ReasoningNotebook({ exerciseId, lens }: { exerciseId: string; lens: string }) {
  const [state, setState] = useState<NotebookState>({
    version: 1,
    responses: emptyResponses,
    revealedLens: false,
  });
  const [hydrated, setHydrated] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");

  useEffect(() => {
    const hydrationTimer = window.setTimeout(() => {
      try {
        const raw = window.localStorage.getItem(storageKey(exerciseId));
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<NotebookState>;
          setState({
            version: 1,
            responses: { ...emptyResponses, ...(parsed.responses ?? {}) },
            revealedLens: Boolean(parsed.revealedLens),
            confidence: parsed.confidence,
            completedAt: parsed.completedAt,
            updatedAt: parsed.updatedAt,
          });
        }
      } catch {
        // Keep the in-memory notebook usable when storage is unavailable or malformed.
      } finally {
        setHydrated(true);
      }
    }, 0);

    return () => window.clearTimeout(hydrationTimer);
  }, [exerciseId]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(storageKey(exerciseId), JSON.stringify({ ...state, updatedAt: new Date().toISOString() }));
    } catch {
      // The notebook remains functional even if persistence is blocked.
    }
  }, [exerciseId, hydrated, state]);

  const completedSteps = useMemo(
    () => notebookSteps.filter((step) => state.responses[step.id].trim().length >= 12).length,
    [state.responses],
  );
  const completion = Math.round((completedSteps / notebookSteps.length) * 100);
  const lensReady = Boolean(state.responses.baseline.trim() && state.responses.waste.trim());

  useEffect(() => {
    if (!hydrated) return;
    const evidenceTimer = window.setTimeout(() => {
      recordReasoningNotebookEvidence(window.localStorage, REASONING_EVIDENCE_KEY, {
        exerciseId,
        developedStages: completedSteps,
        totalStages: notebookSteps.length,
        lensRevealed: state.revealedLens,
        confidence: state.confidence,
        completedAt: state.completedAt,
      });
    }, 250);

    return () => window.clearTimeout(evidenceTimer);
  }, [completedSteps, exerciseId, hydrated, state.completedAt, state.confidence, state.revealedLens]);

  const updateResponse = (id: NotebookStepId, value: string) => {
    setState((current) => ({
      ...current,
      responses: { ...current.responses, [id]: value },
      completedAt: undefined,
    }));
  };

  const markComplete = () => {
    setState((current) => ({ ...current, completedAt: new Date().toISOString() }));
  };

  const reset = () => {
    if (!window.confirm("Clear this reasoning notebook? This cannot be undone.")) return;
    setState({ version: 1, responses: emptyResponses, revealedLens: false });
    try {
      window.localStorage.removeItem(storageKey(exerciseId));
    } catch {
      // Ignore storage failures; the in-memory state has already reset.
    }
  };

  const copyNotebook = async () => {
    const text = notebookSteps
      .map((step) => `${step.number}. ${step.title}\n${state.responses[step.id].trim() || "—"}`)
      .join("\n\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 1600);
    } catch {
      setCopyState("failed");
    }
  };

  return (
    <div className="reasoning-notebook">
      <div className="reasoning-notebook__status">
        <div>
          <span className="eyebrow">Your reasoning log</span>
          <strong>{completedSteps}/{notebookSteps.length} stages developed</strong>
        </div>
        <div className="reasoning-notebook__meter" aria-label={`${completion}% of reasoning stages developed`}>
          <span style={{ width: `${completion}%` }} />
        </div>
        <span className="mono">{hydrated ? "autosaves locally · contributes bounded mastery evidence" : "loading notebook…"}</span>
      </div>

      <div className="reasoning-notebook__steps">
        {notebookSteps.map((step) => {
          const help = getReasoningStageHelp(step.id);
          return (
            <section className="reasoning-step" key={step.id}>
              <div className="reasoning-step__head">
                <span className="mono">{step.number}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.prompt}</p>
                </div>
              </div>
              <textarea
                aria-label={`${step.title} notes`}
                value={state.responses[step.id]}
                onChange={(event) => updateResponse(step.id, event.target.value)}
                placeholder={step.placeholder}
                rows={5}
              />
              {help ? (
                <details className="reasoning-step__help">
                  <summary>Stuck at this stage?</summary>
                  <div>
                    <span className="mono">FIRST MOVE</span>
                    <p>{help.firstMove}</p>
                    <div className="reasoning-step__help-actions">
                      {help.read ? <Link href={help.read.href}>{help.read.label} →</Link> : null}
                      {help.active ? <Link href={help.active.href}>{help.active.label} →</Link> : null}
                    </div>
                  </div>
                </details>
              ) : null}
            </section>
          );
        })}
      </div>

      <section className={state.revealedLens ? "structural-lens structural-lens--open" : "structural-lens"}>
        <div>
          <span className="eyebrow">Progressive hint · structural lens</span>
          <h3>Ask for the lens only after you have a baseline.</h3>
          <p>
            A useful hint should move your reasoning one level, not replace it. The source books repeatedly develop solutions
            from concrete attempts, baselines, and structure rather than jumping straight to finished code.
          </p>
        </div>
        {state.revealedLens ? (
          <div className="structural-lens__answer">
            <span className="mono">AGO LENS</span>
            <p>{lens}</p>
          </div>
        ) : (
          <button
            className="button"
            type="button"
            disabled={!lensReady}
            onClick={() => setState((current) => ({ ...current, revealedLens: true }))}
          >
            {lensReady ? "Reveal structural lens" : "Write baseline + waste first"}
          </button>
        )}
      </section>

      <section className="reasoning-reflection">
        <div>
          <span className="eyebrow">Self-check</span>
          <h3>How independently could you solve a close variant tomorrow?</h3>
        </div>
        <div className="reasoning-reflection__choices" role="group" aria-label="Confidence">
          {(["stuck", "developing", "solid"] as Confidence[]).map((value) => (
            <button
              className={state.confidence === value ? "button button--selected" : "button"}
              type="button"
              onClick={() => setState((current) => ({ ...current, confidence: value }))}
              key={value}
            >
              {value}
            </button>
          ))}
        </div>
      </section>

      <div className="reasoning-notebook__actions">
        <button className="button" type="button" onClick={copyNotebook}>
          {copyState === "copied" ? "Copied" : copyState === "failed" ? "Copy failed" : "Copy reasoning log"}
        </button>
        <button className="button" type="button" onClick={reset}>Reset</button>
        <button className="button button--primary" type="button" onClick={markComplete} disabled={completedSteps < 6}>
          {state.completedAt ? "Marked complete" : completedSteps < 6 ? "Develop at least 6 stages" : "Mark reasoning complete"}
        </button>
      </div>
    </div>
  );
}
