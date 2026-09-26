"use client";

import { useEffect, useState } from "react";
import {
  readRejectedApproaches,
  removeRejectedApproach,
  saveRejectedApproach,
  type RejectedApproach,
} from "@/lib/learning/rejected-approaches";

function makeId() {
  return typeof window !== "undefined" && window.crypto?.randomUUID
    ? window.crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

export function RejectedApproaches({ exerciseId }: { exerciseId: string }) {
  const [entries, setEntries] = useState<RejectedApproach[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setEntries(readRejectedApproaches(window.localStorage)[exerciseId] ?? []);
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [exerciseId]);

  const add = () => {
    const entry: RejectedApproach = {
      id: makeId(),
      approach: "",
      because: "",
      wouldWorkIf: "",
      recordedAt: new Date().toISOString(),
    };
    setEntries((current) => [...current, entry]);
  };

  const update = (entry: RejectedApproach) => {
    setEntries((current) => current.map((item) => item.id === entry.id ? entry : item));
    saveRejectedApproach(window.localStorage, exerciseId, entry);
  };

  const remove = (id: string) => {
    setEntries((current) => current.filter((item) => item.id !== id));
    removeRejectedApproach(window.localStorage, exerciseId, id);
  };

  return (
    <section className="rejected-approaches" aria-labelledby={`rejected-${exerciseId}`}>
      <div className="rejected-approaches__head">
        <div>
          <span className="eyebrow">Design log · failed ideas</span>
          <h3 id={`rejected-${exerciseId}`}>Record “no, because…” as reusable knowledge.</h3>
          <p>
            A rejected technique is useful only when you preserve the failure condition and the assumption that could make it valid later.
            These notes are stored separately from mastery evidence.
          </p>
        </div>
        <button className="button" type="button" onClick={add}>Add rejected approach</button>
      </div>

      {entries.length ? (
        <div className="rejected-approaches__list">
          {entries.map((entry, index) => (
            <article className="rejected-approaches__row" key={entry.id}>
              <span className="mono">NO {String(index + 1).padStart(2, "0")}</span>
              <label>
                <span>Approach / model</span>
                <input value={entry.approach} onChange={(event) => update({ ...entry, approach: event.target.value })} placeholder="Example: greedy by largest item" />
              </label>
              <label>
                <span>Rejected because</span>
                <textarea rows={3} value={entry.because} onChange={(event) => update({ ...entry, because: event.target.value })} placeholder="Smallest counterexample, violated invariant, cost blow-up…" />
              </label>
              <label>
                <span>Could work if</span>
                <textarea rows={3} value={entry.wouldWorkIf} onChange={(event) => update({ ...entry, wouldWorkIf: event.target.value })} placeholder="Which changed assumption would make it defensible?" />
              </label>
              <button className="button button--quiet" type="button" onClick={() => remove(entry.id)}>Remove</button>
            </article>
          ))}
        </div>
      ) : (
        <p className="rejected-approaches__empty">
          {hydrated ? "No failed approach recorded yet. Add one when an idea fails for a specific reason." : "Loading rejected approaches…"}
        </p>
      )}
    </section>
  );
}
