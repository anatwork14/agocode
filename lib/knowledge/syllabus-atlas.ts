import { canonicalExercises, type CanonicalExercise, type ExerciseSource } from "./all-exercises.ts";
import type { SyllabusModule, SyllabusSource } from "./syllabus.ts";

export type SyllabusAtlasMatch = {
  exercise: CanonicalExercise;
  score: number;
  matchedTerms: string[];
};

const sourceMap: Partial<Record<SyllabusSource, ExerciseSource>> = {
  Goodrich: "goodrich",
  EPI: "epi",
  Skiena: "skiena",
};

const stopWords = new Set([
  "a", "an", "and", "are", "as", "at", "be", "before", "by", "can", "do", "does", "for", "from",
  "how", "if", "in", "into", "is", "it", "of", "on", "or", "our", "that", "the", "their", "this", "to",
  "use", "using", "we", "what", "when", "which", "why", "with", "without", "work", "works",
]);

const moduleVocabulary: Record<string, string[]> = {
  "search-growth": ["binary search", "running time", "big o", "asymptotic", "traveling salesman", "tsp", "growth rates"],
  "representation-recursion": ["array", "linked list", "selection sort", "recursion", "divide and conquer", "quicksort", "call stack"],
  "lookup-graphs-optimization": ["hash table", "breadth first search", "dijkstra", "greedy", "dynamic programming", "nearest neighbor", "knapsack"],
  "experimental-analysis": ["experimental analysis", "running time", "growth rates", "asymptotic", "big o", "complexity"],
  correctness: ["correctness", "loop invariant", "invariant", "counterexample", "induction", "contradiction", "proof"],
  amortization: ["amortized", "dynamic array", "resizing", "capacity", "append"],
  "sequence-representations": ["array", "dynamic array", "linked list", "positional list", "sequence", "representation"],
  "stack-queue-deque": ["stack", "queue", "deque", "circular queue", "circular buffer", "fifo", "lifo"],
  "maps-sets": ["map", "dictionary", "hash table", "set", "skip list", "sorted map", "collision", "load factor"],
  "trees-traversal": ["tree", "binary tree", "preorder", "inorder", "postorder", "breadth first", "traversal", "expression tree"],
  "priority-queues": ["priority queue", "heap", "heapify", "heap sort", "online median", "minimum", "maximum"],
  "search-trees": ["binary search tree", "bst", "avl", "splay", "red black", "range query", "balanced tree"],
  "sorting-as-tool": ["sorting", "merge sort", "quicksort", "heap sort", "bucket", "radix", "stable sort"],
  "search-selection": ["binary search", "first occurrence", "rotated array", "selection", "median", "quickselect", "answer space"],
  "text-indexes": ["string matching", "pattern matching", "kmp", "boyer moore", "trie", "suffix", "text index"],
  "recursive-design": ["recursion", "recursive", "call stack", "tail recursion", "factorial"],
  "divide-conquer": ["divide and conquer", "binary search", "quicksort", "merge sort", "fast exponentiation", "recursive"],
  "backtracking-pruning": ["backtracking", "subsets", "permutations", "n queens", "sudoku", "pruning", "branch"],
  "graph-representation": ["graph data structure", "graph representation", "adjacency", "directed graph", "weighted graph", "modeling graph"],
  "graph-traversal": ["breadth first search", "depth first search", "bfs", "dfs", "connected components", "cycle detection", "topological sort", "bipartite"],
  "weighted-graphs": ["shortest path", "dijkstra", "minimum spanning tree", "prim", "kruskal", "union find", "network flow"],
  "greedy-invariant": ["greedy", "interval scheduling", "set cover", "scheduling", "approximation", "counterexample"],
  "dynamic-programming": ["dynamic programming", "knapsack", "edit distance", "longest common subsequence", "longest increasing", "sequence alignment"],
  hardness: ["np complete", "np completeness", "hard problem", "reduction", "approximation", "heuristic", "traveling salesman", "vertex cover", "clique", "satisfiability"],
  "understand-model": ["modeling", "problem design", "input output", "constraints", "design problem", "tiny example"],
  "baseline-refine": ["brute force", "baseline", "sorting", "hashing", "preprocessing", "special case", "optimization"],
  "pattern-repertoire": ["catalog", "searching", "sorting", "shortest path", "string matching", "knapsack", "canonical problem"],
  "libraries-implementation": ["python", "iterator", "generator", "priority queue", "heap", "library", "collections"],
  "memory-external": ["external memory", "b tree", "cache", "lru", "fifo", "external sort", "memory management"],
  "parallel-design": ["parallel", "concurrency", "thread", "readers writers", "deadlock", "distributed", "dependency"],
};

const phraseAliases: Record<string, string[]> = {
  "big o": ["big oh", "asymptotic", "complexity", "growth rate"],
  "breadth first search": ["bfs", "breadth-first"],
  "depth first search": ["dfs", "depth-first"],
  dijkstra: ["shortest path"],
  "nearest neighbor": ["knn", "k nearest neighbors"],
  "binary search tree": ["bst", "search tree"],
  "priority queue": ["heap"],
  map: ["dictionary", "hash table"],
  "dynamic array": ["resizing", "amortized", "capacity"],
  "np complete": ["np-complete", "np completeness", "hard problems"],
  "traveling salesman": ["traveling salesperson", "tsp"],
  "external sort": ["external memory", "external sorting"],
  parallel: ["concurrency", "thread"],
};

function normalize(value: string) {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function tokens(value: string) {
  return normalize(value)
    .split(/\s+/)
    .filter((token) => token.length > 1 && !stopWords.has(token));
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function expandedPhrases(module: SyllabusModule) {
  const direct = [
    ...module.topics,
    ...(moduleVocabulary[module.id] ?? []),
  ].map(normalize);

  const aliases = direct.flatMap((phrase) => phraseAliases[phrase] ?? []);
  return unique([...direct, ...aliases.map(normalize)]).filter((phrase) => phrase.length >= 3);
}

function moduleTokenSet(module: SyllabusModule, phrases: string[]) {
  const text = [
    module.title,
    module.question,
    ...module.outcomes,
    ...module.topics,
    ...(moduleVocabulary[module.id] ?? []),
    ...phrases,
  ].join(" ");
  return new Set(tokens(text));
}

function exerciseText(exercise: CanonicalExercise) {
  return normalize([
    exercise.title,
    exercise.sourceChapter,
    exercise.domain,
    exercise.tags.join(" "),
    exercise.lens,
  ].join(" "));
}

function supportedSources(module: SyllabusModule) {
  return new Set(module.sources.map((source) => sourceMap[source]).filter((source): source is ExerciseSource => Boolean(source)));
}

function scoreExercise(module: SyllabusModule, exercise: CanonicalExercise, phrases: string[], moduleTokens: Set<string>) {
  const haystack = exerciseText(exercise);
  const exerciseTokens = new Set(tokens(haystack));
  const matchedTerms: string[] = [];
  let score = 0;

  for (const phrase of phrases) {
    if (haystack.includes(phrase)) {
      score += phrase.includes(" ") ? 18 : 9;
      matchedTerms.push(phrase);
    }
  }

  let overlap = 0;
  for (const token of moduleTokens) {
    if (!exerciseTokens.has(token)) continue;
    overlap += 1;
    score += 2.25;
  }
  if (overlap >= 3) score += 5;
  if (overlap >= 5) score += 5;

  const title = normalize(exercise.title);
  for (const topic of module.topics.map(normalize)) {
    if (topic && (title.includes(topic) || topic.includes(title))) {
      score += 10;
      matchedTerms.push(topic);
    }
  }

  const sources = supportedSources(module);
  if (sources.has(exercise.source)) score += 4;
  if (exercise.route) score += 0.5;

  return { score, matchedTerms: unique(matchedTerms).slice(0, 5) };
}

export function getAtlasProblemsForModule(module: SyllabusModule, limit = 4): SyllabusAtlasMatch[] {
  const safeLimit = Math.max(1, Math.min(8, Math.floor(limit)));
  const phrases = expandedPhrases(module);
  const moduleTokens = moduleTokenSet(module, phrases);
  const sources = supportedSources(module);

  const ranked = canonicalExercises
    .map((exercise) => ({ exercise, ...scoreExercise(module, exercise, phrases, moduleTokens) }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const aSource = sources.has(a.exercise.source) ? 1 : 0;
      const bSource = sources.has(b.exercise.source) ? 1 : 0;
      if (bSource !== aSource) return bSource - aSource;
      if (Boolean(b.exercise.route) !== Boolean(a.exercise.route)) return Number(Boolean(b.exercise.route)) - Number(Boolean(a.exercise.route));
      return a.exercise.title.localeCompare(b.exercise.title);
    });

  const strong = ranked.filter((match) => match.score >= 8);
  const pool = strong.length >= safeLimit ? strong : ranked;
  const selected: SyllabusAtlasMatch[] = [];
  const seenTitles = new Set<string>();

  for (const match of pool) {
    const titleKey = normalize(match.exercise.title);
    if (seenTitles.has(titleKey)) continue;
    selected.push(match);
    seenTitles.add(titleKey);
    if (selected.length >= safeLimit) break;
  }

  return selected;
}
