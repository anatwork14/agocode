import test from "node:test";
import assert from "node:assert/strict";
import { atlasPatterns, classifiedAtlasExercises } from "../lib/practice/atlas-recognition.ts";
import {
  buildMixedModelVariantSession,
  buildModelVariants,
  modelVariantTemplates,
} from "../lib/practice/model-variants.ts";

test("every structural family has multiple model mutations", () => {
  for (const pattern of atlasPatterns) {
    const templates = modelVariantTemplates[pattern.id];
    assert.ok(Array.isArray(templates));
    assert.ok(templates.length >= 2, `${pattern.id} should expose at least two assumption shifts`);
    assert.equal(new Set(templates.map((item) => item.id)).size, templates.length);
  }
});

test("cross-family mutations point to a known different family", () => {
  const known = new Set(atlasPatterns.map((pattern) => pattern.id));
  for (const pattern of atlasPatterns) {
    for (const template of modelVariantTemplates[pattern.id]) {
      if (template.expectedDecision !== "new-family") continue;
      assert.ok(template.targetFamilyId, `${pattern.id}/${template.id} needs a target family`);
      assert.ok(known.has(template.targetFamilyId));
      assert.notEqual(template.targetFamilyId, pattern.id);
    }
  }
});

test("exercise variants are deterministic, bounded, and remain attached to the source family", () => {
  const source = classifiedAtlasExercises[0];
  assert.ok(source);
  const first = buildModelVariants(source.exercise.id, 4, "stable-seed");
  const second = buildModelVariants(source.exercise.id, 4, "stable-seed");
  assert.deepEqual(first, second);
  assert.ok(first.length >= 2);
  assert.ok(first.length <= 4);
  assert.equal(new Set(first.map((item) => item.id)).size, first.length);
  for (const item of first) {
    assert.equal(item.exerciseId, source.exercise.id);
    assert.equal(item.sourceFamilyId, source.family.id);
  }
});

test("mixed model sessions interleave distinct structural families", () => {
  const session = buildMixedModelVariantSession("mixed-seed", 10);
  assert.equal(session.length, 10);
  assert.equal(new Set(session.map((item) => item.sourceFamilyId)).size, 10);
  assert.ok(new Set(session.map((item) => item.exerciseId)).size >= 8);
});

test("unknown exercises do not invent structural variants", () => {
  assert.deepEqual(buildModelVariants("definitely-missing", 4, "seed"), []);
});
