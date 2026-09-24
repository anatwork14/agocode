"use client";

import { useState } from "react";

const addresses = ["0xA0", "0xA1", "0xA2", "0xA3", "0xA4", "0xA5", "0xA6", "0xA7", "0xA8", "0xA9", "0xAA", "0xAB"];

function slotLabel(index: number, phase: number) {
  if (index === 4) return "other app";
  if (phase === 0 && index === 8) return "notebook";
  if (phase === 1 && index >= 1 && index <= 3) return `todo ${index}`;
  if (phase === 2 && index >= 6 && index <= 9) return `todo ${index - 5}`;
  return "empty";
}

export function MemoryDrawerLab() {
  const [phase, setPhase] = useState(0);

  const message = phase === 0
    ? "One value needs one free slot. The address tells the program where that value lives."
    : phase === 1
      ? "An array reserves neighboring slots. Three todos fit together, but the next slot is already occupied."
      : "To keep four array items contiguous, the whole group moves to a larger free region. The values stay the same; their addresses change.";

  return (
    <div className="memory-lab">
      <div className="memory-lab__header">
        <div>
          <div className="eyebrow">Memory model</div>
          <h3>Think in addressed slots before thinking in data structures.</h3>
        </div>
        <span className="mono">scene {phase + 1}/3</span>
      </div>

      <div className="memory-grid" aria-label="Illustrated computer memory slots">
        {addresses.map((address, index) => {
          const label = slotLabel(index, phase);
          const occupied = label !== "empty";
          const foreign = label === "other app";
          return (
            <div
              className={`memory-slot ${occupied ? "memory-slot--occupied" : ""} ${foreign ? "memory-slot--foreign" : ""}`}
              key={address}
            >
              <span className="memory-slot__address mono">{address}</span>
              <strong>{label}</strong>
            </div>
          );
        })}
      </div>

      <p className="memory-lab__message">{message}</p>

      <div className="lab-toolbar">
        <button className="button" type="button" onClick={() => setPhase((value) => Math.max(0, value - 1))} disabled={phase === 0}>
          ← Back
        </button>
        <button className="button button--primary" type="button" onClick={() => setPhase((value) => Math.min(2, value + 1))} disabled={phase === 2}>
          {phase === 0 ? "Reserve an array →" : "Add a fourth todo →"}
        </button>
        <button className="button button--quiet" type="button" onClick={() => setPhase(0)}>
          Reset
        </button>
      </div>
    </div>
  );
}
