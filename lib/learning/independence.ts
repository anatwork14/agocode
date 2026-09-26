import { classifiedAtlasExercises } from "../practice/atlas-recognition.ts";
import type { ReasoningEvidence, StorageLike } from "./evidence.ts";
import type { RecommendationHistory } from "./recommendations.ts";
import { buildMonotonicReasoningEvidence, type ReasoningAttemptHistory } from "./reasoning-attempts.ts";

export const PROBLEM_RECOGNITION_HISTORY_KEY = "agocode.progress.problem-recognition-history";

export type ProblemIndependenceStage = "seen" | "guided" | "solved" | "independent" | "transferred" | "recalled";

export type ProblemRecognitionEntry = {
  exerciseId: string;
  recognizedAt: string;
  firstTry: boolean;
};

export type ProblemRecognitionHistory = {
  version: 1;
  entries: ProblemRecognitionEntry[];
};

export type ProblemIndependenceState = {
  exerciseId: string;
  stage: ProblemIndependenceStage;
  rank: number;
  label: string;
  explanation: string;
  nextRequirement: string;
  familyId?: string;
  completedAt?: string;
  recognitionAt?: string;
  transferExerciseId?: string;
};

export type ProblemIndependenceProfile = {
  states: Record<string, ProblemIndependenceState>;
  counts: Record<ProblemIndependenceStage, number>;
  tracked: number;
  independentOrBetter: number;
  transferredOrBetter: number;
  recalled: number;
};

type BuildProblemIndependenceInput = {
  reasoning?: ReasoningEvidence;
  reasoningAttempts?: ReasoningAttemptHistory | null;
  recommendationHistory?: RecommendationHistory | null;
  recognitionHistory?: ProblemRecognitionHistory | null;
  recallDelayMs?: number;
};

const MAX_RECOGNITION_ENTRIES = 240;
const DEFAULT_RECALL_DELAY_MS = 24 * 60 * 60 * 1000;

export const problemIndependenceStageLabels: Record<ProblemIndependenceStage, string> = {
  seen: "Seen",
  guided: "Guided",
  solved: "Solved",
  independent: "Independent",
  transferred: "Transferred",
  recalled: "Recalled",
};

export const problemIndependenceStageRank: Record<ProblemIndependenceStage, number> = {
  seen: 1,
  guided: 2,
  solved: 3,
  independent: 4,
  transferred: 5,
  recalled: 6,
};

function parseRecognitionEntry(value: unknown): ProblemRecognitionEntry | null {
  if (!value || typeof value !== "object") return null;
  const entry = value as Partial<ProblemRecognitionEntry>;
  if (
    typeof entry.exerciseId !== "string"
    || typeof entry.recognizedAt !== "string"
    || typeof entry.firstTry !== "boolean"
  ) return null;
  return { exerciseId: entry.exerciseId, recognizedAt: entry.recognizedAt, firstTry: entry.firstTry };
}

export function readProblemRecognitionHistory(storage: StorageLike): ProblemRecognitionHistory {
  try {
    const raw = storage.getItem(PROBLEM_RECOGNITION_HISTORY_KEY);
    if (!raw) return { version: 1, entries: [] };
    const parsed = JSON.parse(raw) as Partial<ProblemRecognitionHistory>;
    const entries = Array.isArray(parsed.entries)
      ? parsed.entries.map(parseRecognitionEntry).filter((entry): entry is ProblemRecognitionEntry => Boolean(entry)).slice(-MAX_RECOGNITION_ENTRIES)
      : [];
    return { version: 1, entries };
  } catch {
    return { version: 1, entries: [] };
  }
}

export function recordProblemRecognitionSession(
  storage: StorageLike,
  items: readonly { exerciseId: string; firstTry: boolean }[],
  recognizedAt = new Date().toISOString(),
): ProblemRecognitionHistory {
  const previous = readProblemRecognitionHistory(storage);
  const additions = items
    .filter((item) => item.exerciseId)
    .map((item) => ({ exerciseId: item.exerciseId, recognizedAt, firstTry: item.firstTry }));
  const next: ProblemRecognitionHistory = {
    version: 1,
    entries: [...previous.entries, ...additions].slice(-MAX_RECOGNITION_ENTRIES),
  };
  try {
    storage.setItem(PROBLEM_RECOGNITION_HISTORY_KEY, JSON.stringify(next));
  } catch {
    // Recognition remains usable even if local persistence is unavailable.
  }
  return next;
}

function stageState(
  exerciseId: string,
  stage: ProblemIndependenceStage,
  explanation: string,
  nextRequirement: string,
  extra: Partial<ProblemIndependenceState> = {},
): ProblemIndependenceState {
  return {
    exerciseId,
    stage,
    rank: problemIndependenceStageRank[stage],
    label: problemIndependenceStageLabels[stage],
    explanation,
    nextRequirement,
    ...extra,
  };
}

export function buildProblemIndependenceProfile(input: BuildProblemIndependenceInput): ProblemIndependenceProfile {
  const reasoningByExercise = buildMonotonicReasoningEvidence(
    input.reasoningAttempts ?? { version: 1, entries: [] },
    input.reasoning,
  )?.byExercise ?? {};
  const recommendations = input.recommendationHistory?.entries ?? [];
  const recognitionEntries = input.recognitionHistory?.entries ?? [];
  const recallDelayMs = Math.max(0, input.recallDelayMs ?? DEFAULT_RECALL_DELAY_MS);
  const classifiedById = new Map(classifiedAtlasExercises.map((item) => [item.exercise.id, item]));
  const trackedIds = new Set<string>([
    ...recommendations.map((entry) => entry.exerciseId),
    ...Object.keys(reasoningByExercise),
    ...recognitionEntries.map((entry) => entry.exerciseId),
  ]);

  const states: Record<string, ProblemIndependenceState> = {};
  const independentIds = new Set<string>();

  for (const exerciseId of trackedIds) {
    const reasoning = reasoningByExercise[exerciseId];
    const classified = classifiedById.get(exerciseId);
    const coverage = reasoning ? reasoning.developedStages / Math.max(1, reasoning.totalStages) : 0;
    const completedAt = reasoning?.completedAt;
    const familyId = classified?.family.id;

    let state = stageState(
      exerciseId,
      "seen",
      "This problem has entered your learning history, but there is not yet enough attempt evidence to claim a solve.",
      "Develop the reasoning notebook far enough to produce a complete solution attempt.",
      { familyId },
    );

    if (reasoning && !completedAt && (reasoning.developedStages >= 2 || reasoning.lensRevealed)) {
      state = stageState(
        exerciseId,
        "guided",
        reasoning.lensRevealed
          ? "You developed the problem with structural-lens support."
          : "You have a meaningful in-progress reasoning attempt, but it is not complete yet.",
        "Complete the reasoning workflow and justify the solution.",
        { familyId },
      );
    }

    if (completedAt) {
      state = stageState(
        exerciseId,
        "solved",
        "A completed reasoning attempt is recorded for this problem.",
        "Solve a fresh attempt without revealing the structural lens to establish independence.",
        { familyId, completedAt },
      );

      if (coverage >= 0.75 && !reasoning?.lensRevealed) {
        state = stageState(
          exerciseId,
          "independent",
          "The problem was completed with substantial reasoning coverage and without revealing the structural lens.",
          "Solve a structurally related problem from a different source or application domain.",
          { familyId, completedAt },
        );
        independentIds.add(exerciseId);
      }
    }

    states[exerciseId] = state;
  }

  for (const exerciseId of independentIds) {
    const current = classifiedById.get(exerciseId);
    if (!current) continue;
    const neighborId = Array.from(independentIds).find((candidateId) => {
      if (candidateId === exerciseId) return false;
      const candidate = classifiedById.get(candidateId);
      if (!candidate || candidate.family.id !== current.family.id) return false;
      return candidate.exercise.source !== current.exercise.source || candidate.exercise.domain !== current.exercise.domain;
    });
    if (!neighborId) continue;

    const prior = states[exerciseId];
    states[exerciseId] = stageState(
      exerciseId,
      "transferred",
      "You independently solved another problem in the same structural family with a changed source or application domain.",
      "Recognize this problem's structure again after a delay without relying on the chapter label.",
      {
        familyId: prior.familyId,
        completedAt: prior.completedAt,
        transferExerciseId: neighborId,
      },
    );
  }

  for (const exerciseId of independentIds) {
    const state = states[exerciseId];
    if (!state.completedAt) continue;
    const completedTime = new Date(state.completedAt).getTime();
    if (!Number.isFinite(completedTime)) continue;
    const recall = recognitionEntries
      .filter((entry) => entry.exerciseId === exerciseId && entry.firstTry)
      .filter((entry) => new Date(entry.recognizedAt).getTime() - completedTime >= recallDelayMs)
      .sort((a, b) => b.recognizedAt.localeCompare(a.recognizedAt))[0];
    if (!recall) continue;

    states[exerciseId] = stageState(
      exerciseId,
      "recalled",
      "After an independent solve, you recognized the problem's structural family on the first try after a delay.",
      "Keep this durable by revisiting it in later mixed sessions rather than repeating it immediately.",
      {
        familyId: state.familyId,
        completedAt: state.completedAt,
        transferExerciseId: state.transferExerciseId,
        recognitionAt: recall.recognizedAt,
      },
    );
  }

  const counts: Record<ProblemIndependenceStage, number> = {
    seen: 0,
    guided: 0,
    solved: 0,
    independent: 0,
    transferred: 0,
    recalled: 0,
  };
  Object.values(states).forEach((state) => { counts[state.stage] += 1; });

  return {
    states,
    counts,
    tracked: Object.keys(states).length,
    independentOrBetter: counts.independent + counts.transferred + counts.recalled,
    transferredOrBetter: counts.transferred + counts.recalled,
    recalled: counts.recalled,
  };
}
