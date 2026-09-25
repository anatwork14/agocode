"use client";

import { useEffect, useMemo, useState } from "react";
import { recordProjectWorkspaceEvidence } from "@/lib/learning/evidence";

const STORAGE_PREFIX = "agocode:project-workspace:v1:";
const PROJECT_EVIDENCE_KEY = "agocode.progress.design.project-workspaces";

const textFields = [
  "contract",
  "interfaces",
  "invariants",
  "decomposition",
  "tests",
  "complexity",
  "experiment",
  "failures",
  "retrospective",
] as const;

type ProjectField = (typeof textFields)[number];

type ProjectState = Record<ProjectField, string> & {
  checkpoints: Record<string, boolean>;
  updatedAt?: string;
};

const blankState = (): ProjectState => ({
  contract: "",
  interfaces: "",
  invariants: "",
  decomposition: "",
  tests: "",
  complexity: "",
  experiment: "",
  failures: "",
  retrospective: "",
  checkpoints: {},
});

const sections: { id: ProjectField; number: string; title: string; prompt: string; placeholder: string }[] = [
  {
    id: "contract",
    number: "01",
    title: "Define the artifact contract",
    prompt: "What must the finished program or data structure do, and what behavior is explicitly out of scope?",
    placeholder: "Inputs, outputs, operations, error behavior, assumptions, non-goals…",
  },
  {
    id: "interfaces",
    number: "02",
    title: "Design the interface before the internals",
    prompt: "Which operations should a caller be able to use without knowing the representation?",
    placeholder: "Public methods / functions, parameters, return values, preconditions…",
  },
  {
    id: "invariants",
    number: "03",
    title: "Write representation invariants",
    prompt: "What must always remain true after construction and after every mutating operation?",
    placeholder: "Example: size matches stored nodes; parent links are reciprocal; heap order holds…",
  },
  {
    id: "decomposition",
    number: "04",
    title: "Break the build into verifiable slices",
    prompt: "What is the smallest sequence of milestones that keeps the system runnable or inspectable after each step?",
    placeholder: "Milestone 1…\nMilestone 2…\nMilestone 3…",
  },
  {
    id: "tests",
    number: "05",
    title: "Build a test matrix before finishing the code",
    prompt: "Which normal, boundary, adversarial, and state-transition cases must pass?",
    placeholder: "Empty / one item / duplicate / worst-shape / invalid input / randomized cross-check…",
  },
  {
    id: "complexity",
    number: "06",
    title: "Set an operation budget",
    prompt: "Which operations dominate the expected workload and what asymptotic bounds should the design meet?",
    placeholder: "Operation → target cost → why the workload makes this important…",
  },
  {
    id: "experiment",
    number: "07",
    title: "Plan empirical validation",
    prompt: "What will you measure to check whether the implementation behaves like the analysis predicts?",
    placeholder: "Input sizes, generated distributions, metrics, comparison baseline, plot/table…",
  },
  {
    id: "failures",
    number: "08",
    title: "Keep the failure log",
    prompt: "Which designs or implementations failed, and what evidence explains why?",
    placeholder: "Tried ___; rejected because ___; evidence ___; next hypothesis ___…",
  },
  {
    id: "retrospective",
    number: "09",
    title: "Close with a transfer retrospective",
    prompt: "What would you keep, replace, or redesign if the scale, workload, or constraints changed?",
    placeholder: "If reads dominated… If data moved to disk… If updates became concurrent…",
  },
];

const checkpoints = [
  "Public contract can be explained without implementation details",
  "Every mutating operation has an invariant check",
  "Tests include at least one adversarial/worst-shape case",
  "Measured behavior is compared with the asymptotic expectation",
  "At least one rejected approach is recorded with evidence",
  "A future constraint change and redesign path are described",
] as const;

function isDeveloped(value: string) {
  return value.trim().length >= 20;
}

export function ProjectWorkspace({ exerciseId }: { exerciseId: string }) {
  const storageKey = `${STORAGE_PREFIX}${exerciseId}`;
  const [state, setState] = useState<ProjectState>(blankState);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const hydrationTimer = window.setTimeout(() => {
      try {
        const raw = localStorage.getItem(storageKey);
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<ProjectState>;
          setState({ ...blankState(), ...parsed, checkpoints: parsed.checkpoints ?? {} });
        } else {
          setState(blankState());
        }
      } catch {
        setState(blankState());
      } finally {
        setLoaded(true);
      }
    }, 0);

    return () => window.clearTimeout(hydrationTimer);
  }, [storageKey]);

  useEffect(() => {
    if (!loaded) return;
    const timer = window.setTimeout(() => {
      localStorage.setItem(storageKey, JSON.stringify({ ...state, updatedAt: new Date().toISOString() }));
    }, 250);
    return () => window.clearTimeout(timer);
  }, [loaded, state, storageKey]);

  const developed = useMemo(() => textFields.filter((field) => isDeveloped(state[field])).length, [state]);
  const checked = useMemo(() => checkpoints.filter((item) => state.checkpoints[item]).length, [state.checkpoints]);
  const progress = Math.round(((developed + checked) / (textFields.length + checkpoints.length)) * 100);
  const qualityGateComplete = developed === textFields.length && checked === checkpoints.length;

  useEffect(() => {
    if (!loaded) return;
    const evidenceTimer = window.setTimeout(() => {
      recordProjectWorkspaceEvidence(window.localStorage, PROJECT_EVIDENCE_KEY, {
        exerciseId,
        developedSections: developed,
        totalSections: textFields.length,
        checkedQualityGates: checked,
        totalQualityGates: checkpoints.length,
        completed: qualityGateComplete,
      });
    }, 250);

    return () => window.clearTimeout(evidenceTimer);
  }, [checked, developed, exerciseId, loaded, qualityGateComplete]);

  const setField = (field: ProjectField, value: string) => setState((current) => ({ ...current, [field]: value }));
  const toggleCheckpoint = (item: string) => setState((current) => ({
    ...current,
    checkpoints: { ...current.checkpoints, [item]: !current.checkpoints[item] },
  }));

  const copyBrief = async () => {
    const body = sections.map((section) => `## ${section.title}\n${state[section.id] || "—"}`).join("\n\n");
    const checklist = checkpoints.map((item) => `- [${state.checkpoints[item] ? "x" : " "}] ${item}`).join("\n");
    await navigator.clipboard.writeText(`# AgoCode project brief · ${exerciseId}\n\n${body}\n\n## Quality gate\n${checklist}`);
  };

  return (
    <div className="project-workspace">
      <div className="project-workspace__status">
        <div>
          <span className="eyebrow">Project tier workspace</span>
          <strong>{developed}/{textFields.length} design sections developed · {checked}/{checkpoints.length} quality checks</strong>
        </div>
        <div className="project-workspace__meter" aria-label={`${progress}% project brief developed`}>
          <span style={{ width: `${progress}%` }} />
        </div>
        <span className="mono">{qualityGateComplete ? "quality gate complete · bounded mastery evidence" : `${progress}% · partial mastery evidence`}</span>
      </div>

      <div className="project-workspace__intro">
        <div>
          <h2>Turn a project prompt into an engineering artifact.</h2>
          <p>
            Projects require more than a final output. Keep interfaces, invariants, tests, complexity expectations,
            experiments, and failed designs visible so the implementation can be reviewed and changed deliberately.
          </p>
        </div>
        <button className="button" type="button" onClick={copyBrief}>Copy project brief</button>
      </div>

      <div className="project-workspace__sections">
        {sections.map((section) => (
          <label className="project-workspace__section" key={section.id}>
            <div>
              <span className="mono">{section.number}</span>
              <div>
                <h3>{section.title}</h3>
                <p>{section.prompt}</p>
              </div>
            </div>
            <textarea
              value={state[section.id]}
              onChange={(event) => setField(section.id, event.target.value)}
              placeholder={section.placeholder}
            />
          </label>
        ))}
      </div>

      <div className="project-workspace__gate">
        <div>
          <span className="eyebrow">Quality gate</span>
          <h2>Do not call the project finished because the happy path runs.</h2>
        </div>
        <div>
          {checkpoints.map((item) => (
            <label key={item}>
              <input type="checkbox" checked={Boolean(state.checkpoints[item])} onChange={() => toggleCheckpoint(item)} />
              <span>{item}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
