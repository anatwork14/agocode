"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { syllabusTracks } from "@/lib/knowledge/syllabus";
import { buildAdaptiveCurriculumPlan, type AdaptiveCurriculumPlan, type CurriculumModuleState } from "@/lib/learning/curriculum-planner";
import { getLatestDiagnosticResult, readDiagnosticState, type DiagnosticResult } from "@/lib/learning/diagnostic";
import { readReasoningAttemptHistory } from "@/lib/learning/reasoning-attempts";
import {
  ensureWeeklyMission,
  evaluateWeeklyMission,
  readWeeklyMissionState,
  regenerateWeeklyMission,
  type WeeklyMission,
  type WeeklyMissionEvaluation,
  type WeeklyMissionSummary,
} from "@/lib/learning/weekly-mission";

type Snapshot = {
  plan: AdaptiveCurriculumPlan;
  diagnostic?: DiagnosticResult;
  mission: WeeklyMission;
  missionEvaluation: WeeklyMissionEvaluation[];
  history: WeeklyMissionSummary[];
};

const stateLabels: Record<CurriculumModuleState, string> = {
  mastered: "Mastered",
  developing: "Developing",
  ready: "Ready now",
  blocked: "Blocked",
};

const roleLabels = {
  strengthen: "Strengthen",
  unlock: "Unlock",
  advance: "Advance",
} as const;

function collect(regenerate = false): Snapshot {
  const diagnostic = getLatestDiagnosticResult(readDiagnosticState(window.localStorage));
  const reasoningAttempts = readReasoningAttemptHistory(window.localStorage);
  const plan = buildAdaptiveCurriculumPlan({ diagnostic, reasoningAttempts });
  const mission = regenerate
    ? regenerateWeeklyMission(window.localStorage, plan)
    : ensureWeeklyMission(window.localStorage, plan);
  const missionState = readWeeklyMissionState(window.localStorage);
  return {
    plan,
    diagnostic,
    mission,
    missionEvaluation: evaluateWeeklyMission(mission, plan),
    history: missionState.history,
  };
}

export function AdaptiveCurriculumPlanner() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);

  useEffect(() => {
    const hydrate = () => setSnapshot(collect());
    const timer = window.setTimeout(hydrate, 0);
    const handleStorage = (event: StorageEvent) => {
      if (!event.key || event.key.startsWith("agocode.")) hydrate();
    };
    const handleFocus = () => hydrate();
    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", handleFocus);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const modulesByTrack = useMemo(() => {
    if (!snapshot) return [];
    const byId = new Map(snapshot.plan.modules.map((module) => [module.id, module]));
    return syllabusTracks.map((track) => ({
      track,
      modules: track.modules.map((module) => byId.get(module.id)).filter((module) => Boolean(module)),
    }));
  }, [snapshot]);

  if (!snapshot) return <div className="curriculum-plan__loading">Deriving your curriculum state from local evidence…</div>;

  const missionSatisfied = snapshot.missionEvaluation.filter((entry) => entry.satisfied).length;
  const recentHistory = snapshot.history.slice(-4).reverse();

  return (
    <div className="curriculum-plan">
      <section className="curriculum-plan__summary" aria-labelledby="curriculum-summary-title">
        <div>
          <span className="eyebrow">Adaptive curriculum</span>
          <h2 id="curriculum-summary-title">Your prerequisite graph now has learner state.</h2>
          <p>
            AgoCode combines diagnostic placement with finalized reasoning attempts. Diagnostic evidence may bypass familiar prerequisites, but only objective independent work can produce a mastered module.
          </p>
        </div>
        <div className="curriculum-plan__summary-grid">
          <div><span>Mastered</span><strong>{snapshot.plan.counts.mastered}</strong><small>objective threshold only</small></div>
          <div><span>Developing</span><strong>{snapshot.plan.counts.developing}</strong><small>has relevant evidence</small></div>
          <div><span>Ready</span><strong>{snapshot.plan.counts.ready}</strong><small>prerequisites satisfied</small></div>
          <div><span>Blocked</span><strong>{snapshot.plan.counts.blocked}</strong><small>repair prerequisite first</small></div>
        </div>
      </section>

      {!snapshot.diagnostic ? (
        <section className="curriculum-plan__diagnostic-callout">
          <div>
            <span className="eyebrow">Cold-start signal missing</span>
            <h3>The plan currently relies only on objective learning evidence.</h3>
            <p>Take the diagnostic to let AgoCode bypass prerequisites you already understand without falsely marking them mastered.</p>
          </div>
          <Link className="button button--primary" href="/diagnostic">Take diagnostic →</Link>
        </section>
      ) : (
        <section className="curriculum-plan__diagnostic-callout curriculum-plan__diagnostic-callout--available">
          <div>
            <span className="eyebrow">Placement prior available</span>
            <h3>{snapshot.diagnostic.overall}% overall diagnostic</h3>
            <p>Used only for routing and prerequisite placement. {snapshot.plan.objectiveExercisesObserved} exercises currently contribute objective reasoning evidence.</p>
          </div>
          <Link className="button" href="/diagnostic">Inspect / retake →</Link>
        </section>
      )}

      <section className="weekly-mission" aria-labelledby="weekly-mission-title">
        <div className="weekly-mission__header">
          <div>
            <span className="eyebrow">Week of {snapshot.mission.weekKey}</span>
            <h2 id="weekly-mission-title">Weekly mission · {missionSatisfied}/{snapshot.mission.items.length} objectively advanced</h2>
            <p>The mission is frozen for the local week. A row completes only when module-level objective evidence improves beyond its weekly baseline.</p>
          </div>
          <button className="button" type="button" onClick={() => setSnapshot(collect(true))}>Rebuild weekly mission</button>
        </div>
        <div className="weekly-mission__list">
          {snapshot.missionEvaluation.map((entry, index) => (
            <article key={entry.item.moduleId} className={`weekly-mission__item ${entry.satisfied ? "weekly-mission__item--satisfied" : ""}`}>
              <div className="weekly-mission__index mono">{String(index + 1).padStart(2, "0")}</div>
              <div>
                <div className="weekly-mission__meta mono">
                  <span>{roleLabels[entry.item.role]}</span>
                  <span>{entry.satisfied ? "objective target met" : `target ${entry.item.targetObjectiveScore}/100`}</span>
                </div>
                <h3>{entry.item.title}</h3>
                <p>{entry.item.reason}</p>
                <small>{entry.explanation}</small>
              </div>
              <Link className={entry.satisfied ? "button" : "button button--primary"} href={entry.item.route}>
                {entry.satisfied ? "Review module →" : "Work on module →"}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="curriculum-plan__next" aria-labelledby="next-curriculum-title">
        <div>
          <span className="eyebrow">Next learning targets</span>
          <h2 id="next-curriculum-title">Why these modules are next</h2>
        </div>
        <div className="curriculum-plan__next-grid">
          {snapshot.plan.nextModules.map((module) => (
            <article key={module.id}>
              <div className="curriculum-plan__module-meta mono">
                <span className={`curriculum-state curriculum-state--${module.state}`}>{stateLabels[module.state]}</span>
                <span>{module.trackTitle}</span>
              </div>
              <h3>{module.title}</h3>
              <p>{module.explanation}</p>
              <div className="curriculum-plan__scores">
                <span>objective <strong>{module.evidence.objectiveScore}/100</strong></span>
                {typeof module.diagnosticScore === "number" ? <span>placement <strong>{module.diagnosticScore}%</strong></span> : null}
              </div>
              <Link href={module.route}>Open module →</Link>
            </article>
          ))}
        </div>
      </section>

      <section className="learner-graph" aria-labelledby="learner-graph-title">
        <div className="learner-graph__header">
          <div>
            <span className="eyebrow">Learner knowledge graph</span>
            <h2 id="learner-graph-title">Prerequisites, now annotated by evidence.</h2>
          </div>
          <Link className="button" href="/syllabus/map">Open static prerequisite map →</Link>
        </div>
        <div className="learner-graph__tracks">
          {modulesByTrack.map(({ track, modules }) => (
            <section key={track.id} className="learner-graph__track">
              <div className="learner-graph__track-heading">
                <span className="mono">{track.number}</span>
                <h3>{track.title}</h3>
              </div>
              <div className="learner-graph__modules">
                {modules.map((module) => module ? (
                  <article key={module.id} className={`learner-graph__module learner-graph__module--${module.state}`}>
                    <div className="curriculum-plan__module-meta mono">
                      <span>{stateLabels[module.state]}</span>
                      <span>{module.evidence.objectiveScore}/100 objective</span>
                    </div>
                    <h4><Link href={module.route}>{module.title}</Link></h4>
                    {module.prerequisites.length ? (
                      <div className="learner-graph__prereqs">
                        {module.prerequisites.map((prerequisite) => (
                          <span key={prerequisite.moduleId} className={prerequisite.satisfied ? "is-met" : "is-missing"}>
                            {prerequisite.satisfied ? "✓" : "○"} {prerequisite.title} · {prerequisite.basis}
                          </span>
                        ))}
                      </div>
                    ) : <small>Root module · no prerequisites</small>}
                  </article>
                ) : null)}
              </div>
            </section>
          ))}
        </div>
      </section>

      {recentHistory.length ? (
        <section className="weekly-mission__history" aria-labelledby="weekly-history-title">
          <span className="eyebrow">Local weekly history</span>
          <h2 id="weekly-history-title">Archived missions</h2>
          <div>
            {recentHistory.map((entry) => (
              <p key={entry.weekKey}><strong>{entry.weekKey}</strong><span>{entry.satisfied}/{entry.total} objective targets satisfied</span></p>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
