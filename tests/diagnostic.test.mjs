import assert from "node:assert/strict";
import test from "node:test";
import {
  DIAGNOSTIC_STATE_KEY,
  completeDiagnostic,
  diagnosticQuestions,
  getLatestDiagnosticResult,
  readDiagnosticState,
  recordDiagnosticAnswer,
  scoreDiagnosticAnswers,
  startDiagnostic,
} from "../lib/learning/diagnostic.ts";

function storage() {
  const values = new Map();
  return {
    values,
    getItem(key) { return values.get(key) ?? null; },
    setItem(key, value) { values.set(key, value); },
  };
}

function allCorrectAnswers() {
  return Object.fromEntries(diagnosticQuestions.map((question) => [question.id, question.correctOptionId]));
}

test("diagnostic has two objective questions for each of eight placement skills", () => {
  assert.equal(diagnosticQuestions.length, 16);
  const counts = new Map();
  for (const question of diagnosticQuestions) counts.set(question.skill, (counts.get(question.skill) ?? 0) + 1);
  assert.equal(counts.size, 8);
  assert.deepEqual([...counts.values()], Array(8).fill(2));
});

test("all-correct diagnostic produces a 100% placement prior without mastery semantics", () => {
  const result = scoreDiagnosticAnswers(allCorrectAnswers());
  assert.equal(result.overall, 100);
  assert.equal(result.correct, 16);
  assert.equal(result.skills.every((skill) => skill.band === "placement-ready"), true);
  assert.equal(result.skills.every((skill) => skill.total === 2), true);
});

test("diagnostic resumes active browser-local state and refuses incomplete completion", () => {
  const store = storage();
  const started = startDiagnostic(store, new Date("2026-09-26T08:00:00.000Z"));
  recordDiagnosticAnswer(store, diagnosticQuestions[0].id, diagnosticQuestions[0].correctOptionId, new Date("2026-09-26T08:01:00.000Z"));
  const resumed = startDiagnostic(store, new Date("2026-09-26T08:02:00.000Z"));
  assert.equal(resumed.attemptId, started.attemptId);
  assert.equal(Object.keys(resumed.answers).length, 1);
  assert.equal(completeDiagnostic(store), null);
});

test("completed diagnostic is archived and becomes the latest placement result", () => {
  const store = storage();
  startDiagnostic(store, new Date("2026-09-26T08:00:00.000Z"));
  for (const question of diagnosticQuestions) {
    recordDiagnosticAnswer(store, question.id, question.correctOptionId, new Date("2026-09-26T08:05:00.000Z"));
  }
  const completed = completeDiagnostic(store, new Date("2026-09-26T08:20:00.000Z"));
  assert.ok(completed?.completedAt);
  assert.equal(completed?.result?.overall, 100);
  const state = readDiagnosticState(store);
  assert.equal(state.active, undefined);
  assert.equal(state.attempts.length, 1);
  assert.equal(getLatestDiagnosticResult(state)?.overall, 100);
  assert.ok(store.values.has(DIAGNOSTIC_STATE_KEY));
});

test("corrupt or unknown diagnostic payload fails closed", () => {
  const store = storage();
  store.setItem(DIAGNOSTIC_STATE_KEY, "{broken-json");
  assert.deepEqual(readDiagnosticState(store), { version: 1, attempts: [] });
  store.setItem(DIAGNOSTIC_STATE_KEY, JSON.stringify({ version: 99, attempts: [{ fake: true }] }));
  assert.deepEqual(readDiagnosticState(store), { version: 1, attempts: [] });
});
