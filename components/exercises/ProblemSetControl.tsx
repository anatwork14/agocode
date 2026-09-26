"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  createProblemSet,
  readProblemSets,
  toggleExerciseInProblemSet,
  toggleProblemBookmark,
  type ProblemSetState,
} from "@/lib/learning/problem-sets";

export function ProblemSetControl({ exerciseId }: { exerciseId: string }) {
  const [state, setState] = useState<ProblemSetState | null>(null);
  const [name, setName] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => setState(readProblemSets(window.localStorage)), 0);
    return () => window.clearTimeout(timer);
  }, []);

  if (!state) return <div className="problem-set-control problem-set-control--loading">Loading learner sets…</div>;
  const bookmarked = state.bookmarks.includes(exerciseId);

  function createSet() {
    const next = createProblemSet(window.localStorage, name);
    setState(next);
    setName("");
  }

  return (
    <aside className="problem-set-control" aria-label="Bookmark and problem sets">
      <div className="problem-set-control__head">
        <div>
          <span className="eyebrow">Learner collection</span>
          <strong>Save this problem for deliberate practice.</strong>
        </div>
        <button
          className={bookmarked ? "button button--selected" : "button"}
          type="button"
          onClick={() => setState(toggleProblemBookmark(window.localStorage, exerciseId))}
        >
          {bookmarked ? "Bookmarked" : "Bookmark"}
        </button>
      </div>

      {state.sets.length ? (
        <div className="problem-set-control__sets">
          {state.sets.map((set) => {
            const selected = set.exerciseIds.includes(exerciseId);
            return (
              <button
                key={set.id}
                type="button"
                className={selected ? "problem-set-control__set problem-set-control__set--selected" : "problem-set-control__set"}
                onClick={() => setState(toggleExerciseInProblemSet(window.localStorage, set.id, exerciseId))}
              >
                <span>{selected ? "✓" : "+"}</span>
                <strong>{set.name}</strong>
                <small>{set.exerciseIds.length} problem{set.exerciseIds.length === 1 ? "" : "s"}</small>
              </button>
            );
          })}
        </div>
      ) : null}

      <div className="problem-set-control__create">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="New set name…"
          aria-label="New problem set name"
        />
        <button className="button button--quiet" type="button" onClick={createSet} disabled={!name.trim()}>Create set</button>
        <Link href="/sets">Manage sets →</Link>
      </div>
    </aside>
  );
}
