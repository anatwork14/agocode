import type { AtlasPatternId } from "../practice/atlas-recognition.ts";
import type { ModelVariantDecision } from "../practice/model-variants.ts";

export const MODEL_VARIANT_HISTORY_KEY = "agocode.progress.transfer.model-variants";
const MAX_MODEL_VARIANT_ATTEMPTS = 200;

export type StorageLike = Pick<Storage, "getItem" | "setItem">;

export type ModelVariantAttempt = {
  exerciseId: string;
  variantId: string;
  familyId: AtlasPatternId;
  expectedDecision: ModelVariantDecision;
  decision: ModelVariantDecision;
  correct: boolean;
  noteLength: number;
  attemptedAt: string;
};

export type ModelVariantHistory = {
  entries: ModelVariantAttempt[];
};

export type ModelVariantFamilyProfile = {
  familyId: AtlasPatternId;
  attempts: number;
  correct: number;
  accuracy: number;
};

export type ModelVariantProfile = {
  attempts: number;
  correct: number;
  accuracy: number;
  families: ModelVariantFamilyProfile[];
};

function isDecision(value: unknown): value is ModelVariantDecision {
  return value === "same-family" || value === "new-family" || value === "depends";
}

function isAttempt(value: unknown): value is ModelVariantAttempt {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<ModelVariantAttempt>;
  return typeof item.exerciseId === "string"
    && typeof item.variantId === "string"
    && typeof item.familyId === "string"
    && isDecision(item.expectedDecision)
    && isDecision(item.decision)
    && typeof item.correct === "boolean"
    && typeof item.noteLength === "number"
    && Number.isFinite(item.noteLength)
    && typeof item.attemptedAt === "string";
}

export function readModelVariantHistory(storage: StorageLike): ModelVariantHistory {
  try {
    const raw = storage.getItem(MODEL_VARIANT_HISTORY_KEY);
    if (!raw) return { entries: [] };
    const parsed = JSON.parse(raw) as Partial<ModelVariantHistory>;
    const entries = Array.isArray(parsed.entries) ? parsed.entries.filter(isAttempt) : [];
    return { entries: entries.slice(-MAX_MODEL_VARIANT_ATTEMPTS) };
  } catch {
    return { entries: [] };
  }
}

export function recordModelVariantAttempt(storage: StorageLike, attempt: ModelVariantAttempt) {
  const history = readModelVariantHistory(storage);
  const normalized: ModelVariantAttempt = {
    ...attempt,
    noteLength: Math.max(0, Math.floor(attempt.noteLength)),
  };
  const next = {
    entries: [...history.entries, normalized].slice(-MAX_MODEL_VARIANT_ATTEMPTS),
  };
  storage.setItem(MODEL_VARIANT_HISTORY_KEY, JSON.stringify(next));
  return next;
}

export function buildModelVariantProfile(history: ModelVariantHistory): ModelVariantProfile {
  const byFamily = new Map<AtlasPatternId, { attempts: number; correct: number }>();
  for (const entry of history.entries) {
    const current = byFamily.get(entry.familyId) ?? { attempts: 0, correct: 0 };
    current.attempts += 1;
    if (entry.correct) current.correct += 1;
    byFamily.set(entry.familyId, current);
  }

  const correct = history.entries.filter((entry) => entry.correct).length;
  return {
    attempts: history.entries.length,
    correct,
    accuracy: history.entries.length ? correct / history.entries.length : 0,
    families: Array.from(byFamily.entries())
      .map(([familyId, value]) => ({
        familyId,
        attempts: value.attempts,
        correct: value.correct,
        accuracy: value.attempts ? value.correct / value.attempts : 0,
      }))
      .sort((a, b) => b.attempts - a.attempts || a.familyId.localeCompare(b.familyId)),
  };
}
