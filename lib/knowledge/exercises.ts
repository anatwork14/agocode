export type ExerciseSource = "goodrich" | "epi" | "skiena";
export type ExerciseKind = "implementation" | "reasoning" | "design" | "catalog";
export type ExerciseLevel = "foundation" | "core" | "advanced";

export type CanonicalExercise = {
  id: string;
  title: string;
  source: ExerciseSource;
  sourceChapter: string;
  domain: string;
  kind: ExerciseKind;
  level: ExerciseLevel;
  tags: string[];
  lens: string;
  route?: string;
};

type ExerciseGroup = {
  source: ExerciseSource;
  sourceChapter: string;
  domain: string;
  kind?: ExerciseKind;
  level?: ExerciseLevel;
  tags?: string[];
  titles: string[];
};

export const sourceLabels: Record<ExerciseSource, string> = {
  goodrich: "Goodrich · Tamassia · Goldwasser",
  epi: "Elements of Programming Interviews",
  skiena: "The Algorithm Design Manual",
};

const interactiveRoutes: Record<string, string> = {
  "Binary search": "/learn/binary-search",
  "Selection sort": "/learn/selection-sort",
  "Quicksort": "/learn/quicksort",
  "Breadth-first search": "/learn/breadth-first-search",
  "Dijkstra's algorithm": "/learn/dijkstra",
  "The knapsack problem": "/learn/dynamic-programming",
  "Knapsack problem": "/learn/dynamic-programming",
  "Interval covering": "/learn/greedy",
  "K-nearest neighbors": "/learn/k-nearest-neighbors",
};

const groups: ExerciseGroup[] = [
  {
    source: "goodrich",
    sourceChapter: "3 · Algorithm Analysis",
    domain: "Analysis & correctness",
    kind: "reasoning",
    level: "foundation",
    tags: ["complexity", "proof"],
    titles: [
      "Experimental running-time study",
      "Compare growth rates",
      "Asymptotic analysis",
      "Big-Oh comparative analysis",
      "Find a counterexample",
      "Contrapositive reasoning",
      "Proof by contradiction",
      "Induction",
      "Loop-invariant correctness",
    ],
  },
  {
    source: "goodrich",
    sourceChapter: "4 · Recursion",
    domain: "Recursion",
    kind: "implementation",
    level: "foundation",
    tags: ["recursion", "stack"],
    titles: [
      "Factorial",
      "English-ruler recursion",
      "Binary search",
      "Recursive file-system traversal",
      "Linear recursion",
      "Binary recursion",
      "Multiple recursion",
      "Design a recursive algorithm",
      "Eliminate tail recursion",
    ],
  },
  {
    source: "goodrich",
    sourceChapter: "5 · Array-Based Sequences",
    domain: "Arrays & memory",
    kind: "implementation",
    level: "core",
    tags: ["array", "amortization"],
    titles: [
      "Low-level referential array",
      "Compact array representation",
      "Dynamic-array growth",
      "Amortized append analysis",
      "Insert into a dynamic array",
      "Remove from a dynamic array",
      "High-score table",
      "Insertion sort on a sequence",
      "Simple substitution cipher",
      "Multidimensional array representation",
    ],
  },
  {
    source: "goodrich",
    sourceChapter: "6 · Stacks, Queues, and Deques",
    domain: "Stacks & queues",
    kind: "implementation",
    level: "core",
    tags: ["stack", "queue", "deque"],
    titles: [
      "Implement the Stack ADT",
      "Reverse data with a stack",
      "Match parentheses with a stack",
      "Match HTML tags with a stack",
      "Implement the Queue ADT",
      "Implement an array-based circular queue",
      "Implement the Deque ADT",
      "Implement a deque with a circular array",
    ],
  },
  {
    source: "goodrich",
    sourceChapter: "7 · Linked Lists",
    domain: "Linked lists",
    kind: "implementation",
    level: "core",
    tags: ["linked-list", "representation"],
    titles: [
      "Singly linked list",
      "Stack backed by a singly linked list",
      "Queue backed by a singly linked list",
      "Circular linked list",
      "Round-robin scheduler",
      "Doubly linked list",
      "Deque backed by a doubly linked list",
      "Positional List ADT",
      "Sort a positional list",
      "Move-to-front access heuristic",
      "Compare link-based and array-based sequences",
    ],
  },
  {
    source: "goodrich",
    sourceChapter: "8 · Trees",
    domain: "Trees",
    kind: "implementation",
    level: "core",
    tags: ["tree", "traversal"],
    titles: [
      "General Tree ADT",
      "Binary Tree ADT",
      "Compute tree depth and height",
      "Linked binary-tree representation",
      "Array-based binary-tree representation",
      "Preorder traversal",
      "Postorder traversal",
      "Breadth-first tree traversal",
      "Inorder traversal",
      "Euler tour",
      "Expression tree",
    ],
  },
  {
    source: "goodrich",
    sourceChapter: "9 · Priority Queues",
    domain: "Heaps & priority queues",
    kind: "implementation",
    level: "core",
    tags: ["heap", "priority-queue"],
    titles: [
      "Priority Queue ADT",
      "Priority queue with an unsorted list",
      "Priority queue with a sorted list",
      "Binary heap",
      "Heap-based priority queue",
      "Bottom-up heap construction",
      "Heap sort",
      "Adaptable priority queue",
    ],
  },
  {
    source: "goodrich",
    sourceChapter: "10 · Maps, Hash Tables, and Skip Lists",
    domain: "Hashing & maps",
    kind: "implementation",
    level: "core",
    tags: ["hash-table", "map", "set"],
    titles: [
      "Map ADT",
      "Count word frequencies",
      "Unsorted map",
      "Hash function design",
      "Collision handling",
      "Load factor and rehashing",
      "Hash-table implementation",
      "Sorted map",
      "Skip-list search and update",
      "Set ADT",
      "Multiset",
      "Multimap",
    ],
  },
  {
    source: "goodrich",
    sourceChapter: "11 · Search Trees",
    domain: "Search trees",
    kind: "implementation",
    level: "advanced",
    tags: ["bst", "balanced-tree"],
    titles: [
      "Binary search tree search",
      "Binary search tree insertion",
      "Binary search tree deletion",
      "AVL-tree rebalancing",
      "Splay tree",
      "(2,4) tree",
      "Red-black tree",
    ],
  },
  {
    source: "goodrich",
    sourceChapter: "12 · Sorting and Selection",
    domain: "Sorting & selection",
    kind: "implementation",
    level: "core",
    tags: ["sorting", "selection"],
    titles: [
      "Selection sort",
      "Insertion sort",
      "Heap sort",
      "Merge sort",
      "Quicksort",
      "Randomized quicksort",
      "Sorting lower bound",
      "Bucket sort",
      "Radix sort",
      "Quickselect",
    ],
  },
  {
    source: "goodrich",
    sourceChapter: "13 · Text Processing",
    domain: "Strings & text",
    kind: "implementation",
    level: "advanced",
    tags: ["string", "dp", "compression"],
    titles: [
      "Brute-force pattern matching",
      "Boyer-Moore pattern matching",
      "Knuth-Morris-Pratt pattern matching",
      "Matrix-chain dynamic programming",
      "DNA sequence alignment",
      "Huffman coding",
      "Trie",
      "Suffix-based text index",
      "Search-engine indexing",
    ],
  },
  {
    source: "goodrich",
    sourceChapter: "14 · Graph Algorithms",
    domain: "Graphs",
    kind: "implementation",
    level: "advanced",
    tags: ["graph", "traversal", "shortest-path"],
    titles: [
      "Graph representation",
      "Depth-first search",
      "Breadth-first search",
      "Transitive closure",
      "Directed acyclic graph",
      "Topological ordering",
      "Dijkstra's algorithm",
      "Minimum spanning tree",
      "Prim's algorithm",
      "Kruskal's algorithm",
      "Disjoint-set union-find",
    ],
  },
  {
    source: "goodrich",
    sourceChapter: "15 · Memory Management and B-Trees",
    domain: "External memory",
    kind: "design",
    level: "advanced",
    tags: ["cache", "b-tree", "external-memory"],
    titles: [
      "Memory hierarchy and caching",
      "LRU page replacement",
      "FIFO page replacement",
      "B-tree",
      "External-memory stack",
      "External-memory queue",
      "External merge sort",
    ],
  },

  {
    source: "epi",
    sourceChapter: "4 · Primitive Types",
    domain: "Primitive types",
    level: "foundation",
    tags: ["bits", "math"],
    titles: [
      "Computing the parity of a word", "Swap bits", "Reverse bits", "Find a closest integer with the same weight",
      "Compute x × y without arithmetical operators", "Compute x / y", "Compute x^y", "Reverse digits",
      "Check if a decimal integer is a palindrome", "Generate uniform random numbers", "Rectangle intersection",
    ],
  },
  {
    source: "epi",
    sourceChapter: "5 · Arrays",
    domain: "Arrays",
    level: "core",
    tags: ["array", "two-pointers", "sampling"],
    titles: [
      "The Dutch national flag problem", "Increment an arbitrary-precision integer", "Multiply two arbitrary-precision integers",
      "Advancing through an array", "Delete duplicates from a sorted array", "Buy and sell a stock once", "Buy and sell a stock twice",
      "Computing an alternation", "Enumerate all primes to n", "Permute the elements of an array", "Compute the next permutation",
      "Sample offline data", "Sample online data", "Compute a random permutation", "Compute a random subset",
      "Generate nonuniform random numbers", "The Sudoku checker problem", "Compute the spiral ordering of a 2D array",
      "Rotate a 2D array", "Compute rows in Pascal's Triangle",
    ],
  },
  {
    source: "epi",
    sourceChapter: "6 · Strings",
    domain: "Strings & text",
    level: "core",
    tags: ["string"],
    titles: [
      "Interconvert strings and integers", "Base conversion", "Compute the spreadsheet column encoding", "Replace and remove",
      "Test palindromicity", "Reverse all the words in a sentence", "Compute all mnemonics for a phone number",
      "The look-and-say problem", "Convert from Roman to decimal", "Compute all valid IP addresses",
      "Write a string sinusoidally", "Implement run-length encoding", "Find the first occurrence of a substring",
    ],
  },
  {
    source: "epi",
    sourceChapter: "7 · Linked Lists",
    domain: "Linked lists",
    level: "core",
    tags: ["linked-list"],
    titles: [
      "Merge two sorted lists", "Reverse a single sublist", "Test for cyclicity", "Test for overlapping cycle-free lists",
      "Test for overlapping lists that may have cycles", "Delete a node from a singly linked list", "Remove the kth last element from a list",
      "Remove duplicates from a sorted list", "Implement cyclic right shift for singly linked lists", "Implement even-odd merge",
      "Test whether a singly linked list is palindromic", "Implement list pivoting", "Add list-based integers",
    ],
  },
  {
    source: "epi",
    sourceChapter: "8 · Stacks and Queues",
    domain: "Stacks & queues",
    level: "core",
    tags: ["stack", "queue"],
    titles: [
      "Implement a stack with max API", "Evaluate RPN expressions", "Test a string for well-formedness", "Normalize pathnames",
      "Compute buildings with a sunset view", "Compute binary tree nodes in order of increasing depth", "Implement a circular queue",
      "Implement a queue using stacks", "Implement a queue with max API",
    ],
  },
  {
    source: "epi",
    sourceChapter: "9 · Binary Trees",
    domain: "Trees",
    level: "core",
    tags: ["tree", "traversal"],
    titles: [
      "Test if a binary tree is height-balanced", "Test if a binary tree is symmetric", "Compute the lowest common ancestor in a binary tree",
      "Compute the LCA when nodes have parent pointers", "Sum the root-to-leaf paths in a binary tree", "Find a root-to-leaf path with specified sum",
      "Implement an inorder traversal without recursion", "Implement a preorder traversal without recursion", "Compute the kth node in an inorder traversal",
      "Compute the successor", "Implement an inorder traversal with O(1) space", "Reconstruct a binary tree from traversal data",
      "Reconstruct a binary tree from a preorder traversal with markers", "Form a linked list from the leaves of a binary tree",
      "Compute the exterior of a binary tree", "Compute the right sibling tree",
    ],
  },
  {
    source: "epi",
    sourceChapter: "10 · Heaps",
    domain: "Heaps & priority queues",
    level: "core",
    tags: ["heap", "stream"],
    titles: [
      "Merge sorted files", "Sort an increasing-decreasing array", "Sort an almost-sorted array", "Compute the k closest stars",
      "Compute the median of online data", "Compute the k largest elements in a max-heap",
    ],
  },
  {
    source: "epi",
    sourceChapter: "11 · Searching",
    domain: "Searching",
    level: "core",
    tags: ["binary-search", "selection"],
    titles: [
      "Search a sorted array for first occurrence of k", "Search a sorted array for an entry equal to its index", "Search a cyclically sorted array",
      "Compute the integer square root", "Compute the real square root", "Search in a 2D sorted array", "Find the min and max simultaneously",
      "Find the kth largest element", "Find the missing IP address", "Find the duplicate and missing elements",
    ],
  },
  {
    source: "epi",
    sourceChapter: "12 · Hash Tables",
    domain: "Hashing & maps",
    level: "core",
    tags: ["hash-table", "sliding-window"],
    titles: [
      "Test for palindromic permutations", "Is an anonymous letter constructible?", "Implement an ISBN cache",
      "Compute the LCA, optimizing for close ancestors", "Find the nearest repeated entries in an array",
      "Find the smallest subarray covering all values", "Find the smallest subarray sequentially covering all values",
      "Find the longest subarray with distinct entries", "Find the length of a longest contained interval",
      "Compute all string decompositions", "Test the Collatz conjecture", "Implement a hash function for chess",
    ],
  },
  {
    source: "epi",
    sourceChapter: "13 · Sorting",
    domain: "Sorting & intervals",
    level: "core",
    tags: ["sorting", "interval"],
    titles: [
      "Compute the intersection of two sorted arrays", "Merge two sorted arrays", "Remove first-name duplicates",
      "Smallest nonconstructible value", "Render a calendar", "Merging intervals", "Compute the union of intervals",
      "Partition and sort an array with many repeated entries", "Team photo day-1", "Implement a fast sorting algorithm for lists",
      "Compute a salary threshold",
    ],
  },
  {
    source: "epi",
    sourceChapter: "14 · Binary Search Trees",
    domain: "Search trees",
    level: "core",
    tags: ["bst"],
    titles: [
      "Test if a binary tree satisfies the BST property", "Find the first key greater than a given value in a BST",
      "Find the k largest elements in a BST", "Compute the LCA in a BST", "Reconstruct a BST from traversal data",
      "Find the closest entries in three sorted arrays", "Enumerate numbers of the form a + b√2",
      "Build a minimum-height BST from a sorted array", "Test if three BST nodes are totally ordered",
      "The range lookup problem", "Add credits",
    ],
  },
  {
    source: "epi",
    sourceChapter: "15 · Recursion",
    domain: "Recursion & backtracking",
    level: "advanced",
    tags: ["recursion", "backtracking"],
    titles: [
      "The Towers of Hanoi problem", "Generate all nonattacking placements of n-Queens", "Generate permutations", "Generate the power set",
      "Generate all subsets of size k", "Generate strings of matched parentheses", "Generate palindromic decompositions",
      "Generate binary trees", "Implement a Sudoku solver", "Compute a Gray code",
    ],
  },
  {
    source: "epi",
    sourceChapter: "16 · Dynamic Programming",
    domain: "Dynamic programming",
    level: "advanced",
    tags: ["dynamic-programming"],
    titles: [
      "Count the number of score combinations", "Compute the Levenshtein distance", "Count the number of ways to traverse a 2D array",
      "Compute the binomial coefficients", "Search for a sequence in a 2D array", "The knapsack problem", "Word decomposition",
      "Find the minimum-weight path in a triangle", "Pick up coins for maximum gain", "Count the number of moves to climb stairs",
      "The pretty-printing problem", "Find the longest nondecreasing subsequence",
    ],
  },
  {
    source: "epi",
    sourceChapter: "17 · Greedy Algorithms and Invariants",
    domain: "Greedy & invariants",
    level: "advanced",
    tags: ["greedy", "invariant"],
    titles: [
      "Compute an optimum assignment of tasks", "Schedule to minimize waiting time", "The interval covering problem", "The 3-sum problem",
      "Find the majority element", "The gasup problem", "Compute the maximum water trapped by a pair of vertical lines",
      "Compute the largest rectangle under the skyline",
    ],
  },
  {
    source: "epi",
    sourceChapter: "18 · Graphs",
    domain: "Graphs",
    level: "advanced",
    tags: ["graph", "bfs", "dfs"],
    titles: [
      "Search a maze", "Paint a Boolean matrix", "Compute enclosed regions", "Deadlock detection", "Clone a graph",
      "Making wired connections", "Transform one string to another", "Team photo day-2",
    ],
  },
  {
    source: "epi",
    sourceChapter: "19 · Parallel Computing",
    domain: "Concurrency",
    kind: "design",
    level: "advanced",
    tags: ["concurrency"],
    titles: [
      "Implement caching for a multithreaded dictionary", "Analyze two unsynchronized interleaved threads",
      "Implement synchronization for two interleaving threads", "Implement a thread pool", "Deadlock",
      "The readers-writers problem", "The readers-writers problem with write preference", "Implement a Timer class",
      "Test the Collatz conjecture in parallel",
    ],
  },
  {
    source: "epi",
    sourceChapter: "24 · Honors Class",
    domain: "Mixed advanced problems",
    kind: "implementation",
    level: "advanced",
    tags: ["mixed", "transfer"],
    titles: [
      "Compute the greatest common divisor", "Find the first missing positive entry", "Buy and sell a stock k times",
      "Compute the maximum product of all entries but one", "Compute the longest contiguous increasing subarray", "Rotate an array",
      "Identify positions attacked by rooks", "Justify text", "Implement list zipping", "Copy a postings list",
      "Compute the longest substring with matching parentheses", "Compute the maximum of a sliding window",
      "Implement a postorder traversal without recursion", "Compute fair bonuses", "Search a sorted array of unknown length",
      "Search in two sorted arrays", "Find the kth largest element — large n, small k", "Find an element that appears only once",
      "Find the line through the most points", "Convert a sorted doubly linked list into a BST",
      "Convert a BST to a sorted doubly linked list", "Merge two BSTs", "Implement regular-expression matching",
      "Synthesize an expression", "Count inversions", "Draw the skyline", "Measure with defective jugs",
      "Compute the maximum subarray sum in a circular array", "Determine the critical height", "Find the maximum 2D subarray",
      "Implement Huffman coding", "Trapping water", "The heavy-hitter problem", "Find the longest subarray whose sum < k",
      "Road network", "Test if arbitrage is possible",
    ],
  },

  {
    source: "skiena",
    sourceChapter: "Catalog · Data Structures",
    domain: "Data structures",
    kind: "catalog",
    level: "core",
    tags: ["catalog", "representation"],
    titles: ["Dictionaries", "Priority Queues", "Suffix Trees and Arrays", "Graph Data Structures", "Set Data Structures", "Kd-Trees"],
  },
  {
    source: "skiena",
    sourceChapter: "Catalog · Numerical Problems",
    domain: "Numerical algorithms",
    kind: "catalog",
    level: "advanced",
    tags: ["catalog", "numerical"],
    titles: [
      "Solving Linear Equations", "Bandwidth Reduction", "Matrix Multiplication", "Determinants and Permanents",
      "Constrained and Unconstrained Optimization", "Linear Programming", "Random Number Generation",
      "Factoring and Primality Testing", "Arbitrary-Precision Arithmetic", "Knapsack Problem", "Discrete Fourier Transform",
    ],
  },
  {
    source: "skiena",
    sourceChapter: "Catalog · Combinatorial Problems",
    domain: "Combinatorial algorithms",
    kind: "catalog",
    level: "core",
    tags: ["catalog", "combinatorial"],
    titles: [
      "Sorting", "Searching", "Median and Selection", "Generating Permutations", "Generating Subsets", "Generating Partitions",
      "Generating Graphs", "Calendrical Calculations", "Job Scheduling", "Satisfiability",
    ],
  },
  {
    source: "skiena",
    sourceChapter: "Catalog · Polynomial-Time Graph Problems",
    domain: "Graphs",
    kind: "catalog",
    level: "advanced",
    tags: ["catalog", "graph"],
    titles: [
      "Connected Components", "Topological Sorting", "Minimum Spanning Tree", "Shortest Path", "Transitive Closure and Reduction",
      "Matching", "Eulerian Cycle / Chinese Postman", "Edge and Vertex Connectivity", "Network Flow", "Drawing Graphs Nicely",
      "Drawing Trees", "Planarity Detection and Embedding",
    ],
  },
  {
    source: "skiena",
    sourceChapter: "Catalog · Hard Graph Problems",
    domain: "Hard problems",
    kind: "catalog",
    level: "advanced",
    tags: ["catalog", "np-hard"],
    titles: [
      "Clique", "Independent Set", "Vertex Cover", "Traveling Salesman Problem", "Hamiltonian Cycle", "Graph Partition",
      "Vertex Coloring", "Edge Coloring", "Graph Isomorphism", "Steiner Tree", "Feedback Edge/Vertex Set",
    ],
  },
  {
    source: "skiena",
    sourceChapter: "Catalog · Computational Geometry",
    domain: "Computational geometry",
    kind: "catalog",
    level: "advanced",
    tags: ["catalog", "geometry"],
    titles: [
      "Robust Geometric Primitives", "Convex Hull", "Triangulation", "Voronoi Diagrams", "Nearest Neighbor Search", "Range Search",
      "Point Location", "Intersection Detection", "Bin Packing", "Medial-Axis Transformation", "Polygon Partitioning",
      "Simplifying Polygons", "Shape Similarity", "Motion Planning", "Maintaining Line Arrangements", "Minkowski Sum",
    ],
  },
  {
    source: "skiena",
    sourceChapter: "Catalog · Set and String Problems",
    domain: "Sets & strings",
    kind: "catalog",
    level: "advanced",
    tags: ["catalog", "string", "set"],
    titles: [
      "Set Cover", "Set Packing", "String Matching", "Approximate String Matching", "Text Compression", "Cryptography",
      "Finite State Machine Minimization", "Longest Common Substring", "Shortest Common Superstring",
    ],
  },
];

function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}

function defaultLens(group: ExerciseGroup, title: string) {
  if (group.kind === "reasoning") {
    return `Do not begin with code. State the claim behind “${title}”, test it on a tiny case, and identify what would make the reasoning fail.`;
  }
  if (group.kind === "design" || group.kind === "catalog") {
    return `Treat “${title}” as a modeling exercise: write the input/output precisely, name the operations that dominate the cost, then compare at least two plausible strategies.`;
  }
  return `Rebuild “${title}” from a tiny instance: write a baseline first, identify the structure or invariant that removes wasted work, then justify the final time and space bounds.`;
}

export const canonicalExercises: CanonicalExercise[] = groups.flatMap((group, groupIndex) =>
  group.titles.map((title, titleIndex) => ({
    id: `${group.source}-${groupIndex + 1}-${titleIndex + 1}-${slugify(title)}`,
    title,
    source: group.source,
    sourceChapter: group.sourceChapter,
    domain: group.domain,
    kind: group.kind ?? "implementation",
    level: group.level ?? "core",
    tags: group.tags ?? [],
    lens: defaultLens(group, title),
    route: interactiveRoutes[title],
  })),
);

export const exerciseDomains = Array.from(new Set(canonicalExercises.map((item) => item.domain))).sort();

export function getCanonicalExercise(id: string) {
  return canonicalExercises.find((item) => item.id === id);
}
