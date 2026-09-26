import type { StuckStateId } from "./stuck-router.ts";

export type DiagnosticPatternLink = {
  id: string;
  label: string;
};

export const diagnosticPatterns: Record<StuckStateId, readonly DiagnosticPatternLink[]> = {
  model: [
    { id: "representations", label: "Sequence representation" },
    { id: "graph-traversal", label: "Graph traversal & structure" },
    { id: "engineering-design", label: "Algorithm engineering & design" },
  ],
  baseline: [
    { id: "sorting-transform", label: "Sorting as transformation" },
    { id: "hashing", label: "Hashing & keyed lookup" },
    { id: "dynamic-programming", label: "Dynamic programming" },
  ],
  representation: [
    { id: "representations", label: "Sequence representation" },
    { id: "linear-adts", label: "Stack / queue / deque" },
    { id: "heap-priority", label: "Heap & priority queue" },
  ],
  correctness: [
    { id: "analysis-correctness", label: "Analysis & correctness" },
    { id: "search-selection", label: "Search & selection" },
  ],
  greedy: [
    { id: "greedy-approximation", label: "Greedy & approximation" },
    { id: "hard-optimization", label: "Hard optimization" },
  ],
  "dp-state": [
    { id: "dynamic-programming", label: "Dynamic programming" },
    { id: "recursive-search", label: "Recursion & backtracking" },
  ],
  "graph-model": [
    { id: "graph-traversal", label: "Graph traversal & structure" },
    { id: "weighted-graphs", label: "Weighted paths & connectivity" },
  ],
  complexity: [
    { id: "hard-optimization", label: "Hard optimization" },
    { id: "engineering-design", label: "Algorithm engineering & design" },
    { id: "analysis-correctness", label: "Analysis & correctness" },
  ],
  debugging: [
    { id: "analysis-correctness", label: "Analysis & correctness" },
    { id: "search-selection", label: "Search & selection" },
  ],
  transfer: [
    { id: "search-selection", label: "Search & selection" },
    { id: "graph-traversal", label: "Graph traversal & structure" },
    { id: "dynamic-programming", label: "Dynamic programming" },
  ],
};
