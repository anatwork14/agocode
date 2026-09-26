import { classifiedAtlasExercises, type AtlasPatternId } from "./atlas-recognition.ts";
import type { ProblemIndependenceState } from "../learning/independence.ts";
import type { MasterySnapshot } from "../learning/mastery.ts";
import type { ProblemReviewStatus } from "../learning/problem-review.ts";
import {
  buildAdaptiveRecommendations,
  type AdaptiveRecommendation,
  type AdaptiveRecommendationInput,
} from "../learning/recommendations.ts";

export type MixedSessionRole =
  | "retrieve"
  | "repair-recognition"
  | "remove-support"
  | "transfer"
  | "weak-dimension"
  | "diversify";

export type MixedSessionItem = {
  exerciseId: string;
  title: string;
  familyId: AtlasPatternId;
  familyLabel: string;
  role: MixedSessionRole;
  reason: string;
  href: string;
  recommendation?: AdaptiveRecommendation;
};

export type MixedPracticeSession = {
  seed: string;
  items: MixedSessionItem[];
  familyCount: number;
  sourceCount: number;
  dueRetrievalCount: number;
};

type BuildMixedSessionInput = AdaptiveRecommendationInput & {
  reviewStatuses?: Record<string, ProblemReviewStatus>;
  mastery: MasterySnapshot;
  sessionSize?: number;
};

function roleFor(
  exerciseId: string,
  independence: ProblemIndependenceState | undefined,
  review: ProblemReviewStatus | undefined,
  missed: Set<string>,
  mastery: MasterySnapshot,
): { role: MixedSessionRole; reason: string } {
  if (review?.dueState === "overdue" || review?.dueState === "due") {
    return {
      role: "retrieve",
      reason: review.dueState === "overdue"
        ? "Overdue retrieval comes first so old proof is tested before more new material is added."
        : "The spacing interval is due now; retrieve this problem without reopening prior notes.",
    };
  }
  if (missed.has(exerciseId)) {
    return { role: "repair-recognition", reason: "This problem was missed in a recent blind-recognition session." };
  }
  if (independence?.stage === "solved" || independence?.stage === "guided") {
    return { role: "remove-support", reason: "Use a fresh attempt to reduce support and move toward independent evidence." };
  }
  if (mastery.weakest.id === "transfer") {
    return { role: "transfer", reason: "The current weakest dimension is transfer, so change the surface story while preserving deep structure." };
  }
  return {
    role: "weak-dimension",
    reason: `This problem contributes evidence toward the current ${mastery.weakest.label.toLowerCase()} gap.`,
  };
}

export function buildMixedPracticeSession(input: BuildMixedSessionInput): MixedPracticeSession {
  const size = Math.max(3, Math.min(8, Math.floor(input.sessionSize ?? 6)));
  const seed = input.seed ?? "mixed-session";
  const missed = new Set(input.missedExerciseIds ?? []);
  const classifiedById = new Map(classifiedAtlasExercises.map((item) => [item.exercise.id, item]));
  const selected: MixedSessionItem[] = [];
  const used = new Set<string>();

  const due = Object.values(input.reviewStatuses ?? {})
    .filter((status) => status.dueState === "overdue" || status.dueState === "due")
    .sort((a, b) => b.priority - a.priority || a.exerciseId.localeCompare(b.exerciseId));

  for (const status of due.slice(0, Math.min(2, size))) {
    const item = classifiedById.get(status.exerciseId);
    if (!item || used.has(status.exerciseId)) continue;
    used.add(status.exerciseId);
    selected.push({
      exerciseId: status.exerciseId,
      title: item.exercise.title,
      familyId: item.family.id,
      familyLabel: item.family.label,
      role: "retrieve",
      reason: status.explanation,
      href: `/review/retrieve/${status.exerciseId}`,
    });
  }

  const ranked = buildAdaptiveRecommendations({ ...input, limit: 8, seed });
  for (const recommendation of ranked) {
    if (selected.length >= size || used.has(recommendation.exercise.id)) continue;
    const status = input.reviewStatuses?.[recommendation.exercise.id];
    const { role, reason } = roleFor(
      recommendation.exercise.id,
      input.problemIndependence?.[recommendation.exercise.id],
      status,
      missed,
      input.mastery,
    );
    used.add(recommendation.exercise.id);
    selected.push({
      exerciseId: recommendation.exercise.id,
      title: recommendation.exercise.title,
      familyId: recommendation.familyId,
      familyLabel: recommendation.familyLabel,
      role,
      reason: recommendation.reasons[0] ?? reason,
      href: role === "retrieve" ? `/review/retrieve/${recommendation.exercise.id}` : `/exercises/${recommendation.exercise.id}`,
      recommendation,
    });
  }

  if (selected.length < size) {
    for (const item of classifiedAtlasExercises) {
      if (selected.length >= size || used.has(item.exercise.id)) continue;
      used.add(item.exercise.id);
      selected.push({
        exerciseId: item.exercise.id,
        title: item.exercise.title,
        familyId: item.family.id,
        familyLabel: item.family.label,
        role: "diversify",
        reason: "Adds a different structural family when the evidence-driven shortlist is smaller than the requested session.",
        href: `/exercises/${item.exercise.id}`,
      });
    }
  }

  const sourceCount = new Set(selected.map((entry) => classifiedById.get(entry.exerciseId)?.exercise.source).filter(Boolean)).size;
  return {
    seed,
    items: selected,
    familyCount: new Set(selected.map((entry) => entry.familyId)).size,
    sourceCount,
    dueRetrievalCount: selected.filter((entry) => entry.role === "retrieve").length,
  };
}
