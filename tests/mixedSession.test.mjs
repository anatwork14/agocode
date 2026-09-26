import assert from "node:assert/strict";
import test from "node:test";
import { classifiedAtlasExercises } from "../lib/practice/atlas-recognition.ts";
import { buildMixedPracticeSession, getMixedSessionItemHref } from "../lib/practice/mixed-session.ts";

function mastery(weakestId = "recall") {
  const ids = ["understand", "trace", "predict", "rebuild", "explain", "transfer", "recall"];
  const dimensions = ids.map((id) => ({
    id,
    label: id[0].toUpperCase() + id.slice(1),
    score: id === weakestId ? 20 : 65,
    evidenceCount: 3,
    completedCount: 2,
    band: id === weakestId ? "emerging" : "developing",
  }));
  return {
    overall: 55,
    dimensions,
    weakest: dimensions.find((item) => item.id === weakestId),
    strongest: dimensions.find((item) => item.id !== weakestId),
  };
}

test("mixed session puts due retrieval into the bounded session", () => {
  const candidate = classifiedAtlasExercises[0];
  assert.ok(candidate);
  const review = {
    exerciseId: candidate.exercise.id,
    independenceStage: "independent",
    anchorAt: "2026-09-20T00:00:00.000Z",
    nextReviewAt: "2026-09-22T00:00:00.000Z",
    intervalDays: 2,
    sessions: 0,
    successful: 0,
    failed: 0,
    dueState: "overdue",
    freshness: 0,
    overdueMs: 4 * 86400000,
    priority: 104,
    recommendedMode: "rebuild",
    explanation: "overdue",
  };
  const session = buildMixedPracticeSession({
    mastery: mastery("recall"),
    problemReview: { [candidate.exercise.id]: review },
    reviewStatuses: { [candidate.exercise.id]: review },
    sessionSize: 6,
    seed: "due-first",
  });
  assert.equal(session.items[0].exerciseId, candidate.exercise.id);
  assert.equal(session.items[0].role, "retrieve");
  assert.equal(session.items[0].href, `/review/retrieve/${candidate.exercise.id}`);
  assert.equal(session.dueRetrievalCount, 1);
});

test("recognition repair uses the objective retrieval surface rather than the reasoning notebook", () => {
  assert.equal(getMixedSessionItemHref("repair-recognition", "exercise-1"), "/review/retrieve/exercise-1");
  assert.equal(getMixedSessionItemHref("retrieve", "exercise-1"), "/review/retrieve/exercise-1");
  assert.equal(getMixedSessionItemHref("remove-support", "exercise-1"), "/exercises/exercise-1");
  assert.equal(getMixedSessionItemHref("transfer", "exercise-1"), "/exercises/exercise-1");
});

test("mixed session is bounded and structurally diverse", () => {
  const session = buildMixedPracticeSession({
    mastery: mastery("transfer"),
    sessionSize: 6,
    seed: "diverse",
  });
  assert.equal(session.items.length, 6);
  assert.ok(session.familyCount >= 3);
  assert.equal(new Set(session.items.map((item) => item.exerciseId)).size, session.items.length);
});
