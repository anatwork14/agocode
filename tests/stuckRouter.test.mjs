import assert from "node:assert/strict";
import test from "node:test";
import { fieldNotes } from "../lib/knowledge/blog.ts";
import { getReasoningStageHelp } from "../lib/knowledge/notebook-help.ts";
import { stuckDiagnoses, getDiagnosesForFieldNote } from "../lib/knowledge/stuck-router.ts";
import { syllabusTracks } from "../lib/knowledge/syllabus.ts";

const fieldNoteSlugs = new Set(fieldNotes.map((item) => item.slug));
const moduleIds = new Set(syllabusTracks.flatMap((track) => track.modules.map((module) => module.id)));
const reasoningStages = ["understand", "examples", "baseline", "waste", "strategy", "invariant", "analyze", "vary"];

test("the stuck router covers distinct high-value failure modes", () => {
  assert.equal(stuckDiagnoses.length, 10);
  assert.equal(new Set(stuckDiagnoses.map((item) => item.id)).size, stuckDiagnoses.length);
  assert.equal(new Set(stuckDiagnoses.map((item) => item.label)).size, stuckDiagnoses.length);
});

test("every diagnosis resolves to real syllabus and field-note context", () => {
  for (const diagnosis of stuckDiagnoses) {
    assert.ok(fieldNoteSlugs.has(diagnosis.fieldNoteSlug), `${diagnosis.id} points to a missing field note`);
    assert.ok(moduleIds.has(diagnosis.syllabusModuleId), `${diagnosis.id} points to a missing syllabus module`);
    assert.ok(diagnosis.questions.length >= 3, `${diagnosis.id} needs a usable question set`);
  }
});

test("every diagnosis provides reading plus an active next step", () => {
  for (const diagnosis of stuckDiagnoses) {
    assert.ok(diagnosis.actions.some((action) => action.kind === "read"), `${diagnosis.id} has no reading path`);
    assert.ok(diagnosis.actions.some((action) => action.kind !== "read"), `${diagnosis.id} has no active next step`);
    assert.ok(diagnosis.actions.every((action) => action.href.startsWith("/")), `${diagnosis.id} has a non-local route`);
  }
});

test("field-note reverse lookup returns only matching contexts", () => {
  for (const note of fieldNotes) {
    const contexts = getDiagnosesForFieldNote(note.slug);
    assert.ok(contexts.every((context) => context.fieldNoteSlug === note.slug));
  }
});

test("every reasoning notebook stage has a contextual escape hatch", () => {
  for (const stage of reasoningStages) {
    const help = getReasoningStageHelp(stage);
    assert.ok(help, `${stage} has no contextual help`);
    assert.ok(help.read?.href.startsWith("/blog/"), `${stage} should link to a field note`);
    assert.ok(help.active?.href.startsWith("/"), `${stage} should include an active next step`);
  }
});
