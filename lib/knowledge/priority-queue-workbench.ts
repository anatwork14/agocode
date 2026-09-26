export type PriorityQueueOperationId = "insert" | "peek" | "extract" | "update";
export type PriorityQueueRepresentationId = "unsorted-list" | "sorted-list" | "binary-heap";

export type PriorityQueueWorkload = Record<PriorityQueueOperationId, number>;

type CostClass = "constant" | "log" | "linear";

export type PriorityQueueRepresentation = {
  id: PriorityQueueRepresentationId;
  label: string;
  representation: string;
  costs: Record<PriorityQueueOperationId, CostClass>;
  invariant: string;
  caveat: string;
};

export const priorityQueueOperations = [
  { id: "insert", label: "Insert", question: "How often does a new priority enter the queue?" },
  { id: "peek", label: "Peek best", question: "How often do we inspect the best item without removing it?" },
  { id: "extract", label: "Extract best", question: "How often must the highest-priority item leave?" },
  { id: "update", label: "Priority update", question: "How often does an existing item's priority change?" },
] as const;

export const priorityQueueRepresentations: PriorityQueueRepresentation[] = [
  {
    id: "unsorted-list",
    label: "Unsorted list",
    representation: "Append cheaply; search for the best item only when it is requested.",
    costs: { insert: "constant", peek: "linear", extract: "linear", update: "linear" },
    invariant: "No global order is maintained.",
    caveat: "Excellent when inserts dominate and best-item queries are rare; poor when extraction is frequent.",
  },
  {
    id: "sorted-list",
    label: "Sorted list",
    representation: "Pay during insertion to keep priorities globally ordered.",
    costs: { insert: "linear", peek: "constant", extract: "constant", update: "linear" },
    invariant: "The list remains ordered by priority after every mutation.",
    caveat: "Useful when reads/extractions dominate and insertions are rare, but maintaining full order can be unnecessary work.",
  },
  {
    id: "binary-heap",
    label: "Binary heap",
    representation: "Maintain only enough partial order for the root to remain the best item.",
    costs: { insert: "log", peek: "constant", extract: "log", update: "log" },
    invariant: "Every parent is at least as high-priority as its children (or the min-heap analogue).",
    caveat: "A heap does not make arbitrary search cheap; its strength is repeated best-item access under ongoing updates.",
  },
];

export const defaultPriorityQueueWorkload: PriorityQueueWorkload = {
  insert: 6,
  peek: 2,
  extract: 6,
  update: 3,
};

export const priorityQueueCostLabels: Record<CostClass, string> = {
  constant: "O(1)",
  log: "O(log n)",
  linear: "O(n)",
};

function modeledCost(cost: CostClass, n: number) {
  if (cost === "constant") return 1;
  if (cost === "log") return Math.max(1, Math.log2(Math.max(2, n)));
  return Math.max(1, n);
}

export function evaluatePriorityQueues(workload: PriorityQueueWorkload, n: number) {
  const safeN = Math.max(2, n);
  const scored = priorityQueueRepresentations.map((representation) => {
    const score = priorityQueueOperations.reduce((sum, operation) => (
      sum + Math.max(0, workload[operation.id] ?? 0) * modeledCost(representation.costs[operation.id], safeN)
    ), 0);
    return { ...representation, score };
  }).sort((a, b) => a.score - b.score || a.label.localeCompare(b.label));
  const max = Math.max(1, ...scored.map((item) => item.score));
  return scored.map((item) => ({ ...item, normalizedScore: item.score / max }));
}
