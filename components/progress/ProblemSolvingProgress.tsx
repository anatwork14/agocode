"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const NOTEBOOK_PREFIX = "agocode:reasoning-notebook:";
const CANVAS_KEY = "agocode:problem-design-canvas:v1";

const notebookFields = ["understand", "examples", "baseline", "waste", "strategy", "invariant", "analyze", "vary"] as const;

type NotebookSummary = {
  id: string;
  developed: number;
  completed: boolean;
  confidence?: "stuck" | "developing" | "solid";
  updatedAt?: string;
};

type DesignCanvasSummary = {
  developed: number;
  hasBaseline: boolean;
  hasModel: boolean;
  hasCandidate: boolean;
};

type SourcePracticeSnapshot = {
  notebooks: NotebookSummary[];
  canvas: DesignCanvasSummary | null;
};

function textDeveloped(value: unknown) {
  return typeof value === "string" && value.trim().length >= 12;
}

function collectSourcePractice(): SourcePracticeSnapshot {
  const notebooks: NotebookSummary[] = [];

  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (!key?.startsWith(NOTEBOOK_PREFIX)) continue;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw) as {
        responses?: Record<string, unknown>;
        completedAt?: unknown;
        confidence?: unknown;
        updatedAt?: unknown;
      };
      const responses = parsed.responses ?? {};
      const developed = notebookFields.filter((field) => textDeveloped(responses[field])).length;
      notebooks.push({
        id: key.slice(NOTEBOOK_PREFIX.length),
        developed,
        completed: typeof parsed.completedAt === "string",
        confidence: parsed.confidence === "stuck" || parsed.confidence === "developing" || parsed.confidence === "solid"
          ? parsed.confidence
          : undefined,
        updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : undefined,
      });
    } catch {
      // Ignore malformed local records rather than breaking the progress page.
    }
  }

  notebooks.sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""));

  let canvas: DesignCanvasSummary | null = null;
  try {
    const raw = localStorage.getItem(CANVAS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      const coreFields = ["problem", "input", "output", "tinyCase", "baseline", "waste", "candidate"];
      canvas = {
        developed: coreFields.filter((field) => textDeveloped(parsed[field])).length,
        hasBaseline: textDeveloped(parsed.baseline),
        hasModel: Array.isArray(parsed.models) && parsed.models.length > 0,
        hasCandidate: textDeveloped(parsed.candidate),
      };
    }
  } catch {
    canvas = null;
  }

  return { notebooks, canvas };
}

export function ProblemSolvingProgress() {
  const [snapshot, setSnapshot] = useState<SourcePracticeSnapshot | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setSnapshot(collectSourcePractice()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const summary = useMemo(() => {
    if (!snapshot) return null;
    const completed = snapshot.notebooks.filter((item) => item.completed).length;
    const solid = snapshot.notebooks.filter((item) => item.confidence === "solid").length;
    const developedStages = snapshot.notebooks.reduce((sum, item) => sum + item.developed, 0);
    const totalStages = snapshot.notebooks.length * notebookFields.length;
    return { completed, solid, developedStages, totalStages };
  }, [snapshot]);

  if (!snapshot || !summary) return <div className="progress-loading">Reading problem-solving notebooks…</div>;

  return (
    <section className="source-practice-progress">
      <div className="section-heading">
        <div className="section-heading__index">DESIGN EVIDENCE</div>
        <div>
          <h2>Track the reasoning that happens before code.</h2>
          <p>
            The expanded source practice records modeling, baselines, rejected ideas, invariants, complexity, and variants separately
            from code-test completion. These are design artifacts, not automatic mastery claims.
          </p>
        </div>
      </div>

      <div className="source-practice-progress__metrics">
        <div><span>Notebooks started</span><strong>{snapshot.notebooks.length}</strong><small>canonical or source-workbook problems</small></div>
        <div><span>Reasoning complete</span><strong>{summary.completed}</strong><small>manually marked after substantial development</small></div>
        <div><span>Stages developed</span><strong>{summary.developedStages}/{summary.totalStages || 0}</strong><small>eight reasoning stages per notebook</small></div>
        <div><span>Self-rated solid</span><strong>{summary.solid}</strong><small>confidence only; not treated as proof</small></div>
      </div>

      <div className="source-practice-progress__grid">
        <div className="source-practice-progress__canvas">
          <span className="eyebrow">Open problem canvas</span>
          <h3>{snapshot.canvas ? `${snapshot.canvas.developed}/7 core fields developed` : "No open-ended design yet"}</h3>
          <p>
            {snapshot.canvas
              ? [snapshot.canvas.hasBaseline ? "baseline" : null, snapshot.canvas.hasModel ? "model" : null, snapshot.canvas.hasCandidate ? "candidate" : null].filter(Boolean).join(" · ") || "Start by clarifying the problem and a tiny case."
              : "Use the canvas for a problem that is not already in the AgoCode atlas."}
          </p>
          <Link className="button" href="/solve">Open design workspace →</Link>
        </div>

        <div className="source-practice-progress__recent">
          <div className="source-practice-progress__recent-head">
            <span className="eyebrow">Recent notebooks</span>
            <Link href="/exercises">Problem Atlas →</Link>
          </div>
          {snapshot.notebooks.length ? (
            <div>
              {snapshot.notebooks.slice(0, 5).map((item) => (
                <Link href={`/exercises/${item.id}`} className="source-practice-progress__row" key={item.id}>
                  <span className="mono">{item.developed}/8</span>
                  <strong>{item.id.replaceAll("-", " ")}</strong>
                  <span>{item.completed ? "complete" : item.confidence ?? "working"}</span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="source-practice-progress__empty">No reasoning notebook has been started in this browser yet.</p>
          )}
        </div>
      </div>
    </section>
  );
}
