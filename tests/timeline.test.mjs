import assert from "node:assert/strict";
import test from "node:test";
import { initialTimelineState, timelineReducer } from "../lib/visualization/timeline.ts";

test("advance unlocks the next visited step", () => {
  const next = timelineReducer(initialTimelineState, { type: "advance", length: 5 });
  assert.deepEqual(next, { index: 1, maxUnlocked: 1 });
});

test("locked advance preserves timeline state", () => {
  const state = { index: 2, maxUnlocked: 2 };
  const next = timelineReducer(state, { type: "advance", length: 5, locked: true });
  assert.deepEqual(next, state);
});

test("scrubbing cannot jump beyond visited history", () => {
  const state = { index: 1, maxUnlocked: 3 };
  const next = timelineReducer(state, { type: "scrub", index: 99 });
  assert.deepEqual(next, { index: 3, maxUnlocked: 3 });
});

test("going backward does not forget unlocked history", () => {
  const state = { index: 3, maxUnlocked: 3 };
  const next = timelineReducer(state, { type: "back" });
  assert.deepEqual(next, { index: 2, maxUnlocked: 3 });
});

test("advance is clamped at the final step", () => {
  const state = { index: 4, maxUnlocked: 4 };
  const next = timelineReducer(state, { type: "advance", length: 5 });
  assert.deepEqual(next, state);
});

test("reset clears both current position and visited history", () => {
  const next = timelineReducer({ index: 4, maxUnlocked: 7 }, { type: "reset" });
  assert.deepEqual(next, initialTimelineState);
});
