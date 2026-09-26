import type { StorageLike } from "./evidence.ts";

export const DIAGNOSTIC_STATE_KEY = "agocode.progress.diagnostic-placement";
export const DIAGNOSTIC_ATTEMPT_LIMIT = 5;

export type PlacementSkillId =
  | "analysis"
  | "data-structures"
  | "recursion"
  | "graphs"
  | "correctness"
  | "greedy"
  | "dynamic-programming"
  | "problem-modeling";

export type PlacementBand = "needs-foundation" | "developing" | "placement-ready";

export type DiagnosticOption = { id: string; label: string };

export type DiagnosticQuestion = {
  id: string;
  skill: PlacementSkillId;
  prompt: string;
  options: DiagnosticOption[];
  correctOptionId: string;
  explanation: string;
};

export type DiagnosticSkillResult = {
  id: PlacementSkillId;
  label: string;
  correct: number;
  total: number;
  score: number;
  band: PlacementBand;
};

export type DiagnosticResult = {
  overall: number;
  correct: number;
  total: number;
  skills: DiagnosticSkillResult[];
};

export type DiagnosticAttempt = {
  attemptId: string;
  startedAt: string;
  updatedAt: string;
  completedAt?: string;
  answers: Record<string, string>;
  result?: DiagnosticResult;
};

export type DiagnosticState = {
  version: 1;
  active?: DiagnosticAttempt;
  attempts: DiagnosticAttempt[];
};

export const placementSkillLabels: Record<PlacementSkillId, string> = {
  analysis: "Analysis & growth",
  "data-structures": "Data structures",
  recursion: "Recursion",
  graphs: "Graphs",
  correctness: "Correctness",
  greedy: "Greedy reasoning",
  "dynamic-programming": "Dynamic programming",
  "problem-modeling": "Problem modeling",
};

export const diagnosticQuestions: DiagnosticQuestion[] = [
  {
    id: "analysis-search-million",
    skill: "analysis",
    prompt: "A sorted array contains about one million values. Binary search needs roughly how many comparisons in the worst case?",
    options: [
      { id: "a", label: "About 20" },
      { id: "b", label: "About 1,000" },
      { id: "c", label: "About 500,000" },
      { id: "d", label: "About 1,000,000" },
    ],
    correctOptionId: "a",
    explanation: "2^20 is slightly above one million, so repeated halving needs about 20 decisions.",
  },
  {
    id: "analysis-n-log-n",
    skill: "analysis",
    prompt: "An outer loop runs n times. Inside it, a variable doubles from 1 until it reaches n. What is the combined asymptotic running time?",
    options: [
      { id: "a", label: "O(log n)" },
      { id: "b", label: "O(n)" },
      { id: "c", label: "O(n log n)" },
      { id: "d", label: "O(n²)" },
    ],
    correctOptionId: "c",
    explanation: "The inner doubling loop takes O(log n) work for each of n outer iterations.",
  },
  {
    id: "structures-membership",
    skill: "data-structures",
    prompt: "You need frequent exact membership checks and insertions, but do not need sorted order. Which default representation best matches the workload?",
    options: [
      { id: "a", label: "Hash set" },
      { id: "b", label: "Sorted array only" },
      { id: "c", label: "Stack" },
      { id: "d", label: "Adjacency matrix" },
    ],
    correctOptionId: "a",
    explanation: "A hash set directly models exact membership with expected constant-time lookup and insertion.",
  },
  {
    id: "structures-repeated-min",
    skill: "data-structures",
    prompt: "A scheduler repeatedly inserts jobs and removes the job with the smallest priority value. Which abstraction is the best fit?",
    options: [
      { id: "a", label: "FIFO queue" },
      { id: "b", label: "Min-priority queue / heap" },
      { id: "c", label: "Hash map" },
      { id: "d", label: "Linked-list stack" },
    ],
    correctOptionId: "b",
    explanation: "The dominant operation is repeated access to the current minimum while updates continue.",
  },
  {
    id: "recursion-progress",
    skill: "recursion",
    prompt: "What two properties are essential for a recursive algorithm to terminate correctly?",
    options: [
      { id: "a", label: "A base case and progress toward it" },
      { id: "b", label: "A global variable and a loop" },
      { id: "c", label: "Two recursive calls every time" },
      { id: "d", label: "A sorted input and a queue" },
    ],
    correctOptionId: "a",
    explanation: "A stopping condition is insufficient unless recursive calls move toward that condition.",
  },
  {
    id: "recursion-tree-stack",
    skill: "recursion",
    prompt: "A depth-first recursive traversal enters a child before finishing its parent. Which runtime structure naturally remembers the unfinished parents?",
    options: [
      { id: "a", label: "Call stack" },
      { id: "b", label: "Hash bucket" },
      { id: "c", label: "Priority queue" },
      { id: "d", label: "Prefix-sum array" },
    ],
    correctOptionId: "a",
    explanation: "Each active recursive call remains on the call stack until its descendants return.",
  },
  {
    id: "graphs-unweighted-shortest",
    skill: "graphs",
    prompt: "Edges are unweighted and you need the minimum number of edges from one node to every reachable node. Which traversal directly provides this?",
    options: [
      { id: "a", label: "DFS" },
      { id: "b", label: "BFS" },
      { id: "c", label: "Quicksort" },
      { id: "d", label: "Binary search" },
    ],
    correctOptionId: "b",
    explanation: "BFS explores the graph in nondecreasing edge-distance layers.",
  },
  {
    id: "graphs-weighted-shortest",
    skill: "graphs",
    prompt: "All edge weights are nonnegative and you need single-source shortest paths. Which algorithmic model is appropriate?",
    options: [
      { id: "a", label: "BFS ignoring weights" },
      { id: "b", label: "Dijkstra with a priority queue" },
      { id: "c", label: "Selection sort" },
      { id: "d", label: "Greedy interval scheduling" },
    ],
    correctOptionId: "b",
    explanation: "Dijkstra repeatedly finalizes the cheapest unsettled distance when weights are nonnegative.",
  },
  {
    id: "correctness-invariant",
    skill: "correctness",
    prompt: "What is the role of a loop invariant in a correctness argument?",
    options: [
      { id: "a", label: "It is a property maintained before and after each iteration" },
      { id: "b", label: "It estimates wall-clock speed" },
      { id: "c", label: "It picks random test inputs" },
      { id: "d", label: "It guarantees the code uses O(1) memory" },
    ],
    correctOptionId: "a",
    explanation: "Initialization, maintenance, and termination connect a maintained property to the final claim.",
  },
  {
    id: "correctness-counterexample",
    skill: "correctness",
    prompt: "Someone claims a greedy rule is optimal for every valid input. What is sufficient to disprove that universal claim?",
    options: [
      { id: "a", label: "One valid counterexample where the rule is suboptimal" },
      { id: "b", label: "A faster computer" },
      { id: "c", label: "One input where the rule works" },
      { id: "d", label: "A larger Big-O constant" },
    ],
    correctOptionId: "a",
    explanation: "A universal claim fails as soon as one valid input violates it.",
  },
  {
    id: "greedy-intervals",
    skill: "greedy",
    prompt: "For selecting the maximum number of non-overlapping intervals on one resource, which classic local rule is safe?",
    options: [
      { id: "a", label: "Choose the interval that finishes earliest" },
      { id: "b", label: "Choose the longest interval first" },
      { id: "c", label: "Choose the interval with the latest start" },
      { id: "d", label: "Choose an arbitrary interval" },
    ],
    correctOptionId: "a",
    explanation: "Earliest finish leaves the largest remaining suffix and supports an exchange argument.",
  },
  {
    id: "greedy-knapsack-boundary",
    skill: "greedy",
    prompt: "Why does sorting by value/weight ratio fail as a general solution to 0/1 knapsack?",
    options: [
      { id: "a", label: "Items cannot be split, so a locally dense choice can block a better combination" },
      { id: "b", label: "Ratios cannot be computed" },
      { id: "c", label: "Knapsack inputs are always unsorted" },
      { id: "d", label: "The capacity is never known" },
    ],
    correctOptionId: "a",
    explanation: "The indivisibility constraint destroys the exchange property that makes the fractional version greedy-safe.",
  },
  {
    id: "dp-state-sufficiency",
    skill: "dynamic-programming",
    prompt: "A dynamic-programming state is sufficient when it stores which information?",
    options: [
      { id: "a", label: "Exactly the information needed to determine future subproblem choices" },
      { id: "b", label: "Every input value seen so far, regardless of relevance" },
      { id: "c", label: "Only the final answer" },
      { id: "d", label: "The source-code line number" },
    ],
    correctOptionId: "a",
    explanation: "Two histories may share a state only when their remaining optimal decisions are equivalent.",
  },
  {
    id: "dp-overlap",
    skill: "dynamic-programming",
    prompt: "Which combination most strongly suggests memoization or dynamic programming may remove repeated work?",
    options: [
      { id: "a", label: "Overlapping subproblems plus reusable optimal substructure" },
      { id: "b", label: "A single comparison on a sorted array" },
      { id: "c", label: "Only one possible solution" },
      { id: "d", label: "An input that fits in one CPU register" },
    ],
    correctOptionId: "a",
    explanation: "Caching helps when the same subproblems recur, and DP is useful when their results compose into larger decisions.",
  },
  {
    id: "modeling-monotone-answer",
    skill: "problem-modeling",
    prompt: "You need the minimum capacity C such that a feasibility test changes monotonically from false to true as C grows. What transformation should you consider first?",
    options: [
      { id: "a", label: "Binary search on the answer space" },
      { id: "b", label: "DFS over every permutation" },
      { id: "c", label: "A FIFO queue regardless of structure" },
      { id: "d", label: "K-nearest neighbors" },
    ],
    correctOptionId: "a",
    explanation: "A monotone feasibility predicate turns optimization into repeated decision checks over an ordered answer space.",
  },
  {
    id: "modeling-prefix-transform",
    skill: "problem-modeling",
    prompt: "A static array receives many range-sum queries and no updates. Which preprocessing transformation removes repeated summation?",
    options: [
      { id: "a", label: "Prefix sums" },
      { id: "b", label: "Recursive permutation generation" },
      { id: "c", label: "Heapify the array" },
      { id: "d", label: "Run Dijkstra" },
    ],
    correctOptionId: "a",
    explanation: "Prefix sums pay preprocessing once so each range sum becomes a difference of two stored aggregates.",
  },
];

const skillIds = Object.keys(placementSkillLabels) as PlacementSkillId[];

function emptyState(): DiagnosticState {
  return { version: 1, attempts: [] };
}

function bandFor(score: number): PlacementBand {
  if (score >= 75) return "placement-ready";
  if (score >= 50) return "developing";
  return "needs-foundation";
}

function validAnswers(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const knownQuestions = new Map(diagnosticQuestions.map((question) => [question.id, new Set(question.options.map((option) => option.id))]));
  const answers: Record<string, string> = {};
  for (const [questionId, optionId] of Object.entries(value as Record<string, unknown>)) {
    if (typeof optionId === "string" && knownQuestions.get(questionId)?.has(optionId)) answers[questionId] = optionId;
  }
  return answers;
}

export function scoreDiagnosticAnswers(answers: Record<string, string>): DiagnosticResult {
  const skills = skillIds.map((skill): DiagnosticSkillResult => {
    const questions = diagnosticQuestions.filter((question) => question.skill === skill);
    const correct = questions.filter((question) => answers[question.id] === question.correctOptionId).length;
    const score = Math.round((correct / Math.max(1, questions.length)) * 100);
    return { id: skill, label: placementSkillLabels[skill], correct, total: questions.length, score, band: bandFor(score) };
  });
  const correct = diagnosticQuestions.filter((question) => answers[question.id] === question.correctOptionId).length;
  return {
    correct,
    total: diagnosticQuestions.length,
    overall: Math.round((correct / Math.max(1, diagnosticQuestions.length)) * 100),
    skills,
  };
}

function parseAttempt(value: unknown): DiagnosticAttempt | null {
  if (!value || typeof value !== "object") return null;
  const attempt = value as Partial<DiagnosticAttempt>;
  if (typeof attempt.attemptId !== "string" || typeof attempt.startedAt !== "string" || typeof attempt.updatedAt !== "string") return null;
  const answers = validAnswers(attempt.answers);
  const completedAt = typeof attempt.completedAt === "string" ? attempt.completedAt : undefined;
  return {
    attemptId: attempt.attemptId,
    startedAt: attempt.startedAt,
    updatedAt: attempt.updatedAt,
    completedAt,
    answers,
    result: completedAt ? scoreDiagnosticAnswers(answers) : undefined,
  };
}

export function readDiagnosticState(storage: StorageLike): DiagnosticState {
  try {
    const raw = storage.getItem(DIAGNOSTIC_STATE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as Partial<DiagnosticState>;
    if (parsed.version !== 1) return emptyState();
    const active = parseAttempt(parsed.active);
    const attempts = Array.isArray(parsed.attempts)
      ? parsed.attempts.map(parseAttempt).filter((attempt): attempt is DiagnosticAttempt => Boolean(attempt?.completedAt)).slice(-DIAGNOSTIC_ATTEMPT_LIMIT)
      : [];
    return { version: 1, active: active?.completedAt ? undefined : active ?? undefined, attempts };
  } catch {
    return emptyState();
  }
}

function writeDiagnosticState(storage: StorageLike, state: DiagnosticState) {
  storage.setItem(DIAGNOSTIC_STATE_KEY, JSON.stringify(state));
}

function attemptId(now: Date) {
  return `diagnostic-${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function startDiagnostic(storage: StorageLike, now = new Date(), restart = false): DiagnosticAttempt {
  const state = readDiagnosticState(storage);
  if (state.active && !restart) return state.active;
  const timestamp = now.toISOString();
  const active: DiagnosticAttempt = { attemptId: attemptId(now), startedAt: timestamp, updatedAt: timestamp, answers: {} };
  writeDiagnosticState(storage, { ...state, active });
  return active;
}

export function recordDiagnosticAnswer(
  storage: StorageLike,
  questionId: string,
  optionId: string,
  now = new Date(),
): DiagnosticAttempt | null {
  const state = readDiagnosticState(storage);
  const active = state.active;
  const question = diagnosticQuestions.find((item) => item.id === questionId);
  if (!active || !question || !question.options.some((option) => option.id === optionId)) return active ?? null;
  const next: DiagnosticAttempt = {
    ...active,
    updatedAt: now.toISOString(),
    answers: { ...active.answers, [questionId]: optionId },
  };
  writeDiagnosticState(storage, { ...state, active: next });
  return next;
}

export function completeDiagnostic(storage: StorageLike, now = new Date()): DiagnosticAttempt | null {
  const state = readDiagnosticState(storage);
  const active = state.active;
  if (!active || diagnosticQuestions.some((question) => !active.answers[question.id])) return null;
  const timestamp = now.toISOString();
  const completed: DiagnosticAttempt = {
    ...active,
    updatedAt: timestamp,
    completedAt: timestamp,
    result: scoreDiagnosticAnswers(active.answers),
  };
  writeDiagnosticState(storage, {
    version: 1,
    attempts: [...state.attempts, completed].slice(-DIAGNOSTIC_ATTEMPT_LIMIT),
  });
  return completed;
}

export function getLatestDiagnosticResult(state: DiagnosticState) {
  return [...state.attempts].reverse().find((attempt) => attempt.completedAt)?.result;
}
