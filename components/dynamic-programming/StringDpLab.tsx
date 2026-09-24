"use client";

import { useState } from "react";
import { buildSequenceGrid, type SequenceDpMode } from "@/lib/algorithms/dynamicProgramming";

const wordA = "plane";
const wordB = "panel";

function sourceLabel(source: "diagonal" | "up" | "left" | "reset") {
  if (source === "diagonal") return "↖ +1";
  if (source === "up") return "↑";
  if (source === "left") return "←";
  return "0";
}

export function StringDpLab() {
  const [mode, setMode] = useState<SequenceDpMode>("substring");
  const [step, setStep] = useState(0);
  const result = buildSequenceGrid(wordA, wordB, mode);
  const total = wordA.length * wordB.length;
  const currentRow = step < total ? Math.floor(step / wordB.length) : null;
  const currentColumn = step < total ? step % wordB.length : null;
  const finished = step === total;

  function switchMode(nextMode: SequenceDpMode) {
    setMode(nextMode);
    setStep(0);
  }

  return (
    <div className="dp-string-lab">
      <div className="dp-lab__header">
        <div>
          <div className="eyebrow">Sequence grid</div>
          <h3>Same grid shape, different mismatch rule.</h3>
        </div>
        <span className="mono">{mode === "substring" ? "contiguous" : "ordered"}</span>
      </div>

      <div className="dp-mode-switch" role="group" aria-label="Sequence dynamic programming mode">
        <button className={`button ${mode === "substring" ? "button--primary" : ""}`} type="button" onClick={() => switchMode("substring")}>Longest common substring</button>
        <button className={`button ${mode === "subsequence" ? "button--primary" : ""}`} type="button" onClick={() => switchMode("subsequence")}>Longest common subsequence</button>
      </div>

      <div className="dp-string-formula">
        <div><span>letters match</span><strong className="mono">diagonal + 1</strong></div>
        <div><span>letters differ</span><strong className="mono">{mode === "substring" ? "reset to 0" : "max(up, left)"}</strong></div>
      </div>

      <div className="sequence-grid-wrap">
        <div className="sequence-grid" style={{ gridTemplateColumns: `44px repeat(${wordB.length}, minmax(48px, 1fr))` }} role="table" aria-label={`${mode} grid for ${wordA} and ${wordB}`}>
          <div className="sequence-grid__corner" />
          {[...wordB].map((letter, column) => <div className={currentColumn === column ? "sequence-grid__letter sequence-grid__letter--current" : "sequence-grid__letter"} role="columnheader" key={`b-${column}`}>{letter}</div>)}
          {[...wordA].map((letter, row) => [
            <div className={currentRow === row ? "sequence-grid__letter sequence-grid__letter--current" : "sequence-grid__letter"} role="rowheader" key={`a-${row}`}>{letter}</div>,
            ...result.grid[row].map((cell, column) => {
              const index = row * wordB.length + column;
              const revealed = index < step;
              const current = index === step;
              const isBest = revealed && result.bestCell?.row === row && result.bestCell?.column === column;
              return (
                <div className={`sequence-grid__cell ${revealed ? "sequence-grid__cell--revealed" : ""} ${current ? "sequence-grid__cell--current" : ""} ${isBest ? "sequence-grid__cell--best" : ""}`} role="cell" key={`${row}-${column}`}>
                  <strong className="mono">{revealed ? cell.value : "?"}</strong>
                  {revealed ? <small className="mono">{sourceLabel(cell.source)}</small> : null}
                </div>
              );
            }),
          ])}
        </div>
      </div>

      <div className="trace-note" aria-live="polite">
        <strong>{finished ? "Result:" : "Cell rule:"}</strong>{" "}
        {finished
          ? mode === "substring"
            ? `The largest cell can be anywhere in the grid. Here the longest contiguous match is “${result.bestValue}” with length ${result.bestLength}.`
            : `The bottom-right cell summarizes the full prefixes. One longest ordered subsequence is “${result.bestValue}” with length ${result.bestLength}.`
          : currentRow !== null && currentColumn !== null
            ? wordA[currentRow] === wordB[currentColumn]
              ? `${wordA[currentRow]} matches ${wordB[currentColumn]}, so extend the diagonal subproblem by one.`
              : mode === "substring"
                ? `${wordA[currentRow]} and ${wordB[currentColumn]} differ, so a contiguous match cannot continue through this cell; reset it to 0.`
                : `${wordA[currentRow]} and ${wordB[currentColumn]} differ, so preserve the better ordered subsequence from above or left.`
            : "Compare prefixes, not the whole words at once."}
      </div>

      <div className="lab-toolbar">
        <button className="button" type="button" onClick={() => setStep((value) => Math.max(0, value - 1))} disabled={step === 0}>← Back</button>
        <button className="button button--primary" type="button" onClick={() => setStep((value) => Math.min(total, value + 1))} disabled={finished}>{finished ? "Grid complete" : "Fill next cell →"}</button>
        <button className="button button--quiet" type="button" onClick={() => setStep(0)}>Reset</button>
      </div>
    </div>
  );
}
