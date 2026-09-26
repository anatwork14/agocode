import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, relative, sep } from "node:path";
import { canonicalExercises } from "../lib/knowledge/all-exercises.ts";
import { moduleLabRoutes } from "../lib/knowledge/module-lab-routes.ts";
import { stuckDiagnoses } from "../lib/knowledge/stuck-router.ts";
import { syllabusTracks } from "../lib/knowledge/syllabus.ts";
import { primaryLearnerJourneys } from "../lib/navigation/primary-journeys.ts";
import { atlasPatterns } from "../lib/practice/atlas-recognition.ts";

const appRoot = fileURLToPath(new URL("../app", import.meta.url));

function collectPages(directory = appRoot, pages = []) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const absolute = join(directory, entry.name);
    if (entry.isDirectory()) collectPages(absolute, pages);
    else if (entry.isFile() && entry.name === "page.tsx") pages.push(absolute);
  }
  return pages;
}

function routeSegmentsForPage(file) {
  const directory = relative(appRoot, file.slice(0, -"page.tsx".length))
    .split(sep)
    .filter(Boolean)
    .filter((segment) => !(segment.startsWith("(") && segment.endsWith(")")));
  return directory;
}

const pagePatterns = collectPages().map(routeSegmentsForPage);

function normalizeHref(href) {
  const path = href.split("#", 1)[0].split("?", 1)[0];
  if (!path) return "/";
  return path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;
}

function matchesPattern(patternSegments, pathname) {
  const actual = pathname.split("/").filter(Boolean);
  let actualIndex = 0;

  for (let index = 0; index < patternSegments.length; index += 1) {
    const segment = patternSegments[index];
    if (segment.startsWith("[[...") && segment.endsWith("]]")) return true;
    if (segment.startsWith("[...") && segment.endsWith("]")) return actualIndex < actual.length;
    if (actualIndex >= actual.length) return false;
    if (!(segment.startsWith("[") && segment.endsWith("]")) && segment !== actual[actualIndex]) return false;
    actualIndex += 1;
  }

  return actualIndex === actual.length;
}

function hasApplicationRoute(href) {
  if (!href.startsWith("/")) return true;
  const pathname = normalizeHref(href);
  return pagePatterns.some((pattern) => matchesPattern(pattern, pathname));
}

function assertRoutesExist(label, hrefs) {
  for (const href of hrefs) {
    assert.ok(hasApplicationRoute(href), `${label} points to missing application route: ${href}`);
  }
}

test("data-driven syllabus routes resolve to real app pages", () => {
  const moduleRoutes = syllabusTracks.flatMap((track) => track.modules.map((module) => module.route).filter(Boolean));
  assertRoutesExist("syllabus module", moduleRoutes);
  assertRoutesExist("module lab", Object.values(moduleLabRoutes));
});

test("contextual-help actions resolve to real app pages", () => {
  assertRoutesExist("stuck-router action", stuckDiagnoses.flatMap((diagnosis) => diagnosis.actions.map((action) => action.href)));
  assertRoutesExist("stuck-router field note", stuckDiagnoses.map((diagnosis) => `/blog/${diagnosis.fieldNoteSlug}`));
});

test("canonical exercise lesson routes resolve to real app pages", () => {
  assertRoutesExist("canonical exercise", canonicalExercises.map((exercise) => exercise.route).filter(Boolean));
});

test("all generated structural and syllabus detail links have backing dynamic routes", () => {
  assertRoutesExist("pattern detail", atlasPatterns.map((pattern) => `/patterns/${pattern.id}`));
  assertRoutesExist("family detail", atlasPatterns.map((pattern) => `/exercises/families/${pattern.id}`));
  assertRoutesExist("exercise detail", canonicalExercises.slice(0, 25).map((exercise) => `/exercises/${exercise.id}`));
  assertRoutesExist("syllabus detail", syllabusTracks.flatMap((track) => track.modules.map((module) => `/syllabus/${module.id}`)));
});

test("route discovery includes every core product mode", () => {
  const critical = [
    "/learn",
    "/syllabus",
    "/syllabus/map",
    "/lab",
    "/exercises",
    "/exercises/families/search-selection",
    "/patterns/search-selection",
    "/solve",
    "/blog",
    "/practice/next",
    "/practice/session",
    "/practice/variants",
    "/practice/atlas",
    "/sets",
    "/review",
    "/review/retrieve/epi-two-sum",
    "/progress",
    "/settings/data",
    "/roadmap",
  ];
  assertRoutesExist("core product surface", critical);
});

test("advanced design workbenches remain routable", () => {
  assertRoutesExist("advanced workbench", [
    "/lab/adt-workbench",
    "/lab/invariants",
    "/lab/amortization",
    "/lab/graph-modeling",
    "/lab/dp-state-design",
    "/lab/priority-queues",
    "/lab/backtracking",
    "/lab/greedy-counterexamples",
    "/lab/optimization-strategies",
    "/lab/transformations",
    "/lab/special-cases",
  ]);
});

test("primary learner journeys stay unique, internal, and fully routable", () => {
  const journeyIds = primaryLearnerJourneys.map((journey) => journey.id);
  assert.equal(new Set(journeyIds).size, journeyIds.length, "Primary learner journey ids must be unique.");

  for (const journey of primaryLearnerJourneys) {
    assert.ok(journey.label.trim(), `${journey.id} requires a learner-facing label.`);
    assert.ok(journey.routes.length >= 2, `${journey.id} must describe a multi-step journey.`);
    assert.equal(new Set(journey.routes).size, journey.routes.length, `${journey.id} must not repeat route steps.`);

    for (const route of journey.routes) {
      assert.ok(route.startsWith("/"), `${journey.id} contains a non-internal route: ${route}`);
    }
    assertRoutesExist(`primary learner journey ${journey.id}`, journey.routes);
  }
});
