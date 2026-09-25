export type ComplexityClass = "constant" | "log" | "linear" | "amortized-constant";

export type AdtOperation = {
  id: string;
  label: string;
  question: string;
};

export type AdtImplementation = {
  id: string;
  label: string;
  representation: string;
  notes: string;
  costs: Record<string, ComplexityClass>;
  caveat?: string;
};

export type AdtScenario = {
  id: string;
  label: string;
  contract: string;
  designQuestion: string;
  operations: AdtOperation[];
  implementations: AdtImplementation[];
};

export type WorkloadWeights = Record<string, number>;

export type EvaluatedImplementation = AdtImplementation & {
  score: number;
  normalizedScore: number;
  weightedBreakdown: { operationId: string; weight: number; estimatedCost: number; contribution: number }[];
};

export const complexityLabels: Record<ComplexityClass, string> = {
  constant: "O(1)",
  log: "O(log n)",
  linear: "O(n)",
  "amortized-constant": "O(1) amortized",
};

export const adtScenarios: AdtScenario[] = [
  {
    id: "sequence",
    label: "Sequence",
    contract: "Maintain an ordered collection whose elements have positions.",
    designQuestion: "Does the workload care more about random access or structural edits at known positions?",
    operations: [
      { id: "index", label: "Access by index", question: "How often do we jump directly to position i?" },
      { id: "append", label: "Append at end", question: "How often do we grow the sequence at its tail?" },
      { id: "middle-edit", label: "Insert/delete in middle", question: "How often do we edit a known interior position?" },
      { id: "scan", label: "Sequential scan", question: "How often do we traverse the whole sequence?" },
    ],
    implementations: [
      {
        id: "dynamic-array",
        label: "Dynamic array",
        representation: "Contiguous references with occasional resizing.",
        notes: "Excellent indexed access and locality; interior edits shift later elements.",
        costs: { index: "constant", append: "amortized-constant", "middle-edit": "linear", scan: "linear" },
        caveat: "A single resize can be linear even though a long append sequence is amortized constant per append.",
      },
      {
        id: "singly-linked",
        label: "Singly linked list",
        representation: "Nodes connected by next references.",
        notes: "Edits are cheap once the predecessor is known; locating an index requires link hopping.",
        costs: { index: "linear", append: "linear", "middle-edit": "constant", scan: "linear" },
        caveat: "The O(1) middle edit assumes the relevant node/predecessor position is already known; searching for it is separate work.",
      },
      {
        id: "doubly-linked",
        label: "Doubly linked positional list",
        representation: "Nodes carry previous/next links and stable positions.",
        notes: "Supports constant-time edits at known positions in both directions, at the cost of extra links and weaker locality.",
        costs: { index: "linear", append: "constant", "middle-edit": "constant", scan: "linear" },
        caveat: "Random access remains linear; position handles matter to the contract.",
      },
    ],
  },
  {
    id: "queue",
    label: "Queue",
    contract: "Enqueue at the back and dequeue from the front in FIFO order.",
    designQuestion: "Which representation preserves FIFO while avoiding unnecessary movement or storage overhead?",
    operations: [
      { id: "enqueue", label: "Enqueue", question: "How often do items enter?" },
      { id: "dequeue", label: "Dequeue", question: "How often do items leave?" },
      { id: "front", label: "Inspect front", question: "How often do we peek without removing?" },
      { id: "iterate", label: "Iterate all", question: "How often is the full queue scanned?" },
    ],
    implementations: [
      {
        id: "shift-array",
        label: "Naive array with front shifts",
        representation: "Contiguous array; dequeue removes index 0 and shifts the remainder.",
        notes: "Simple, but deleting the front repeatedly performs avoidable movement.",
        costs: { enqueue: "amortized-constant", dequeue: "linear", front: "constant", iterate: "linear" },
      },
      {
        id: "circular-array",
        label: "Circular array",
        representation: "Array plus front index and modular wraparound.",
        notes: "Reuses freed cells and keeps both ends cheap without shifting every dequeue.",
        costs: { enqueue: "amortized-constant", dequeue: "constant", front: "constant", iterate: "linear" },
        caveat: "Resizing can still be linear occasionally; the enqueue bound is amortized.",
      },
      {
        id: "linked-queue",
        label: "Linked queue",
        representation: "Linked nodes with head and tail references.",
        notes: "Both endpoint updates are constant time, with one node allocation per element.",
        costs: { enqueue: "constant", dequeue: "constant", front: "constant", iterate: "linear" },
      },
    ],
  },
  {
    id: "priority-queue",
    label: "Priority queue",
    contract: "Insert keyed items and repeatedly expose/remove the minimum-priority item.",
    designQuestion: "Should we pay to keep everything ordered during insertion, or maintain only enough order to find the next minimum?",
    operations: [
      { id: "insert", label: "Insert", question: "How frequently do priorities enter?" },
      { id: "min", label: "Find minimum", question: "How often do we only inspect the minimum?" },
      { id: "remove-min", label: "Remove minimum", question: "How often do we consume the next priority?" },
      { id: "bulk-scan", label: "Scan all items", question: "How often do we need the whole collection?" },
    ],
    implementations: [
      {
        id: "unsorted-list-pq",
        label: "Unsorted list",
        representation: "Append entries without maintaining order.",
        notes: "Cheap inserts, but finding the minimum scans the collection.",
        costs: { insert: "constant", min: "linear", "remove-min": "linear", "bulk-scan": "linear" },
      },
      {
        id: "sorted-list-pq",
        label: "Sorted list",
        representation: "Keep entries sorted by priority.",
        notes: "The minimum is immediately available, but maintaining order makes insertion expensive.",
        costs: { insert: "linear", min: "constant", "remove-min": "constant", "bulk-scan": "linear" },
      },
      {
        id: "binary-heap-pq",
        label: "Binary heap",
        representation: "Complete binary tree stored compactly in an array.",
        notes: "Maintains partial order: enough to expose the minimum while updates touch only a root-to-leaf path.",
        costs: { insert: "log", min: "constant", "remove-min": "log", "bulk-scan": "linear" },
      },
    ],
  },
  {
    id: "map",
    label: "Map / dictionary",
    contract: "Associate unique keys with values and support keyed lookup/update/delete.",
    designQuestion: "Do we only need exact keyed access, or do ordered/range queries matter too?",
    operations: [
      { id: "lookup", label: "Exact lookup", question: "How often do we query a known key?" },
      { id: "update", label: "Insert/update", question: "How often do keys change?" },
      { id: "delete", label: "Delete", question: "How often are keys removed?" },
      { id: "ordered", label: "Ordered/range query", question: "How often do we need keys in sorted/range order?" },
    ],
    implementations: [
      {
        id: "unsorted-map",
        label: "Unsorted table",
        representation: "Store key/value entries without an index.",
        notes: "Minimal machinery; keyed operations scan until a match is found.",
        costs: { lookup: "linear", update: "linear", delete: "linear", ordered: "linear" },
      },
      {
        id: "hash-map",
        label: "Hash table",
        representation: "Hash keys into buckets and resolve collisions.",
        notes: "Excellent expected exact access when hashing/distribution/load are healthy; does not maintain key order.",
        costs: { lookup: "constant", update: "constant", delete: "constant", ordered: "linear" },
        caveat: "The O(1) keyed costs are expected/average, not a worst-case guarantee; collisions and resizing matter.",
      },
      {
        id: "balanced-search-tree-map",
        label: "Balanced search tree",
        representation: "Maintain keys in balanced search-tree order.",
        notes: "Pays logarithmic keyed operations in exchange for ordered traversal and range structure.",
        costs: { lookup: "log", update: "log", delete: "log", ordered: "log" },
        caveat: "Producing k range results still costs output-sensitive work beyond locating the boundary.",
      },
    ],
  },
];

function estimateCost(complexity: ComplexityClass, n: number) {
  const size = Math.max(2, n);
  switch (complexity) {
    case "constant": return 1;
    case "amortized-constant": return 1.35;
    case "log": return Math.log2(size);
    case "linear": return size;
  }
}

export function evaluateImplementations(
  scenario: AdtScenario,
  weights: WorkloadWeights,
  n: number,
): EvaluatedImplementation[] {
  const raw = scenario.implementations.map((implementation) => {
    const weightedBreakdown = scenario.operations.map((operation) => {
      const weight = Math.max(0, weights[operation.id] ?? 0);
      const estimatedCost = estimateCost(implementation.costs[operation.id], n);
      return { operationId: operation.id, weight, estimatedCost, contribution: weight * estimatedCost };
    });
    const score = weightedBreakdown.reduce((sum, item) => sum + item.contribution, 0);
    return { ...implementation, score, weightedBreakdown };
  });

  const maxScore = Math.max(1, ...raw.map((item) => item.score));
  return raw
    .map((item) => ({ ...item, normalizedScore: item.score / maxScore }))
    .sort((a, b) => a.score - b.score || a.label.localeCompare(b.label));
}

export function defaultWorkload(scenario: AdtScenario): WorkloadWeights {
  return Object.fromEntries(scenario.operations.map((operation) => [operation.id, 5]));
}
