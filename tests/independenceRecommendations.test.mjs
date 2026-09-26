import assert from "node:assert/strict";
import test from "node:test";
import { classifiedAtlasExercises } from "../lib/practice/atlas-recognition.ts";
import { buildAdaptiveRecommendations } from "../lib/learning/recommendations.ts";

function mastery(weakestId = "transfer", overall = 52) {
  const ids = ["understand", "trace", "predict", "rebuild", "explain", "transfer", "recall"];
  const dimensions = ids.map((id) => ({
    id,
    label: id[0].toUpperCase() + id.slice(1),
    score: id === weakestId ? 24 : 62,
    evidenceCount: 3,
    completedCount: 2,
    band: id === weakestId ? "emerging" : "developing",
  }));
  return {
    overall,
    dimensions,
    weakest: dimensions.find((item) => item.id === weakestId),
    strongest: dimensions.find((item) => item.id !== weakestId),
  };
}

function state(exerciseId, stage, rank, familyId) {
  return {
    exerciseId,
    stage,
    rank,
    label: stage,
    explanation: "test",
    nextRequirement: "test",
    familyId,
  };
}

test("planner prioritizes a solved problem when the next evidence transition is independence", () => {
  const target = classifiedAtlasExercises.find((item) => item.exercise.level === "core") ?? classifiedAtlasExercises[0];
  assert.ok(target);

  const problemIndependence = Object.fromEntries(classifiedAtlasExercises.map((item) => [
    item.exercise.id,
    state(item.exercise.id, "recalled", 6, item.family.id),
  ]));
  problemIndependence[target.exercise.id] = state(target.exercise.id, "solved", 3, target.family.id);

  const recommendations = buildAdaptiveRecommendations({
    mastery: mastery("rebuild"),
    problemIndependence,
    limit: 5,
    seed: "independence-transition",
  });

  const recommendation = recommendations.find((item) => item.exercise.id === target.exercise.id);
  assert.ok(recommendation, "expected the solved problem to be promoted over already recalled problems");
  assert.ok(recommendation.reasons.some((reason) => reason.includes("establish independence")));
});

test("transfer weakness prefers a fresh surface story from an independently solved family", () => {
  let source;
  let target;
  for (const item of classifiedAtlasExercises) {
    const candidate = classifiedAtlasExercises.find((other) => (
      other.exercise.id !== item.exercise.id
      && other.family.id === item.family.id
      && (other.exercise.source !== item.exercise.source || other.exercise.domain !== item.exercise.domain)
    ));
    if (candidate) {
      source = item;
      target = candidate;
      break;
    }
  }
  assert.ok(source && target);

  const recommendations = buildAdaptiveRecommendations({
    mastery: mastery("transfer"),
    problemIndependence: {
      [source.exercise.id]: state(source.exercise.id, "independent", 4, source.family.id),
    },
    limit: 8,
    seed: "independent-family-transfer",
  });

  assert.ok(
    recommendations.some((item) => item.familyId === source.family.id && item.exercise.id !== source.exercise.id),
    "expected a new problem from an independently solved structural family",
  );
  assert.ok(
    recommendations.some((item) => item.reasons.some((reason) => reason.includes("family already solved independently"))),
  );
});
