import assert from "node:assert/strict";
import test from "node:test";
import { fieldNotes } from "../lib/knowledge/blog.ts";
import { canonicalExercises } from "../lib/knowledge/all-exercises.ts";
import { goodrichExerciseCount, goodrichExerciseIndex, goodrichExerciseReferences } from "../lib/knowledge/goodrich-workbook.ts";
import { practiceStages } from "../lib/knowledge/practice-framework.ts";
import { syllabusTracks } from "../lib/knowledge/syllabus.ts";

test("canonical problem atlas is broad, source-aware, and uniquely addressable", () => {
  assert.ok(canonicalExercises.length >= 350, `expected at least 350 catalog entries, received ${canonicalExercises.length}`);

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

test("EPI atlas includes domain-specific chapters 20 through 23", () => {
  const epi = canonicalExercises.filter((item) => item.source === "epi");
  for (const chapter of ["20 ·", "21 ·", "22 ·", "23 ·"]) {
    assert.ok(epi.some((item) => item.sourceChapter.startsWith(chapter)), `missing EPI ${chapter}`);
  }
  for (const title of ["Design a spell checker", "Implement PageRank", "Garbage collection", "Template Method vs Strategy", "SQL vs NoSQL", "DNS"]) {
    assert.ok(epi.some((item) => item.title === title), `missing EPI problem ${title}`);
  }
});

test("Goodrich source workbook preserves every indexed R/C/P identifier uniquely", () => {
  assert.equal(goodrichExerciseIndex.length, 15);
  assert.equal(goodrichExerciseCount, 758);
  assert.equal(goodrichExerciseReferences.length, goodrichExerciseCount);
  assert.equal(new Set(goodrichExerciseReferences.map((item) => item.id)).size, goodrichExerciseCount);
  assert.equal(new Set(goodrichExerciseReferences.map((item) => item.sourceId)).size, goodrichExerciseCount);
  assert.deepEqual(
    [...new Set(goodrichExerciseReferences.map((item) => item.tier))].sort(),
    ["C", "P", "R"],
  );
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

test("practice progression moves from mechanism to transfer and delayed retrieval", () => {
  assert.deepEqual(practiceStages.map((stage) => stage.id), ["reinforce", "create", "build", "recognize", "vary", "retrieve"]);
  assert.ok(practiceStages.every((stage) => stage.evidence.length >= 4));
  assert.ok(practiceStages.every((stage) => stage.learnerPrompt.endsWith("?")));
});
