export type TimelineState = {
  index: number;
  maxUnlocked: number;
};

export type TimelineAction =
  | { type: "reset" }
  | { type: "back" }
  | { type: "advance"; length: number; locked?: boolean }
  | { type: "scrub"; index: number };

export const initialTimelineState: TimelineState = {
  index: 0,
  maxUnlocked: 0,
};

export function timelineReducer(state: TimelineState, action: TimelineAction): TimelineState {
  switch (action.type) {
    case "reset":
      return initialTimelineState;

    case "back":
      return {
        ...state,
        index: Math.max(0, state.index - 1),
      };

    case "advance": {
      if (action.locked || action.length <= 0) return state;
      const next = Math.min(action.length - 1, state.index + 1);
      return {
        index: next,
        maxUnlocked: Math.max(state.maxUnlocked, next),
      };
    }

    case "scrub": {
      const next = Math.min(state.maxUnlocked, Math.max(0, action.index));
      return {
        ...state,
        index: next,
      };
    }
  }
}
