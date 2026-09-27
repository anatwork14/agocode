export type RecommendationReasonId =
  | "difficulty-calibration"
  | "guided-continuation"
  | "independence-retry"
  | "delayed-retrieval"
  | "transfer-within-family"
  | "retrieval-overdue"
  | "retrieval-due"
  | "retrieval-due-soon"
  | "weakest-dimension"
  | "repeated-friction"
  | "recognition-miss"
  | "recent-retrieval"
  | "source-diversity"
  | "domain-diversity"
  | "family-diversity"
  | "combined-diversity"
  | "baseline-fit"
  | "other";

export type RecommendationScoreDelta = -2 | 0 | 2;
export type RecommendationScoreAdjustments = Partial<Record<RecommendationReasonId, RecommendationScoreDelta>>;

const reasonLabels: Record<RecommendationReasonId, string> = {
  "difficulty-calibration": "Difficulty calibration",
  "guided-continuation": "Continue guided work",
  "independence-retry": "Remove support on a solved problem",
  "delayed-retrieval": "Delayed structural retrieval",
  "transfer-within-family": "Transfer within a known family",
  "retrieval-overdue": "Overdue retrieval",
  "retrieval-due": "Retrieval due now",
  "retrieval-due-soon": "Retrieval due soon",
  "weakest-dimension": "Weakest-dimension alignment",
  "repeated-friction": "Repeated-friction targeting",
  "recognition-miss": "Blind-recognition miss retry",
  "recent-retrieval": "Recent-study retrieval",
  "source-diversity": "Source diversity",
  "domain-diversity": "Domain diversity",
  "family-diversity": "Structural-family diversity",
  "combined-diversity": "Source + domain diversity",
  "baseline-fit": "General weakest-gap fit",
  other: "Other surfaced rationale",
};

const reasonMatchers: Array<{ id: Exclude<RecommendationReasonId, "other">; matches: (reason: string) => boolean }> = [
  { id: "difficulty-calibration", matches: (reason) => reason.includes("difficulty calibration") },
  { id: "guided-continuation", matches: (reason) => reason.includes("in-progress problem") },
  { id: "independence-retry", matches: (reason) => reason.includes("without support to establish independence") },
  { id: "delayed-retrieval", matches: (reason) => reason.includes("delayed structural retrieval") },
  { id: "transfer-within-family", matches: (reason) => reason.includes("family already solved independently") },
  { id: "retrieval-overdue", matches: (reason) => reason.includes("retrieval evidence is overdue") },
  { id: "retrieval-due", matches: (reason) => reason.includes("retrieval is due now") },
  { id: "retrieval-due-soon", matches: (reason) => reason.includes("next retrieval window") },
  { id: "weakest-dimension", matches: (reason) => reason.startsWith("builds ") && reason.endsWith(" evidence") },
  { id: "repeated-friction", matches: (reason) => reason.startsWith("targets repeated friction") || reason === "targets repeated problem-solving friction" },
  { id: "recognition-miss", matches: (reason) => reason.includes("blind-recognition miss") },
  { id: "recent-retrieval", matches: (reason) => reason.includes("recently studied problem from memory") },
  { id: "source-diversity", matches: (reason) => reason === "changes source perspective" },
  { id: "domain-diversity", matches: (reason) => reason === "changes application domain" },
  { id: "family-diversity", matches: (reason) => reason === "widens structural-family coverage" },
  { id: "combined-diversity", matches: (reason) => reason === "adds source and domain diversity" },
  { id: "baseline-fit", matches: (reason) => reason.startsWith("fits your current ") && reason.endsWith(" gap") },
];

export const recommendationReasonIds = Object.freeze(Object.keys(reasonLabels) as RecommendationReasonId[]);

export function classifyRecommendationReason(reason: string): RecommendationReasonId {
  const normalized = reason.trim().toLowerCase();
  return reasonMatchers.find((matcher) => matcher.matches(normalized))?.id ?? "other";
}

export function recommendationReasonLabel(id: RecommendationReasonId) {
  return reasonLabels[id];
}
