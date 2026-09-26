import test from "node:test";
import assert from "node:assert/strict";
import { atlasPatterns, classifiedAtlasExercises } from "../lib/practice/atlas-recognition.ts";

test("every structural family has classified practice", () => {
  for (const family of atlasPatterns) {
    const members = classifiedAtlasExercises.filter((item) => item.family.id === family.id);
    assert.ok(members.length > 0, `${family.id} has no classified exercises`);
  }
});

test("structural family classification only references known family ids", () => {
  const known = new Set(atlasPatterns.map((family) => family.id));
  for (const item of classifiedAtlasExercises) assert.ok(known.has(item.family.id));
});

test("multiple families expose cross-source transfer opportunities", () => {
  const crossSource = atlasPatterns.filter((family) => {
    const sources = new Set(classifiedAtlasExercises.filter((item) => item.family.id === family.id).map((item) => item.exercise.source));
    return sources.size >= 2;
  });
  assert.ok(crossSource.length >= 8);
});
