import assert from "node:assert/strict";
import test from "node:test";
import { fieldNotes } from "../lib/knowledge/blog.ts";
import { canonicalExercises } from "../lib/knowledge/exercises.ts";
import { syllabusTracks } from "../lib/knowledge/syllabus.ts";

test("canonical problem atlas is broad, source-aware, and uniquely addressable", () => {
  assert.ok(canonicalExercises.length >= 300, `expected at least 300 catalog entries, received ${canonicalExercises.length}`);

  const ids = new Set(canonicalExercises.map((item) => item.id));
  assert.equal(ids.size, canonicalExercises.length);

  const sources = new Set(canonicalExercises.map((item) => item.source));
  assert.deepEqual([...sources].sort(), ["epi", "goodrich", "skiena"]);

  for (const item of canonicalExercises) {
    assert.ok(item.title.trim().length > 2);
    assert.ok(item.sourceChapter.trim().length > 2);
    assert.ok(item.domain.trim().length > 2);
    assert.ok(item.lens.trim().length > 20);
  }
});

test("problem-solving field notes have unique slugs and actionable questions", () => {
  assert.equal(fieldNotes.length, 12);
  assert.equal(new Set(fieldNotes.map((item) => item.slug)).size, fieldNotes.length);
  for (const item of fieldNotes) {
    assert.ok(item.sections.length >= 1);
    assert.ok(item.questions.length >= 4);
  }
});

test("expanded syllabus contains multiple modules across ten tracks", () => {
  assert.equal(syllabusTracks.length, 10);
  assert.ok(syllabusTracks.every((track) => track.modules.length >= 3));
  assert.ok(syllabusTracks.some((track) => track.modules.some((module) => module.sources.includes("Goodrich"))));
  assert.ok(syllabusTracks.some((track) => track.modules.some((module) => module.sources.includes("EPI"))));
  assert.ok(syllabusTracks.some((track) => track.modules.some((module) => module.sources.includes("Skiena"))));
});
