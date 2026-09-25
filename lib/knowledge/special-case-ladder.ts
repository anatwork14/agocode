export type SpecialCaseStage = {
  id: string;
  restriction: string;
  algorithm: string;
  complexity: string;
  whyItWorks: string;
  liftedConstraint: string;
  obstruction: string;
  addedMachinery: string;
};

export type SpecialCaseScenario = {
  id: string;
  label: string;
  title: string;
  fullProblem: string;
  question: string;
  stages: SpecialCaseStage[];
  durableInsight: string;
  transferQuestion: string;
};

export const specialCaseScenarios: SpecialCaseScenario[] = [
  {
    id: "shortest-path",
    label: "Graph paths",
    title: "Shortest path grows new machinery as edge assumptions change",
    fullProblem: "Find the minimum-cost path from a source to a target in a graph.",
    question: "Which assumption is currently making the path problem easier than the fully general statement?",
    stages: [
      {
        id: "unweighted",
        restriction: "Every edge has the same cost.",
        algorithm: "Breadth-first search",
        complexity: "O(V + E)",
        whyItWorks: "Layer number equals path length in edges, so the first time a vertex is discovered gives a shortest path.",
        liftedConstraint: "Allow different non-negative edge costs.",
        obstruction: "Fewest edges no longer means cheapest path; queue order is no longer enough to decide which frontier vertex is safest to finalize.",
        addedMachinery: "Track tentative distances and choose the smallest-distance frontier state.",
      },
      {
        id: "nonnegative",
        restriction: "Edge weights may differ, but all are non-negative.",
        algorithm: "Dijkstra's algorithm",
        complexity: "O((V + E) log V) with a heap",
        whyItWorks: "Non-negative edges ensure that once the smallest tentative distance is finalized, a later detour cannot improve it.",
        liftedConstraint: "Allow negative-weight edges.",
        obstruction: "A later path can reduce the cost of a vertex that looked final earlier, so Dijkstra's finalization invariant can fail.",
        addedMachinery: "Use an algorithm that tolerates repeated relaxation, or exploit additional structure such as acyclicity.",
      },
      {
        id: "negative-dag",
        restriction: "Negative weights are allowed, but the directed graph is acyclic.",
        algorithm: "Topological-order dynamic programming",
        complexity: "O(V + E)",
        whyItWorks: "A topological order guarantees every predecessor is settled before a vertex is processed, so each edge needs one forward relaxation.",
        liftedConstraint: "Allow cycles as well as negative edges.",
        obstruction: "There is no topological order, and reachable negative cycles can make the optimum undefined because repeated cycling keeps lowering cost.",
        addedMachinery: "Detect negative cycles and use repeated relaxation when finite shortest paths exist.",
      },
    ],
    durableInsight: "Start with the strongest simplifying assumption you can justify, then name exactly which proof breaks when that assumption is removed.",
    transferQuestion: "If the graph is a tree, which parts of shortest-path machinery become unnecessary even when edges have weights?",
  },
  {
    id: "interval-scheduling",
    label: "Scheduling",
    title: "From trivial order to greedy choice to dynamic programming",
    fullProblem: "Choose a compatible set of time intervals, possibly with different values.",
    question: "Which extra requirement turns a simple scan into an optimization problem?",
    stages: [
      {
        id: "already-compatible",
        restriction: "Intervals are already ordered and guaranteed not to overlap.",
        algorithm: "Single scan",
        complexity: "O(n)",
        whyItWorks: "No conflict decision remains; every interval can be accepted.",
        liftedConstraint: "Intervals may overlap; maximize the number selected.",
        obstruction: "Taking every interval is impossible, so each choice can exclude future candidates.",
        addedMachinery: "Sort by finishing time and use a greedy acceptance rule whose local choice can be justified.",
      },
      {
        id: "unweighted-overlap",
        restriction: "Intervals may overlap, but every accepted interval has equal value.",
        algorithm: "Earliest-finish greedy scheduling",
        complexity: "O(n log n)",
        whyItWorks: "Finishing earliest leaves at least as much room for the remaining intervals as any competing first choice.",
        liftedConstraint: "Give each interval an arbitrary value and maximize total value.",
        obstruction: "The earliest finishing interval can have tiny value, while a longer interval may be worth sacrificing several small ones for.",
        addedMachinery: "Remember the best value for prefixes and compare taking an interval with skipping it.",
      },
      {
        id: "weighted",
        restriction: "Intervals have arbitrary values; objective is maximum total value.",
        algorithm: "Weighted interval scheduling DP",
        complexity: "O(n log n) with predecessor search",
        whyItWorks: "Each interval creates two subproblems: skip it, or take it and combine with the best compatible prefix.",
        liftedConstraint: "Add multiple shared resources or richer compatibility constraints.",
        obstruction: "A one-dimensional prefix state may no longer describe enough of the remaining feasibility conditions.",
        addedMachinery: "Add state dimensions, change the model, or accept that the generalized problem may be substantially harder.",
      },
    ],
    durableInsight: "A small change in the objective can invalidate an otherwise elegant greedy rule. Generalization must preserve the proof, not just the code shape.",
    transferQuestion: "What would change if intervals had deadlines and processing times rather than fixed start/end windows?",
  },
  {
    id: "knapsack",
    label: "Optimization",
    title: "Knapsack changes character when divisibility and scale change",
    fullProblem: "Choose items under a capacity constraint to maximize total value.",
    question: "Which restriction makes a locally best ratio safe, and which restriction makes pseudo-polynomial DP practical?",
    stages: [
      {
        id: "fractional",
        restriction: "Items may be divided into arbitrary fractions.",
        algorithm: "Greedy by value density",
        complexity: "O(n log n)",
        whyItWorks: "Any capacity can be filled with the currently best value-per-weight material without a discrete commitment blocking a better combination.",
        liftedConstraint: "Items become indivisible: each item is either taken or skipped.",
        obstruction: "A locally best density choice can consume capacity needed for a better discrete combination.",
        addedMachinery: "Represent capacity/subset decisions explicitly rather than committing greedily.",
      },
      {
        id: "small-integer-capacity",
        restriction: "Items are 0/1 and capacity is a reasonably small integer.",
        algorithm: "Dynamic programming by capacity",
        complexity: "O(nC)",
        whyItWorks: "The capacity axis is small enough to enumerate subproblems and reuse overlapping results.",
        liftedConstraint: "Capacity becomes extremely large while n stays moderate.",
        obstruction: "O(nC) depends on the numeric capacity, not only input length; the state table can become impractical even though the recurrence remains correct.",
        addedMachinery: "Reconsider backtracking, meet-in-the-middle, integer programming, scaling, or approximation depending on the real constraints.",
      },
      {
        id: "large-capacity",
        restriction: "Exact pseudo-polynomial DP is too large for the available resource budget.",
        algorithm: "Constraint-driven exact or approximate method",
        complexity: "depends on chosen formulation",
        whyItWorks: "The method is selected from n, capacity magnitude, value range, accuracy requirement, and latency budget rather than from the problem name alone.",
        liftedConstraint: "Require exact answers at very large scale with no exploitable structure.",
        obstruction: "The requirement itself may be unrealistic; computational hardness can be the bottleneck rather than implementation quality.",
        addedMachinery: "Negotiate approximation, exploit application-specific structure, or use stronger optimization machinery.",
      },
    ],
    durableInsight: "Parameter magnitude is part of the problem. An algorithm that is polynomial in a numeric capacity can still be unusable when that capacity is enormous.",
    transferQuestion: "If item values were small integers but weights were huge, which alternative DP state might become attractive?",
  },
  {
    id: "connectivity",
    label: "Connectivity",
    title: "Tree assumptions remove ambiguity that general graphs must manage",
    fullProblem: "Answer connectivity and path questions over a network.",
    question: "What disappears when the network is guaranteed to be a tree?",
    stages: [
      {
        id: "tree-static",
        restriction: "The graph is a connected tree and does not change.",
        algorithm: "DFS/BFS with parent tracking",
        complexity: "O(V) per full traversal",
        whyItWorks: "There is exactly one simple path between any two vertices, and there are no cycles to create alternative routes.",
        liftedConstraint: "Allow arbitrary undirected cycles and disconnected components.",
        obstruction: "A traversal can revisit vertices through different edges, and not every vertex belongs to the same component.",
        addedMachinery: "Maintain visited state and reason explicitly about components and cycles.",
      },
      {
        id: "general-static",
        restriction: "The graph is arbitrary but static; many connectivity queries may be asked.",
        algorithm: "Precompute components or traverse on demand",
        complexity: "O(V + E) preprocessing for components",
        whyItWorks: "Static structure lets us pay once to label connected components and answer later membership queries cheaply.",
        liftedConstraint: "Edges are inserted over time and queries are interleaved with updates.",
        obstruction: "A static component labeling becomes stale after every merge.",
        addedMachinery: "Use a dynamic connectivity representation such as disjoint-set union for insertion-only connectivity.",
      },
      {
        id: "incremental",
        restriction: "Connectivity changes only by edge insertion; no deletions.",
        algorithm: "Disjoint-set union (union-find)",
        complexity: "near-constant amortized operations",
        whyItWorks: "Connectivity classes only merge, so a compact representative structure can maintain the partition incrementally.",
        liftedConstraint: "Allow arbitrary edge deletions too.",
        obstruction: "Removing one edge can split a component, something union-find cannot undo locally from its compressed representation.",
        addedMachinery: "Use more advanced dynamic graph techniques or rebuild strategically based on workload constraints.",
      },
    ],
    durableInsight: "A representation is often powerful because an update model is restricted. Before reusing it, ask which operations the original proof never had to support.",
    transferQuestion: "If queries asked for the minimum-cost connection rather than mere connectivity, which additional structure would become relevant?",
  },
];

export function getSpecialCaseScenario(id: string) {
  return specialCaseScenarios.find((scenario) => scenario.id === id);
}
