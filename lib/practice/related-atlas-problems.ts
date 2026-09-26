import { classifiedAtlasExercises, type ClassifiedAtlasExercise } from "./atlas-recognition.ts";

export type RelatedAtlasProblem = {
  item: ClassifiedAtlasExercise;
  relationScore: number;
  crossSource: boolean;
  crossDomain: boolean;
};

export function getRelatedAtlasProblems(exerciseId: string, limit = 4): RelatedAtlasProblem[] {
  const target = classifiedAtlasExercises.find((entry) => entry.exercise.id === exerciseId);
  if (!target) return [];

  const safeLimit = Math.max(1, Math.min(8, Math.floor(limit)));

  return classifiedAtlasExercises
    .filter((entry) => entry.exercise.id !== exerciseId && entry.family.id === target.family.id)
    .map((entry) => {
      const crossSource = entry.exercise.source !== target.exercise.source;
      const crossDomain = entry.exercise.domain !== target.exercise.domain;
      const sharedTerms = entry.matchedTerms.filter((term) => target.matchedTerms.includes(term)).length;
      const relationScore =
        (crossSource ? 5 : 0) +
        (crossDomain ? 3 : 0) +
        sharedTerms * 2 +
        Math.min(3, entry.score / 8);

      return { item: entry, relationScore, crossSource, crossDomain };
    })
    .sort((a, b) =>
      b.relationScore - a.relationScore ||
      a.item.exercise.title.localeCompare(b.item.exercise.title),
    )
    .slice(0, safeLimit);
}
