export type SemanticEvent =
  | { type: "SET_RANGE"; low: number; high: number }
  | { type: "SET_POINTER"; pointer: "mid"; index: number }
  | { type: "COMPARE"; left: number; operator: "<" | ">" | "=="; right: number }
  | { type: "FOUND"; index: number };

export type TracePredictionOption = {
  id: string;
  label: string;
};

export type TracePrediction = {
  prompt: string;
  options: TracePredictionOption[];
  correctOptionId: string;
  explanation: string;
};

export type ArrayTraceFrame = {
  event: SemanticEvent;
  low: number;
  high: number;
  mid: number | null;
  activeLine: number;
  note: string;
  comparison?: string;
  found?: boolean;
  prediction?: TracePrediction;
};
