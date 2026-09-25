import assert from "node:assert/strict";
import test from "node:test";
import { getAtlasProblemsForModule } from "../lib/knowledge/syllabus-atlas.ts";
import { syllabusTracks } from "../lib/knowledge/syllabus.ts";

const sourceMap = {
  Goodrich: "goodrich",
  EPI: "epi",
  Skiena: "skiena",
};

const modules = syllabusTracks.flatMap((track) => track.modules);

function moduleById(id) {
  const module = modules.find((item) => item.id === id);
  assert.ok(module, `missing syllabus module ${id}`);
  return module;
}

function titlesFor(id, limit = 6) {
  return getAtlasProblemsForModule(moduleById(id), limit).map((match) => match.exercise.title.toLowerCase());
}

test("every syllabus module surfaces several unique canonical Atlas problems", () => {
  assert.ok(modules.length >= 30);

  for (const module of modules) {
    const matches = getAtlasProblemsForModule(module, 4);
    assert.equal(matches.length, 4, `${module.id} should surface four Atlas problems`);
    assert.equal(new Set(matches.map((match) => match.exercise.id)).size, matches.length, `${module.id} duplicated an exercise id`);
    assert.equal(new Set(matches.map((match) => match.exercise.title.toLowerCase())).size, matches.length, `${module.id} duplicated a problem title`);
    assert.ok(matches.every((match) => Number.isFinite(match.score) && match.score > 0), `${module.id} should have positive semantic scores`);
  }
});

test("modules retain at least one exercise from a named source perspective", () => {
  for (const module of modules) {
    const supported = module.sources.map((source) => sourceMap[source]).filter(Boolean);
    if (!supported.length) continue;
    const matches = getAtlasProblemsForModule(module, 4);
    assert.ok(
      matches.some((match) => supported.includes(match.exercise.source)),
      `${module.id} lost all exercises from its named source perspective`,
    );
  }
});

test("correctness module retrieves proof and invariant problems", () => {
  const titles = titlesFor("correctness");
  assert.ok(titles.some((title) => /invariant|induction|counterexample|contradiction|correct/.test(title)), titles.join(" | "));
});

test("priority-queue module retrieves heap or priority-queue problems", () => {
  const titles = titlesFor("priority-queues");
  assert.ok(titles.some((title) => /heap|priority/.test(title)), titles.join(" | "));
});

test("graph traversal module retrieves traversal families rather than generic graph design", () => {
  const titles = titlesFor("graph-traversal");
  assert.ok(titles.some((title) => /breadth|depth|component|topological|cycle|bipart/.test(title)), titles.join(" | "));
});

test("external-memory module retrieves cache, B-tree, or external-memory problems", () => {
  const titles = titlesFor("memory-external");
  assert.ok(titles.some((title) => /cache|b-tree|b tree|external|memory/.test(title)), titles.join(" | "));
});

test("hardness module retrieves canonical hard-problem vocabulary", () => {
  const titles = titlesFor("hardness");
  assert.ok(titles.some((title) => /traveling|vertex cover|clique|satisf|set cover|independent/.test(title)), titles.join(" | "));
});
