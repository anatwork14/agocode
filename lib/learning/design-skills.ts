import { getCanonicalExercise, type ExerciseSource } from "@/lib/knowledge/all-exercises";
import { classifyReasoningAttempt, type ReasoningAttemptHistory } from "./reasoning-attempts.ts";
import type { ReasoningStageId } from "./reasoning-stages.ts";

export type DesignSkillId =
  | "framing"
  | "baseline-diagnosis"
  | "strategy-modeling"
  | "correctness"
  | "complexity"
  | "transfer";

export type DesignSkillEvidence = {
  id: DesignSkillId;
  label: string;
  description: string;
  stageIds: readonly ReasoningStageId[];
  observedExercises: number;
  independentExercises: number;
  sourceWorkbookExercises: number;
  coveragePercent: number;
};

export type DesignSkillProfile = {
  trackedExercises: number;
  stageSpecificAttempts: number;
  legacyCoarseAttempts: number;
  sourceWorkbookExercises: number;
  dimensions: DesignSkillEvidence[];
  leastObservedDimensionIds: DesignSkillId[];
};

const definitions: readonly Omit<DesignSkillEvidence, "observedExercises" | "independentExercises" | "sourceWorkbookExercises" | "coveragePercent">[] = [
  {
    id: "framing",
    label: "Problem framing",
    description: "Clarify the contract, constraints, scale, and revealing examples before selecting an algorithm.",
    stageIds: ["understand", "examples"],
  },
  {
    id: "baseline-diagnosis",
    label: "Baseline diagnosis",
    description: "Establish an obviously correct baseline and identify the repeated work that actually needs optimization.",
    stageIds: ["baseline", "waste"],
  },
  {
    id: "strategy-modeling",
    label: "Strategy & modeling",
    description: "Choose an appropriate transformation, model, or data structure before implementation tactics.",
    stageIds: ["strategy"],
  },
  {
    id: "correctness",
    label: "Correctness reasoning",
    description: "State and challenge the invariant that must survive important state transitions.",
    stageIds: ["invariant"],
  },
  {
    id: "complexity",
    label: "Cost analysis",
    description: "Account for time, space, hidden state, preprocessing, and the dominant operation.",
    stageIds: ["analyze"],
  },
  {
    id: "transfer",
    label: "Variation & transfer",
    description: "Change an assumption and reason about what survives, breaks, or requires new state.",
    stageIds: ["vary"],
  },
] as const;

function sourceForExercise(exerciseId: string): ExerciseSource | undefined {
  const canonical = getCanonicalExercise(exerciseId);
  if (canonical) return canonical.source;
  if (exerciseId.startsWith("goodrich-")) return "goodrich";
  if (exerciseId.startsWith("epi-")) return "epi";
  if (exerciseId.startsWith("skiena-")) return "skiena";
  return undefined;
}

function intersects(values: readonly ReasoningStageId[], targets: readonly ReasoningStageId[]) {
  const targetSet = new Set(targets);
  return values.some((value) => targetSet.has(value));
}

export function buildDesignSkillProfile(history: ReasoningAttemptHistory): DesignSkillProfile {
  const stageSpecificEntries = history.entries.filter((entry) => Boolean(entry.developedStageIds?.length));
  const legacyCoarseAttempts = history.entries.filter((entry) => entry.developedStages > 0 && !entry.developedStageIds?.length).length;
  const trackedExerciseIds = new Set(stageSpecificEntries.map((entry) => entry.exerciseId));
  const sourceWorkbookIds = new Set(
    [...trackedExerciseIds].filter((exerciseId) => Boolean(sourceForExercise(exerciseId))),
  );

  const dimensions = definitions.map((definition): DesignSkillEvidence => {
    const observedIds = new Set<string>();
    const independentIds = new Set<string>();
    const sourceIds = new Set<string>();

    for (const entry of stageSpecificEntries) {
      const developed = entry.developedStageIds ?? [];
      if (!intersects(developed, definition.stageIds)) continue;
      observedIds.add(entry.exerciseId);
      if (sourceForExercise(entry.exerciseId)) sourceIds.add(entry.exerciseId);
      if (classifyReasoningAttempt(entry) === "independent") independentIds.add(entry.exerciseId);
    }

    return {
      ...definition,
      observedExercises: observedIds.size,
      independentExercises: independentIds.size,
      sourceWorkbookExercises: sourceIds.size,
      coveragePercent: trackedExerciseIds.size
        ? Math.round((observedIds.size / trackedExerciseIds.size) * 100)
        : 0,
    };
  });

  const minimumObserved = dimensions.length
    ? Math.min(...dimensions.map((dimension) => dimension.observedExercises))
    : 0;

  return {
    trackedExercises: trackedExerciseIds.size,
    stageSpecificAttempts: stageSpecificEntries.length,
    legacyCoarseAttempts,
    sourceWorkbookExercises: sourceWorkbookIds.size,
    dimensions,
    leastObservedDimensionIds: dimensions
      .filter((dimension) => dimension.observedExercises === minimumObserved)
      .map((dimension) => dimension.id),
  };
}
