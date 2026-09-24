export type TransferTechniqueId =
  | "binary-search"
  | "hash-membership"
  | "bfs"
  | "dijkstra"
  | "greedy"
  | "dynamic-programming"
  | "knn"
  | "recursion";

export type TransferTechnique = {
  id: TransferTechniqueId;
  label: string;
  invariant: string;
  clue: string;
  bookHref: string;
};

export const transferTechniques: TransferTechnique[] = [
  {
    id: "binary-search",
    label: "Binary search",
    invariant: "A decision at the midpoint must prove that an entire candidate region cannot contain the answer.",
    clue: "Look for ordered or monotonic structure plus a requirement to shrink a candidate range quickly.",
    bookHref: "/learn/binary-search",
  },
  {
    id: "hash-membership",
    label: "Hash membership",
    invariant: "A key should answer membership or lookup directly instead of forcing a repeated scan.",
    clue: "Repeated membership, deduplication, counting, or key → value lookup is central to the task.",
    bookHref: "/learn/hash-tables",
  },
  {
    id: "bfs",
    label: "Breadth-first search",
    invariant: "FIFO layer order means the first time a node is reached, it has been reached with the fewest unweighted edges.",
    clue: "The graph is unweighted and the objective is fewest hops, levels, moves, or edges.",
    bookHref: "/learn/breadth-first-search",
  },
  {
    id: "dijkstra",
    label: "Dijkstra",
    invariant: "Repeatedly finalize the cheapest unfinished cost and relax non-negative outgoing edges.",
    clue: "Edges have different non-negative costs and the goal is minimum total path weight.",
    bookHref: "/learn/dijkstra",
  },
  {
    id: "greedy",
    label: "Greedy",
    invariant: "A locally chosen move must leave enough room that repeating the rule still builds a valid global solution or useful approximation.",
    clue: "You are repeatedly choosing one best-looking compatible option, often after sorting by a strategic key.",
    bookHref: "/learn/greedy",
  },
  {
    id: "dynamic-programming",
    label: "Dynamic programming",
    invariant: "A state stores the best answer to a reusable subproblem so larger states can combine already-solved answers.",
    clue: "The problem asks for an optimum under constraints and naturally repeats smaller choices or prefix/capacity states.",
    bookHref: "/learn/dynamic-programming",
  },
  {
    id: "knn",
    label: "K-nearest neighbors",
    invariant: "Represent examples as comparable features, measure distance, keep the k nearest, then aggregate their labels or responses.",
    clue: "Prediction depends on similarity to labeled or measured examples rather than an exact rule.",
    bookHref: "/learn/k-nearest-neighbors",
  },
  {
    id: "recursion",
    label: "Recursion",
    invariant: "Each call must move toward a base case while preserving enough suspended state to combine the return values.",
    clue: "The input is naturally nested or self-similar and solving a smaller version of the same problem is the clearest decomposition.",
    bookHref: "/learn/recursion",
  },
];

export type RecognitionScenario = {
  id: string;
  title: string;
  prompt: string;
  constraints: string[];
  answer: TransferTechniqueId;
  explanation: string;
  trap: string;
};

export const recognitionScenarios: RecognitionScenario[] = [
  {
    id: "badge-repeat",
    title: "The first repeated badge",
    prompt: "A conference stream emits attendee badge IDs. Return the first ID whose second appearance is encountered. There may be millions of IDs, and you only need one pass.",
    constraints: ["encounter order matters", "millions of IDs", "one pass preferred"],
    answer: "hash-membership",
    explanation: "Keep a set of badges already seen. Each new badge needs one membership check; the first badge already in the set is the answer.",
    trap: "Sorting would destroy encounter order unless you carry extra positions, and repeatedly scanning the prefix creates quadratic work.",
  },
  {
    id: "fewest-handoffs",
    title: "Fewest package handoffs",
    prompt: "Warehouses are connected by direct handoff links. Every handoff counts as one step. Find the minimum number of handoffs from warehouse A to warehouse Z.",
    constraints: ["all edges cost one handoff", "cycles may exist", "minimum edge count"],
    answer: "bfs",
    explanation: "FIFO exploration visits the network layer by layer. The first discovery of the destination therefore uses the fewest handoffs.",
    trap: "Dijkstra can solve it, but adds machinery you do not need when every edge has the same cost.",
  },
  {
    id: "toll-route",
    title: "Cheapest courier route",
    prompt: "Roads between depots have different non-negative tolls. Find a route from Start to Finish with the minimum total toll.",
    constraints: ["weighted graph", "weights are non-negative", "minimize total cost, not edge count"],
    answer: "dijkstra",
    explanation: "The relevant quantity is accumulated path cost. Dijkstra repeatedly finalizes the cheapest unfinished distance and relaxes outgoing roads.",
    trap: "BFS minimizes the number of roads, which can disagree with minimum total toll when weights differ.",
  },
  {
    id: "studio-schedule",
    title: "Fit the most recording sessions",
    prompt: "A studio receives proposed sessions with start and end times. Choose the maximum number of non-overlapping sessions that fit in one room.",
    constraints: ["one room", "sessions cannot overlap", "maximize count"],
    answer: "greedy",
    explanation: "Sorting by finish time and repeatedly taking the earliest-finishing compatible session leaves the most room for what follows.",
    trap: "Choosing the shortest duration or earliest start is locally plausible but does not preserve as much future room.",
  },
  {
    id: "study-budget",
    title: "Spend a fixed study budget",
    prompt: "You have a fixed number of study hours. Each optional module consumes a whole number of hours and yields a score boost; each module can be completed at most once. Maximize the total score boost.",
    constraints: ["hard capacity", "0/1 choices", "maximize value"],
    answer: "dynamic-programming",
    explanation: "The natural state is the best score reachable using the modules seen so far under each hour budget. Larger states reuse smaller solved capacities.",
    trap: "Picking the best score-per-hour module greedily can miss a better combination of modules.",
  },
  {
    id: "server-capacity",
    title: "Minimum safe server capacity",
    prompt: "For any candidate capacity C, a simulation can answer whether all jobs finish before the deadline. If capacity C works, every larger capacity also works. Find the smallest working capacity.",
    constraints: ["monotonic feasibility", "huge numeric answer range", "need the smallest feasible value"],
    answer: "binary-search",
    explanation: "The answer values form false…false, true…true. Binary search the capacity range and discard the impossible half after each feasibility check.",
    trap: "There may be no sorted input array to search; the ordered object is the monotonic answer space itself.",
  },
  {
    id: "plant-classifier",
    title: "Classify a new plant",
    prompt: "You have labeled plant examples represented by height, leaf width, and petal length. Predict the species of a new plant from the most similar labeled examples.",
    constraints: ["numeric feature vectors", "labeled examples", "similar examples should behave alike"],
    answer: "knn",
    explanation: "Measure feature-space distance, select the k closest labeled plants, and let their labels vote.",
    trap: "There is no exact comparison rule like binary search; the prediction is similarity-based.",
  },
  {
    id: "folder-size",
    title: "Total size of a nested folder",
    prompt: "A folder can contain files and more folders to arbitrary depth. Compute the total bytes stored under the root folder.",
    constraints: ["arbitrary nesting", "same structure repeats at every folder", "combine child totals"],
    answer: "recursion",
    explanation: "Each folder is the same smaller problem: sum its direct files plus the totals returned by its child folders, stopping at folders with no nested children.",
    trap: "A stack-based iterative traversal is also possible, but the recursive decomposition mirrors the nested structure directly.",
  },
  {
    id: "directory-threshold",
    title: "Locate an ordered boundary",
    prompt: "A sorted log stores timestamps. Find the first timestamp that is greater than or equal to a requested cutoff.",
    constraints: ["sorted values", "boundary rather than exact equality", "logarithmic target"],
    answer: "binary-search",
    explanation: "Keep the leftmost feasible timestamp as a candidate while continuing to discard the half that cannot contain an earlier valid boundary.",
    trap: "Returning immediately on an equal timestamp can be wrong when duplicate timestamps exist and the first valid position matters.",
  },
  {
    id: "network-influence",
    title: "Predict engagement from similar creators",
    prompt: "Creators are represented by posting frequency, average video length, topic ratios, and audience size. Predict a new creator's engagement using nearby creators with known engagement scores.",
    constraints: ["feature vectors", "numeric target", "local similarity"],
    answer: "knn",
    explanation: "This is KNN regression: find nearby feature vectors and combine their numeric responses, such as by averaging them.",
    trap: "Classification would be appropriate for a category label, but the requested output here is numeric.",
  },
];

export const transferChallengeKeys = [
  "agocode.progress.transfer.hash-membership",
  "agocode.progress.transfer.bfs-handoffs",
  "agocode.progress.transfer.dijkstra-route",
  "agocode.progress.transfer.greedy-schedule",
  "agocode.progress.transfer.dp-budget",
] as const;
