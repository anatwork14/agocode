import assert from "node:assert/strict";
import test from "node:test";
import {
  ensureDailyPracticeSession,
  regenerateDailyPracticeSession,
  updateDailyPracticeItemStatus,
} from "../lib/practice/daily-session.ts";

function storage() {
  const values = new Map();
  return {
    getItem(key) { return values.get(key) ?? null; },
    setItem(key, value) { values.set(key, value); },
  };
}

function plan(seed, role) {
  return {
    seed,
    familyCount: 1,
    sourceCount: 1,
    dueRetrievalCount: role === "retrieve" ? 1 : 0,
    items: [{
      exerciseId: "same-problem",
      title: "Same problem",
      familyId: "family-1",
      familyLabel: "Family 1",
      role,
      reason: role,
      href: role === "retrieve" ? "/review/retrieve/same-problem" : "/exercises/same-problem",
    }],
  };
}

test("regeneration keeps completion only when the exercise keeps the same objective role", () => {
  const store = storage();
  ensureDailyPracticeSession(store, plan("initial", "retrieve"), new Date(2026, 8, 26, 9, 0, 0));
  updateDailyPracticeItemStatus(store, "same-problem", "done", new Date(2026, 8, 26, 9, 5, 0));

  const sameRole = regenerateDailyPracticeSession(
    store,
    plan("same-role", "retrieve"),
    new Date(2026, 8, 26, 9, 10, 0),
  );
  assert.equal(sameRole.items[0].status, "done");

  const changedRole = regenerateDailyPracticeSession(
    store,
    plan("changed-role", "transfer"),
    new Date(2026, 8, 26, 9, 15, 0),
  );
  assert.equal(changedRole.items[0].status, "pending");
  assert.equal(changedRole.items[0].completionMode, undefined);
  assert.equal(changedRole.items[0].enteredAt, "2026-09-26T02:15:00.000Z");
});
