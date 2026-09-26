import type { ReasoningExerciseEvidence, StorageLike } from "./evidence.ts";

export const DIFFICULTY_CALIBRATION_KEY = "agocode.progress.difficulty-calibration";

export type DifficultyRating = "too-easy" | "productive-stretch" | "too-hard";
export type DifficultyBias = -1 | 0 | 1;

export type ObjectiveAttemptSnapshot = {
  developedStages: number;
  totalStages: number;
  coverage: number;
  completed: boolean;
  lensRevealed: boolean;
  evidenceUpdatedAt: string;
};

export type DifficultyCalibrationEntry = {
  exerciseId: string;
  recommendationChosenAt: string;
  rating: DifficultyRating;
  ratedAt: string;
  objective: ObjectiveAttemptSnapshot | null;
};

export type DifficultyCalibrationHistory = {
  version: 1;
  entries: DifficultyCalibrationEntry[];
};

export type DifficultyCalibrationSignal = "raise" | "hold" | "lower" | "waiting";

export type DifficultyCalibrationEvaluation = {
  entry: DifficultyCalibrationEntry;
  signal: DifficultyCalibrationSignal;
  vote: DifficultyBias;
  reason: string;
};

export type DifficultyCalibrationProfile = {
  bias: DifficultyBias;
  score: number;
  selfReportSamples: number;
  evidenceSamples: number;
  latestRating?: DifficultyRating;
  direction: "harder" | "steady" | "easier";
  explanation: string;
};

type RecordDifficultyCalibrationInput = {
  exerciseId: string;
  recommendationChosenAt: string;
  rating: DifficultyRating;
  evidence?: ReasoningExerciseEvidence;
  ratedAt?: string;
};

const MAX_CALIBRATION_ENTRIES = 40;
const PROFILE_WINDOW = 8;

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function isDifficultyRating(value: unknown): value is DifficultyRating {
  return value === "too-easy" || value === "productive-stretch" || value === "too-hard";
}

function parseObjective(value: unknown): ObjectiveAttemptSnapshot | null {
  if (!value || typeof value !== "object") return null;
  const objective = value as Partial<ObjectiveAttemptSnapshot>;
  if (
    typeof objective.developedStages !== "number" ||
    typeof objective.totalStages !== "number" ||
    typeof objective.coverage !== "number" ||
    typeof objective.completed !== "boolean" ||
    typeof objective.lensRevealed !== "boolean" ||
    typeof objective.evidenceUpdatedAt !== "string"
  ) {
    return null;
  }

  const totalStages = Math.max(1, objective.totalStages);
  const developedStages = Math.max(0, Math.min(objective.developedStages, totalStages));
  return {
    developedStages,
    totalStages,
    coverage: clamp01(objective.coverage),
    completed: objective.completed,
    lensRevealed: objective.lensRevealed,
    evidenceUpdatedAt: objective.evidenceUpdatedAt,
  };
}

function parseEntry(value: unknown): DifficultyCalibrationEntry | null {
  if (!value || typeof value !== "object") return null;
  const entry = value as Partial<DifficultyCalibrationEntry>;
  if (
    typeof entry.exerciseId !== "string" ||
    typeof entry.recommendationChosenAt !== "string" ||
    !isDifficultyRating(entry.rating) ||
    typeof entry.ratedAt !== "string"
  ) {
    return null;
  }

  return {
    exerciseId: entry.exerciseId,
    recommendationChosenAt: entry.recommendationChosenAt,
    rating: entry.rating,
    ratedAt: entry.ratedAt,
    objective: parseObjective(entry.objective),
  };
}

export function summarizeReasoningAttempt(
  evidence: ReasoningExerciseEvidence | undefined,
): ObjectiveAttemptSnapshot | null {
  if (!evidence) return null;
  const totalStages = Math.max(1, evidence.totalStages);
  const developedStages = Math.max(0, Math.min(evidence.developedStages, totalStages));
  if (developedStages === 0 && !evidence.lensRevealed && !evidence.completedAt) return null;
  return {
    developedStages,
    totalStages,
    coverage: developedStages / totalStages,
    completed: Boolean(evidence.completedAt),
    lensRevealed: evidence.lensRevealed,
    evidenceUpdatedAt: evidence.updatedAt,
  };
}

export function readDifficultyCalibrationHistory(storage: StorageLike): DifficultyCalibrationHistory {
  try {
    const raw = storage.getItem(DIFFICULTY_CALIBRATION_KEY);
    if (!raw) return { version: 1, entries: [] };
    const parsed = JSON.parse(raw) as Partial<DifficultyCalibrationHistory>;
    const entries = Array.isArray(parsed.entries)
      ? parsed.entries
        .map(parseEntry)
        .filter((entry): entry is DifficultyCalibrationEntry => Boolean(entry))
        .slice(-MAX_CALIBRATION_ENTRIES)
      : [];
    return { version: 1, entries };
  } catch {
    return { version: 1, entries: [] };
  }
}

export function recordDifficultyCalibration(
  storage: StorageLike,
  input: RecordDifficultyCalibrationInput,
): DifficultyCalibrationHistory {
  const previous = readDifficultyCalibrationHistory(storage);
  const entry: DifficultyCalibrationEntry = {
    exerciseId: input.exerciseId,
    recommendationChosenAt: input.recommendationChosenAt,
    rating: input.rating,
    ratedAt: input.ratedAt ?? new Date().toISOString(),
    objective: summarizeReasoningAttempt(input.evidence),
  };

  const entries = [
    ...previous.entries.filter((candidate) => !(
      candidate.exerciseId === input.exerciseId
      && candidate.recommendationChosenAt === input.recommendationChosenAt
    )),
    entry,
  ].slice(-MAX_CALIBRATION_ENTRIES);
  const next: DifficultyCalibrationHistory = { version: 1, entries };

  try {
    storage.setItem(DIFFICULTY_CALIBRATION_KEY, JSON.stringify(next));
  } catch {
    // Calibration is optional metadata; learning remains usable without persistence.
  }

  return next;
}

export function evaluateDifficultyCalibrationEntry(
  entry: DifficultyCalibrationEntry,
): DifficultyCalibrationEvaluation {
  const objective = entry.objective;
  if (!objective) {
    return {
      entry,
      signal: "waiting",
      vote: 0,
      reason: "Waiting for observable attempt evidence before this rating can affect sequencing.",
    };
  }

  const independentlyCompleted = objective.completed && objective.coverage >= 0.75 && !objective.lensRevealed;
  const lowProgress = !objective.completed && objective.coverage < 0.5;
  const neededSupport = objective.lensRevealed || (!objective.completed && objective.coverage < 0.75);

  if (entry.rating === "too-easy") {
    if (independentlyCompleted) {
      return {
        entry,
        signal: "raise",
        vote: 1,
        reason: "The problem felt easy and the recorded attempt shows substantial independent completion.",
      };
    }
    return {
      entry,
      signal: "hold",
      vote: 0,
      reason: "The self-rating is not enough to raise difficulty because the recorded attempt does not yet show independent completion.",
    };
  }

  if (entry.rating === "too-hard") {
    if (neededSupport) {
      return {
        entry,
        signal: "lower",
        vote: -1,
        reason: "The problem felt too hard and the recorded attempt also shows incomplete progress or structural-lens support.",
      };
    }
    return {
      entry,
      signal: "hold",
      vote: 0,
      reason: "The difficulty rating conflicts with a substantially complete independent attempt, so sequencing stays steady.",
    };
  }

  if (lowProgress) {
    return {
      entry,
      signal: "lower",
      vote: -1,
      reason: "The problem felt like a stretch, but the recorded attempt stalled early, so the next step is softened slightly.",
    };
  }

  return {
    entry,
    signal: "hold",
    vote: 0,
    reason: "The productive-stretch rating is consistent with the recorded attempt, so current difficulty is maintained.",
  };
}

export function buildDifficultyCalibrationProfile(
  history: DifficultyCalibrationHistory,
): DifficultyCalibrationProfile {
  const entries = history.entries.slice(-PROFILE_WINDOW).reverse();
  const evaluations = entries.map(evaluateDifficultyCalibrationEntry);
  const usable = evaluations.filter((evaluation) => evaluation.signal !== "waiting");

  let weightedVote = 0;
  let totalWeight = 0;
  usable.forEach((evaluation, index) => {
    const weight = Math.max(0.5, 1 - index * 0.08);
    weightedVote += evaluation.vote * weight;
    totalWeight += weight;
  });

  const score = totalWeight ? weightedVote / totalWeight : 0;
  const bias: DifficultyBias = score >= 0.35 ? 1 : score <= -0.35 ? -1 : 0;
  const direction = bias === 1 ? "harder" : bias === -1 ? "easier" : "steady";

  let explanation = "No difficulty adjustment is active yet.";
  if (!entries.length) {
    explanation = "Rate a recommended problem after an attempt to start calibrating difficulty.";
  } else if (!usable.length) {
    explanation = "Ratings are stored, but they stay inactive until AgoCode can cross-check them against observable attempt evidence.";
  } else if (bias === 1) {
    explanation = "Recent ratings and recorded solution evidence support a harder next step.";
  } else if (bias === -1) {
    explanation = "Recent ratings and recorded solution evidence support a gentler next step.";
  } else {
    explanation = "Recent ratings and recorded solution evidence support holding the current difficulty band.";
  }

  return {
    bias,
    score,
    selfReportSamples: entries.length,
    evidenceSamples: usable.length,
    latestRating: entries[0]?.rating,
    direction,
    explanation,
  };
}
