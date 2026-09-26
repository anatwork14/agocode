import { designTokens } from "@/lib/ui/tokens";

export type PlaybackSpeedId = "slow" | "normal" | "fast";

export const playbackSpeeds = [
  { id: "slow", label: "0.75×", delayMs: designTokens.motion.traceSlowMs },
  { id: "normal", label: "1×", delayMs: designTokens.motion.traceNormalMs },
  { id: "fast", label: "1.5×", delayMs: designTokens.motion.traceFastMs },
] as const;

export type PlaybackState = {
  playing: boolean;
  speedId: PlaybackSpeedId;
};

export type PlaybackAction =
  | { type: "toggle" }
  | { type: "play" }
  | { type: "stop" }
  | { type: "set-speed"; speedId: PlaybackSpeedId };

export const initialPlaybackState: PlaybackState = {
  playing: false,
  speedId: "normal",
};

export function playbackReducer(state: PlaybackState, action: PlaybackAction): PlaybackState {
  switch (action.type) {
    case "toggle":
      return { ...state, playing: !state.playing };
    case "play":
      return { ...state, playing: true };
    case "stop":
      return { ...state, playing: false };
    case "set-speed":
      return { ...state, speedId: action.speedId };
  }
}

export function playbackDelayMs(state: PlaybackState) {
  return playbackSpeeds.find((speed) => speed.id === state.speedId)?.delayMs
    ?? designTokens.motion.traceNormalMs;
}

export function canAutoplayAdvance({
  state,
  index,
  length,
  locked = false,
}: {
  state: PlaybackState;
  index: number;
  length: number;
  locked?: boolean;
}) {
  return state.playing && !locked && length > 0 && index >= 0 && index < length - 1;
}
