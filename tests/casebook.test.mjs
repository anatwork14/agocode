import assert from "node:assert/strict";
import test from "node:test";
import { caseStudies } from "../lib/knowledge/casebook.ts";

test("casebook contains several distinct application domains", () => {
  assert.ok(caseStudies.length >= 4);
  assert.equal(new Set(caseStudies.map((item) => item.slug)).size, caseStudies.length);
  assert.ok(new Set(caseStudies.map((item) => item.domain)).size >= 4);
});

test("every case preserves a multi-stage design trace rather than jumping to a solution", () => {
  for (const item of caseStudies) {
    assert.ok(item.stages.length >= 6, `${item.slug} should expose a substantial reasoning trace`);
    assert.equal(item.stages[0].kind, "request");
    assert.ok(item.stages.some((stage) => stage.kind === "baseline"));
    assert.ok(item.stages.some((stage) => stage.kind === "design"));
    assert.ok(item.stages.some((stage) => stage.kind === "verification"));
    assert.ok(item.stages.some((stage) => stage.kind === "postmortem"));
  }
});

test("case predictions have one defensible strategic choice and feedback for every option", () => {
  for (const item of caseStudies) {
    assert.ok(item.prediction.choices.length >= 3);
    assert.equal(item.prediction.choices.filter((choice) => choice.correct).length, 1, `${item.slug} should have one supported prediction`);
    for (const choice of item.prediction.choices) {
      assert.ok(choice.feedback.length > 20);
    }
  }
});

test("rejected ideas are preserved when they are pedagogically useful", () => {
  const rejected = caseStudies.flatMap((item) => item.stages.filter((stage) => stage.kind === "failure"));
  assert.ok(rejected.length >= 3);
  assert.ok(rejected.every((stage) => stage.body.join(" ").length > 80));
});

test("every case ends with a concrete design and assumption-changing transfer prompts", () => {
  for (const item of caseStudies) {
    assert.ok(item.finalDesign.length >= 4);
    assert.ok(item.transferQuestions.length >= 3);
    assert.ok(item.transferQuestions.every((question) => question.endsWith("?")));
  }
});
