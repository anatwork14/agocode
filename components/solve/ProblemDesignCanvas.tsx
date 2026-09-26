"use client";

import { useEffect, useMemo, useState } from "react";
import {
  buildDesignSessionMarkdown,
  createDesignSession,
  emptyDesignCanvasState,
  readDesignSessions,
  readLegacyDesignCanvas,
  writeDesignSessions,
  type DesignCanvasState,
  type DesignRejection,
  type DesignSession,
  type DesignTestCase,
} from "@/lib/learning/design-sessions";

const modelOptions = [
  "ordered / searchable data", "sequence / string", "set / membership", "graph / relationships", "tree / hierarchy",
  "scheduling / intervals", "optimization", "stream / online data", "geometry", "numeric",
] as const;

const paradigmOptions = [
  "sort first", "hash / index", "heap / priority queue", "divide & conquer", "recursion / backtracking",
  "dynamic programming", "greedy + invariant", "graph traversal / path", "randomization", "approximation / heuristic",
] as const;

function toggle(list: string[], value: string) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

function makeId(prefix: string) {
  const random = typeof window !== "undefined" && window.crypto?.randomUUID
    ? window.crypto.randomUUID()
    : Math.random().toString(36).slice(2);
  return `${prefix}-${random}`;
}

function safeFilename(value: string) {
  const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `${slug || "agocode-design"}.md`;
}

export function ProblemDesignCanvas() {
  const [sessions, setSessions] = useState<DesignSession[]>([]);
  const [activeId, setActiveId] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      let existing = readDesignSessions(window.localStorage);
      if (!existing.length) {
        const legacy = readLegacyDesignCanvas(window.localStorage);
        const first = createDesignSession(
          makeId("design"),
          legacy ? "Migrated design session" : "Untitled design 1",
          new Date().toISOString(),
          legacy ?? emptyDesignCanvasState(),
        );
        existing = [first];
        writeDesignSessions(window.localStorage, existing);
      }
      setSessions(existing);
      setActiveId(existing[0]?.id ?? "");
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hydrated || !sessions.length) return;
    const timer = window.setTimeout(() => {
      try { writeDesignSessions(window.localStorage, sessions); } catch { /* current session remains usable */ }
    }, 180);
    return () => window.clearTimeout(timer);
  }, [hydrated, sessions]);

  const active = useMemo(
    () => sessions.find((session) => session.id === activeId) ?? sessions[0],
    [activeId, sessions],
  );
  const state = active?.state ?? emptyDesignCanvasState();

  const developed = useMemo(() => {
    const values = [state.problem, state.input, state.output, state.tinyCase, state.baseline, state.waste, state.candidate];
    return values.filter((value) => value.trim().length >= 12).length;
  }, [state]);

  const updateActive = (update: (session: DesignSession) => DesignSession) => {
    if (!active) return;
    const updatedAt = new Date().toISOString();
    setSessions((current) => current.map((session) => session.id === active.id
      ? { ...update(session), updatedAt }
      : session));
  };

  const setField = <K extends keyof DesignCanvasState>(key: K, value: DesignCanvasState[K]) => {
    updateActive((session) => ({ ...session, state: { ...session.state, [key]: value } }));
  };

  const createNewSession = () => {
    const next = createDesignSession(makeId("design"), `Untitled design ${sessions.length + 1}`);
    setSessions((current) => [next, ...current]);
    setActiveId(next.id);
  };

  const duplicateSession = () => {
    if (!active) return;
    const next = createDesignSession(makeId("design"), `${active.name} copy`, new Date().toISOString(), active.state);
    setSessions((current) => [next, ...current]);
    setActiveId(next.id);
  };

  const deleteSession = () => {
    if (!active) return;
    if (sessions.length === 1) {
      if (!window.confirm("Clear this design session?")) return;
      const replacement = createDesignSession(active.id, "Untitled design 1");
      setSessions([replacement]);
      return;
    }
    if (!window.confirm(`Delete “${active.name}”?`)) return;
    const next = sessions.filter((session) => session.id !== active.id);
    setSessions(next);
    setActiveId(next[0]?.id ?? "");
  };

  const copyMarkdown = async () => {
    if (!active) return;
    try {
      await navigator.clipboard.writeText(buildDesignSessionMarkdown(active));
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 1600);
    } catch {
      setCopyState("failed");
    }
  };

  const exportMarkdown = () => {
    if (!active) return;
    const blob = new Blob([buildDesignSessionMarkdown(active)], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = safeFilename(active.name);
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  const addRejection = () => setField("rejections", [
    ...state.rejections,
    { id: makeId("rejection"), approach: "", because: "", wouldWorkIf: "" },
  ]);
  const updateRejection = (id: string, patch: Partial<DesignRejection>) => setField(
    "rejections",
    state.rejections.map((item) => item.id === id ? { ...item, ...patch } : item),
  );
  const removeRejection = (id: string) => setField("rejections", state.rejections.filter((item) => item.id !== id));

  const addTest = () => setField("tests", [
    ...state.tests,
    { id: makeId("test"), input: "", expected: "", notes: "" },
  ]);
  const updateTest = (id: string, patch: Partial<DesignTestCase>) => setField(
    "tests",
    state.tests.map((item) => item.id === id ? { ...item, ...patch } : item),
  );
  const removeTest = (id: string) => setField("tests", state.tests.filter((item) => item.id !== id));

  if (!active) return <div className="design-canvas">Loading design workspace…</div>;

  return (
    <div className="design-canvas">
      <section className="design-session-bar" aria-label="Saved design sessions">
        <div className="design-session-bar__identity">
          <span className="eyebrow">Named design session</span>
          <input
            aria-label="Design session name"
            value={active.name}
            onChange={(event) => updateActive((session) => ({ ...session, name: event.target.value }))}
          />
        </div>
        <label className="design-session-bar__switcher">
          <span>Switch session</span>
          <select value={active.id} onChange={(event) => setActiveId(event.target.value)}>
            {sessions.map((session) => <option value={session.id} key={session.id}>{session.name}</option>)}
          </select>
        </label>
        <div className="design-session-bar__actions">
          <button className="button" type="button" onClick={createNewSession}>New</button>
          <button className="button" type="button" onClick={duplicateSession}>Duplicate</button>
          <button className="button" type="button" onClick={deleteSession}>Delete</button>
        </div>
      </section>

      <div className="design-canvas__status">
        <span className="eyebrow">Working design log</span>
        <strong>{developed}/7 core fields developed</strong>
        <span className="mono">{hydrated ? `${sessions.length} saved locally · autosave on` : "loading…"}</span>
      </div>

      <section className="design-canvas__section">
        <div className="design-canvas__prompt"><span className="design-canvas__number">01</span><div><h2>Do I really understand the problem?</h2><p>Strip away the story. State what comes in, what must come out, and what makes one answer correct.</p></div></div>
        <label className="design-field design-field--wide"><span>Problem in one sentence</span><textarea rows={3} value={state.problem} onChange={(e) => setField("problem", e.target.value)} placeholder="Given…, produce… such that…" /></label>
        <div className="design-canvas__two">
          <label className="design-field"><span>Input</span><textarea rows={4} value={state.input} onChange={(e) => setField("input", e.target.value)} /></label>
          <label className="design-field"><span>Output / objective</span><textarea rows={4} value={state.output} onChange={(e) => setField("output", e.target.value)} /></label>
        </div>
        <div className="design-canvas__two">
          <label className="design-field"><span>Constraints / assumptions</span><textarea rows={4} value={state.constraints} onChange={(e) => setField("constraints", e.target.value)} placeholder="sorted? unique? weighted? online? memory bound?" /></label>
          <label className="design-field"><span>Realistic scale and latency</span><textarea rows={4} value={state.scale} onChange={(e) => setField("scale", e.target.value)} placeholder="10 items? 10^6? one query or many? milliseconds or batch?" /></label>
        </div>
        <div className="design-choice"><span>Does the answer have to be exact?</span><div>{(["exact", "approximate", "either"] as const).map((value) => <button type="button" className={state.exactness === value ? "button button--selected" : "button"} onClick={() => setField("exactness", value)} key={value}>{value}</button>)}</div></div>
      </section>

      <section className="design-canvas__section">
        <div className="design-canvas__prompt"><span className="design-canvas__number">02</span><div><h2>What happens on a case small enough to solve by hand?</h2><p>Record the decisions you make manually. Those decisions often expose the state an algorithm must preserve.</p></div></div>
        <label className="design-field design-field--wide"><span>Tiny + extreme example</span><textarea rows={6} value={state.tinyCase} onChange={(e) => setField("tinyCase", e.target.value)} placeholder="Example input…\nManual steps…\nExtreme / adversarial case…" /></label>
      </section>

      <section className="design-canvas__section">
        <div className="design-canvas__prompt"><span className="design-canvas__number">03</span><div><h2>What is the simplest obviously correct baseline?</h2><p>Do not optimize before you have a reference algorithm and a reason it is correct.</p></div></div>
        <div className="design-canvas__two">
          <label className="design-field"><span>Baseline</span><textarea rows={5} value={state.baseline} onChange={(e) => setField("baseline", e.target.value)} /></label>
          <label className="design-field"><span>Time / space</span><textarea rows={5} value={state.baselineCost} onChange={(e) => setField("baselineCost", e.target.value)} placeholder="Time…\nSpace…\nDominant operation…" /></label>
        </div>
        <label className="design-field design-field--wide"><span>Name the waste</span><textarea rows={4} value={state.waste} onChange={(e) => setField("waste", e.target.value)} placeholder="The baseline repeatedly rescans / recomputes / enumerates…" /></label>
      </section>

      <section className="design-canvas__section">
        <div className="design-canvas__prompt"><span className="design-canvas__number">04</span><div><h2>Can I model the problem in a more useful language?</h2><p>Choose several plausible formulations before committing to a technique. Strategy comes before representation details.</p></div></div>
        <div className="design-pills" role="group" aria-label="Possible problem models">{modelOptions.map((option) => <button type="button" className={state.models.includes(option) ? "design-pill design-pill--active" : "design-pill"} onClick={() => setField("models", toggle(state.models, option))} key={option}>{option}</button>)}</div>
        <label className="design-field design-field--wide"><span>Special case ladder</span><textarea rows={4} value={state.specialCase} onChange={(e) => setField("specialCase", e.target.value)} placeholder="If this parameter were 0/1, if weights were equal, if input were sorted… what becomes easy?" /></label>
      </section>

      <section className="design-canvas__section">
        <div className="design-canvas__prompt"><span className="design-canvas__number">05</span><div><h2>Which design paradigms deserve a trial?</h2><p>These are candidates, not answers. Select more than one and reject weak options with an explicit reason.</p></div></div>
        <div className="design-pills" role="group" aria-label="Candidate design paradigms">{paradigmOptions.map((option) => <button type="button" className={state.paradigms.includes(option) ? "design-pill design-pill--active" : "design-pill"} onClick={() => setField("paradigms", toggle(state.paradigms, option))} key={option}>{option}</button>)}</div>
        <label className="design-field design-field--wide"><span>Invariant / proof obligation</span><textarea rows={5} value={state.invariant} onChange={(e) => setField("invariant", e.target.value)} placeholder="After every step, … remains true because…" /></label>

        <div className="structured-log">
          <div className="structured-log__head"><div><span className="eyebrow">Rejected approaches</span><h3>Preserve why an idea failed.</h3></div><button className="button" type="button" onClick={addRejection}>Add rejection</button></div>
          {state.rejections.length ? state.rejections.map((item, index) => (
            <div className="structured-log__row" key={item.id}>
              <span className="mono">NO {String(index + 1).padStart(2, "0")}</span>
              <input aria-label={`Rejected approach ${index + 1}`} value={item.approach} onChange={(e) => updateRejection(item.id, { approach: e.target.value })} placeholder="Approach or model" />
              <input aria-label={`Reason rejected ${index + 1}`} value={item.because} onChange={(e) => updateRejection(item.id, { because: e.target.value })} placeholder="Rejected because…" />
              <input aria-label={`When rejected approach could work ${index + 1}`} value={item.wouldWorkIf} onChange={(e) => updateRejection(item.id, { wouldWorkIf: e.target.value })} placeholder="Could work if…" />
              <button className="button button--quiet" type="button" onClick={() => removeRejection(item.id)}>Remove</button>
            </div>
          )) : <p className="structured-log__empty">No structured rejection recorded yet. Keep failed reasoning when it teaches a reusable boundary.</p>}
          {state.rejectionLog ? <label className="design-field"><span>Legacy free-text rejection notes</span><textarea rows={3} value={state.rejectionLog} onChange={(e) => setField("rejectionLog", e.target.value)} /></label> : null}
        </div>
      </section>

      <section className="design-canvas__section">
        <div className="design-canvas__prompt"><span className="design-canvas__number">06</span><div><h2>Commit to a candidate and try to break it.</h2><p>Write the design before code. Analyze it under the real constraints, then change one assumption to test transfer.</p></div></div>
        <label className="design-field design-field--wide"><span>Candidate algorithm / data structure</span><textarea rows={6} value={state.candidate} onChange={(e) => setField("candidate", e.target.value)} /></label>
        <div className="design-canvas__two">
          <label className="design-field"><span>Candidate cost + assumptions</span><textarea rows={5} value={state.candidateCost} onChange={(e) => setField("candidateCost", e.target.value)} /></label>
          <label className="design-field"><span>Variant: change one assumption</span><textarea rows={5} value={state.variant} onChange={(e) => setField("variant", e.target.value)} placeholder="If … changes, what breaks and what must change?" /></label>
        </div>
      </section>

      <section className="design-canvas__section">
        <div className="design-canvas__prompt"><span className="design-canvas__number">07</span><div><h2>Build a small test-case scratchpad.</h2><p>Write boundary, ordinary, adversarial, and invariant-breaking cases before implementation. Tests are design probes, not only code checks.</p></div></div>
        <div className="structured-log">
          <div className="structured-log__head"><div><span className="eyebrow">Test cases</span><h3>{state.tests.length} design probe{state.tests.length === 1 ? "" : "s"}</h3></div><button className="button" type="button" onClick={addTest}>Add test case</button></div>
          {state.tests.length ? state.tests.map((item, index) => (
            <div className="test-scratch-row" key={item.id}>
              <span className="mono">T{String(index + 1).padStart(2, "0")}</span>
              <textarea aria-label={`Test input ${index + 1}`} rows={3} value={item.input} onChange={(e) => updateTest(item.id, { input: e.target.value })} placeholder="Input / setup" />
              <textarea aria-label={`Expected result ${index + 1}`} rows={3} value={item.expected} onChange={(e) => updateTest(item.id, { expected: e.target.value })} placeholder="Expected result / property" />
              <textarea aria-label={`Test notes ${index + 1}`} rows={3} value={item.notes} onChange={(e) => updateTest(item.id, { notes: e.target.value })} placeholder="Why this case matters" />
              <button className="button button--quiet" type="button" onClick={() => removeTest(item.id)}>Remove</button>
            </div>
          )) : <p className="structured-log__empty">No tests yet. Start with the smallest valid case and one adversarial case.</p>}
        </div>
      </section>

      <div className="design-canvas__actions">
        <button className="button" type="button" onClick={copyMarkdown}>{copyState === "copied" ? "Markdown copied" : copyState === "failed" ? "Copy failed" : "Copy Markdown"}</button>
        <button className="button button--primary" type="button" onClick={exportMarkdown}>Export .md</button>
      </div>
    </div>
  );
}
