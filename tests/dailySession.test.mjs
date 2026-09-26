import assert from "node:assert/strict";
import test from "node:test";
import {
  DAILY_PRACTICE_HISTORY_LIMIT,
  DAILY_PRACTICE_SESSION_KEY,
  ensureDailyPracticeSession,
  getDailyPracticeProgress,
  getLocalDayKey,
  readDailyPracticeState,
  regenerateDailyPracticeSession,
  updateDailyPracticeItemStatus,
} from "../lib/practice/daily-session.ts";

function createStorage() {
  const values = new Map();
  return {
    values,
    getItem(key) { return values.get(key) ?? null; },
    setItem(key, value) { values.set(key, value); },
  };
}

function mixed(seed, ids = ["p1", "p2", "p3"]) {
  const roles = ["retrieve", "remove-support", "transfer"];
  return {
    seed,
    familyCount: ids.length,
    sourceCount: Math.min(2, ids.length),
    dueRetrievalCount: ids.length ? 1 : 0,
    items: ids.map((exerciseId, index) => ({
      exerciseId,
      title: `Problem ${exerciseId}`,
      familyId: `family-${exerciseId}`,
      familyLabel: `Family ${exerciseId}`,
      role: roles[index % roles.length],
      reason: `Reason for ${exerciseId}`,
      href: `/exercises/${exerciseId}`,
    })),
  };
}

test("local day keys use the browser-style calendar day rather than UTC slicing", () => {
  const local = new Date(2026, 8, 26, 23, 45, 0);
  assert.equal(getLocalDayKey(local), "2026-09-26");
});

test("daily session is frozen for the same local day", () => {
  const storage = createStorage();
  const morning = new Date(2026, 8, 26, 8, 0, 0);
  const evening = new Date(2026, 8, 26, 20, 30, 0);
  const first = ensureDailyPracticeSession(storage, mixed("morning", ["p1", "p2"]), morning);
  const resumed = ensureDailyPracticeSession(storage, mixed("evening", ["p9", "p8"]), evening);

  assert.equal(first.seed, "morning");
  assert.equal(resumed.seed, "morning");
  assert.deepEqual(resumed.items.map((item) => item.exerciseId), ["p1", "p2"]);
  assert.equal(storage.values.size, 1);
  assert.ok(storage.values.has(DAILY_PRACTICE_SESSION_KEY));
});

test("status updates persist without writing any learning-evidence keys", () => {
  const storage = createStorage();
  const now = new Date(2026, 8, 26, 10, 0, 0);
  ensureDailyPracticeSession(storage, mixed("today", ["p1", "p2"]), now);
  const updated = updateDailyPracticeItemStatus(storage, "p1", "done", new Date(2026, 8, 26, 10, 5, 0));

  assert.ok(updated);
  assert.equal(updated.items[0].status, "done");
  assert.equal(updated.items[0].completionMode, "manual");
  assert.match(updated.items[0].satisfactionDetail, /does not create learning evidence/);
  assert.equal(updated.items[1].status, "pending");
  assert.equal(getDailyPracticeProgress(updated).done, 1);
  assert.equal(getDailyPracticeProgress(updated).manualDone, 1);
  assert.equal(getDailyPracticeProgress(updated).objectiveDone, 0);
  assert.deepEqual([...storage.values.keys()], [DAILY_PRACTICE_SESSION_KEY]);
});

test("explicit regeneration preserves completed overlap and gives re-queued work a fresh evidence window", () => {
  const storage = createStorage();
  const now = new Date(2026, 8, 26, 9, 0, 0);
  ensureDailyPracticeSession(storage, mixed("initial", ["p1", "p2", "p3"]), now);
  updateDailyPracticeItemStatus(storage, "p1", "done", new Date(2026, 8, 26, 9, 5, 0));
  updateDailyPracticeItemStatus(storage, "p2", "skipped", new Date(2026, 8, 26, 9, 6, 0));

  const regeneratedAt = new Date(2026, 8, 26, 9, 10, 0);
  const regenerated = regenerateDailyPracticeSession(
    storage,
    mixed("rebuilt", ["p1", "p2", "p4"]),
    regeneratedAt,
  );

  assert.equal(regenerated.regenerationCount, 1);
  assert.equal(regenerated.seed, "rebuilt");
  assert.deepEqual(regenerated.items.map((item) => [item.exerciseId, item.status]), [
    ["p1", "done"],
    ["p2", "pending"],
    ["p4", "pending"],
  ]);
  assert.equal(regenerated.items[0].completionMode, "manual");
  assert.equal(regenerated.items[1].enteredAt, regeneratedAt.toISOString());
  assert.equal(regenerated.items[2].enteredAt, regeneratedAt.toISOString());
  assert.equal(regenerated.completedAt, undefined);
});

test("clearing every row records session completion and reopening starts a new objective window", () => {
  const storage = createStorage();
  ensureDailyPracticeSession(storage, mixed("today", ["p1", "p2"]), new Date(2026, 8, 26, 7, 0, 0));
  updateDailyPracticeItemStatus(storage, "p1", "done", new Date(2026, 8, 26, 7, 5, 0));
  const completed = updateDailyPracticeItemStatus(storage, "p2", "skipped", new Date(2026, 8, 26, 7, 6, 0));
  assert.ok(completed?.completedAt);
  assert.equal(getDailyPracticeProgress(completed).isComplete, true);

  const reopenedAt = new Date(2026, 8, 26, 7, 7, 0);
  const reopened = updateDailyPracticeItemStatus(storage, "p2", "pending", reopenedAt);
  assert.equal(reopened?.completedAt, undefined);
  assert.equal(reopened?.items[1].enteredAt, reopenedAt.toISOString());
  assert.equal(getDailyPracticeProgress(reopened).pending, 1);
});

test("legacy version-one rows migrate with manual completion semantics", () => {
  const storage = createStorage();
  storage.setItem(DAILY_PRACTICE_SESSION_KEY, JSON.stringify({
    version: 1,
    history: [],
    current: {
      version: 1,
      dayKey: "2026-09-26",
      seed: "legacy",
      startedAt: "2026-09-26T01:00:00.000Z",
      generatedAt: "2026-09-26T01:00:00.000Z",
      updatedAt: "2026-09-26T01:05:00.000Z",
      regenerationCount: 0,
      familyCount: 1,
      sourceCount: 1,
      dueRetrievalCount: 0,
      items: [{
        exerciseId: "p1",
        title: "Legacy",
        familyId: "f1",
        familyLabel: "Family",
        role: "diversify",
        reason: "legacy",
        href: "/exercises/p1",
        status: "done",
      }],
    },
  }));

  const state = readDailyPracticeState(storage);
  assert.equal(state.current?.items[0].enteredAt, "2026-09-26T01:00:00.000Z");
  assert.equal(state.current?.items[0].completionMode, "manual");
  assert.equal(state.current?.items[0].satisfiedAt, "2026-09-26T01:05:00.000Z");
});

test("day rollover archives objective/manual counts and bounds local history", () => {
  const storage = createStorage();
  const start = new Date(2026, 0, 1, 12, 0, 0);
  for (let day = 0; day < DAILY_PRACTICE_HISTORY_LIMIT + 5; day += 1) {
    const now = new Date(start);
    now.setDate(start.getDate() + day);
    ensureDailyPracticeSession(storage, mixed(`day-${day}`, [`p-${day}`]), now);
  }
  const state = readDailyPracticeState(storage);
  assert.equal(state.history.length, DAILY_PRACTICE_HISTORY_LIMIT);
  assert.equal(state.current?.seed, `day-${DAILY_PRACTICE_HISTORY_LIMIT + 4}`);
  assert.equal(new Set(state.history.map((entry) => entry.dayKey)).size, state.history.length);
  assert.ok(state.history.every((entry) => typeof entry.objectiveDone === "number" && typeof entry.manualDone === "number"));
});

test("corrupt or unknown local payloads fail closed to an empty state", () => {
  const storage = createStorage();
  storage.setItem(DAILY_PRACTICE_SESSION_KEY, "{broken-json");
  assert.deepEqual(readDailyPracticeState(storage), { version: 1, history: [] });

  storage.setItem(DAILY_PRACTICE_SESSION_KEY, JSON.stringify({ version: 99, history: [{ dayKey: "bad" }] }));
  assert.deepEqual(readDailyPracticeState(storage), { version: 1, history: [] });
});
