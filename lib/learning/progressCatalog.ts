export type EvidenceDimension =
  | "understand"
  | "trace"
  | "predict"
  | "rebuild"
  | "explain"
  | "transfer"
  | "recall";

export type ProgressEvidenceItem = {
  key: string;
  title: string;
  href: string;
  dimensions: readonly EvidenceDimension[];
  weight?: number;
};

export type BookProgressChapter = {
  number: number;
  title: string;
  href: string;
  evidence: readonly ProgressEvidenceItem[];
};

export type TransferProgressItem = ProgressEvidenceItem & {
  number: string;
  technique: string;
  kind: "code" | "recognition";
};

export const bookProgressChapters: readonly BookProgressChapter[] = [
  {
    number: 1,
    title: "Introduction to Algorithms",
    href: "/learn",
    evidence: [
      { key: "agocode.progress.binary-search.rebuild", title: "Rebuild Binary Search", href: "/learn/binary-search#rebuild", dimensions: ["rebuild"], weight: 1.2 },
      { key: "agocode.progress.binary-search.explain", title: "Explain the search invariant", href: "/learn/binary-search#explain", dimensions: ["explain", "understand"] },
      { key: "agocode.progress.chapter-1.running-time", title: "Reason about running time", href: "/learn/running-time", dimensions: ["understand", "explain"] },
      { key: "agocode.progress.chapter-1.big-o", title: "Compare growth with Big O", href: "/learn/big-o", dimensions: ["understand", "trace"] },
      { key: "agocode.progress.chapter-1.tsp", title: "Recognize factorial growth", href: "/learn/traveling-salesperson", dimensions: ["understand"] },
      { key: "agocode.progress.chapter-1.recap", title: "Recall Chapter 1", href: "/learn/chapter-1-recap", dimensions: ["recall", "explain"], weight: 1.2 },
    ],
  },
  {
    number: 2,
    title: "Selection Sort",
    href: "/learn/memory",
    evidence: [
      { key: "agocode.progress.chapter-2.memory", title: "Build the memory model", href: "/learn/memory", dimensions: ["understand"] },
      { key: "agocode.progress.chapter-2.arrays-lists", title: "Compare arrays and linked lists", href: "/learn/arrays-linked-lists", dimensions: ["understand", "explain"] },
      { key: "agocode.progress.selection-sort.rebuild", title: "Rebuild Selection Sort", href: "/learn/selection-sort#rebuild", dimensions: ["trace", "rebuild"], weight: 1.2 },
      { key: "agocode.progress.chapter-2.recap", title: "Recall Chapter 2", href: "/learn/chapter-2-recap", dimensions: ["recall"] },
    ],
  },
  {
    number: 3,
    title: "Recursion",
    href: "/learn/recursion",
    evidence: [
      { key: "agocode.progress.recursion.factorial-rebuild", title: "Rebuild a recursive solution", href: "/learn/recursion#rebuild", dimensions: ["trace", "rebuild"], weight: 1.2 },
      { key: "agocode.progress.chapter-3.recap", title: "Recall the call-stack model", href: "/learn/chapter-3-recap", dimensions: ["recall", "explain"] },
    ],
  },
  {
    number: 4,
    title: "Quicksort",
    href: "/learn/divide-and-conquer",
    evidence: [
      { key: "agocode.progress.divide-conquer.sum-rebuild", title: "Rebuild divide and conquer", href: "/learn/divide-and-conquer#rebuild", dimensions: ["understand", "rebuild"] },
      { key: "agocode.progress.quicksort.rebuild", title: "Rebuild Quicksort", href: "/learn/quicksort#rebuild", dimensions: ["trace", "rebuild"], weight: 1.2 },
      { key: "agocode.progress.chapter-4.recap", title: "Recall Chapter 4", href: "/learn/chapter-4-recap", dimensions: ["recall"] },
    ],
  },
  {
    number: 5,
    title: "Hash Tables",
    href: "/learn/hash-tables",
    evidence: [
      { key: "agocode.progress.hash-tables.duplicate-filter", title: "Apply hash-backed membership", href: "/learn/hash-tables#apply", dimensions: ["understand", "rebuild", "transfer"] },
      { key: "agocode.progress.chapter-5.recap", title: "Recall hash-table behavior", href: "/learn/chapter-5-recap", dimensions: ["recall", "explain"] },
    ],
  },
  {
    number: 6,
    title: "Breadth-First Search",
    href: "/learn/breadth-first-search",
    evidence: [
      { key: "agocode.progress.bfs.prediction", title: "Predict FIFO traversal state", href: "/learn/breadth-first-search#trace", dimensions: ["predict", "trace"], weight: 1.2 },
      { key: "agocode.progress.bfs.rebuild", title: "Rebuild BFS", href: "/learn/breadth-first-search#rebuild", dimensions: ["rebuild", "trace"], weight: 1.2 },
      { key: "agocode.progress.chapter-6.recap", title: "Recall graph and queue invariants", href: "/learn/chapter-6-recap", dimensions: ["recall", "explain"] },
    ],
  },
  {
    number: 7,
    title: "Dijkstra's Algorithm",
    href: "/learn/dijkstra",
    evidence: [
      { key: "agocode.progress.dijkstra.rebuild", title: "Rebuild Dijkstra", href: "/learn/dijkstra#rebuild", dimensions: ["trace", "rebuild"], weight: 1.2 },
      { key: "agocode.progress.chapter-7.recap", title: "Recall weighted-path reasoning", href: "/learn/chapter-7-recap", dimensions: ["recall", "explain"] },
    ],
  },
  {
    number: 8,
    title: "Greedy Algorithms",
    href: "/learn/greedy",
    evidence: [
      { key: "agocode.progress.greedy.scheduling", title: "Apply interval scheduling", href: "/learn/greedy#schedule", dimensions: ["trace", "understand"] },
      { key: "agocode.progress.greedy.set-cover", title: "Trace set-cover approximation", href: "/learn/greedy#set-cover", dimensions: ["trace", "understand"] },
      { key: "agocode.progress.chapter-8.recap", title: "Recall greedy boundaries", href: "/learn/chapter-8-recap", dimensions: ["recall", "explain"] },
    ],
  },
  {
    number: 9,
    title: "Dynamic Programming",
    href: "/learn/dynamic-programming",
    evidence: [
      { key: "agocode.progress.dynamic-programming.knapsack-grid", title: "Build a knapsack state grid", href: "/learn/dynamic-programming#cell", dimensions: ["trace", "understand"] },
      { key: "agocode.progress.dynamic-programming.knapsack-rebuild", title: "Rebuild the knapsack recurrence", href: "/learn/dynamic-programming#rebuild", dimensions: ["rebuild", "explain"], weight: 1.2 },
      { key: "agocode.progress.dynamic-programming.sequence-grid", title: "Compare sequence-state rules", href: "/learn/dynamic-programming#strings", dimensions: ["trace", "understand"] },
      { key: "agocode.progress.chapter-9.recap", title: "Recall Chapter 9", href: "/learn/chapter-9-recap", dimensions: ["recall"] },
    ],
  },
  {
    number: 10,
    title: "K-Nearest Neighbors",
    href: "/learn/k-nearest-neighbors",
    evidence: [
      { key: "agocode.progress.knn.classification", title: "Classify by neighborhood", href: "/learn/k-nearest-neighbors#classify", dimensions: ["trace", "understand"] },
      { key: "agocode.progress.knn.rebuild", title: "Rebuild KNN classification", href: "/learn/k-nearest-neighbors#rebuild", dimensions: ["rebuild"] },
      { key: "agocode.progress.chapter-10.recap", title: "Recall KNN and feature quality", href: "/learn/chapter-10-recap", dimensions: ["recall", "explain"] },
    ],
  },
  {
    number: 11,
    title: "Where to Go Next",
    href: "/learn/where-to-go-next",
    evidence: [
      { key: "agocode.progress.chapter-11.explore", title: "Explore the advanced-topic map", href: "/learn/where-to-go-next#choose", dimensions: ["understand"] },
      { key: "agocode.progress.chapter-11.recap", title: "Recall the advanced-topic map", href: "/learn/chapter-11-recap", dimensions: ["recall"] },
    ],
  },
];

export const transferProgressItems: readonly TransferProgressItem[] = [
  { number: "01", key: "agocode.progress.transfer.hash-membership", title: "Membership under encounter order", technique: "Hash tables", href: "/practice/hash-membership", kind: "code", dimensions: ["transfer", "rebuild"] },
  { number: "02", key: "agocode.progress.transfer.bfs-handoffs", title: "Shortest unweighted handoff path", technique: "BFS", href: "/practice/bfs-handoffs", kind: "code", dimensions: ["transfer", "rebuild"] },
  { number: "03", key: "agocode.progress.transfer.dijkstra-route", title: "Cheapest weighted route", technique: "Dijkstra", href: "/practice/dijkstra-route", kind: "code", dimensions: ["transfer", "rebuild"] },
  { number: "04", key: "agocode.progress.transfer.greedy-schedule", title: "Maximum compatible schedule", technique: "Greedy", href: "/practice/greedy-schedule", kind: "code", dimensions: ["transfer", "rebuild"] },
  { number: "05", key: "agocode.progress.transfer.dp-budget", title: "Optimization under a hard budget", technique: "Dynamic programming", href: "/practice/dp-budget", kind: "code", dimensions: ["transfer", "rebuild"] },
  { number: "06", key: "agocode.progress.transfer.knn-classify", title: "Classification from nearby examples", technique: "K-nearest neighbors", href: "/practice/knn-classify", kind: "code", dimensions: ["transfer", "rebuild"] },
  { number: "07", key: "agocode.progress.transfer.recursion-folder-size", title: "Aggregate a nested folder tree", technique: "Recursion", href: "/practice/recursion-folder-size", kind: "code", dimensions: ["transfer", "rebuild"] },
  { number: "08", key: "agocode.progress.transfer.mixed-recognition", title: "No-label mixed recognition", technique: "Interleaved", href: "/practice/mixed", kind: "recognition", dimensions: ["transfer", "predict"], weight: 1.2 },
];

export const progressEvidenceKeys = Array.from(
  new Set([
    ...bookProgressChapters.flatMap((chapter) => chapter.evidence.map((item) => item.key)),
    ...transferProgressItems.map((item) => item.key),
  ]),
);

export const masteryEvidenceItems: readonly ProgressEvidenceItem[] = [
  ...bookProgressChapters.flatMap((chapter) => chapter.evidence),
  ...transferProgressItems,
];
