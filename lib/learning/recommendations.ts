import { canonicalExercises, type CanonicalExercise } from "../knowledge/all-exercises.ts";
import { diagnosticPatterns } from "../knowledge/diagnostic-patterns.ts";
import { stuckDiagnoses, type StuckStateId } from "../knowledge/stuck-router.ts";
import { classifiedAtlasExercises, type AtlasPatternId, type ClassifiedAtlasExercise } from "../practice/atlas-recognition.ts";
import type { StorageLike } from "./evidence.ts";
import type { MasterySnapshot } from "./mastery.ts";
import type { EvidenceDimension } from "./progressCatalog.ts";
import { getMostFrequentObstacles, type ObstacleEvidence } from "./obstacles.ts";

export const RECOMMENDATION_HISTORY_KEY = "agocode.progress.next-problem-history";

export type RecommendationHistoryEntry = {
  exerciseId: string;
  chosenAt: string;
};

export type RecommendationHistory = {
  version: 1;
  entries: RecommendationHistoryEntry[];
};

export type AdaptiveRecommendationInput = {
  mastery: MasterySnapshot;
  obstacles?: ObstacleEvidence | null;
  recentExerciseIds?: readonly string[];
  missedExerciseIds?: readonly string[];
  recommendationHistoryIds?: readonly string[];
  limit?: number;
  seed?: string;
};

export type AdaptiveRecommendation = {
  exercise: CanonicalExercise;
  familyId: AtlasPatternId;
  familyLabel: string;
  score: number;
  targetDimension: EvidenceDimension;
  reasons: string[];
  matchedObstacleIds: StuckStateId[];
  novelty: {
    source: boolean;
    domain: boolean;
    family: boolean;
  };
};

const dimensionFamilyAffinity: Record<EvidenceDimension, readonly AtlasPatternId[]> = {
  understand: ["analysis-correctness", "representations", "linear-adts", "tree-order", "graph-traversal", "engineering-design"],
  trace: ["search-selection", "sorting-transform", "recursive-search", "graph-traversal", "weighted-graphs", "dynamic-programming"],
  predict: ["heap-priority", "search-selection", "graph-traversal", "weighted-graphs", "greedy-approximation", "dynamic-programming"],
  rebuild: ["linear-adts", "hashing", "search-selection", "sorting-transform", "tree-order", "heap-priority", "graph-traversal", "weighted-graphs", "dynamic-programming"],
  explain: ["analysis-correctness", "greedy-approximation", "hard-optimization", "dynamic-programming", "engineering-design"],
  transfer: ["search-selection", "hashing", "recursive-search", "graph-traversal", "weighted-graphs", "dynamic-programming", "greedy-approximation", "text-indexing"],
  recall: [],
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function hashSeed(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function tieBreaker(seed: string, id: string) {
  return hashSeed(`${seed}:${id}`) / 0xffffffff;
}

function uniqueRecent(ids: readonly string[] | undefined, limit = 10) {
  const seen = new Set<string>();
  const output: string[] = [];
  for (const id of ids ?? []) {
    if (!id || seen.has(id)) continue;
    seen.add(id);
    output.push(id);
    if (output.length >= limit) break;
  }
  return output;
}

function candidateKindScore(exercise: CanonicalExercise, dimension: EvidenceDimension) {
  if (dimension === "understand") {
    return exercise.kind === "reasoning" ? 10 : exercise.kind === "design" ? 8 : 3;
  }
  if (dimension === "trace" || dimension === "predict") {
    return exercise.kind === "implementation" ? 10 : exercise.kind === "reasoning" ? 4 : 1;
  }
  if (dimension === "rebuild") {
    return exercise.kind === "implementation" ? 13 : exercise.kind === "design" ? 4 : 2;
  }
  if (dimension === "explain") {
    return exercise.kind === "reasoning" ? 11 : exercise.kind === "design" ? 9 : 3;
  }
  if (dimension === "transfer") {
    return exercise.kind === "catalog" ? 7 : 5;
  }
  return 4;
}

function candidateLevelScore(exercise: CanonicalExercise, overall: number) {
  if (overall < 35) {
    return exercise.level === "foundation" ? 9 : exercise.level === "core" ? 4 : -6;
  }
  if (overall < 70) {
    return exercise.level === "core" ? 8 : exercise.level === "foundation" ? 4 : 2;
  }
  return exercise.level === "advanced" ? 9 : exercise.level === "core" ? 6 : 2;
}

function obstaclePatternIds(id: StuckStateId) {
  return new Set(diagnosticPatterns[id].map((item) => item.id));
}

function scoreCandidate(
  item: ClassifiedAtlasExercise,
  input: AdaptiveRecommendationInput,
  recentIds: Set<string>,
  recentSources: Set<string>,
  recentDomains: Set<string>,
  recentFamilies: Set<string>,
  missedIds: Set<string>,
  historyIds: Set<string>,
) {
  const targetDimension = input.mastery.weakest.id;
  const reasons: string[] = [];
  let score = 20;

  score += candidateKindScore(item.exercise, targetDimension);
  score += candidateLevelScore(item.exercise, input.mastery.overall);

  if (dimensionFamilyAffinity[targetDimension].includes(item.family.id)) {
    score += 8;
    reasons.push(`builds ${input.mastery.weakest.label.toLowerCase()} evidence`);
  }

  const frequent = input.obstacles ? getMostFrequentObstacles(input.obstacles, 3) : [];
  const matchedObstacleIds: StuckStateId[] = [];
  for (const obstacle of frequent) {
    if (!obstaclePatternIds(obstacle.id).has(item.family.id)) continue;
    matchedObstacleIds.push(obstacle.id);
    score += clamp(4 + obstacle.count * 2, 5, 15);
  }
  if (matchedObstacleIds.length) {
    const diagnosis = stuckDiagnoses.find((entry) => entry.id === matchedObstacleIds[0]);
    reasons.push(diagnosis ? `targets repeated friction: ${diagnosis.label.toLowerCase()}` : "targets repeated problem-solving friction");
  }

  if (missedIds.has(item.exercise.id)) {
    score += 18;
    reasons.push("retries a recent blind-recognition miss");
  }

  const wasRecent = recentIds.has(item.exercise.id);
  if (targetDimension === "recall" && wasRecent) {
    score += 13;
    reasons.push("retrieves a recently studied problem from memory");
  } else if (wasRecent) {
    score -= 14;
  }

  if (historyIds.has(item.exercise.id)) score -= 12;

  const sourceNovel = !recentSources.has(item.exercise.source);
  const domainNovel = !recentDomains.has(item.exercise.domain);
  const familyNovel = !recentFamilies.has(item.family.id);

  if (sourceNovel) score += 5;
  if (domainNovel) score += 4;
  if (familyNovel) score += targetDimension === "transfer" ? 8 : 3;

  if (targetDimension === "transfer") {
    if (sourceNovel) reasons.push("changes source perspective");
    if (domainNovel) reasons.push("changes application domain");
    if (familyNovel) reasons.push("widens structural-family coverage");
  } else if (sourceNovel && domainNovel) {
    reasons.push("adds source and domain diversity");
  }

  if (!reasons.length) reasons.push(`fits your current ${input.mastery.weakest.label.toLowerCase()} gap`);

  return {
    item,
    score,
    reasons,
    matchedObstacleIds,
    novelty: { source: sourceNovel, domain: domainNovel, family: familyNovel },
  };
}

export function buildAdaptiveRecommendations(input: AdaptiveRecommendationInput): AdaptiveRecommendation[] {
  const limit = clamp(Math.floor(input.limit ?? 5), 1, 8);
  const seed = input.seed ?? "agocode-next";
  const recent = uniqueRecent(input.recentExerciseIds, 10);
  const recentIds = new Set(recent);
  const recentExercises = recent
    .map((id) => canonicalExercises.find((exercise) => exercise.id === id))
    .filter((exercise): exercise is CanonicalExercise => Boolean(exercise));
  const classifiedById = new Map(classifiedAtlasExercises.map((item) => [item.exercise.id, item]));
  const recentSources = new Set(recentExercises.map((exercise) => exercise.source));
  const recentDomains = new Set(recentExercises.map((exercise) => exercise.domain));
  const recentFamilies = new Set(
    recent.map((id) => classifiedById.get(id)?.family.id).filter((id): id is AtlasPatternId => Boolean(id)),
  );
  const missedIds = new Set(input.missedExerciseIds ?? []);
  const historyIds = new Set(input.recommendationHistoryIds ?? []);

  const ranked = classifiedAtlasExercises
    .map((item) => scoreCandidate(item, input, recentIds, recentSources, recentDomains, recentFamilies, missedIds, historyIds))
    .sort((a, b) => b.score - a.score || tieBreaker(seed, b.item.exercise.id) - tieBreaker(seed, a.item.exercise.id));

  const selected: typeof ranked = [];
  const usedSources = new Set<string>();
  const usedDomains = new Set<string>();
  const usedFamilies = new Set<string>();
  const remaining = [...ranked];

  while (selected.length < limit && remaining.length) {
    let bestIndex = 0;
    let bestSelectionScore = -Infinity;

    for (let index = 0; index < remaining.length; index += 1) {
      const candidate = remaining[index];
      const diversityBonus = (usedSources.has(candidate.item.exercise.source) ? 0 : 4)
        + (usedDomains.has(candidate.item.exercise.domain) ? 0 : 3)
        + (usedFamilies.has(candidate.item.family.id) ? 0 : 6);
      const selectionScore = candidate.score + diversityBonus + tieBreaker(`${seed}:${selected.length}`, candidate.item.exercise.id);
      if (selectionScore > bestSelectionScore) {
        bestSelectionScore = selectionScore;
        bestIndex = index;
      }
    }

    const [chosen] = remaining.splice(bestIndex, 1);
    selected.push(chosen);
    usedSources.add(chosen.item.exercise.source);
    usedDomains.add(chosen.item.exercise.domain);
    usedFamilies.add(chosen.item.family.id);
  }

  return selected.map((candidate): AdaptiveRecommendation => ({
    exercise: candidate.item.exercise,
    familyId: candidate.item.family.id,
    familyLabel: candidate.item.family.label,
    score: Math.round(candidate.score),
    targetDimension: input.mastery.weakest.id,
    reasons: candidate.reasons.slice(0, 3),
    matchedObstacleIds: candidate.matchedObstacleIds,
    novelty: candidate.novelty,
  }));
}

export function readRecommendationHistory(storage: StorageLike): RecommendationHistory {
  try {
    const raw = storage.getItem(RECOMMENDATION_HISTORY_KEY);
    if (!raw) return { version: 1, entries: [] };
    const parsed = JSON.parse(raw) as Partial<RecommendationHistory>;
    const entries = Array.isArray(parsed.entries)
      ? parsed.entries.filter((entry): entry is RecommendationHistoryEntry => Boolean(
        entry
        && typeof entry === "object"
        && typeof (entry as RecommendationHistoryEntry).exerciseId === "string"
        && typeof (entry as RecommendationHistoryEntry).chosenAt === "string",
      )).slice(-30)
      : [];
    return { version: 1, entries };
  } catch {
    return { version: 1, entries: [] };
  }
}

export function recordRecommendationChoice(
  storage: StorageLike,
  exerciseId: string,
  chosenAt = new Date().toISOString(),
): RecommendationHistory {
  const previous = readRecommendationHistory(storage);
  const entries = [...previous.entries, { exerciseId, chosenAt }].slice(-30);
  const next: RecommendationHistory = { version: 1, entries };
  try {
    storage.setItem(RECOMMENDATION_HISTORY_KEY, JSON.stringify(next));
  } catch {
    // Recommendation remains usable even when storage is unavailable.
  }
  return next;
}
