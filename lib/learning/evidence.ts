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

export type LearningEvidence = {
  version: 1;
  exerciseId: string;
  completedAt?: string;
  attempts: LearningAttempt[];
  bestPassedCount: number;
  totalTests: number;
  lowestHintCountOnPass?: number;
  recognition?: RecognitionEvidence;
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

const MAX_ATTEMPTS = 50;

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
    version: 1,
    exerciseId: input.exerciseId,
    completedAt: previous?.completedAt ?? (input.passed ? attemptedAt : undefined),
    attempts: [...(previous?.attempts ?? []), attempt].slice(-MAX_ATTEMPTS),
    bestPassedCount: Math.max(previous?.bestPassedCount ?? 0, input.passedCount),
    totalTests: Math.max(previous?.totalTests ?? 0, input.totalTests),
    lowestHintCountOnPass,
    recognition: previous?.recognition,
  };

  try {
    storage.setItem(key, JSON.stringify(evidence));
  } catch {
    // Learning should still work if browser storage is unavailable or full.
  }

  return evidence;
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
    version: 1,
    exerciseId: input.exerciseId,
    completedAt: previous?.completedAt ?? completedAt,
    attempts: previous?.attempts ?? [],
    bestPassedCount: previous?.bestPassedCount ?? 0,
    totalTests: previous?.totalTests ?? 0,
    lowestHintCountOnPass: previous?.lowestHintCountOnPass,
    recognition: {
      sessions: (priorRecognition?.sessions ?? 0) + 1,
      lastFirstTryCorrect: firstTryCorrect,
      bestFirstTryCorrect: Math.max(priorRecognition?.bestFirstTryCorrect ?? 0, firstTryCorrect),
      totalScenarios: Math.max(priorRecognition?.totalScenarios ?? 0, totalScenarios),
      byTechnique: Object.keys(byTechnique).length ? byTechnique : undefined,
      recentMissedScenarioIds,
    },
  };

  try {
    storage.setItem(key, JSON.stringify(evidence));
  } catch {
    // Recognition practice should remain usable without persistent storage.
  }

  return evidence;
}
