import assert from "node:assert/strict";
import test from "node:test";
import {
  DESIGN_SESSIONS_KEY,
  LEGACY_DESIGN_CANVAS_KEY,
  buildDesignSessionMarkdown,
  createDesignSession,
  deleteDesignSession,
  readDesignSessions,
  readLegacyDesignCanvas,
  upsertDesignSession,
} from "../lib/learning/design-sessions.ts";

function storage() {
  const data = new Map();
  return {
    getItem(key) { return data.has(key) ? data.get(key) : null; },
    setItem(key, value) { data.set(key, value); },
    removeItem(key) { data.delete(key); },
    data,
  };
}

test("named design sessions persist and update without duplication", () => {
  const store = storage();
  const session = createDesignSession("a", "Graph routing", "2026-09-26T00:00:00.000Z");
  upsertDesignSession(store, session);
  upsertDesignSession(store, { ...session, name: "Graph routing v2", updatedAt: "2026-09-26T01:00:00.000Z" });
  const sessions = readDesignSessions(store);
  assert.equal(sessions.length, 1);
  assert.equal(sessions[0].name, "Graph routing v2");
});

test("design sessions preserve structured tests and rejected approaches", () => {
  const store = storage();
  const session = createDesignSession("b", "Search", "2026-09-26T00:00:00.000Z", {
    tests: [{ id: "t1", input: "[]", expected: "0", notes: "empty boundary" }],
    rejections: [{ id: "r1", approach: "Sort first", because: "destroys online latency", wouldWorkIf: "batch mode" }],
  });
  upsertDesignSession(store, session);
  const saved = readDesignSessions(store)[0];
  assert.equal(saved.state.tests[0].expected, "0");
  assert.equal(saved.state.rejections[0].because, "destroys online latency");
});

test("deleting one design session keeps the others", () => {
  const store = storage();
  upsertDesignSession(store, createDesignSession("a", "A", "2026-09-26T00:00:00.000Z"));
  upsertDesignSession(store, createDesignSession("b", "B", "2026-09-26T01:00:00.000Z"));
  deleteDesignSession(store, "b");
  assert.deepEqual(readDesignSessions(store).map((item) => item.id), ["a"]);
});

test("legacy single-canvas state can be recovered", () => {
  const store = storage();
  store.setItem(LEGACY_DESIGN_CANVAS_KEY, JSON.stringify({ problem: "Legacy prompt", models: ["graph / relationships"] }));
  const legacy = readLegacyDesignCanvas(store);
  assert.equal(legacy.problem, "Legacy prompt");
  assert.deepEqual(legacy.models, ["graph / relationships"]);
});

test("markdown export includes proof, rejections, tests, and metadata", () => {
  const session = createDesignSession("x", "Counterexample search", "2026-09-26T00:00:00.000Z", {
    invariant: "The prefix remains feasible.",
    rejections: [{ id: "r", approach: "Greedy by largest", because: "small counterexample", wouldWorkIf: "exchange property held" }],
    tests: [{ id: "t", input: "[1,3,4], 6", expected: "2 coins", notes: "greedy fails" }],
  });
  const markdown = buildDesignSessionMarkdown(session);
  assert.match(markdown, /^# Counterexample search/m);
  assert.match(markdown, /The prefix remains feasible/);
  assert.match(markdown, /Greedy by largest/);
  assert.match(markdown, /2 coins/);
});

test("malformed session storage degrades safely", () => {
  const store = storage();
  store.setItem(DESIGN_SESSIONS_KEY, "{broken");
  assert.deepEqual(readDesignSessions(store), []);
});
