export const reasoningStageIds = [
  "understand",
  "examples",
  "baseline",
  "waste",
  "strategy",
  "invariant",
  "analyze",
  "vary",
] as const;

export type ReasoningStageId = (typeof reasoningStageIds)[number];

const reasoningStageIdSet = new Set<string>(reasoningStageIds);

export function isReasoningStageId(value: unknown): value is ReasoningStageId {
  return typeof value === "string" && reasoningStageIdSet.has(value);
}

export const reasoningStageLabels: Record<ReasoningStageId, string> = {
  understand: "Understand",
  examples: "Tiny and extreme cases",
  baseline: "Baseline",
  waste: "Name the waste",
  strategy: "Strategy / model",
  invariant: "Invariant",
  analyze: "Complexity analysis",
  vary: "Vary / transfer",
};
