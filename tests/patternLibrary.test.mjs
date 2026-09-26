import assert from "node:assert/strict";
import test from "node:test";
import { diagnosticPatterns } from "../lib/knowledge/diagnostic-patterns.ts";
import { stuckDiagnoses } from "../lib/knowledge/stuck-router.ts";
import { atlasPatterns, classifiedAtlasExercises } from "../lib/practice/atlas-recognition.ts";
import { patternLibrary, getPatternExercises, getPatternLibraryEntry } from "../lib/practice/pattern-library.ts";

test("pattern library mirrors the recognition taxonomy", () => {
  assert.equal(patternLibrary.length, atlasPatterns.length);
  assert.equal(new Set(patternLibrary.map((item) => item.id)).size, patternLibrary.length);
  assert.equal(
    patternLibrary.reduce((sum, item) => sum + item.exerciseCount, 0),
    classifiedAtlasExercises.length,
  );
});

test("pattern pages can recover their classified exercises", () => {
  for (const pattern of patternLibrary) {
    assert.equal(getPatternLibraryEntry(pattern.id)?.label, pattern.label);
    const exercises = getPatternExercises(pattern.id);
    assert.equal(exercises.length, pattern.exerciseCount);
    assert.ok(exercises.every((item) => item.family.id === pattern.id));
  }
});

test("every stuck diagnosis links only to known structural families", () => {
  const ids = new Set(patternLibrary.map((item) => item.id));
  for (const diagnosis of stuckDiagnoses) {
    const links = diagnosticPatterns[diagnosis.id];
    assert.ok(links.length >= 2, `${diagnosis.id} should expose more than one structural comparison`);
    assert.ok(links.every((link) => ids.has(link.id)), `${diagnosis.id} points to an unknown pattern family`);
    assert.equal(new Set(links.map((link) => link.id)).size, links.length, `${diagnosis.id} duplicates a pattern family`);
  }
});
