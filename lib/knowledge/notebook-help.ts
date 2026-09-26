import { getStuckDiagnosis, type StuckStateId } from "./stuck-router.ts";

export type ReasoningStageId =
  | "understand"
  | "examples"
  | "baseline"
  | "waste"
  | "strategy"
  | "invariant"
  | "analyze"
  | "vary";

const stageDiagnosis: Record<ReasoningStageId, StuckStateId> = {
  understand: "model",
  examples: "debugging",
  baseline: "baseline",
  waste: "baseline",
  strategy: "representation",
  invariant: "correctness",
  analyze: "complexity",
  vary: "transfer",
};

export function getReasoningStageHelp(stageId: ReasoningStageId) {
  const diagnosis = getStuckDiagnosis(stageDiagnosis[stageId]);
  if (!diagnosis) return null;
  return {
    diagnosisId: diagnosis.id,
    label: diagnosis.label,
    firstMove: diagnosis.firstMove,
    read: diagnosis.actions.find((action) => action.kind === "read") ?? null,
    active: diagnosis.actions.find((action) => action.kind !== "read") ?? null,
  };
}
