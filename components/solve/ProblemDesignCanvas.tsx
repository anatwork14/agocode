"use client";

import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "agocode:problem-design-canvas:v1";

const modelOptions = [
  "ordered / searchable data",
  "sequence / string",
  "set / membership",
  "graph / relationships",
  "tree / hierarchy",
  "scheduling / intervals",
  "optimization",
  "stream / online data",
  "geometry",
  "numeric",
] as const;

const paradigmOptions = [
  "sort first",
  "hash / index",
  "heap / priority queue",
  "divide & conquer",
  "recursion / backtracking",
  "dynamic programming",
  "greedy + invariant",
  "graph traversal / path",
  "randomization",
  "approximation / heuristic",
] as const;

type CanvasState = {
  problem: string;
  input: string;
  output: string;
  constraints: string;
  exactness: "" | "exact" | "approximate" | "either";
  scale: string;
  tinyCase: string;
  baseline: string;
  baselineCost: string;
  waste: string;
  models: string[];
  specialCase: string;
  paradigms: string[];
  invariant: string;
  rejectionLog: string;
  candidate: string;
  candidateCost: string;
  variant: string;
};

const emptyState: CanvasState = {
  problem: "",
  input: "",
  output: "",
  constraints: "",
  exactness: "",
  scale: "",
  tinyCase: "",
  baseline: "",
  baselineCost: "",
  waste: "",
  models: [],
  specialCase: "",
  paradigms: [],
  invariant: "",
  rejectionLog: "",
  candidate: "",
  candidateCost: "",
  variant: "",
};

function toggle(list: string[], value: string) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

export function ProblemDesignCanvas() {
  const [state, setState] = useState<CanvasState>(emptyState);
  const [hydrated, setHydrated] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) setState({ ...emptyState, ...(JSON.parse(raw) as Partial<CanvasState>) });
      } catch {
        // Keep the canvas usable if saved data is malformed or storage is unavailable.
      } finally {
        setHydrated(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Persistence is optional; the current session still works.
    }
  }, [hydrated, state]);

  const developed = useMemo(() => {
    const textFields = [state.problem, state.input, state.output, state.tinyCase, state.baseline, state.waste, state.candidate];
    return textFields.filter((value) => value.trim().length >= 12).length;
  }, [state]);

  const setField = <K extends keyof CanvasState>(key: K, value: CanvasState[K]) => {
    setState((current) => ({ ...current, [key]: value }));
  };

  const copyCanvas = async () => {
    const text = [
      ["Problem", state.problem],
      ["Input", state.input],
      ["Output", state.output],
      ["Constraints", state.constraints],
      ["Exactness", state.exactness],
      ["Scale", state.scale],
      ["Tiny case", state.tinyCase],
      ["Baseline", state.baseline],
      ["Baseline cost", state.baselineCost],
      ["Named waste", state.waste],
      ["Possible models", state.models.join(", ")],
      ["Special case", state.specialCase],
      ["Candidate paradigms", state.paradigms.join(", ")],
      ["Invariant / proof obligation", state.invariant],
      ["Rejected approaches", state.rejectionLog],
      ["Candidate design", state.candidate],
      ["Candidate cost", state.candidateCost],
      ["Variant", state.variant],
    ].map(([label, value]) => `${label}\n${value || "—"}`).join("\n\n");

    try {
      await navigator.clipboard.writeText(text);
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 1600);
    } catch {
      setCopyState("failed");
    }
  };

  const clearCanvas = () => {
    if (!window.confirm("Clear the current design canvas?")) return;
    setState(emptyState);
    try { window.localStorage.removeItem(STORAGE_KEY); } catch { /* optional persistence */ }
  };

  return (
    <div className="design-canvas">
      <div className="design-canvas__status">
        <span className="eyebrow">Working design log</span>
        <strong>{developed}/7 core fields developed</strong>
        <span className="mono">{hydrated ? "autosaves locally" : "loading…"}</span>
      </div>

      <section className="design-canvas__section">
        <div className="design-canvas__prompt">
          <span className="design-canvas__number">01</span>
          <div><h2>Do I really understand the problem?</h2><p>Strip away the story. State what comes in, what must come out, and what makes one answer correct.</p></div>
        </div>
        <label className="design-field design-field--wide"><span>Problem in one sentence</span><textarea rows={3} value={state.problem} onChange={(e) => setField("problem", e.target.value)} placeholder="Given…, produce… such that…" /></label>
        <div className="design-canvas__two">
          <label className="design-field"><span>Input</span><textarea rows={4} value={state.input} onChange={(e) => setField("input", e.target.value)} /></label>
          <label className="design-field"><span>Output / objective</span><textarea rows={4} value={state.output} onChange={(e) => setField("output", e.target.value)} /></label>
        </div>
        <div className="design-canvas__two">
          <label className="design-field"><span>Constraints / assumptions</span><textarea rows={4} value={state.constraints} onChange={(e) => setField("constraints", e.target.value)} placeholder="sorted? unique? weighted? online? memory bound?" /></label>
          <label className="design-field"><span>Realistic scale and latency</span><textarea rows={4} value={state.scale} onChange={(e) => setField("scale", e.target.value)} placeholder="10 items? 10^6? one query or many? milliseconds or batch?" /></label>
        </div>
        <div className="design-choice">
          <span>Does the answer have to be exact?</span>
          <div>{(["exact", "approximate", "either"] as const).map((value) => <button type="button" className={state.exactness === value ? "button button--selected" : "button"} onClick={() => setField("exactness", value)} key={value}>{value}</button>)}</div>
        </div>
      </section>

      <section className="design-canvas__section">
        <div className="design-canvas__prompt">
          <span className="design-canvas__number">02</span>
          <div><h2>What happens on a case small enough to solve by hand?</h2><p>Record the decisions you make manually. Those decisions often expose the state an algorithm must preserve.</p></div>
        </div>
        <label className="design-field design-field--wide"><span>Tiny + extreme example</span><textarea rows={6} value={state.tinyCase} onChange={(e) => setField("tinyCase", e.target.value)} placeholder="Example input…\nManual steps…\nExtreme / adversarial case…" /></label>
      </section>

      <section className="design-canvas__section">
        <div className="design-canvas__prompt">
          <span className="design-canvas__number">03</span>
          <div><h2>What is the simplest obviously correct baseline?</h2><p>Do not optimize before you have a reference algorithm and a reason it is correct.</p></div>
        </div>
        <div className="design-canvas__two">
          <label className="design-field"><span>Baseline</span><textarea rows={5} value={state.baseline} onChange={(e) => setField("baseline", e.target.value)} /></label>
          <label className="design-field"><span>Time / space</span><textarea rows={5} value={state.baselineCost} onChange={(e) => setField("baselineCost", e.target.value)} placeholder="Time…\nSpace…\nDominant operation…" /></label>
        </div>
        <label className="design-field design-field--wide"><span>Name the waste</span><textarea rows={4} value={state.waste} onChange={(e) => setField("waste", e.target.value)} placeholder="The baseline repeatedly rescans / recomputes / enumerates…" /></label>
      </section>

      <section className="design-canvas__section">
        <div className="design-canvas__prompt">
          <span className="design-canvas__number">04</span>
          <div><h2>Can I model the problem in a more useful language?</h2><p>Choose several plausible formulations before committing to a technique. Strategy comes before representation details.</p></div>
        </div>
        <div className="design-pills" role="group" aria-label="Possible problem models">
          {modelOptions.map((option) => <button type="button" className={state.models.includes(option) ? "design-pill design-pill--active" : "design-pill"} onClick={() => setField("models", toggle(state.models, option))} key={option}>{option}</button>)}
        </div>
        <label className="design-field design-field--wide"><span>Special case ladder</span><textarea rows={4} value={state.specialCase} onChange={(e) => setField("specialCase", e.target.value)} placeholder="If this parameter were 0/1, if weights were equal, if input were sorted… what becomes easy?" /></label>
      </section>

      <section className="design-canvas__section">
        <div className="design-canvas__prompt">
          <span className="design-canvas__number">05</span>
          <div><h2>Which design paradigms deserve a trial?</h2><p>These are candidates, not answers. Select more than one and reject weak options with an explicit reason.</p></div>
        </div>
        <div className="design-pills" role="group" aria-label="Candidate design paradigms">
          {paradigmOptions.map((option) => <button type="button" className={state.paradigms.includes(option) ? "design-pill design-pill--active" : "design-pill"} onClick={() => setField("paradigms", toggle(state.paradigms, option))} key={option}>{option}</button>)}
        </div>
        <div className="design-canvas__two">
          <label className="design-field"><span>Invariant / proof obligation</span><textarea rows={5} value={state.invariant} onChange={(e) => setField("invariant", e.target.value)} placeholder="After every step, … remains true because…" /></label>
          <label className="design-field"><span>“No, because…” log</span><textarea rows={5} value={state.rejectionLog} onChange={(e) => setField("rejectionLog", e.target.value)} placeholder="I rejected … because …\nI rejected … because …" /></label>
        </div>
      </section>

      <section className="design-canvas__section">
        <div className="design-canvas__prompt">
          <span className="design-canvas__number">06</span>
          <div><h2>Commit to a candidate and try to break it.</h2><p>Write the design before code. Analyze it under the real constraints, then change one assumption to test transfer.</p></div>
        </div>
        <label className="design-field design-field--wide"><span>Candidate algorithm / data structure</span><textarea rows={6} value={state.candidate} onChange={(e) => setField("candidate", e.target.value)} /></label>
        <div className="design-canvas__two">
          <label className="design-field"><span>Candidate cost + assumptions</span><textarea rows={5} value={state.candidateCost} onChange={(e) => setField("candidateCost", e.target.value)} /></label>
          <label className="design-field"><span>Variant: change one assumption</span><textarea rows={5} value={state.variant} onChange={(e) => setField("variant", e.target.value)} placeholder="If … changes, what breaks and what must change?" /></label>
        </div>
      </section>

      <div className="design-canvas__actions">
        <button className="button" type="button" onClick={copyCanvas}>{copyState === "copied" ? "Copied" : copyState === "failed" ? "Copy failed" : "Copy design log"}</button>
        <button className="button" type="button" onClick={clearCanvas}>Clear canvas</button>
      </div>
    </div>
  );
}
