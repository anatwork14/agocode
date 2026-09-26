import { canonicalExercises, type CanonicalExercise } from "../knowledge/all-exercises.ts";
import {
  getModuleDependents,
  getModulePrerequisites,
  syllabusGraphNodes,
  type SyllabusGraphNode,
} from "../knowledge/syllabus-graph.ts";
import type { DiagnosticResult, PlacementSkillId } from "./diagnostic.ts";
import {
  classifyReasoningAttempt,
  type ReasoningAttemptEntry,
  type ReasoningAttemptHistory,
} from "./reasoning-attempts.ts";

export type CurriculumModuleState = "mastered" | "developing" | "ready" | "blocked";

export type CurriculumModuleEvidence = {
  attempts: number;
  relevantExercises: number;
  completedExercises: number;
  independentExercises: number;
  objectiveScore: number;
  latestEvidenceAt?: string;
};

export type CurriculumPrerequisiteStatus = {
  moduleId: string;
  title: string;
  satisfied: boolean;
  basis: "objective" | "diagnostic" | "missing";
};

export type CurriculumModuleProfile = {
  id: string;
  title: string;
  trackId: string;
  trackTitle: string;
  route: string;
  state: CurriculumModuleState;
  skills: PlacementSkillId[];
  diagnosticScore?: number;
  evidence: CurriculumModuleEvidence;
  prerequisites: CurriculumPrerequisiteStatus[];
  blockedBy: string[];
  downstreamCount: number;
  priority: number;
  explanation: string;
};

export type AdaptiveCurriculumPlan = {
  modules: CurriculumModuleProfile[];
  nextModules: CurriculumModuleProfile[];
  counts: Record<CurriculumModuleState, number>;
  diagnosticAvailable: boolean;
  objectiveExercisesObserved: number;
};

export const moduleSkillMap: Record<string, PlacementSkillId[]> = {
  "search-growth": ["analysis", "problem-modeling"],
  "representation-recursion": ["data-structures", "recursion"],
  "lookup-graphs-optimization": ["data-structures", "graphs", "greedy", "dynamic-programming"],
  "experimental-analysis": ["analysis"],
  correctness: ["correctness", "analysis"],
  amortization: ["analysis", "data-structures"],
  "sequence-representations": ["data-structures"],
  "stack-queue-deque": ["data-structures"],
  "maps-sets": ["data-structures"],
  "trees-traversal": ["data-structures", "recursion"],
  "priority-queues": ["data-structures"],
  "search-trees": ["data-structures", "analysis"],
  "sorting-as-tool": ["analysis", "problem-modeling"],
  "search-selection": ["analysis", "problem-modeling"],
  "text-indexes": ["data-structures", "problem-modeling"],
  "recursive-design": ["recursion", "problem-modeling"],
  "divide-conquer": ["recursion", "analysis"],
  "backtracking-pruning": ["recursion", "correctness", "problem-modeling"],
  "graph-representation": ["graphs", "data-structures", "problem-modeling"],
  "graph-traversal": ["graphs"],
  "weighted-graphs": ["graphs", "data-structures", "greedy"],
  "greedy-invariant": ["greedy", "correctness"],
  "dynamic-programming": ["dynamic-programming", "recursion", "problem-modeling"],
  hardness: ["analysis", "correctness", "greedy", "dynamic-programming"],
  "understand-model": ["problem-modeling"],
  "baseline-refine": ["problem-modeling", "analysis"],
  "pattern-repertoire": ["problem-modeling"],
  "libraries-implementation": ["data-structures"],
  "memory-external": ["data-structures", "analysis"],
  "parallel-design": ["problem-modeling", "correctness", "analysis"],
};

const moduleEvidenceTerms: Record<string, string[]> = {
  "search-growth": ["binary search", "complexity", "asymptotic", "big-oh", "search"],
  "representation-recursion": ["array", "linked", "recursion", "quicksort", "selection sort", "divide"],
  "lookup-graphs-optimization": ["hash", "graph", "bfs", "dijkstra", "greedy", "dynamic programming", "knapsack", "nearest"],
  "experimental-analysis": ["running-time", "running time", "growth", "asymptotic", "complexity"],
  correctness: ["proof", "invariant", "counterexample", "induction", "contradiction", "correctness"],
  amortization: ["amortized", "dynamic-array", "dynamic array", "resizing"],
  "sequence-representations": ["array", "linked list", "sequence", "positional list"],
  "stack-queue-deque": ["stack", "queue", "deque", "circular queue"],
  "maps-sets": ["hash", "map", "set", "skip list", "dictionary"],
  "trees-traversal": ["tree", "traversal", "preorder", "inorder", "postorder", "expression tree"],
  "priority-queues": ["priority queue", "heap", "heapify", "median"],
  "search-trees": ["binary search tree", "search tree", "avl", "red-black", "tree search"],
  "sorting-as-tool": ["sort", "sorting", "ordering", "duplicate"],
  "search-selection": ["binary search", "selection", "kth", "order statistic", "search"],
  "text-indexes": ["string", "text", "trie", "pattern", "index"],
  "recursive-design": ["recursion", "recursive", "call stack"],
  "divide-conquer": ["divide", "merge sort", "quicksort", "binary search"],
  "backtracking-pruning": ["backtracking", "permutation", "subset", "n-queens", "branch"],
  "graph-representation": ["graph", "adjacency", "vertex", "edge"],
  "graph-traversal": ["bfs", "dfs", "breadth", "depth-first", "graph traversal"],
  "weighted-graphs": ["dijkstra", "weighted", "shortest path", "minimum spanning", "mst"],
  "greedy-invariant": ["greedy", "interval", "set cover", "exchange"],
  "dynamic-programming": ["dynamic programming", "knapsack", "subsequence", "memoization", "dp"],
  hardness: ["np", "hardness", "exponential", "approximation", "reduction"],
  "understand-model": ["model", "modeling", "problem framing"],
  "baseline-refine": ["baseline", "brute force", "bottleneck", "waste"],
  "pattern-repertoire": ["pattern", "two pointers", "sliding window", "prefix", "transformation"],
  "libraries-implementation": ["implementation", "library", "container", "iterator"],
  "memory-external": ["memory", "external", "cache", "locality", "disk"],
  "parallel-design": ["parallel", "concurrent", "mapreduce", "partition"],
};

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9+]+/g, " ").replace(/\s+/g, " ").trim();
}

function exerciseHaystack(exercise: CanonicalExercise) {
  return normalize([exercise.title, exercise.domain, exercise.lens, ...exercise.tags].join(" "));
}

function exerciseRelevantToModule(exercise: CanonicalExercise, moduleId: string) {
  const haystack = exerciseHaystack(exercise);
  return (moduleEvidenceTerms[moduleId] ?? []).some((term) => haystack.includes(normalize(term)));
}

function diagnosticScoreForModule(result: DiagnosticResult | undefined, moduleId: string) {
  if (!result) return undefined;
  const skills = moduleSkillMap[moduleId] ?? [];
  const scores = skills
    .map((skill) => result.skills.find((entry) => entry.id === skill)?.score)
    .filter((score): score is number => typeof score === "number");
  if (!scores.length) return undefined;
  return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
}

function buildEvidenceByModule(history: ReasoningAttemptHistory) {
  const exerciseById = new Map(canonicalExercises.map((exercise) => [exercise.id, exercise]));
  const grouped = new Map<string, ReasoningAttemptEntry[]>();
  for (const entry of history.entries) {
    const group = grouped.get(entry.exerciseId) ?? [];
    group.push(entry);
    grouped.set(entry.exerciseId, group);
  }

  return Object.fromEntries(syllabusGraphNodes.map((node) => {
    const relevant = [...grouped.entries()].filter(([exerciseId]) => {
      const exercise = exerciseById.get(exerciseId);
      return exercise ? exerciseRelevantToModule(exercise, node.id) : false;
    });
    let attempts = 0;
    let completedExercises = 0;
    let independentExercises = 0;
    let latestEvidenceAt: string | undefined;

    for (const [, entries] of relevant) {
      attempts += entries.length;
      const stages = entries.map(classifyReasoningAttempt);
      if (stages.some((stage) => stage === "solved" || stage === "independent")) completedExercises += 1;
      if (stages.includes("independent")) independentExercises += 1;
      for (const entry of entries) {
        if (!latestEvidenceAt || entry.finalizedAt > latestEvidenceAt) latestEvidenceAt = entry.finalizedAt;
      }
    }

    const guidedExercises = Math.max(0, relevant.length - completedExercises);
    const solvedOnlyExercises = Math.max(0, completedExercises - independentExercises);
    const objectiveScore = Math.min(100, guidedExercises * 8 + solvedOnlyExercises * 18 + independentExercises * 40);
    const evidence: CurriculumModuleEvidence = {
      attempts,
      relevantExercises: relevant.length,
      completedExercises,
      independentExercises,
      objectiveScore,
      latestEvidenceAt,
    };
    return [node.id, evidence];
  })) as Record<string, CurriculumModuleEvidence>;
}

function routeFor(node: SyllabusGraphNode) {
  return node.module.route ?? `/syllabus/${node.id}`;
}

function prerequisiteBasis(
  prerequisiteId: string,
  evidenceByModule: Record<string, CurriculumModuleEvidence>,
  diagnostic?: DiagnosticResult,
): CurriculumPrerequisiteStatus["basis"] {
  const evidence = evidenceByModule[prerequisiteId];
  if (evidence.independentExercises >= 2 && evidence.objectiveScore >= 75) return "objective";
  if (evidence.independentExercises >= 1 && evidence.objectiveScore >= 50) return "objective";
  const score = diagnosticScoreForModule(diagnostic, prerequisiteId);
  if (typeof score === "number" && score >= 75) return "diagnostic";
  return "missing";
}

function explanationFor(
  state: CurriculumModuleState,
  profile: Pick<CurriculumModuleProfile, "diagnosticScore" | "evidence" | "blockedBy">,
) {
  if (state === "mastered") {
    return `Objective evidence includes ${profile.evidence.independentExercises} independent relevant problems; this is verified evidence, not diagnostic placement.`;
  }
  if (state === "developing") {
    return `${profile.evidence.completedExercises} relevant problems have objective completion evidence, but the module has not yet reached the independent-evidence threshold.`;
  }
  if (state === "blocked") {
    return `Prerequisite evidence is still missing for ${profile.blockedBy.length} module${profile.blockedBy.length === 1 ? "" : "s"}; strengthen those first.`;
  }
  if (typeof profile.diagnosticScore === "number" && profile.diagnosticScore >= 75) {
    return `Diagnostic placement is strong (${profile.diagnosticScore}%), so this module is ready to attempt; placement does not count as mastery.`;
  }
  return "Prerequisites are currently satisfied, so this is available as a next learning target.";
}

export function buildAdaptiveCurriculumPlan(input: {
  diagnostic?: DiagnosticResult;
  reasoningAttempts: ReasoningAttemptHistory;
}): AdaptiveCurriculumPlan {
  const evidenceByModule = buildEvidenceByModule(input.reasoningAttempts);
  const modules = syllabusGraphNodes.map((node): CurriculumModuleProfile => {
    const evidence = evidenceByModule[node.id];
    const diagnosticScore = diagnosticScoreForModule(input.diagnostic, node.id);
    const prerequisites = getModulePrerequisites(node.id).map((prerequisite): CurriculumPrerequisiteStatus => {
      const basis = prerequisiteBasis(prerequisite.id, evidenceByModule, input.diagnostic);
      return { moduleId: prerequisite.id, title: prerequisite.module.title, satisfied: basis !== "missing", basis };
    });
    const blockedBy = prerequisites.filter((item) => !item.satisfied).map((item) => item.moduleId);
    const objectiveMastered = evidence.independentExercises >= 2 && evidence.objectiveScore >= 75;
    let state: CurriculumModuleState;
    if (objectiveMastered) state = "mastered";
    else if (evidence.objectiveScore > 0) state = "developing";
    else if (blockedBy.length) state = "blocked";
    else state = "ready";

    const downstreamCount = getModuleDependents(node.id).length;
    const priority = state === "developing"
      ? 120 - evidence.objectiveScore + downstreamCount * 6
      : state === "ready"
        ? 80 + Math.round((diagnosticScore ?? 40) * 0.2) + downstreamCount * 7
        : state === "blocked"
          ? Math.max(0, 30 - blockedBy.length * 5)
          : 0;

    const profile: CurriculumModuleProfile = {
      id: node.id,
      title: node.module.title,
      trackId: node.track.id,
      trackTitle: node.track.title,
      route: routeFor(node),
      state,
      skills: moduleSkillMap[node.id] ?? [],
      diagnosticScore,
      evidence,
      prerequisites,
      blockedBy,
      downstreamCount,
      priority,
      explanation: "",
    };
    profile.explanation = explanationFor(state, profile);
    return profile;
  });

  const counts: Record<CurriculumModuleState, number> = { mastered: 0, developing: 0, ready: 0, blocked: 0 };
  for (const moduleProfile of modules) counts[moduleProfile.state] += 1;
  const nextModules = modules
    .filter((moduleProfile) => moduleProfile.state === "developing" || moduleProfile.state === "ready")
    .sort((a, b) => b.priority - a.priority || a.title.localeCompare(b.title))
    .slice(0, 6);

  return {
    modules,
    nextModules,
    counts,
    diagnosticAvailable: Boolean(input.diagnostic),
    objectiveExercisesObserved: new Set(input.reasoningAttempts.entries.map((entry) => entry.exerciseId)).size,
  };
}
