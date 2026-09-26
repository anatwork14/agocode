import { canonicalExercises, type CanonicalExercise } from "../knowledge/all-exercises.ts";
import {
  placementSkillLabels,
  type DiagnosticAttempt,
  type PlacementSkillId,
} from "./diagnostic.ts";
import type { ProblemRecognitionHistory } from "./independence.ts";
import type { RecommendationHistory } from "./recommendations.ts";
import {
  classifyReasoningAttempt,
  reasoningAttemptStageRank,
  type ReasoningAttemptEntry,
  type ReasoningAttemptHistory,
  type ReasoningAttemptStage,
} from "./reasoning-attempts.ts";

export const DEFAULT_RECOMMENDATION_OBSERVATION_MS = 7 * 24 * 60 * 60 * 1000;
export const DEFAULT_RECOMMENDATION_GRACE_MS = 24 * 60 * 60 * 1000;

export type RecommendationAuditStatus =
  | "waiting"
  | "no-evidence"
  | "guided"
  | "retrieval-miss"
  | "solved"
  | "independent"
  | "retrieval-hit";

export type RecommendationOutcome = {
  exerciseId: string;
  chosenAt: string;
  windowEndsAt: string;
  status: RecommendationAuditStatus;
  evidenceAt?: string;
  firstEvidenceAt?: string;
  latencyMs?: number;
  strongEvidence: boolean;
  detail: string;
};

export type RecommendationOutcomeAudit = {
  choices: number;
  matureChoices: number;
  waiting: number;
  followedThrough: number;
  strongEvidence: number;
  noEvidence: number;
  followThroughRate?: number;
  strongEvidenceRate?: number;
  medianLatencyMs?: number;
  outcomes: RecommendationOutcome[];
};

export type DiagnosticCalibrationStatus = "aligned" | "optimistic" | "conservative" | "insufficient";
export type CalibrationBand = "foundation" | "developing" | "strong";

export type DiagnosticSkillCalibration = {
  skillId: PlacementSkillId;
  label: string;
  diagnosticScore: number;
  objectiveScore?: number;
  diagnosticBand: CalibrationBand;
  objectiveBand?: CalibrationBand;
  status: DiagnosticCalibrationStatus;
  observedExercises: number;
  completedExercises: number;
  independentExercises: number;
  directionalGap?: number;
  explanation: string;
};

export type DiagnosticCalibrationAudit = {
  available: boolean;
  diagnosticCompletedAt?: string;
  observedSkills: number;
  aligned: number;
  optimistic: number;
  conservative: number;
  insufficient: number;
  rows: DiagnosticSkillCalibration[];
};

const exerciseById = new Map(canonicalExercises.map((exercise) => [exercise.id, exercise]));

const placementSkillTerms: Record<PlacementSkillId, readonly string[]> = {
  analysis: [
    "complexity", "asymptotic", "running time", "big o", "amortized", "binary search", "sorting", "selection", "growth",
  ],
  "data-structures": [
    "array", "linked list", "stack", "queue", "deque", "hash", "map", "set", "heap", "priority queue", "tree", "trie", "bloom filter",
  ],
  recursion: [
    "recursion", "recursive", "divide and conquer", "backtracking", "call stack", "quicksort", "merge sort", "tree traversal",
  ],
  graphs: [
    "graph", "bfs", "dfs", "breadth first", "depth first", "dijkstra", "shortest path", "minimum spanning", "mst", "topological",
  ],
  correctness: [
    "correctness", "invariant", "proof", "counterexample", "exchange argument", "induction", "assumption", "pruning",
  ],
  greedy: [
    "greedy", "interval scheduling", "set cover", "minimum spanning", "mst", "dijkstra", "exchange argument",
  ],
  "dynamic-programming": [
    "dynamic programming", "memoization", "knapsack", "subsequence", "substring", "state design", "optimal substructure",
  ],
  "problem-modeling": [
    "model", "modeling", "transformation", "baseline", "brute force", "prefix", "sliding window", "two pointers", "answer space", "representation",
  ],
};

const signalRank: Record<Exclude<RecommendationAuditStatus, "waiting" | "no-evidence">, number> = {
  guided: 1,
  "retrieval-miss": 2,
  solved: 3,
  independent: 4,
  "retrieval-hit": 5,
};

function finiteTime(value: string) {
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : undefined;
}

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
}

function exerciseHaystack(exercise: CanonicalExercise) {
  return normalize([exercise.title, exercise.domain, exercise.lens, ...exercise.tags].join(" "));
}

export function inferPlacementSkillsForExercise(exercise: CanonicalExercise): PlacementSkillId[] {
  const haystack = ` ${exerciseHaystack(exercise)} `;
  return (Object.keys(placementSkillTerms) as PlacementSkillId[]).filter((skill) => (
    placementSkillTerms[skill].some((term) => haystack.includes(` ${normalize(term)} `) || haystack.includes(normalize(term)))
  ));
}

function strongestReasoningStatus(entries: ReasoningAttemptEntry[]) {
  let strongest: { status: "guided" | "solved" | "independent"; entry: ReasoningAttemptEntry } | undefined;
  for (const entry of entries) {
    const stage = classifyReasoningAttempt(entry);
    if (!strongest || reasoningAttemptStageRank[stage] > reasoningAttemptStageRank[strongest.status]) {
      strongest = { status: stage, entry };
    } else if (strongest && reasoningAttemptStageRank[stage] === reasoningAttemptStageRank[strongest.status]
      && entry.finalizedAt < strongest.entry.finalizedAt) {
      strongest = { status: stage, entry };
    }
  }
  return strongest;
}

function recommendationDetail(status: RecommendationAuditStatus) {
  if (status === "waiting") return "The attribution window is still young; AgoCode is waiting for objective evidence before judging this recommendation.";
  if (status === "no-evidence") return "No objective reasoning or blind-recognition event appeared inside this recommendation's attribution window.";
  if (status === "guided") return "The recommendation led to a meaningful reasoning attempt, but not yet to a completed solve.";
  if (status === "retrieval-miss") return "The recommendation led to blind recognition practice, but the first structural choice was not correct.";
  if (status === "solved") return "A completed reasoning attempt followed this recommendation, but the strongest observed solve still used support or lacked independent coverage.";
  if (status === "independent") return "The recommendation led to an independent completed reasoning attempt without structural-lens support.";
  return "The recommendation led to a first-try blind structural-recognition success.";
}

function median(values: number[]) {
  if (!values.length) return undefined;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : Math.round((sorted[middle - 1] + sorted[middle]) / 2);
}

export function buildRecommendationOutcomeAudit(input: {
  recommendations: RecommendationHistory;
  reasoningAttempts: ReasoningAttemptHistory;
  recognitionHistory: ProblemRecognitionHistory;
  now?: number;
  observationMs?: number;
  graceMs?: number;
}): RecommendationOutcomeAudit {
  const now = input.now ?? Date.now();
  const observationMs = Math.max(60_000, input.observationMs ?? DEFAULT_RECOMMENDATION_OBSERVATION_MS);
  const graceMs = Math.max(0, input.graceMs ?? DEFAULT_RECOMMENDATION_GRACE_MS);
  const ordered = input.recommendations.entries
    .map((entry, index) => ({ ...entry, index, chosenMs: finiteTime(entry.chosenAt) }))
    .filter((entry): entry is typeof entry & { chosenMs: number } => entry.chosenMs !== undefined)
    .sort((a, b) => a.chosenMs - b.chosenMs || a.index - b.index);

  const outcomes = ordered.map((choice): RecommendationOutcome => {
    const nextChoice = ordered.find((candidate) => (
      candidate.exerciseId === choice.exerciseId && candidate.chosenMs > choice.chosenMs
    ));
    const naturalEnd = choice.chosenMs + observationMs;
    const windowEnd = Math.min(naturalEnd, nextChoice?.chosenMs ?? naturalEnd);
    const reasoning = input.reasoningAttempts.entries.filter((entry) => {
      if (entry.exerciseId !== choice.exerciseId) return false;
      const time = finiteTime(entry.finalizedAt);
      return time !== undefined && time >= choice.chosenMs && time < windowEnd;
    });
    const recognition = input.recognitionHistory.entries.filter((entry) => {
      if (entry.exerciseId !== choice.exerciseId) return false;
      const time = finiteTime(entry.recognizedAt);
      return time !== undefined && time >= choice.chosenMs && time < windowEnd;
    });

    const firstEventTimes = [
      ...reasoning.map((entry) => finiteTime(entry.finalizedAt)),
      ...recognition.map((entry) => finiteTime(entry.recognizedAt)),
    ].filter((time): time is number => time !== undefined);
    const firstEvidenceMs = firstEventTimes.length ? Math.min(...firstEventTimes) : undefined;
    const strongestReasoning = strongestReasoningStatus(reasoning);
    const strongestRecognition = recognition
      .map((entry) => ({
        status: entry.firstTry ? "retrieval-hit" as const : "retrieval-miss" as const,
        entry,
      }))
      .sort((a, b) => signalRank[b.status] - signalRank[a.status] || a.entry.recognizedAt.localeCompare(b.entry.recognizedAt))[0];

    let strongest: { status: Exclude<RecommendationAuditStatus, "waiting" | "no-evidence">; at: string } | undefined;
    if (strongestReasoning) strongest = { status: strongestReasoning.status, at: strongestReasoning.entry.finalizedAt };
    if (strongestRecognition && (!strongest || signalRank[strongestRecognition.status] > signalRank[strongest.status])) {
      strongest = { status: strongestRecognition.status, at: strongestRecognition.entry.recognizedAt };
    }

    const matureWithoutEvidence = now >= Math.min(choice.chosenMs + graceMs, windowEnd);
    const status: RecommendationAuditStatus = strongest?.status ?? (matureWithoutEvidence ? "no-evidence" : "waiting");
    const strongEvidence = status === "independent" || status === "retrieval-hit";
    return {
      exerciseId: choice.exerciseId,
      chosenAt: choice.chosenAt,
      windowEndsAt: new Date(windowEnd).toISOString(),
      status,
      evidenceAt: strongest?.at,
      firstEvidenceAt: firstEvidenceMs === undefined ? undefined : new Date(firstEvidenceMs).toISOString(),
      latencyMs: firstEvidenceMs === undefined ? undefined : Math.max(0, firstEvidenceMs - choice.chosenMs),
      strongEvidence,
      detail: recommendationDetail(status),
    };
  });

  const mature = outcomes.filter((outcome) => outcome.status !== "waiting");
  const followed = mature.filter((outcome) => outcome.status !== "no-evidence");
  const strong = mature.filter((outcome) => outcome.strongEvidence);
  const latencies = outcomes.map((outcome) => outcome.latencyMs).filter((value): value is number => value !== undefined);

  return {
    choices: outcomes.length,
    matureChoices: mature.length,
    waiting: outcomes.filter((outcome) => outcome.status === "waiting").length,
    followedThrough: followed.length,
    strongEvidence: strong.length,
    noEvidence: mature.filter((outcome) => outcome.status === "no-evidence").length,
    followThroughRate: mature.length ? Math.round((followed.length / mature.length) * 100) : undefined,
    strongEvidenceRate: mature.length ? Math.round((strong.length / mature.length) * 100) : undefined,
    medianLatencyMs: median(latencies),
    outcomes: outcomes.sort((a, b) => b.chosenAt.localeCompare(a.chosenAt)),
  };
}

function calibrationBand(score: number): CalibrationBand {
  if (score >= 75) return "strong";
  if (score >= 50) return "developing";
  return "foundation";
}

const calibrationBandRank: Record<CalibrationBand, number> = {
  foundation: 0,
  developing: 1,
  strong: 2,
};

function stageScore(stage: ReasoningAttemptStage) {
  if (stage === "independent") return 100;
  if (stage === "solved") return 60;
  return 25;
}

function skillExplanation(status: DiagnosticCalibrationStatus, observed: number) {
  if (status === "insufficient") return `Only ${observed} post-diagnostic exercise${observed === 1 ? "" : "s"} currently map to this skill; at least two are required before comparing placement with later work.`;
  if (status === "optimistic") return "Diagnostic placement is directionally stronger than the later objective attempts observed so far. Treat the placement as a starting prior, not proof of durable skill.";
  if (status === "conservative") return "Later objective attempts are directionally stronger than the diagnostic placement suggested. The learner may have improved or the short diagnostic may have underestimated this skill.";
  return "Diagnostic placement and later objective attempt strength currently fall in the same broad evidence band.";
}

export function buildDiagnosticCalibrationAudit(input: {
  diagnosticAttempt?: DiagnosticAttempt;
  reasoningAttempts: ReasoningAttemptHistory;
}): DiagnosticCalibrationAudit {
  const diagnostic = input.diagnosticAttempt;
  if (!diagnostic?.completedAt || !diagnostic.result) {
    return {
      available: false,
      observedSkills: 0,
      aligned: 0,
      optimistic: 0,
      conservative: 0,
      insufficient: 0,
      rows: [],
    };
  }

  const completedMs = finiteTime(diagnostic.completedAt);
  if (completedMs === undefined) {
    return {
      available: false,
      observedSkills: 0,
      aligned: 0,
      optimistic: 0,
      conservative: 0,
      insufficient: 0,
      rows: [],
    };
  }

  const postDiagnostic = input.reasoningAttempts.entries.filter((entry) => {
    const finalized = finiteTime(entry.finalizedAt);
    return finalized !== undefined && finalized > completedMs;
  });

  const rows = diagnostic.result.skills.map((skill): DiagnosticSkillCalibration => {
    const grouped = new Map<string, ReasoningAttemptEntry[]>();
    for (const entry of postDiagnostic) {
      const exercise = exerciseById.get(entry.exerciseId);
      if (!exercise || !inferPlacementSkillsForExercise(exercise).includes(skill.id)) continue;
      const entries = grouped.get(entry.exerciseId) ?? [];
      entries.push(entry);
      grouped.set(entry.exerciseId, entries);
    }

    const bestStages = [...grouped.values()].map((entries) => (
      entries.map(classifyReasoningAttempt).reduce((best, candidate) => (
        reasoningAttemptStageRank[candidate] > reasoningAttemptStageRank[best] ? candidate : best
      ))
    ));
    const observedExercises = bestStages.length;
    const completedExercises = bestStages.filter((stage) => stage === "solved" || stage === "independent").length;
    const independentExercises = bestStages.filter((stage) => stage === "independent").length;
    const diagnosticBand = calibrationBand(skill.score);

    if (observedExercises < 2) {
      return {
        skillId: skill.id,
        label: placementSkillLabels[skill.id],
        diagnosticScore: skill.score,
        diagnosticBand,
        status: "insufficient",
        observedExercises,
        completedExercises,
        independentExercises,
        explanation: skillExplanation("insufficient", observedExercises),
      };
    }

    const objectiveScore = Math.round(bestStages.reduce((sum, stage) => sum + stageScore(stage), 0) / observedExercises);
    const objectiveBand = calibrationBand(objectiveScore);
    const gap = objectiveScore - skill.score;
    const status: DiagnosticCalibrationStatus = calibrationBandRank[diagnosticBand] === calibrationBandRank[objectiveBand]
      ? "aligned"
      : calibrationBandRank[diagnosticBand] > calibrationBandRank[objectiveBand]
        ? "optimistic"
        : "conservative";

    return {
      skillId: skill.id,
      label: placementSkillLabels[skill.id],
      diagnosticScore: skill.score,
      objectiveScore,
      diagnosticBand,
      objectiveBand,
      status,
      observedExercises,
      completedExercises,
      independentExercises,
      directionalGap: gap,
      explanation: skillExplanation(status, observedExercises),
    };
  });

  return {
    available: true,
    diagnosticCompletedAt: diagnostic.completedAt,
    observedSkills: rows.filter((row) => row.status !== "insufficient").length,
    aligned: rows.filter((row) => row.status === "aligned").length,
    optimistic: rows.filter((row) => row.status === "optimistic").length,
    conservative: rows.filter((row) => row.status === "conservative").length,
    insufficient: rows.filter((row) => row.status === "insufficient").length,
    rows,
  };
}
