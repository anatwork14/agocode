import assert from "node:assert/strict";
import test from "node:test";
import {
  atlasPatterns,
  buildAtlasRecognitionSession,
  classifiedAtlasExercises,
  getAtlasRecognitionChoices,
} from "../lib/practice/atlas-recognition.ts";

test("atlas recognition exposes a broad structural vocabulary", () => {
  assert.ok(atlasPatterns.length >= 12);
  assert.equal(new Set(atlasPatterns.map((pattern) => pattern.id)).size, atlasPatterns.length);
  assert.ok(atlasPatterns.every((pattern) => pattern.clue.length > 30));
  assert.ok(atlasPatterns.every((pattern) => pattern.firstQuestion.endsWith("?")));
});

test("a mixed recognition session is diverse and deterministic for a seed", () => {
  assert.ok(classifiedAtlasExercises.length >= 12);
  const first = buildAtlasRecognitionSession("test-seed", 12);
  const second = buildAtlasRecognitionSession("test-seed", 12);

  assert.equal(first.items.length, 12);
  assert.deepEqual(first.items.map((item) => item.exercise.id), second.items.map((item) => item.exercise.id));
  assert.equal(new Set(first.items.map((item) => item.exercise.id)).size, first.items.length);
  assert.ok(first.sourceCount >= 2);
  assert.ok(first.familyCount >= 4);
});

test("recent first-try misses are brought to the front of the next session", () => {
  const missedIds = classifiedAtlasExercises.slice(0, 3).map((item) => item.exercise.id);
  const session = buildAtlasRecognitionSession("retry-seed", 12, missedIds);
  assert.deepEqual(session.items.slice(0, missedIds.length).map((item) => item.exercise.id), missedIds);
});

test("recognition choices include exactly one correct structural family", () => {
  const session = buildAtlasRecognitionSession("choice-seed", 12);
  const item = session.items[0];
  assert.ok(item);

  const choices = getAtlasRecognitionChoices(item, "choice-seed", 6);
  assert.equal(choices.length, 6);
  assert.equal(new Set(choices.map((choice) => choice.id)).size, choices.length);
  assert.equal(choices.filter((choice) => choice.id === item.family.id).length, 1);
});
