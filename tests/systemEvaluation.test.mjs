import test from "node:test";
import assert from "node:assert/strict";

import { canonicalExercises } from "../lib/knowledge/all-exercises.ts";
import { placementSkillLabels } from "../lib/learning/diagnostic.ts";
import {
  buildDiagnosticCalibrationAudit,
  buildRecommendationOutcomeAudit,
  inferPlacementSkillsForExercise,
} from "../lib/learning/system-evaluation.ts";

function reasoningAttempt({
  attemptId,
  exerciseId,
  finalizedAt,
  stage,
}) {
  const completed = stage !== "guided";
  return {
    attemptId,
    exerciseId,
    startedAt: finalizedAt,
    finalizedAt,
    developedStages: stage === "guided" ? 2 : stage === "solved" ? 5 : 8,
    totalStages: 8,
    lensRevealed: stage !== "independent",
    completedAt: completed ? finalizedAt : undefined,
  };
}

function diagnosticAttempt(skillId, score, completedAt) {
  const skills = Object.entries(placementSkillLabels).map(([id, label]) => {
    const skillScore = id === skillId ? score : 50;
    return {
      id,
      label,
      correct: skillScore >= 75 ? 2 : skillScore >= 50 ? 1 : 0,
      total: 2,
      score: skillScore,
      band: skillScore >= 75 ? "placement-ready" : skillScore >= 50 ? "developing" : "needs-foundation",
    };
  });
  return {
    attemptId: `diagnostic-${skillId}-${score}`,
    startedAt: completedAt,
    updatedAt: completedAt,
    completedAt,
    answers: {},
    result: {
      overall: 50,
      correct: 8,
      total: 16,
      skills,
    },
  };
}

function exercisesForSkill(skillId) {
  return canonicalExercises.filter((exercise) => inferPlacementSkillsForExercise(exercise).includes(skillId));
}

test("a later attempt is attributed only to the newest recommendation window for the same exercise", () => {
  const exerciseId = canonicalExercises[0].id;
  const firstChoice = "2026-01-01T00:00:00.000Z";
  const secondChoice = "2026-01-03T00:00:00.000Z";
  const independentAt = "2026-01-04T00:00:00.000Z";
  const audit = buildRecommendationOutcomeAudit({
    recommendations: {
      version: 1,
      entries: [
        { exerciseId, chosenAt: firstChoice },
        { exerciseId, chosenAt: secondChoice },
      ],
    },
    reasoningAttempts: {
      version: 1,
      entries: [reasoningAttempt({ attemptId: "attempt-1", exerciseId, finalizedAt: independentAt, stage: "independent" })],
    },
    recognitionHistory: { version: 1, entries: [] },
    now: new Date("2026-01-12T00:00:00.000Z").getTime(),
  });

  const first = audit.outcomes.find((outcome) => outcome.chosenAt === firstChoice);
  const second = audit.outcomes.find((outcome) => outcome.chosenAt === secondChoice);
  assert.equal(first?.status, "no-evidence");
  assert.equal(second?.status, "independent");
  assert.equal(audit.followedThrough, 1);
  assert.equal(audit.strongEvidence, 1);
});

test("a recent recommendation with no objective event remains waiting instead of being called a failure", () => {
  const chosenAt = "2026-01-10T10:00:00.000Z";
  const audit = buildRecommendationOutcomeAudit({
    recommendations: { version: 1, entries: [{ exerciseId: canonicalExercises[0].id, chosenAt }] },
    reasoningAttempts: { version: 1, entries: [] },
    recognitionHistory: { version: 1, entries: [] },
    now: new Date("2026-01-10T12:00:00.000Z").getTime(),
  });

  assert.equal(audit.outcomes[0].status, "waiting");
  assert.equal(audit.matureChoices, 0);
  assert.equal(audit.followThroughRate, undefined);
});

test("first-try blind recognition is strong recommendation evidence", () => {
  const exerciseId = canonicalExercises[0].id;
  const audit = buildRecommendationOutcomeAudit({
    recommendations: { version: 1, entries: [{ exerciseId, chosenAt: "2026-01-01T00:00:00.000Z" }] },
    reasoningAttempts: { version: 1, entries: [] },
    recognitionHistory: {
      version: 1,
      entries: [{ exerciseId, recognizedAt: "2026-01-01T06:00:00.000Z", firstTry: true }],
    },
    now: new Date("2026-01-02T12:00:00.000Z").getTime(),
  });

  assert.equal(audit.outcomes[0].status, "retrieval-hit");
  assert.equal(audit.outcomes[0].strongEvidence, true);
  assert.equal(audit.strongEvidenceRate, 100);
});

test("diagnostic calibration ignores pre-diagnostic strength and flags optimistic placement from weak later work", () => {
  const skillId = "analysis";
  const exercises = exercisesForSkill(skillId).slice(0, 2);
  assert.equal(exercises.length, 2);
  const diagnosticAt = "2026-02-10T00:00:00.000Z";
  const audit = buildDiagnosticCalibrationAudit({
    diagnosticAttempt: diagnosticAttempt(skillId, 100, diagnosticAt),
    reasoningAttempts: {
      version: 1,
      entries: [
        reasoningAttempt({ attemptId: "old-1", exerciseId: exercises[0].id, finalizedAt: "2026-02-01T00:00:00.000Z", stage: "independent" }),
        reasoningAttempt({ attemptId: "old-2", exerciseId: exercises[1].id, finalizedAt: "2026-02-02T00:00:00.000Z", stage: "independent" }),
        reasoningAttempt({ attemptId: "new-1", exerciseId: exercises[0].id, finalizedAt: "2026-02-11T00:00:00.000Z", stage: "guided" }),
        reasoningAttempt({ attemptId: "new-2", exerciseId: exercises[1].id, finalizedAt: "2026-02-12T00:00:00.000Z", stage: "guided" }),
      ],
    },
  });

  const row = audit.rows.find((candidate) => candidate.skillId === skillId);
  assert.equal(row?.observedExercises, 2);
  assert.equal(row?.objectiveScore, 25);
  assert.equal(row?.status, "optimistic");
});

test("strong independent work after a low diagnostic is surfaced as conservative placement", () => {
  const skillId = "problem-modeling";
  const exercises = exercisesForSkill(skillId).slice(0, 2);
  assert.equal(exercises.length, 2);
  const audit = buildDiagnosticCalibrationAudit({
    diagnosticAttempt: diagnosticAttempt(skillId, 0, "2026-03-01T00:00:00.000Z"),
    reasoningAttempts: {
      version: 1,
      entries: exercises.map((exercise, index) => reasoningAttempt({
        attemptId: `independent-${index}`,
        exerciseId: exercise.id,
        finalizedAt: `2026-03-0${index + 2}T00:00:00.000Z`,
        stage: "independent",
      })),
    },
  });

  const row = audit.rows.find((candidate) => candidate.skillId === skillId);
  assert.equal(row?.objectiveScore, 100);
  assert.equal(row?.status, "conservative");
});

test("a diagnostic skill stays unclassified until at least two later exercises are observed", () => {
  const skillId = "graphs";
  const exercise = exercisesForSkill(skillId)[0];
  assert.ok(exercise);
  const audit = buildDiagnosticCalibrationAudit({
    diagnosticAttempt: diagnosticAttempt(skillId, 100, "2026-04-01T00:00:00.000Z"),
    reasoningAttempts: {
      version: 1,
      entries: [reasoningAttempt({
        attemptId: "graph-one",
        exerciseId: exercise.id,
        finalizedAt: "2026-04-02T00:00:00.000Z",
        stage: "independent",
      })],
    },
  });

  const row = audit.rows.find((candidate) => candidate.skillId === skillId);
  assert.equal(row?.status, "insufficient");
  assert.equal(row?.objectiveScore, undefined);
});
