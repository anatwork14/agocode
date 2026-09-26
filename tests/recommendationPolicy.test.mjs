import assert from "node:assert/strict";
import test from "node:test";

import {
  buildRecommendationPolicyAudit,
  classifyRecommendationReason,
  recordRecommendationSelection,
} from "../lib/learning/recommendation-policy.ts";
import { readRecommendationHistory } from "../lib/learning/recommendations.ts";

function memoryStorage() {
  const data = new Map();
  return {
    getItem(key) { return data.has(key) ? data.get(key) : null; },
    setItem(key, value) { data.set(key, value); },
    removeItem(key) { data.delete(key); },
  };
}

function recommendation(id, reasons) {
  return {
    exercise: {
      id,
      title: id,
      source: "goodrich",
      sourceChapter: "test",
      domain: "Analysis & correctness",
      kind: "reasoning",
      level: "core",
      tags: [],
      lens: "test",
    },
    familyId: "analysis-correctness",
    familyLabel: "Analysis & correctness",
    score: 42,
    targetDimension: "explain",
    reasons,
    matchedObstacleIds: [],
    novelty: { source: true, domain: true, family: true },
  };
}

function outcome(entry, status, strongEvidence = false) {
  return {
    exerciseId: entry.exerciseId,
    chosenAt: entry.chosenAt,
    windowEndsAt: "2026-10-10T00:00:00.000Z",
    status,
    strongEvidence,
    detail: "test",
  };
}

function auditFrom(entries, outcomes) {
  const mature = outcomes.filter((item) => item.status !== "waiting");
  const followed = mature.filter((item) => item.status !== "no-evidence");
  const strong = mature.filter((item) => item.strongEvidence);
  return buildRecommendationPolicyAudit({
    recommendations: { version: 1, entries },
    outcomes: {
      choices: outcomes.length,
      matureChoices: mature.length,
      waiting: outcomes.length - mature.length,
      followedThrough: followed.length,
      strongEvidence: strong.length,
      noEvidence: mature.filter((item) => item.status === "no-evidence").length,
      followThroughRate: mature.length ? Math.round((followed.length / mature.length) * 100) : undefined,
      strongEvidenceRate: mature.length ? Math.round((strong.length / mature.length) * 100) : undefined,
      outcomes,
    },
  });
}

test("selection snapshots the rationale already shown by the planner without creating a second history key", () => {
  const storage = memoryStorage();
  const item = recommendation("problem-a", ["retrieval evidence is overdue", "builds recall evidence"]);
  const chosenAt = "2026-09-26T10:00:00.000Z";

  recordRecommendationSelection(storage, item, chosenAt);
  const history = readRecommendationHistory(storage);
  assert.equal(history.entries.length, 1);

  const raw = JSON.parse(storage.getItem("agocode.progress.next-problem-history"));
  assert.deepEqual(raw.entries[0].reasons, item.reasons);
  assert.equal(raw.entries[0].targetDimension, "explain");
  assert.equal(raw.entries[0].score, 42);
  assert.equal(raw.entries[0].familyId, "analysis-correctness");
  assert.equal(storage.getItem("agocode.progress.recommendation-policy"), null);
});

test("known surfaced rationale text maps to stable policy reason ids", () => {
  assert.equal(classifyRecommendationReason("retrieval evidence is overdue"), "retrieval-overdue");
  assert.equal(classifyRecommendationReason("builds explain evidence"), "weakest-dimension");
  assert.equal(classifyRecommendationReason("targets repeated friction: graph modeling"), "repeated-friction");
  assert.equal(classifyRecommendationReason("a future rationale we do not know yet"), "other");
});

test("small local samples cannot produce score-change previews", () => {
  const entries = Array.from({ length: 7 }, (_, index) => ({
    exerciseId: `p-${index}`,
    chosenAt: `2026-09-${String(index + 1).padStart(2, "0")}T00:00:00.000Z`,
    reasons: ["retrieval evidence is overdue"],
  }));
  const outcomes = entries.map((entry) => outcome(entry, "independent", true));
  const audit = auditFrom(entries, outcomes);
  const row = audit.reasons.find((item) => item.reasonId === "retrieval-overdue");

  assert.equal(audit.matureSnapshottedChoices, 7);
  assert.equal(row?.status, "insufficient");
  assert.equal(row?.suggestedScoreDelta, 0);
});

test("a rationale still needs its own minimum sample after the overall gate is met", () => {
  const entries = Array.from({ length: 10 }, (_, index) => ({
    exerciseId: `p-${index}`,
    chosenAt: `2026-09-${String(index + 1).padStart(2, "0")}T00:00:00.000Z`,
    reasons: [index < 4 ? "retrieval evidence is overdue" : "adds source and domain diversity"],
  }));
  const outcomes = entries.map((entry) => outcome(entry, "independent", true));
  const audit = auditFrom(entries, outcomes);
  const row = audit.reasons.find((item) => item.reasonId === "retrieval-overdue");

  assert.equal(audit.matureSnapshottedChoices, 10);
  assert.equal(row?.matureChoices, 4);
  assert.equal(row?.status, "insufficient");
  assert.equal(row?.suggestedScoreDelta, 0);
});

test("strong and weak rationale associations produce only bounded preview deltas", () => {
  const entries = Array.from({ length: 12 }, (_, index) => ({
    exerciseId: `p-${index}`,
    chosenAt: `2026-09-${String(index + 1).padStart(2, "0")}T00:00:00.000Z`,
    reasons: [index < 6 ? "retrieval evidence is overdue" : "adds source and domain diversity"],
  }));
  const outcomes = entries.map((entry, index) => (
    index < 6
      ? outcome(entry, "independent", true)
      : index < 11
        ? outcome(entry, "no-evidence", false)
        : outcome(entry, "solved", false)
  ));
  const audit = auditFrom(entries, outcomes);
  const promising = audit.reasons.find((item) => item.reasonId === "retrieval-overdue");
  const weak = audit.reasons.find((item) => item.reasonId === "combined-diversity");

  assert.equal(promising?.status, "promising");
  assert.equal(promising?.suggestedScoreDelta, 2);
  assert.equal(weak?.status, "weak");
  assert.equal(weak?.suggestedScoreDelta, -2);
  assert.equal(audit.suggestedChanges, 2);
});

test("legacy recommendation rows remain valid but are excluded from reason-level coverage", () => {
  const entries = [
    { exerciseId: "legacy", chosenAt: "2026-09-01T00:00:00.000Z" },
    { exerciseId: "new", chosenAt: "2026-09-02T00:00:00.000Z", reasons: ["retrieval evidence is overdue"] },
  ];
  const outcomes = [outcome(entries[0], "independent", true), outcome(entries[1], "independent", true)];
  const audit = auditFrom(entries, outcomes);

  assert.equal(audit.choices, 2);
  assert.equal(audit.snapshottedChoices, 1);
  assert.equal(audit.metadataCoverageRate, 50);
  assert.equal(audit.matureSnapshottedChoices, 1);
  assert.equal(audit.reasons[0]?.status, "insufficient");
});
