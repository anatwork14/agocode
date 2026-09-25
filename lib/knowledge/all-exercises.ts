import {
  canonicalExercises as coreCanonicalExercises,
  sourceLabels,
  type CanonicalExercise,
  type ExerciseKind,
  type ExerciseLevel,
  type ExerciseSource,
} from "@/lib/knowledge/exercises";
import { supplementalCanonicalExercises } from "@/lib/knowledge/supplemental-exercises";

export type { CanonicalExercise, ExerciseKind, ExerciseLevel, ExerciseSource };
export { sourceLabels };

export const canonicalExercises: CanonicalExercise[] = [
  ...coreCanonicalExercises,
  ...supplementalCanonicalExercises,
];

export const exerciseDomains = Array.from(new Set(canonicalExercises.map((item) => item.domain))).sort();

export function getCanonicalExercise(id: string) {
  return canonicalExercises.find((item) => item.id === id);
}
