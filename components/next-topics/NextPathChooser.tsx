"use client";

import { useState } from "react";

const paths = [
  { id: "structures", title: "Data structures & search", topics: "balanced trees · B-trees · inverted indexes", reason: "Go deeper on fast lookup, ordered data, databases, and search systems." },
  { id: "scale", title: "Parallel & distributed systems", topics: "parallel algorithms · MapReduce", reason: "Study how algorithms change when work is divided across cores or machines." },
  { id: "probability", title: "Memory-efficient data systems", topics: "Bloom filters · HyperLogLog", reason: "Learn when approximate answers buy dramatic space savings at large scale." },
  { id: "signals", title: "Signals & similarity", topics: "Fourier transform · locality-sensitive hashing", reason: "Explore transforms, frequency-domain thinking, and similarity-preserving representations." },
  { id: "optimization", title: "Optimization", topics: "linear programming · constrained optimization", reason: "Move from hand-designed algorithms toward a general framework for maximizing objectives under constraints." },
] as const;

export function NextPathChooser() {
  const [selected, setSelected] = useState<string | null>(null);

  function choose(id: string) {
    setSelected(id);
    try {
      localStorage.setItem(
        "agocode.progress.chapter-11.explore",
        JSON.stringify({ completedAt: new Date().toISOString(), exerciseId: "where-to-go-next", selectedPath: id }),
      );
    } catch {
      // Choosing a path still works when browser storage is unavailable.
    }
  }

  const choice = paths.find((path) => path.id === selected);

  return (
    <div className="next-path-chooser">
      <div className="next-lab__header">
        <div>
          <div className="eyebrow">Your next branch</div>
          <h3>The book ends by widening the map. Pick the direction you want AgoCode to reinforce next.</h3>
        </div>
      </div>

      <div className="next-path-grid">
        {paths.map((path) => (
          <button className={selected === path.id ? "next-path-card next-path-card--selected" : "next-path-card"} type="button" onClick={() => choose(path.id)} key={path.id}>
            <strong>{path.title}</strong>
            <span className="mono">{path.topics}</span>
            <p>{path.reason}</p>
          </button>
        ))}
      </div>

      {choice ? (
        <div className="trace-note" aria-live="polite">
          <strong>Saved direction:</strong> {choice.title}. This does not lock you in; it gives the end of the Book Track a concrete handoff instead of a generic “learn more” screen.
        </div>
      ) : null}
    </div>
  );
}
