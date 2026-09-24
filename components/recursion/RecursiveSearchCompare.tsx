"use client";

import { useState } from "react";

const tree = [
  { id: "root", label: "project/", depth: 0, kind: "folder" },
  { id: "docs", label: "docs/", depth: 1, kind: "folder" },
  { id: "draft", label: "drafts/", depth: 2, kind: "folder" },
  { id: "notes", label: "notes.txt", depth: 3, kind: "file" },
  { id: "src", label: "src/", depth: 1, kind: "folder" },
  { id: "target", label: "answer.py", depth: 2, kind: "target" },
] as const;

export function RecursiveSearchCompare() {
  const [mode, setMode] = useState<"explicit" | "recursive">("explicit");

  return (
    <div className="recursion-compare">
      <div className="structure-lab__controls" aria-label="Choose nested-search strategy">
        <button className={`button ${mode === "explicit" ? "button--primary" : ""}`} type="button" onClick={() => setMode("explicit")}>
          Explicit work stack
        </button>
        <button className={`button ${mode === "recursive" ? "button--primary" : ""}`} type="button" onClick={() => setMode("recursive")}>
          Recursive calls
        </button>
      </div>

      <div className="recursion-compare__grid">
        <section>
          <div className="eyebrow">Nested data</div>
          <div className="folder-tree" aria-label="Nested folders containing a target file">
            {tree.map((item) => (
              <div
                className={`folder-tree__row ${item.kind === "target" ? "folder-tree__row--target" : ""}`}
                style={{ paddingLeft: `${item.depth * 22 + 10}px` }}
                key={item.id}
              >
                <span aria-hidden="true">{item.kind === "folder" ? "▸" : item.kind === "target" ? "◆" : "·"}</span>
                <strong>{item.label}</strong>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="eyebrow">{mode === "explicit" ? "You manage pending work" : "The call stack manages pending work"}</div>
          {mode === "explicit" ? (
            <div className="work-stack" aria-label="Explicit stack of folders to visit">
              <div><span className="mono">top</span><strong>src/</strong></div>
              <div><span className="mono">next</span><strong>drafts/</strong></div>
              <div><span className="mono">next</span><strong>docs/</strong></div>
            </div>
          ) : (
            <div className="call-stack-mini" aria-label="Recursive calls currently active">
              <div><span className="mono">search(src/)</span><strong>active</strong></div>
              <div><span className="mono">search(project/)</span><strong>paused</strong></div>
            </div>
          )}
          <p>
            {mode === "explicit"
              ? "The loop needs an explicit collection of folders that still need inspection. You push newly discovered folders into that work list."
              : "Each recursive call receives one smaller subproblem. The caller pauses while the child call searches deeper, and the runtime preserves the caller's state."}
          </p>
        </section>
      </div>
    </div>
  );
}
