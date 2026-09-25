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

test("EPI atlas spans every problem chapter from primitive types through honors and domain design", () => {
  const epi = canonicalExercises.filter((item) => item.source === "epi");
  for (let chapter = 4; chapter <= 24; chapter += 1) {
    assert.ok(epi.some((item) => item.sourceChapter.startsWith(`${chapter} ·`)), `missing EPI chapter ${chapter}`);
  }

  for (const title of [
    "Computing the parity of a word",
    "The Dutch national flag problem",
    "Merge two sorted lists",
    "Test if a binary tree is height-balanced",
    "Compute the median of online data",
    "Search a cyclically sorted array",
    "The knapsack problem",
    "The interval covering problem",
    "Search a maze",
    "Implement caching for a multithreaded dictionary",
    "Design a spell checker",
    "Garbage collection",
    "Template Method vs Strategy",
    "SQL vs NoSQL",
    "Compute the greatest common divisor",
  ]) {
    assert.ok(epi.some((item) => item.title === title), `missing representative EPI problem ${title}`);
  }
});

test("Skiena atlas preserves the complete 75-problem catalog by catalog section", () => {
  const skiena = canonicalExercises.filter((item) => item.source === "skiena");
  assert.equal(skiena.length, 75);

  const expectedSections = new Map([
    ["Catalog · Data Structures", 6],
    ["Catalog · Numerical Problems", 11],
    ["Catalog · Combinatorial Problems", 10],
    ["Catalog · Polynomial-Time Graph Problems", 12],
    ["Catalog · Hard Graph Problems", 11],
    ["Catalog · Computational Geometry", 16],
    ["Catalog · Set and String Problems", 9],
  ]);

  for (const [section, expectedCount] of expectedSections) {
    assert.equal(skiena.filter((item) => item.sourceChapter === section).length, expectedCount, `${section} coverage changed`);
  }

  for (const title of [
    "Dictionaries",
    "Knapsack Problem",
    "Satisfiability",
    "Minimum Spanning Tree",
    "Traveling Salesman Problem",
    "Voronoi Diagrams",
    "Shortest Common Superstring",
  ]) {
    assert.ok(skiena.some((item) => item.title === title), `missing Skiena catalog problem ${title}`);
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
