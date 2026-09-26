"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { buildDesignSkillProfile, type DesignSkillProfile } from "@/lib/learning/design-skills";
import { readReasoningAttemptHistory } from "@/lib/learning/reasoning-attempts";

export function DesignSkillProgress() {
  const [profile, setProfile] = useState<DesignSkillProfile | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setProfile(buildDesignSkillProfile(readReasoningAttemptHistory(window.localStorage)));
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  if (!profile) return <div className="progress-loading">Reading design-skill evidence…</div>;

  return (
    <section className="design-skill-progress">
      <div className="section-heading">
        <div className="section-heading__index">DESIGN SKILLS</div>
        <div>
          <h2>See which parts of algorithm design you have actually practiced.</h2>
          <p>
            This view derives only from developed reasoning stages in finalized attempts. Coverage means the skill appeared
            in an exercise; “independent” means that same attempt was completed with substantial coverage and without the
            structural lens. Confidence labels do not affect these counts.
          </p>
        </div>
      </div>

      <div className="design-skill-progress__metrics">
        <div><span>Stage-aware exercises</span><strong>{profile.trackedExercises}</strong><small>unique problems with specific stage evidence</small></div>
        <div><span>Stage-aware attempts</span><strong>{profile.stageSpecificAttempts}</strong><small>finalized attempts recorded with stage identities</small></div>
        <div><span>Source-workbook exercises</span><strong>{profile.sourceWorkbookExercises}</strong><small>Goodrich, EPI, or Skiena-derived practice</small></div>
        <div><span>Legacy coarse attempts</span><strong>{profile.legacyCoarseAttempts}</strong><small>kept valid, but not invented into dimensions</small></div>
      </div>

      {profile.trackedExercises ? (
        <div className="design-skill-progress__grid">
          {profile.dimensions.map((dimension) => {
            const leastObserved = profile.leastObservedDimensionIds.includes(dimension.id);
            return (
              <article className="design-skill-card" key={dimension.id}>
                <div className="design-skill-card__head">
                  <div>
                    <span className="eyebrow">{leastObserved ? "Least observed evidence" : "Observed evidence"}</span>
                    <h3>{dimension.label}</h3>
                  </div>
                  <strong>{dimension.coveragePercent}%</strong>
                </div>
                <p>{dimension.description}</p>
                <dl>
                  <div><dt>Exercises observed</dt><dd>{dimension.observedExercises}/{profile.trackedExercises}</dd></div>
                  <div><dt>Independent observations</dt><dd>{dimension.independentExercises}</dd></div>
                  <div><dt>Source-workbook exercises</dt><dd>{dimension.sourceWorkbookExercises}</dd></div>
                </dl>
                <div className="design-skill-card__meter" aria-label={`${dimension.coveragePercent}% exercise coverage for ${dimension.label}`}>
                  <span style={{ width: `${dimension.coveragePercent}%` }} />
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="design-skill-progress__empty">
          <p>
            No finalized attempt yet contains stage-level evidence. New reasoning attempts will populate this model; older
            count-only records remain preserved without guessing which stages they represented.
          </p>
          <Link className="button" href="/exercises">Open the Problem Atlas →</Link>
        </div>
      )}
    </section>
  );
}
