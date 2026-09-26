import {
  atlasPatterns,
  classifiedAtlasExercises,
  type AtlasPatternId,
  type ClassifiedAtlasExercise,
} from "./atlas-recognition.ts";

export type PatternLibraryEntry = {
  id: AtlasPatternId;
  label: string;
  clue: string;
  firstQuestion: string;
  exerciseCount: number;
};

export const patternLibrary: PatternLibraryEntry[] = atlasPatterns.map((pattern) => ({
  id: pattern.id,
  label: pattern.label,
  clue: pattern.clue,
  firstQuestion: pattern.firstQuestion,
  exerciseCount: classifiedAtlasExercises.filter((item) => item.family.id === pattern.id).length,
}));

export function getPatternLibraryEntry(id: string) {
  return patternLibrary.find((pattern) => pattern.id === id);
}

export function getPatternExercises(id: AtlasPatternId, limit?: number): ClassifiedAtlasExercise[] {
  const matches = classifiedAtlasExercises
    .filter((item) => item.family.id === id)
    .sort((a, b) => b.score - a.score || a.exercise.title.localeCompare(b.exercise.title));
  return typeof limit === "number" ? matches.slice(0, Math.max(0, limit)) : matches;
}
