export const designTokens = {
  color: {
    paper: "var(--paper)",
    surface: "var(--surface)",
    ink: "var(--ink)",
    muted: "var(--muted)",
    border: "var(--border)",
    accent: "var(--accent)",
    success: "var(--state-success)",
    warning: "var(--state-warning)",
  },
  radius: {
    small: "var(--radius-sm)",
    control: "var(--radius-control)",
    panel: "var(--radius-panel)",
  },
  layout: {
    contentWidthPx: 1180,
    graphWidth: 640,
    graphHeight: 360,
  },
  motion: {
    controlMs: 160,
    traceSlowMs: 1400,
    traceNormalMs: 900,
    traceFastMs: 550,
  },
} as const;
