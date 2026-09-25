export type SyllabusSource = "AgoCode" | "Grokking" | "Goodrich" | "EPI" | "Skiena";

export type SyllabusModule = {
  id: string;
  title: string;
  question: string;
  outcomes: string[];
  topics: string[];
  sources: SyllabusSource[];
  route?: string;
};

export type SyllabusTrack = {
  id: string;
  number: string;
  title: string;
  purpose: string;
  modules: SyllabusModule[];
};

export const problemSolvingLoop = [
  "Understand",
  "Model",
  "Baseline",
  "Transform",
  "Choose structure",
  "Prove",
  "Analyze",
  "Implement",
  "Vary",
  "Recall",
] as const;

export const syllabusTracks: SyllabusTrack[] = [
  {
    id: "visual-foundation",
    number: "00",
    title: "Visual-first foundation",
    purpose: "Keep the original AgoCode/Grokking path as the low-friction intuition track, then connect each idea to the deeper structures and design questions below.",
    modules: [
      {
        id: "search-growth",
        title: "Search, growth, and the cost of choices",
        question: "How much work disappears when one comparison eliminates many candidates?",
        outcomes: ["Trace binary search", "Reason in growth rates rather than seconds", "Recognize factorial explosion"],
        topics: ["Binary search", "running time", "Big O", "traveling salesperson"],
        sources: ["AgoCode", "Grokking"],
        route: "/learn/binary-search",
      },
      {
        id: "representation-recursion",
        title: "Representation and recursive structure",
        question: "How does the way data is represented change what becomes cheap?",
        outcomes: ["Compare arrays and linked structures", "Trace a call stack", "Decompose recursively"],
        topics: ["memory", "arrays/lists", "selection sort", "recursion", "divide and conquer", "quicksort"],
        sources: ["AgoCode", "Grokking"],
        route: "/learn/memory",
      },
      {
        id: "lookup-graphs-optimization",
        title: "Lookup, graph search, and optimization",
        question: "Which state must be remembered so repeated work disappears?",
        outcomes: ["Use hashing", "Model relationships as graphs", "Distinguish greedy and dynamic-programming structure"],
        topics: ["hash tables", "BFS", "Dijkstra", "greedy", "dynamic programming", "KNN"],
        sources: ["AgoCode", "Grokking"],
        route: "/learn/hash-tables",
      },
    ],
  },
  {
    id: "proof-analysis",
    number: "01",
    title: "Measure and justify",
    purpose: "Upgrade complexity from a label attached after coding into a tool for deciding whether an idea can survive the actual input scale.",
    modules: [
      {
        id: "experimental-analysis",
        title: "From measurements to growth",
        question: "What can timing experiments tell us, and what can they not tell us?",
        outcomes: ["Design a controlled experiment", "Separate machine effects from growth", "Compare asymptotic functions"],
        topics: ["experimental studies", "growth functions", "best/worst/average case", "asymptotic comparison"],
        sources: ["Goodrich", "Skiena"],
        route: "/learn/running-time",
      },
      {
        id: "correctness",
        title: "Correctness is an argument",
        question: "What must remain true while the algorithm changes state?",
        outcomes: ["Write a loop invariant", "Use counterexamples", "Recognize induction, contradiction, and contrapositive reasoning"],
        topics: ["counterexamples", "induction", "loop invariants", "correctness"],
        sources: ["Goodrich", "EPI"],
      },
      {
        id: "amortization",
        title: "The expensive operation that is still cheap overall",
        question: "Can rare expensive steps be averaged across a long sequence?",
        outcomes: ["Explain dynamic-array growth", "Analyze aggregate cost", "Avoid judging a structure by one worst-looking operation"],
        topics: ["dynamic arrays", "amortized analysis", "resizing"],
        sources: ["Goodrich"],
      },
    ],
  },
  {
    id: "adt-representation",
    number: "02",
    title: "Abstract data types before implementations",
    purpose: "Learn the contract first, then compare representations by the operations the application actually needs.",
    modules: [
      {
        id: "sequence-representations",
        title: "Sequences: array or links?",
        question: "Are random access, locality, insertion, or stable positions the dominant operation?",
        outcomes: ["Separate ADT from representation", "Compare operation costs", "Choose based on workload rather than habit"],
        topics: ["arrays", "dynamic arrays", "singly/doubly/circular lists", "positional lists"],
        sources: ["Goodrich", "EPI"],
        route: "/learn/arrays-linked-lists",
      },
      {
        id: "stack-queue-deque",
        title: "Restricted access creates useful guarantees",
        question: "What becomes easier when the access rule itself is part of the abstraction?",
        outcomes: ["Implement stack/queue/deque contracts", "Use LIFO/FIFO as algorithmic state", "Recognize monotone and traversal patterns later"],
        topics: ["stack", "queue", "deque", "circular buffer"],
        sources: ["Goodrich", "EPI"],
      },
      {
        id: "maps-sets",
        title: "Keyed access, membership, and order",
        question: "Do we need exact lookup, ordered queries, multiplicity, or range structure?",
        outcomes: ["Compare map implementations", "Reason about collision/load factor", "Distinguish map/set/multimap/sorted map"],
        topics: ["maps", "hash tables", "sets", "skip lists", "sorted maps"],
        sources: ["Goodrich", "EPI", "Skiena"],
        route: "/learn/hash-tables",
      },
    ],
  },
  {
    id: "ordered-hierarchical",
    number: "03",
    title: "Ordered and hierarchical structures",
    purpose: "Move beyond flat containers: trees and heaps encode partial order so queries and updates can exploit it.",
    modules: [
      {
        id: "trees-traversal",
        title: "Trees and traversal viewpoints",
        question: "Which visit order exposes the property we care about?",
        outcomes: ["Model general and binary trees", "Trace preorder/inorder/postorder/BFS", "Use Euler-tour style recursion"],
        topics: ["tree ADT", "binary trees", "traversals", "expression trees"],
        sources: ["Goodrich", "EPI"],
      },
      {
        id: "priority-queues",
        title: "Priority queues and heaps",
        question: "What if the only ordering we repeatedly need is the current minimum or maximum?",
        outcomes: ["Compare sorted/unsorted implementations", "Maintain heap order", "Use heaps for streaming and scheduling"],
        topics: ["priority queue ADT", "binary heap", "heapify", "heap sort", "online median"],
        sources: ["Goodrich", "EPI", "Skiena"],
      },
      {
        id: "search-trees",
        title: "Search trees and balance",
        question: "How do we preserve ordered search when updates keep changing the tree?",
        outcomes: ["Implement BST operations", "Explain why balance matters", "Recognize AVL/splay/red-black trade-offs"],
        topics: ["BST", "AVL", "splay", "red-black", "range queries"],
        sources: ["Goodrich", "EPI"],
      },
    ],
  },
  {
    id: "transform-search",
    number: "04",
    title: "Transform the input before solving",
    purpose: "Many difficult-looking tasks become simple after sorting, partitioning, indexing, or otherwise exposing latent structure.",
    modules: [
      {
        id: "sorting-as-tool",
        title: "Sorting is preprocessing, not just an end goal",
        question: "If the input were sorted, what relationships would become local or searchable?",
        outcomes: ["Use sorting to expose adjacency", "Compare sorting strategies", "Notice stability/distribution/input-shape constraints"],
        topics: ["merge sort", "quicksort", "heap sort", "bucket/radix", "applications of sorting"],
        sources: ["Goodrich", "EPI", "Skiena"],
        route: "/learn/quicksort",
      },
      {
        id: "search-selection",
        title: "Search boundaries and selection",
        question: "Is the answer an item, a boundary, a rank, or a monotone decision?",
        outcomes: ["Use binary search variants", "Use quickselect/heap strategies", "Search answer space when feasibility is monotone"],
        topics: ["binary search", "first occurrence", "rotated arrays", "selection", "answer-space search"],
        sources: ["AgoCode", "Goodrich", "EPI", "Skiena"],
        route: "/practice/binary-search",
      },
      {
        id: "text-indexes",
        title: "Text as structured data",
        question: "Can preprocessing turn repeated string work into indexed queries?",
        outcomes: ["Compare brute force, KMP, and Boyer-Moore", "Understand tries/suffix indexes", "Connect matching to sequence DP"],
        topics: ["pattern matching", "KMP", "Boyer-Moore", "tries", "suffix structures", "text indexing"],
        sources: ["Goodrich", "Skiena"],
      },
    ],
  },
  {
    id: "recursive-search",
    number: "05",
    title: "Recursive decomposition and search",
    purpose: "Use the shape of the problem to shrink it, enumerate possibilities systematically, and prune branches that cannot matter.",
    modules: [
      {
        id: "recursive-design",
        title: "Follow the recursive definition",
        question: "What is the smaller instance, and what stops the descent?",
        outcomes: ["Identify base/progress rules", "Trace suspended work", "Convert some recursive processes to iteration"],
        topics: ["linear recursion", "binary recursion", "multiple recursion", "call stack"],
        sources: ["AgoCode", "Goodrich", "EPI"],
        route: "/learn/recursion",
      },
      {
        id: "divide-conquer",
        title: "Divide, solve, combine",
        question: "Can independent subproblems be solved separately and merged?",
        outcomes: ["Recognize divide-and-conquer structure", "Reason about balanced vs lopsided splits", "Use partitioning deliberately"],
        topics: ["recursive sum", "quicksort", "merge sort", "binary search", "fast exponentiation"],
        sources: ["AgoCode", "EPI", "Skiena"],
        route: "/learn/divide-and-conquer",
      },
      {
        id: "backtracking-pruning",
        title: "Enumerate without getting lost",
        question: "What partial choices can already be proven impossible?",
        outcomes: ["Generate subsets/permutations", "Backtrack from partial state", "Prune infeasible or dominated branches"],
        topics: ["n-Queens", "Sudoku", "subsets", "permutations", "branch pruning"],
        sources: ["EPI", "Skiena"],
      },
    ],
  },
  {
    id: "graph-modeling",
    number: "06",
    title: "Graph modeling as a change of language",
    purpose: "Practice converting entities and relationships into vertices and edges before choosing a traversal or path algorithm.",
    modules: [
      {
        id: "graph-representation",
        title: "Get the graph right first",
        question: "What are the vertices, what do the edges mean, and which direction/weight belongs on them?",
        outcomes: ["Model real relationships", "Choose adjacency list vs matrix", "Separate graph construction from traversal"],
        topics: ["graph representation", "directed/undirected", "weighted/unweighted"],
        sources: ["Goodrich", "EPI", "Skiena"],
      },
      {
        id: "graph-traversal",
        title: "Traversal exposes structure",
        question: "Do we need layers, depth, connectivity, cycles, coloring, or ordering?",
        outcomes: ["Trace BFS/DFS", "Find components/cycles", "Topologically order a DAG", "Check bipartiteness"],
        topics: ["BFS", "DFS", "components", "cycle detection", "bipartite", "topological sort"],
        sources: ["Goodrich", "EPI", "Skiena"],
        route: "/learn/breadth-first-search",
      },
      {
        id: "weighted-graphs",
        title: "Weighted paths and spanning structure",
        question: "Are we minimizing a route, connecting everything, or pushing flow?",
        outcomes: ["Use Dijkstra for non-negative shortest paths", "Distinguish shortest path from MST", "Recognize union-find and flow as separate tools"],
        topics: ["Dijkstra", "Prim", "Kruskal", "union-find", "network flow"],
        sources: ["Goodrich", "Skiena"],
        route: "/learn/dijkstra",
      },
    ],
  },
  {
    id: "optimization",
    number: "07",
    title: "Optimization: greedy, DP, and approximation",
    purpose: "Learn to ask whether local choices are safe, whether overlapping subproblems can be cached, and when exact optimization is unrealistic.",
    modules: [
      {
        id: "greedy-invariant",
        title: "Greedy needs a reason",
        question: "What invariant or exchange argument makes a local choice safe?",
        outcomes: ["Test greedy rules with counterexamples", "Use scheduling/cover examples", "Separate heuristic success from proof"],
        topics: ["interval scheduling", "task assignment", "set cover", "greedy counterexamples"],
        sources: ["AgoCode", "EPI", "Skiena"],
        route: "/learn/greedy",
      },
      {
        id: "dynamic-programming",
        title: "Define the state before the recurrence",
        question: "Which smaller answers must be remembered so the full answer can be assembled?",
        outcomes: ["Name state meaning", "Write transitions", "Choose dimensions/granularity", "Reconstruct a solution"],
        topics: ["knapsack", "edit distance", "grid DP", "sequence alignment", "LCS/LIS"],
        sources: ["AgoCode", "Goodrich", "EPI", "Skiena"],
        route: "/learn/dynamic-programming",
      },
      {
        id: "hardness",
        title: "Recognize when exact may be the wrong requirement",
        question: "Is the exponential behavior a coding failure, or a property of the problem class?",
        outcomes: ["Recognize canonical hard problems", "Understand reductions at an intuitive level", "Choose brute force, pruning, approximation, or heuristic based on constraints"],
        topics: ["NP-completeness", "reductions", "approximation", "heuristics", "simulated annealing"],
        sources: ["EPI", "Skiena"],
      },
    ],
  },
  {
    id: "problem-solving",
    number: "08",
    title: "A repeatable way to solve unfamiliar problems",
    purpose: "Turn problem solving from inspiration into a sequence of explicit questions and recorded decisions.",
    modules: [
      {
        id: "understand-model",
        title: "Understand before naming an algorithm",
        question: "What exactly is the input, output, scale, objective, and acceptable approximation?",
        outcomes: ["Solve tiny examples by hand", "Classify the problem in multiple ways", "Write assumptions and constraints"],
        topics: ["concrete examples", "extreme cases", "input/output", "modeling", "strategy vs tactics"],
        sources: ["EPI", "Skiena"],
        route: "/blog#model-before-optimize",
      },
      {
        id: "baseline-refine",
        title: "Baseline first, then remove wasted work",
        question: "What does the brute-force solution recompute, rescan, or reconsider?",
        outcomes: ["State a correct baseline", "Find the bottleneck", "Iteratively refine with sorting, caching, or a data structure"],
        topics: ["brute force", "case analysis", "iterative refinement", "special cases"],
        sources: ["EPI", "Skiena"],
        route: "/blog#brute-force-baseline",
      },
      {
        id: "pattern-repertoire",
        title: "Build a repertoire without memorizing answers",
        question: "Which known problem is structurally closest to this one?",
        outcomes: ["Name canonical problem families", "Use reductions and variants", "Retrieve by structural clue instead of surface story"],
        topics: ["problem catalog", "patterns", "reduction", "variants", "mixed recognition"],
        sources: ["EPI", "Skiena", "AgoCode"],
        route: "/exercises",
      },
    ],
  },
  {
    id: "engineering",
    number: "09",
    title: "Algorithm engineering and real constraints",
    purpose: "Bridge textbook mechanisms to library use, memory hierarchy, concurrency, and system-scale design decisions.",
    modules: [
      {
        id: "libraries-implementation",
        title: "Know what to implement and what to reuse",
        question: "Is the learning goal the mechanism, or is a trusted library the correct production choice?",
        outcomes: ["Use standard containers intentionally", "Keep top-level logic visible", "Know the contract and complexity of reused components"],
        topics: ["Python collections", "heapq", "iterators/generators", "reusable components"],
        sources: ["Goodrich", "EPI"],
      },
      {
        id: "memory-external",
        title: "When memory hierarchy changes the algorithm",
        question: "What happens when the data no longer fits comfortably in RAM?",
        outcomes: ["Reason about cache/page behavior", "Understand B-trees", "Recognize external sorting"],
        topics: ["cache", "LRU/FIFO", "B-tree", "external memory", "external sort"],
        sources: ["Goodrich", "Skiena"],
      },
      {
        id: "parallel-design",
        title: "Concurrency and design problems",
        question: "Which state is shared, which operations require coordination, and which work can safely proceed independently?",
        outcomes: ["Reason about races/deadlock", "Recognize parallelizable subproblems", "Connect algorithm choices to system design"],
        topics: ["threads", "readers-writers", "caching", "parallel algorithms", "design problems"],
        sources: ["EPI", "Skiena"],
      },
    ],
  },
];

export const syllabusModuleCount = syllabusTracks.reduce((sum, track) => sum + track.modules.length, 0);
