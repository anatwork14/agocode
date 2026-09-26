import type { StorageLike } from "./evidence.ts";

export const PROBLEM_SETS_KEY = "agocode.progress.problem-sets";

export type LearnerProblemSet = {
  id: string;
  name: string;
  exerciseIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type ProblemSetState = {
  version: 1;
  bookmarks: string[];
  sets: LearnerProblemSet[];
};

const MAX_SETS = 24;
const MAX_ITEMS_PER_SET = 120;

function cleanIds(values: unknown) {
  if (!Array.isArray(values)) return [];
  return Array.from(new Set(values.filter((value): value is string => typeof value === "string" && Boolean(value.trim()))))
    .slice(0, MAX_ITEMS_PER_SET);
}

function parseSet(value: unknown): LearnerProblemSet | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Partial<LearnerProblemSet>;
  if (
    typeof item.id !== "string"
    || typeof item.name !== "string"
    || typeof item.createdAt !== "string"
    || typeof item.updatedAt !== "string"
  ) return null;
  return {
    id: item.id,
    name: item.name.trim().slice(0, 80) || "Untitled set",
    exerciseIds: cleanIds(item.exerciseIds),
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

function persist(storage: StorageLike, state: ProblemSetState) {
  try {
    storage.setItem(PROBLEM_SETS_KEY, JSON.stringify(state));
  } catch {
    // Sets are learner convenience metadata; learning remains usable without persistence.
  }
  return state;
}

export function readProblemSets(storage: StorageLike): ProblemSetState {
  try {
    const raw = storage.getItem(PROBLEM_SETS_KEY);
    if (!raw) return { version: 1, bookmarks: [], sets: [] };
    const parsed = JSON.parse(raw) as Partial<ProblemSetState>;
    return {
      version: 1,
      bookmarks: cleanIds(parsed.bookmarks),
      sets: Array.isArray(parsed.sets)
        ? parsed.sets.map(parseSet).filter((item): item is LearnerProblemSet => Boolean(item)).slice(-MAX_SETS)
        : [],
    };
  } catch {
    return { version: 1, bookmarks: [], sets: [] };
  }
}

export function toggleProblemBookmark(storage: StorageLike, exerciseId: string): ProblemSetState {
  const previous = readProblemSets(storage);
  const exists = previous.bookmarks.includes(exerciseId);
  return persist(storage, {
    ...previous,
    bookmarks: exists
      ? previous.bookmarks.filter((id) => id !== exerciseId)
      : [...previous.bookmarks, exerciseId].slice(-MAX_ITEMS_PER_SET),
  });
}

export function createProblemSet(
  storage: StorageLike,
  name: string,
  createdAt = new Date().toISOString(),
): ProblemSetState {
  const previous = readProblemSets(storage);
  const cleanName = name.trim().slice(0, 80);
  if (!cleanName) return previous;
  const id = `set-${createdAt.replace(/[^0-9]/g, "").slice(0, 17)}-${previous.sets.length + 1}`;
  const set: LearnerProblemSet = {
    id,
    name: cleanName,
    exerciseIds: [],
    createdAt,
    updatedAt: createdAt,
  };
  return persist(storage, { ...previous, sets: [...previous.sets, set].slice(-MAX_SETS) });
}

export function deleteProblemSet(storage: StorageLike, setId: string): ProblemSetState {
  const previous = readProblemSets(storage);
  return persist(storage, { ...previous, sets: previous.sets.filter((set) => set.id !== setId) });
}

export function renameProblemSet(
  storage: StorageLike,
  setId: string,
  name: string,
  updatedAt = new Date().toISOString(),
): ProblemSetState {
  const previous = readProblemSets(storage);
  const cleanName = name.trim().slice(0, 80);
  if (!cleanName) return previous;
  return persist(storage, {
    ...previous,
    sets: previous.sets.map((set) => set.id === setId ? { ...set, name: cleanName, updatedAt } : set),
  });
}

export function toggleExerciseInProblemSet(
  storage: StorageLike,
  setId: string,
  exerciseId: string,
  updatedAt = new Date().toISOString(),
): ProblemSetState {
  const previous = readProblemSets(storage);
  return persist(storage, {
    ...previous,
    sets: previous.sets.map((set) => {
      if (set.id !== setId) return set;
      const exists = set.exerciseIds.includes(exerciseId);
      return {
        ...set,
        exerciseIds: exists
          ? set.exerciseIds.filter((id) => id !== exerciseId)
          : [...set.exerciseIds, exerciseId].slice(-MAX_ITEMS_PER_SET),
        updatedAt,
      };
    }),
  });
}

export function getProblemSetExerciseIds(state: ProblemSetState, setId: string) {
  if (setId === "bookmarks") return state.bookmarks;
  return state.sets.find((set) => set.id === setId)?.exerciseIds ?? [];
}
