export type StorageLike = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

export type LearningAttempt = {
  attemptedAt: string;
  passed: boolean;
  passedCount: number;
  totalTests: number;
  hintCount: number;
  runtimeError: boolean;
};

export type RecognitionTechniqueEvidence = {
  totalSeen: number;
  firstTryCorrect: number;
};

export type RecognitionEvidence = {
  sessions: number;
  lastFirstTryCorrect: number;
  bestFirstTryCorrect: number;
  totalScenarios: number;
  byTechnique?: Record<string, RecognitionTechniqueEvidence>;
  recentMissedScenarioIds?: string[];
};

export type PredictionEvidence = {
  sessions: number;
  totalQuestions: number;
  correctFirstTry: number;
  currentStreak: number;
  bestStreak: number;
  lastAccuracy: number;
  lastAnsweredAt?: string;
  lastSessionId?: string;
};

export type ExplanationEvidence = {
  sessions: number;
  completed: number;
  lastScore: number;
  bestScore: number;
  averageScore: number;
  lastCompletedAt?: string;
};

export type RecallEvidence = {
  sessions: number;
  successful: number;
  failed: number;
  lastOutcome: "remembered" | "needs-work";
  lastReviewedAt: string;
  nextReviewAt: string;
  intervalDays: number;
};

export type ReasoningConfidence = "stuck" | "developing" | "solid";

export type ReasoningExerciseEvidence = {
  developedStages: number;
  totalStages: number;
  lensRevealed: boolean;
  confidence?: ReasoningConfidence;
  completedAt?: string;
  updatedAt: string;
};

export type ReasoningEvidence = {
  byExercise: Record<string, ReasoningExerciseEvidence>;
};

export type ProjectExerciseEvidence = {
  developedSections: number;
  totalSections: number;
  checkedQualityGates: number;
  totalQualityGates: number;
  completedAt?: string;
  updatedAt: string;
};

export type ProjectEvidence = {
  byExercise: Record<string, ProjectExerciseEvidence>;
};

export type LearningEvidence = {
  version: 1;
  exerciseId: string;
  completedAt?: string;
  attempts: LearningAttempt[];
  bestPassedCount: number;
  totalTests: number;
  lowestHintCountOnPass?: number;
  recognition?: RecognitionEvidence;
  prediction?: PredictionEvidence;
  explanation?: ExplanationEvidence;
  recall?: RecallEvidence;
  reasoning?: ReasoningEvidence;
  project?: ProjectEvidence;
};

type RecordAttemptInput = Omit<LearningAttempt, "attemptedAt"> & {
  exerciseId: string;
  attemptedAt?: string;
};

type RecordRecognitionInput = {
  exerciseId: string;
  firstTryCorrect: number;
  totalScenarios: number;
  completedAt?: string;
  techniqueResults?: Record<string, { totalScenarios: number; firstTryCorrect: number }>;
  missedScenarioIds?: string[];
};

type RecordPredictionInput = {
  exerciseId: string;
  sessionId: string;
  correct: boolean;
  answeredAt?: string;
  completeAfterQuestions?: number;
};

type RecordExplanationInput = {
  exerciseId: string;
  score: number;
  completed?: boolean;
  completedAt?: string;
};

type RecordRecallInput = {
  exerciseId: string;
  outcome: "remembered" | "needs-work";
  reviewedAt?: string;
  baseIntervalDays?: number;
};

type RecordReasoningInput = {
  exerciseId: string;
  developedStages: number;
  totalStages?: number;
  lensRevealed: boolean;
  confidence?: ReasoningConfidence;
  completedAt?: string;
  updatedAt?: string;
};

type RecordProjectInput = {
  exerciseId: string;
  developedSections: number;
  totalSections?: number;
  checkedQualityGates: number;
  totalQualityGates?: number;
  completed?: boolean;
  updatedAt?: string;
};

const MAX_ATTEMPTS = 50;
const DAY_MS = 24 * 60 * 60 * 1000;

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function isAttempt(value: unknown): value is LearningAttempt {
  if (!value || typeof value !== "object") return false;
  const attempt = value as Partial<LearningAttempt>;
  return (
    typeof attempt.attemptedAt === "string" &&
    typeof attempt.passed === "boolean" &&
    typeof attempt.passedCount === "number" &&
    typeof attempt.totalTests === "number" &&
    typeof attempt.hintCount === "number" &&
    typeof attempt.runtimeError === "boolean"
  );
}

function parseTechniqueEvidence(value: unknown): Record<string, RecognitionTechniqueEvidence> | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const parsed: Record<string, RecognitionTechniqueEvidence> = {};

  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    if (!raw || typeof raw !== "object") continue;
    const item = raw as Partial<RecognitionTechniqueEvidence>;
    if (typeof item.totalSeen !== "number" || typeof item.firstTryCorrect !== "number") continue;
    const totalSeen = Math.max(0, item.totalSeen);
    parsed[key] = {
      totalSeen,
      firstTryCorrect: Math.max(0, Math.min(item.firstTryCorrect, totalSeen)),
    };
  }

  return Object.keys(parsed).length ? parsed : undefined;
}

function parseRecognition(value: unknown): RecognitionEvidence | undefined {
  if (!value || typeof value !== "object") return undefined;
  const recognition = value as Partial<RecognitionEvidence>;
  if (
    typeof recognition.sessions !== "number" ||
    typeof recognition.lastFirstTryCorrect !== "number" ||
    typeof recognition.bestFirstTryCorrect !== "number" ||
    typeof recognition.totalScenarios !== "number"
  ) {
    return undefined;
  }

  const totalScenarios = Math.max(0, recognition.totalScenarios);
  const recentMissedScenarioIds = Array.isArray(recognition.recentMissedScenarioIds)
    ? recognition.recentMissedScenarioIds.filter((item): item is string => typeof item === "string")
    : undefined;

  return {
    sessions: Math.max(0, recognition.sessions),
    lastFirstTryCorrect: Math.max(0, Math.min(recognition.lastFirstTryCorrect, totalScenarios)),
    bestFirstTryCorrect: Math.max(0, Math.min(recognition.bestFirstTryCorrect, totalScenarios)),
    totalScenarios,
    byTechnique: parseTechniqueEvidence(recognition.byTechnique),
    recentMissedScenarioIds,
  };
}

function parsePrediction(value: unknown): PredictionEvidence | undefined {
  if (!value || typeof value !== "object") return undefined;
  const prediction = value as Partial<PredictionEvidence>;
  if (
    typeof prediction.sessions !== "number" ||
    typeof prediction.totalQuestions !== "number" ||
    typeof prediction.correctFirstTry !== "number" ||
    typeof prediction.currentStreak !== "number" ||
    typeof prediction.bestStreak !== "number" ||
    typeof prediction.lastAccuracy !== "number"
  ) {
    return undefined;
  }

  const totalQuestions = Math.max(0, prediction.totalQuestions);
  const correctFirstTry = Math.max(0, Math.min(prediction.correctFirstTry, totalQuestions));
  return {
    sessions: Math.max(0, prediction.sessions),
    totalQuestions,
    correctFirstTry,
    currentStreak: Math.max(0, prediction.currentStreak),
    bestStreak: Math.max(0, prediction.bestStreak),
    lastAccuracy: clamp01(prediction.lastAccuracy),
    lastAnsweredAt: typeof prediction.lastAnsweredAt === "string" ? prediction.lastAnsweredAt : undefined,
    lastSessionId: typeof prediction.lastSessionId === "string" ? prediction.lastSessionId : undefined,
  };
}

function parseExplanation(value: unknown): ExplanationEvidence | undefined {
  if (!value || typeof value !== "object") return undefined;
  const explanation = value as Partial<ExplanationEvidence>;
  if (
    typeof explanation.sessions !== "number" ||
    typeof explanation.completed !== "number" ||
    typeof explanation.lastScore !== "number" ||
    typeof explanation.bestScore !== "number" ||
    typeof explanation.averageScore !== "number"
  ) {
    return undefined;
  }

  return {
    sessions: Math.max(0, explanation.sessions),
    completed: Math.max(0, explanation.completed),
    lastScore: clamp01(explanation.lastScore),
    bestScore: clamp01(explanation.bestScore),
    averageScore: clamp01(explanation.averageScore),
    lastCompletedAt: typeof explanation.lastCompletedAt === "string" ? explanation.lastCompletedAt : undefined,
  };
}

function parseRecall(value: unknown): RecallEvidence | undefined {
  if (!value || typeof value !== "object") return undefined;
  const recall = value as Partial<RecallEvidence>;
  if (
    typeof recall.sessions !== "number" ||
    typeof recall.successful !== "number" ||
    typeof recall.failed !== "number" ||
    (recall.lastOutcome !== "remembered" && recall.lastOutcome !== "needs-work") ||
    typeof recall.lastReviewedAt !== "string" ||
    typeof recall.nextReviewAt !== "string" ||
    typeof recall.intervalDays !== "number"
  ) {
    return undefined;
  }

  return {
    sessions: Math.max(0, recall.sessions),
    successful: Math.max(0, recall.successful),
    failed: Math.max(0, recall.failed),
    lastOutcome: recall.lastOutcome,
    lastReviewedAt: recall.lastReviewedAt,
    nextReviewAt: recall.nextReviewAt,
    intervalDays: Math.max(1, recall.intervalDays),
  };
}

function parseReasoning(value: unknown): ReasoningEvidence | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const rawByExercise = (value as Partial<ReasoningEvidence>).byExercise;
  if (!rawByExercise || typeof rawByExercise !== "object" || Array.isArray(rawByExercise)) return undefined;

  const byExercise: Record<string, ReasoningExerciseEvidence> = {};
  for (const [exerciseId, raw] of Object.entries(rawByExercise as Record<string, unknown>)) {
    if (!raw || typeof raw !== "object") continue;
    const item = raw as Partial<ReasoningExerciseEvidence>;
    if (
      typeof item.developedStages !== "number" ||
      typeof item.totalStages !== "number" ||
      typeof item.lensRevealed !== "boolean" ||
      typeof item.updatedAt !== "string"
    ) continue;

    const totalStages = Math.max(1, item.totalStages);
    const confidence = item.confidence === "stuck" || item.confidence === "developing" || item.confidence === "solid"
      ? item.confidence
      : undefined;
    byExercise[exerciseId] = {
      developedStages: Math.max(0, Math.min(item.developedStages, totalStages)),
      totalStages,
      lensRevealed: item.lensRevealed,
      confidence,
      completedAt: typeof item.completedAt === "string" ? item.completedAt : undefined,
      updatedAt: item.updatedAt,
    };
  }

  return Object.keys(byExercise).length ? { byExercise } : undefined;
}

function parseProject(value: unknown): ProjectEvidence | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const rawByExercise = (value as Partial<ProjectEvidence>).byExercise;
  if (!rawByExercise || typeof rawByExercise !== "object" || Array.isArray(rawByExercise)) return undefined;

  const byExercise: Record<string, ProjectExerciseEvidence> = {};
  for (const [exerciseId, raw] of Object.entries(rawByExercise as Record<string, unknown>)) {
    if (!raw || typeof raw !== "object") continue;
    const item = raw as Partial<ProjectExerciseEvidence>;
    if (
      typeof item.developedSections !== "number" ||
      typeof item.totalSections !== "number" ||
      typeof item.checkedQualityGates !== "number" ||
      typeof item.totalQualityGates !== "number" ||
      typeof item.updatedAt !== "string"
    ) continue;

    const totalSections = Math.max(1, item.totalSections);
    const totalQualityGates = Math.max(1, item.totalQualityGates);
    byExercise[exerciseId] = {
      developedSections: Math.max(0, Math.min(item.developedSections, totalSections)),
      totalSections,
      checkedQualityGates: Math.max(0, Math.min(item.checkedQualityGates, totalQualityGates)),
      totalQualityGates,
      completedAt: typeof item.completedAt === "string" ? item.completedAt : undefined,
      updatedAt: item.updatedAt,
    };
  }

  return Object.keys(byExercise).length ? { byExercise } : undefined;
}

function legacyRecognition(parsed: Record<string, unknown>): RecognitionEvidence | undefined {
  if (typeof parsed.score !== "number" || typeof parsed.total !== "number") return undefined;
  const totalScenarios = Math.max(0, parsed.total);
  const score = Math.max(0, Math.min(parsed.score, totalScenarios));
  return {
    sessions: 1,
    lastFirstTryCorrect: score,
    bestFirstTryCorrect: score,
    totalScenarios,
  };
}

function persist(storage: StorageLike, key: string, evidence: LearningEvidence) {
  try {
    storage.setItem(key, JSON.stringify(evidence));
  } catch {
    // Learning should still work if browser storage is unavailable or full.
  }
  return evidence;
}

export function readLearningEvidence(
  storage: StorageLike,
  key: string,
  fallbackExerciseId = key,
): LearningEvidence | null {
  try {
    const raw = storage.getItem(key);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (!parsed || typeof parsed !== "object") return null;

    if (parsed.version === 1 && Array.isArray(parsed.attempts)) {
      const attempts = parsed.attempts.filter(isAttempt);
      return {
        version: 1,
        exerciseId: typeof parsed.exerciseId === "string" ? parsed.exerciseId : fallbackExerciseId,
        completedAt: typeof parsed.completedAt === "string" ? parsed.completedAt : undefined,
        attempts,
        bestPassedCount: typeof parsed.bestPassedCount === "number" ? parsed.bestPassedCount : 0,
        totalTests: typeof parsed.totalTests === "number" ? parsed.totalTests : 0,
        lowestHintCountOnPass:
          typeof parsed.lowestHintCountOnPass === "number" ? parsed.lowestHintCountOnPass : undefined,
        recognition: parseRecognition(parsed.recognition) ?? legacyRecognition(parsed),
        prediction: parsePrediction(parsed.prediction),
        explanation: parseExplanation(parsed.explanation),
        recall: parseRecall(parsed.recall),
        reasoning: parseReasoning(parsed.reasoning),
        project: parseProject(parsed.project),
      };
    }

    // Backward compatibility with completion-only and early recognition records.
    if (typeof parsed.completedAt === "string") {
      return {
        version: 1,
        exerciseId: typeof parsed.exerciseId === "string" ? parsed.exerciseId : fallbackExerciseId,
        completedAt: parsed.completedAt,
        attempts: [],
        bestPassedCount: 0,
        totalTests: 0,
        recognition: legacyRecognition(parsed),
      };
    }
  } catch {
    return null;
  }

  return null;
}

function baseEvidence(previous: LearningEvidence | null, exerciseId: string): LearningEvidence {
  return {
    version: 1,
    exerciseId,
    completedAt: previous?.completedAt,
    attempts: previous?.attempts ?? [],
    bestPassedCount: previous?.bestPassedCount ?? 0,
    totalTests: previous?.totalTests ?? 0,
    lowestHintCountOnPass: previous?.lowestHintCountOnPass,
    recognition: previous?.recognition,
    prediction: previous?.prediction,
    explanation: previous?.explanation,
    recall: previous?.recall,
    reasoning: previous?.reasoning,
    project: previous?.project,
  };
}

function earliestCompletion(values: Array<string | undefined>) {
  const timestamps = values.filter((value): value is string => typeof value === "string");
  if (!timestamps.length) return undefined;
  return timestamps.sort((a, b) => new Date(a).getTime() - new Date(b).getTime())[0];
}

export function recordLearningAttempt(
  storage: StorageLike,
  key: string,
  input: RecordAttemptInput,
): LearningEvidence {
  const attemptedAt = input.attemptedAt ?? new Date().toISOString();
  const previous = readLearningEvidence(storage, key, input.exerciseId);
  const attempt: LearningAttempt = {
    attemptedAt,
    passed: input.passed,
    passedCount: input.passedCount,
    totalTests: input.totalTests,
    hintCount: input.hintCount,
    runtimeError: input.runtimeError,
  };

  const previousHintFloor = previous?.lowestHintCountOnPass;
  const lowestHintCountOnPass = input.passed
    ? previousHintFloor === undefined
      ? input.hintCount
      : Math.min(previousHintFloor, input.hintCount)
    : previousHintFloor;

  const evidence: LearningEvidence = {
    ...baseEvidence(previous, input.exerciseId),
    completedAt: previous?.completedAt ?? (input.passed ? attemptedAt : undefined),
    attempts: [...(previous?.attempts ?? []), attempt].slice(-MAX_ATTEMPTS),
    bestPassedCount: Math.max(previous?.bestPassedCount ?? 0, input.passedCount),
    totalTests: Math.max(previous?.totalTests ?? 0, input.totalTests),
    lowestHintCountOnPass,
  };

  return persist(storage, key, evidence);
}

export function recordRecognitionCompletion(
  storage: StorageLike,
  key: string,
  input: RecordRecognitionInput,
): LearningEvidence {
  const completedAt = input.completedAt ?? new Date().toISOString();
  const previous = readLearningEvidence(storage, key, input.exerciseId);
  const totalScenarios = Math.max(0, input.totalScenarios);
  const firstTryCorrect = Math.max(0, Math.min(input.firstTryCorrect, totalScenarios));
  const priorRecognition = previous?.recognition;
  const byTechnique: Record<string, RecognitionTechniqueEvidence> = {
    ...(priorRecognition?.byTechnique ?? {}),
  };

  for (const [technique, result] of Object.entries(input.techniqueResults ?? {})) {
    const sessionTotal = Math.max(0, result.totalScenarios);
    const sessionCorrect = Math.max(0, Math.min(result.firstTryCorrect, sessionTotal));
    const prior = byTechnique[technique] ?? { totalSeen: 0, firstTryCorrect: 0 };
    byTechnique[technique] = {
      totalSeen: prior.totalSeen + sessionTotal,
      firstTryCorrect: prior.firstTryCorrect + sessionCorrect,
    };
  }

  const recentMissedScenarioIds = input.missedScenarioIds === undefined
    ? priorRecognition?.recentMissedScenarioIds
    : Array.from(new Set(input.missedScenarioIds.filter((item) => typeof item === "string")));

  const evidence: LearningEvidence = {
    ...baseEvidence(previous, input.exerciseId),
    completedAt: previous?.completedAt ?? completedAt,
    recognition: {
      sessions: (priorRecognition?.sessions ?? 0) + 1,
      lastFirstTryCorrect: firstTryCorrect,
      bestFirstTryCorrect: Math.max(priorRecognition?.bestFirstTryCorrect ?? 0, firstTryCorrect),
      totalScenarios: Math.max(priorRecognition?.totalScenarios ?? 0, totalScenarios),
      byTechnique: Object.keys(byTechnique).length ? byTechnique : undefined,
      recentMissedScenarioIds,
    },
  };

  return persist(storage, key, evidence);
}

export function recordPredictionAttempt(
  storage: StorageLike,
  key: string,
  input: RecordPredictionInput,
): LearningEvidence {
  const answeredAt = input.answeredAt ?? new Date().toISOString();
  const previous = readLearningEvidence(storage, key, input.exerciseId);
  const prior = previous?.prediction;
  const newSession = prior?.lastSessionId !== input.sessionId;
  const totalQuestions = (prior?.totalQuestions ?? 0) + 1;
  const correctFirstTry = (prior?.correctFirstTry ?? 0) + (input.correct ? 1 : 0);
  const currentStreak = input.correct ? (prior?.currentStreak ?? 0) + 1 : 0;
  const bestStreak = Math.max(prior?.bestStreak ?? 0, currentStreak);
  const accuracy = totalQuestions ? correctFirstTry / totalQuestions : 0;
  const completeAfterQuestions = Math.max(1, input.completeAfterQuestions ?? 3);
  const qualifiesAsEvidence = totalQuestions >= completeAfterQuestions && accuracy >= 2 / 3;

  const evidence: LearningEvidence = {
    ...baseEvidence(previous, input.exerciseId),
    completedAt: previous?.completedAt ?? (qualifiesAsEvidence ? answeredAt : undefined),
    prediction: {
      sessions: (prior?.sessions ?? 0) + (newSession ? 1 : 0),
      totalQuestions,
      correctFirstTry,
      currentStreak,
      bestStreak,
      lastAccuracy: accuracy,
      lastAnsweredAt: answeredAt,
      lastSessionId: input.sessionId,
    },
  };

  return persist(storage, key, evidence);
}

export function recordExplanationCompletion(
  storage: StorageLike,
  key: string,
  input: RecordExplanationInput,
): LearningEvidence {
  const completedAt = input.completedAt ?? new Date().toISOString();
  const previous = readLearningEvidence(storage, key, input.exerciseId);
  const prior = previous?.explanation;
  const score = clamp01(input.score);
  const sessions = (prior?.sessions ?? 0) + 1;
  const completed = (prior?.completed ?? 0) + (input.completed === false ? 0 : 1);
  const averageScore = (((prior?.averageScore ?? 0) * (prior?.sessions ?? 0)) + score) / sessions;
  const marksComplete = input.completed !== false;

  const evidence: LearningEvidence = {
    ...baseEvidence(previous, input.exerciseId),
    completedAt: previous?.completedAt ?? (marksComplete ? completedAt : undefined),
    explanation: {
      sessions,
      completed,
      lastScore: score,
      bestScore: Math.max(prior?.bestScore ?? 0, score),
      averageScore,
      lastCompletedAt: marksComplete ? completedAt : prior?.lastCompletedAt,
    },
  };

  return persist(storage, key, evidence);
}

export function recordRecallOutcome(
  storage: StorageLike,
  key: string,
  input: RecordRecallInput,
): LearningEvidence {
  const reviewedAt = input.reviewedAt ?? new Date().toISOString();
  const previous = readLearningEvidence(storage, key, input.exerciseId);
  const prior = previous?.recall;
  const baseInterval = Math.max(1, input.baseIntervalDays ?? 1);
  const intervalDays = input.outcome === "remembered"
    ? Math.min(30, prior ? Math.max(baseInterval, prior.intervalDays * 2) : baseInterval)
    : 1;
  const nextReviewAt = new Date(new Date(reviewedAt).getTime() + intervalDays * DAY_MS).toISOString();

  const evidence: LearningEvidence = {
    ...baseEvidence(previous, input.exerciseId),
    recall: {
      sessions: (prior?.sessions ?? 0) + 1,
      successful: (prior?.successful ?? 0) + (input.outcome === "remembered" ? 1 : 0),
      failed: (prior?.failed ?? 0) + (input.outcome === "needs-work" ? 1 : 0),
      lastOutcome: input.outcome,
      lastReviewedAt: reviewedAt,
      nextReviewAt,
      intervalDays,
    },
  };

  return persist(storage, key, evidence);
}

export function recordReasoningNotebookEvidence(
  storage: StorageLike,
  key: string,
  input: RecordReasoningInput,
): LearningEvidence {
  const updatedAt = input.updatedAt ?? new Date().toISOString();
  const previous = readLearningEvidence(storage, key, "reasoning-notebooks");
  const totalStages = Math.max(1, input.totalStages ?? 8);
  const developedStages = Math.max(0, Math.min(input.developedStages, totalStages));
  const byExercise: Record<string, ReasoningExerciseEvidence> = {
    ...(previous?.reasoning?.byExercise ?? {}),
  };
  const meaningful = developedStages > 0 || Boolean(input.completedAt) || input.lensRevealed || Boolean(input.confidence);

  if (meaningful) {
    byExercise[input.exerciseId] = {
      developedStages,
      totalStages,
      lensRevealed: input.lensRevealed,
      confidence: input.confidence,
      completedAt: input.completedAt,
      updatedAt,
    };
  } else {
    delete byExercise[input.exerciseId];
  }

  const reasoning = Object.keys(byExercise).length ? { byExercise } : undefined;
  const completedAt = reasoning
    ? earliestCompletion(Object.values(byExercise).map((item) => item.completedAt))
    : undefined;

  return persist(storage, key, {
    ...baseEvidence(previous, "reasoning-notebooks"),
    completedAt,
    reasoning,
  });
}

export function recordProjectWorkspaceEvidence(
  storage: StorageLike,
  key: string,
  input: RecordProjectInput,
): LearningEvidence {
  const updatedAt = input.updatedAt ?? new Date().toISOString();
  const previous = readLearningEvidence(storage, key, "project-workspaces");
  const totalSections = Math.max(1, input.totalSections ?? 9);
  const totalQualityGates = Math.max(1, input.totalQualityGates ?? 6);
  const developedSections = Math.max(0, Math.min(input.developedSections, totalSections));
  const checkedQualityGates = Math.max(0, Math.min(input.checkedQualityGates, totalQualityGates));
  const byExercise: Record<string, ProjectExerciseEvidence> = {
    ...(previous?.project?.byExercise ?? {}),
  };
  const meaningful = developedSections > 0 || checkedQualityGates > 0;
  const priorEntry = byExercise[input.exerciseId];

  if (meaningful) {
    byExercise[input.exerciseId] = {
      developedSections,
      totalSections,
      checkedQualityGates,
      totalQualityGates,
      completedAt: input.completed ? (priorEntry?.completedAt ?? updatedAt) : undefined,
      updatedAt,
    };
  } else {
    delete byExercise[input.exerciseId];
  }

  const project = Object.keys(byExercise).length ? { byExercise } : undefined;
  const completedAt = project
    ? earliestCompletion(Object.values(byExercise).map((item) => item.completedAt))
    : undefined;

  return persist(storage, key, {
    ...baseEvidence(previous, "project-workspaces"),
    completedAt,
    project,
  });
}
