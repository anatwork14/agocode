"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { stuckDiagnoses } from "@/lib/knowledge/stuck-router";
import { getMostFrequentObstacles, readObstacleEvidence, type ObstacleEvidence } from "@/lib/learning/obstacles";

export function ProblemSolvingFriction() {
  const [evidence, setEvidence] = useState<ObstacleEvidence | null>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => setEvidence(readObstacleEvidence(window.localStorage)), 0);
    return () => window.clearTimeout(timeout);
  }, []);

  const frequent = useMemo(() => evidence ? getMostFrequentObstacles(evidence, 4) : [], [evidence]);

  if (!evidence) return <div className="friction-loading">Reading problem-solving friction from this browser…</div>;

  if (!evidence.events.length) {
    return (
      <section className="friction-progress">
        <div className="section-heading">
          <div className="section-heading__index">FRICTION</div>
          <div>
            <h2>We do not know where your reasoning gets stuck yet.</h2>
            <p>Use contextual help during a real attempt. AgoCode records the obstacle you select, separately from mastery evidence.</p>
          </div>
        </div>
        <Link className="button" href="/blog#diagnose">Diagnose a problem-solving obstacle →</Link>
      </section>
    );
  }

  const lastEvent = evidence.events.at(-1);

  return (
    <section className="friction-progress">
      <div className="section-heading">
        <div className="section-heading__index">FRICTION</div>
        <div>
          <h2>Where does your reasoning most often ask for help?</h2>
          <p>
            This is not a mastery score. It is a record of where you explicitly requested guidance, useful for choosing the
            next field note or workbench instead of repeating the same kind of dead end.
          </p>
        </div>
      </div>

      <div className="friction-progress__summary">
        <div><strong>{evidence.events.length}</strong><span>help diagnoses recorded</span></div>
        <div><strong>{Object.keys(evidence.counts).length}</strong><span>distinct obstacle types</span></div>
        <div>
          <strong>{lastEvent ? new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(lastEvent.selectedAt)) : "—"}</strong>
          <span>latest diagnosis{lastEvent?.context ? ` · ${lastEvent.context}` : ""}</span>
        </div>
      </div>

      <div className="friction-progress__list">
        {frequent.map(({ id, count }, index) => {
          const diagnosis = stuckDiagnoses.find((item) => item.id === id);
          if (!diagnosis) return null;
          const active = diagnosis.actions.find((action) => action.kind !== "read");
          return (
            <article className="friction-progress__row" key={id}>
              <span className="mono">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <div className="friction-progress__row-head">
                  <h3>{diagnosis.label}</h3>
                  <span className="mono">{count} selection{count === 1 ? "" : "s"}</span>
                </div>
                <p>{diagnosis.firstMove}</p>
                <div className="friction-progress__actions">
                  <Link href={`/blog/${diagnosis.fieldNoteSlug}`}>Read the matching field note →</Link>
                  {active ? <Link href={active.href}>{active.label} →</Link> : null}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="friction-progress__footer">
        <p>Use the counts as a reflection prompt, not a label. A frequent obstacle can simply mean you are deliberately practicing harder problems.</p>
        <Link className="button" href="/blog#diagnose">Open contextual help →</Link>
      </div>
    </section>
  );
}
