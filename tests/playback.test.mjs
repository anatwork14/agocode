import assert from "node:assert/strict";
import test from "node:test";
import {
  canAutoplayAdvance,
  initialPlaybackState,
  playbackDelayMs,
  playbackReducer,
} from "../lib/visualization/playback.ts";

test("playback reducer toggles, stops, and changes speed deterministically", () => {
  const playing = playbackReducer(initialPlaybackState, { type: "play" });
  assert.equal(playing.playing, true);

  const fast = playbackReducer(playing, { type: "set-speed", speedId: "fast" });
  assert.equal(fast.speedId, "fast");
  assert.ok(playbackDelayMs(fast) < playbackDelayMs(initialPlaybackState));

  const stopped = playbackReducer(fast, { type: "stop" });
  assert.equal(stopped.playing, false);
});

test("autoplay advances only while playing before the final frame", () => {
  const playing = { ...initialPlaybackState, playing: true };
  assert.equal(canAutoplayAdvance({ state: playing, index: 0, length: 4 }), true);
  assert.equal(canAutoplayAdvance({ state: playing, index: 3, length: 4 }), false);
  assert.equal(canAutoplayAdvance({ state: initialPlaybackState, index: 0, length: 4 }), false);
});

test("prediction locks always block autoplay", () => {
  const playing = { ...initialPlaybackState, playing: true };
  assert.equal(canAutoplayAdvance({ state: playing, index: 1, length: 4, locked: true }), false);
  assert.equal(canAutoplayAdvance({ state: playing, index: 1, length: 4, locked: false }), true);
});
