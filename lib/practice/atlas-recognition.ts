import { canonicalExercises, type CanonicalExercise, type ExerciseSource } from "../knowledge/all-exercises.ts";

export type AtlasPatternId =
  | "analysis-correctness"
  | "representations"
  | "linear-adts"
  | "hashing"
  | "search-selection"
  | "sorting-transform"
  | "tree-order"
  | "heap-priority"
  | "recursive-search"
  | "graph-traversal"
  | "weighted-graphs"
  | "dynamic-programming"
  | "greedy-approximation"
  | "text-indexing"
  | "hard-optimization"
  | "engineering-design";

export type AtlasPattern = {
  id: AtlasPatternId;
  label: string;
  clue: string;
  firstQuestion: string;
  terms: string[];
};

export type ClassifiedAtlasExercise = {
  exercise: CanonicalExercise;
  family: AtlasPattern;
  score: number;
  matchedTerms: string[];
};

export type AtlasRecognitionSession = {
  seed: string;
  items: ClassifiedAtlasExercise[];
  eligibleCount: number;
  sourceCount: number;
  familyCount: number;
};

export const atlasPatterns: AtlasPattern[] = [
  {
    id: "analysis-correctness",
    label: "Analysis & correctness",
    clue: "The main work is proving behavior, bounding cost, or constructing a counterexample rather than choosing a container.",
    firstQuestion: "What claim or cost model must be made precise before implementation?",
    terms: ["complexity", "asymptotic", "big o", "running time", "correctness", "proof", "induction", "counterexample", "invariant", "growth rate"],
  },
  {
    id: "representations",
    label: "Sequence representation",
    clue: "Performance depends on how a sequence is represented, resized, linked, indexed, or moved.",
    firstQuestion: "Which operations dominate, and which representation makes them cheap?",
    terms: ["array", "dynamic array", "linked list", "positional list", "sequence", "amortized", "resize", "memory representation"],
  },
  {
    id: "linear-adts",
    label: "Stack / queue / deque",
    clue: "The problem is driven by LIFO, FIFO, or two-ended access and the order in which pending work is exposed.",
    firstQuestion: "What removal order must the pending items obey?",
    terms: ["stack", "queue", "deque", "fifo", "lifo", "circular queue", "parentheses", "round robin"],
  },
  {
    id: "hashing",
    label: "Hashing & keyed lookup",
    clue: "Repeated membership, key lookup, counting, deduplication, or collision handling is central.",
    firstQuestion: "Can a key replace a repeated scan?",
    terms: ["hash", "hash table", "dictionary", "map", "set data", "set membership", "collision", "load factor", "deduplicate", "frequency"],
  },
  {
    id: "search-selection",
    label: "Search & selection",
    clue: "The task is to locate a key, boundary, rank, median, or selected element while discarding candidates quickly.",
    firstQuestion: "What structure lets one decision eliminate many candidates?",
    terms: ["binary search", "searching", "search", "median", "selection", "quickselect", "rank", "first occurrence", "rotated array"],
  },
  {
    id: "sorting-transform",
    label: "Sorting as transformation",
    clue: "Ordering the data exposes adjacency, rank, merge structure, duplicates, or a simpler scan.",
    firstQuestion: "What relationship becomes local after ordering the input?",
    terms: ["sorting", "sort", "merge sort", "quicksort", "heap sort", "bucket sort", "radix", "insertion sort", "selection sort"],
  },
  {
    id: "tree-order",
    label: "Trees & ordered search structures",
    clue: "Hierarchical structure or maintained key order drives traversal, range queries, balancing, or updates.",
    firstQuestion: "Which tree invariant makes the required query or update efficient?",
    terms: ["binary tree", "binary search tree", "search tree", "avl", "splay", "red black", "tree map", "tree traversal", "range query", "b tree"],
  },
  {
    id: "heap-priority",
    label: "Heap & priority queue",
    clue: "The algorithm repeatedly needs an extreme-priority item without fully sorting everything.",
    firstQuestion: "Do you need the next minimum/maximum repeatedly rather than the complete order?",
    terms: ["priority queue", "heap", "heapify", "remove min", "remove max", "online median", "top k", "smallest k"],
  },
  {
    id: "recursive-search",
    label: "Recursion & backtracking",
    clue: "The state decomposes into smaller self-similar calls or a decision tree that must be explored and pruned.",
    firstQuestion: "What is the smaller state, base case, and reversible choice?",
    terms: ["recursion", "recursive", "backtracking", "permutation", "subset", "n queens", "sudoku", "pruning", "branch and bound"],
  },
  {
    id: "graph-traversal",
    label: "Graph traversal & structure",
    clue: "Reachability, components, dependency order, cycles, coloring, or unweighted layers are central.",
    firstQuestion: "What are the vertices and edges, and what traversal state must never be rediscovered?",
    terms: ["breadth first", "depth first", "bfs", "dfs", "connected component", "topological", "cycle detection", "bipartite", "graph traversal", "graph data structure"],
  },
  {
    id: "weighted-graphs",
    label: "Weighted paths & connectivity",
    clue: "Edge weights, path cost, spanning connectivity, or flow capacity determine the objective.",
    firstQuestion: "Are you minimizing a path, connecting everything, or routing capacity?",
    terms: ["shortest path", "dijkstra", "minimum spanning", "prim", "kruskal", "network flow", "weighted graph", "all pairs shortest", "transitive closure"],
  },
  {
    id: "dynamic-programming",
    label: "Dynamic programming",
    clue: "An optimum or count reuses overlapping smaller states whose answers can be stored and combined.",
    firstQuestion: "What does one reusable subproblem state mean?",
    terms: ["dynamic programming", "knapsack", "edit distance", "longest common", "longest increasing", "sequence alignment", "matrix chain", "partition problem"],
  },
  {
    id: "greedy-approximation",
    label: "Greedy & approximation",
    clue: "A locally chosen move or bounded approximation is attractive because exact global search is unnecessary or expensive.",
    firstQuestion: "What exchange, bound, or invariant would justify committing to the next local choice?",
    terms: ["greedy", "set cover", "interval", "scheduling", "approximation", "matching", "covering", "packing"],
  },
  {
    id: "text-indexing",
    label: "Text matching & indexing",
    clue: "The structure is a string, pattern, prefix/suffix relation, trie, or text index rather than a generic array.",
    firstQuestion: "What information about the pattern or prefixes can avoid restarting comparisons?",
    terms: ["string matching", "pattern matching", "boyer moore", "knuth morris", "kmp", "trie", "suffix", "text processing", "compression", "huffman"],
  },
  {
    id: "hard-optimization",
    label: "Hard optimization",
    clue: "The general problem may require exponential exact search, a reduction, approximation, heuristic, or a tractable special case.",
    firstQuestion: "Do the constraints demand exact optimality, or should you search for structure, a bound, or approximation?",
    terms: ["traveling salesman", "traveling salesperson", "vertex cover", "independent set", "clique", "satisfiability", "hamiltonian", "np complete", "np-complete", "steiner", "graph coloring"],
  },
  {
    id: "engineering-design",
    label: "Algorithm engineering & design",
    clue: "The main challenge is decomposing a system, choosing interfaces, or respecting memory, concurrency, language, database, or network constraints.",
    firstQuestion: "Which resource, interface, or system constraint should drive the decomposition?",
    terms: ["design", "system", "external memory", "cache", "database", "networking", "python", "language", "object oriented", "parallel", "concurrency", "distributed", "tools"],
  },
];

function normalize(value: string) {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function exerciseText(exercise: CanonicalExercise) {
  return normalize([
    exercise.title,
    exercise.domain,
    exercise.sourceChapter,
    exercise.tags.join(" "),
  ].join(" "));
}

function titleText(exercise: CanonicalExercise) {
  return normalize(exercise.title);
}

function termScore(text: string, title: string, term: string) {
  const normalized = normalize(term);
  if (!normalized || !text.includes(normalized)) return 0;
  const phraseWeight = normalized.includes(" ") ? 4 : 2;
  return phraseWeight + (title.includes(normalized) ? 3 : 0);
}

export function classifyAtlasExercise(exercise: CanonicalExercise): ClassifiedAtlasExercise | null {
  const text = exerciseText(exercise);
  const title = titleText(exercise);
  const ranked = atlasPatterns
    .map((family) => {
      const matchedTerms = family.terms.filter((term) => text.includes(normalize(term)));
      const score = matchedTerms.reduce((sum, term) => sum + termScore(text, title, term), 0);
      return { family, score, matchedTerms };
    })
    .sort((a, b) => b.score - a.score || a.family.label.localeCompare(b.family.label));

  const best = ranked[0];
  const second = ranked[1];
  if (!best || best.score < 4) return null;
  if (second && best.score === second.score && best.score < 8) return null;

  return {
    exercise,
    family: best.family,
    score: best.score,
    matchedTerms: best.matchedTerms.slice(0, 4),
  };
}

export const classifiedAtlasExercises = canonicalExercises
  .map(classifyAtlasExercise)
  .filter((item): item is ClassifiedAtlasExercise => Boolean(item));

function hashSeed(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededRank(seed: string, id: string) {
  return hashSeed(`${seed}:${id}`) / 0xffffffff;
}

function uniqueById(items: ClassifiedAtlasExercise[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.exercise.id)) return false;
    seen.add(item.exercise.id);
    return true;
  });
}

function pickBestDiversity(
  candidates: ClassifiedAtlasExercise[],
  selected: ClassifiedAtlasExercise[],
  seed: string,
) {
  const usedSources = new Set(selected.map((item) => item.exercise.source));
  const usedFamilies = new Set(selected.map((item) => item.family.id));
  const usedDomains = new Set(selected.map((item) => item.exercise.domain));

  return [...candidates].sort((a, b) => {
    const aScore = (usedSources.has(a.exercise.source) ? 0 : 5)
      + (usedFamilies.has(a.family.id) ? 0 : 4)
      + (usedDomains.has(a.exercise.domain) ? 0 : 2)
      + Math.min(2, a.score / 12)
      + seededRank(seed, a.exercise.id);
    const bScore = (usedSources.has(b.exercise.source) ? 0 : 5)
      + (usedFamilies.has(b.family.id) ? 0 : 4)
      + (usedDomains.has(b.exercise.domain) ? 0 : 2)
      + Math.min(2, b.score / 12)
      + seededRank(seed, b.exercise.id);
    return bScore - aScore;
  })[0];
}

export function buildAtlasRecognitionSession(
  seed: string,
  size = 12,
  priorMissedIds: string[] = [],
): AtlasRecognitionSession {
  const safeSize = Math.max(6, Math.min(20, Math.floor(size)));
  const eligible = classifiedAtlasExercises;
  const byId = new Map(eligible.map((item) => [item.exercise.id, item]));
  const selected = uniqueById(priorMissedIds.map((id) => byId.get(id)).filter((item): item is ClassifiedAtlasExercise => Boolean(item))).slice(0, Math.min(4, safeSize));
  const selectedIds = new Set(selected.map((item) => item.exercise.id));

  const sourceOrder: ExerciseSource[] = ["goodrich", "epi", "skiena"];
  for (const source of sourceOrder) {
    if (selected.length >= safeSize || selected.some((item) => item.exercise.source === source)) continue;
    const sourceCandidates = eligible
      .filter((item) => item.exercise.source === source && !selectedIds.has(item.exercise.id))
      .sort((a, b) => seededRank(seed, b.exercise.id) - seededRank(seed, a.exercise.id));
    const pick = pickBestDiversity(sourceCandidates, selected, `${seed}:${source}`);
    if (pick) {
      selected.push(pick);
      selectedIds.add(pick.exercise.id);
    }
  }

  while (selected.length < safeSize) {
    const candidates = eligible.filter((item) => !selectedIds.has(item.exercise.id));
    const pick = pickBestDiversity(candidates, selected, `${seed}:${selected.length}`);
    if (!pick) break;
    selected.push(pick);
    selectedIds.add(pick.exercise.id);
  }

  return {
    seed,
    items: selected,
    eligibleCount: eligible.length,
    sourceCount: new Set(selected.map((item) => item.exercise.source)).size,
    familyCount: new Set(selected.map((item) => item.family.id)).size,
  };
}

export function getAtlasRecognitionChoices(item: ClassifiedAtlasExercise, seed: string, count = 6) {
  const safeCount = Math.max(4, Math.min(atlasPatterns.length, Math.floor(count)));
  const distractors = atlasPatterns
    .filter((pattern) => pattern.id !== item.family.id)
    .sort((a, b) => seededRank(seed, `${item.exercise.id}:${b.id}`) - seededRank(seed, `${item.exercise.id}:${a.id}`))
    .slice(0, safeCount - 1);

  return [item.family, ...distractors]
    .sort((a, b) => seededRank(`${seed}:choices`, `${item.exercise.id}:${a.id}`) - seededRank(`${seed}:choices`, `${item.exercise.id}:${b.id}`));
}
