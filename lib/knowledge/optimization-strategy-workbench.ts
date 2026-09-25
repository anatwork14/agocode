export type OptimizationRequirement = "exact" | "guaranteed" | "best-effort";
export type OptimizationScale = "tiny" | "moderate" | "large";
export type StrategyClass = "exact" | "approximation" | "heuristic";

export type OptimizationStrategy = {
  id: string;
  label: string;
  class: StrategyClass;
  complexity: string;
  guarantee: string;
  practicalThrough: OptimizationScale;
  requires: string[];
  strength: string;
  limitation: string;
};

export type OptimizationScenario = {
  id: string;
  label: string;
  problem: string;
  objective: string;
  hardnessNote: string;
  smallOracle: string;
  stressCase: string;
  strategies: OptimizationStrategy[];
  transferQuestion: string;
};

const scaleRank: Record<OptimizationScale, number> = { tiny: 0, moderate: 1, large: 2 };

export const optimizationScenarios: OptimizationScenario[] = [
  {
    id: "set-cover",
    label: "Set cover",
    problem: "Choose as few available sets as possible so every required element is covered.",
    objective: "Minimize number (or cost) of selected sets while covering the universe.",
    hardnessNote: "General set cover is NP-hard. Large instances should trigger a requirement conversation rather than an assumption that a clever exact polynomial-time implementation must exist.",
    smallOracle: "Enumerate all subsets of the available sets and keep the cheapest covering subset. Use this only on tiny fixtures as a correctness oracle.",
    stressCase: "Construct overlapping sets where the largest immediate coverage choice leads to a different selection from the exact optimum.",
    strategies: [
      {
        id: "enumerate",
        label: "Enumerate set subsets",
        class: "exact",
        complexity: "O(2^m · check)",
        guarantee: "Optimal when allowed to finish.",
        practicalThrough: "tiny",
        requires: ["Small number m of candidate sets"],
        strength: "Simple exact oracle; excellent for validating other methods on tiny instances.",
        limitation: "Exponential growth makes it unsuitable as the primary method once m grows.",
      },
      {
        id: "integer-program",
        label: "Integer-programming formulation",
        class: "exact",
        complexity: "Exponential worst case; solver-dependent in practice",
        guarantee: "Can certify an optimum when the solver completes with proof.",
        practicalThrough: "moderate",
        requires: ["Optimization solver", "Problem size/latency compatible with exact search"],
        strength: "Expresses weighted constraints directly and delegates sophisticated branch-and-bound/cuts to a solver.",
        limitation: "No polynomial-time guarantee for general instances; runtime can vary sharply with structure.",
      },
      {
        id: "greedy",
        label: "Greedy uncovered-elements-per-cost",
        class: "approximation",
        complexity: "Polynomial; implementation-dependent",
        guarantee: "Logarithmic approximation bound for standard set cover.",
        practicalThrough: "large",
        requires: ["Standard set-cover objective", "Approximation acceptable"],
        strength: "Fast, explainable, and comes with a worst-case quality bound rather than only empirical hope.",
        limitation: "It can still be meaningfully worse than the optimum; the bound is not a promise of near-perfect output on every instance.",
      },
      {
        id: "local-search",
        label: "Local-search heuristic",
        class: "heuristic",
        complexity: "Budget-controlled",
        guarantee: "No general optimality guarantee in this simple form.",
        practicalThrough: "large",
        requires: ["A useful neighborhood definition", "A time/iteration budget"],
        strength: "Can exploit application-specific structure and improve a fast initial cover.",
        limitation: "Stopping at a locally stable solution does not prove global quality.",
      },
    ],
    transferQuestion: "If every element appears in at most two sets, does the problem gain structure that should change your strategy search?",
  },
  {
    id: "vertex-cover",
    label: "Vertex cover",
    problem: "Choose vertices so every graph edge has at least one selected endpoint.",
    objective: "Minimize the number (or weight) of selected vertices.",
    hardnessNote: "Minimum vertex cover is NP-hard on general graphs, but important special graph classes admit polynomial exact algorithms.",
    smallOracle: "Enumerate vertex subsets in increasing size and stop at the first subset covering every edge.",
    stressCase: "Use a star, path, triangle, and dense graph to compare greedy-looking choices against exact size.",
    strategies: [
      {
        id: "enumerate",
        label: "Enumerate vertex subsets",
        class: "exact",
        complexity: "O(2^V · E)",
        guarantee: "Optimal when completed.",
        practicalThrough: "tiny",
        requires: ["Tiny graph"],
        strength: "Direct exact oracle and easy to reason about.",
        limitation: "Exponential in the number of vertices.",
      },
      {
        id: "branch-bound",
        label: "Branch and bound / parameterized search",
        class: "exact",
        complexity: "Exponential worst case; often prunable",
        guarantee: "Optimal when search completes.",
        practicalThrough: "moderate",
        requires: ["Useful bounds or small target cover k"],
        strength: "Can exploit a small solution parameter or strong bounds instead of enumerating all subsets blindly.",
        limitation: "Worst-case hardness remains; a difficult instance can defeat pruning.",
      },
      {
        id: "matching-2approx",
        label: "Maximal-matching 2-approximation",
        class: "approximation",
        complexity: "O(V + E)",
        guarantee: "Cover size at most 2× optimum for unweighted vertex cover.",
        practicalThrough: "large",
        requires: ["Unweighted standard vertex cover", "Factor-2 guarantee acceptable"],
        strength: "Very simple, linear-time, and quality is certified relative to optimum.",
        limitation: "A factor of two can be too loose when every selected vertex is expensive.",
      },
      {
        id: "degree-greedy",
        label: "Highest-degree-first heuristic",
        class: "heuristic",
        complexity: "Polynomial",
        guarantee: "No fixed factor promised by this simple rule.",
        practicalThrough: "large",
        requires: ["Fast best-effort answer"],
        strength: "Intuitive and easy to implement; can be a useful starting solution.",
        limitation: "High local coverage can make globally poor commitments on adversarial graphs.",
      },
    ],
    transferQuestion: "What changes when the input graph is known to be bipartite?",
  },
  {
    id: "metric-tsp",
    label: "Metric TSP",
    problem: "Visit every location once and return to the start while minimizing total route length.",
    objective: "Minimum Hamiltonian tour under distances that satisfy the triangle inequality.",
    hardnessNote: "Even metric TSP remains NP-hard, but the metric assumption enables approximation guarantees that are impossible to claim for arbitrary distances.",
    smallOracle: "Enumerate permutations after fixing one start location; compare total tour lengths for tiny n.",
    stressCase: "Compare clustered points with one distant point and instances where nearest-neighbor makes an early commitment that creates an expensive closing edge.",
    strategies: [
      {
        id: "held-karp",
        label: "Held–Karp subset dynamic programming",
        class: "exact",
        complexity: "O(n² · 2^n)",
        guarantee: "Optimal.",
        practicalThrough: "tiny",
        requires: ["Small n", "Enough memory for subset states"],
        strength: "Much better than n! enumeration while remaining exact.",
        limitation: "Still exponential and memory-heavy.",
      },
      {
        id: "solver",
        label: "Exact branch-and-cut solver",
        class: "exact",
        complexity: "Exponential worst case; solver/instance-dependent",
        guarantee: "Can certify optimum when completed.",
        practicalThrough: "moderate",
        requires: ["Solver", "Latency compatible with exact optimization"],
        strength: "Production-grade solvers can exploit powerful cuts and bounds on structured instances.",
        limitation: "Exact runtime is not predictable from n alone and can become unacceptable.",
      },
      {
        id: "double-tree",
        label: "MST double-tree approximation",
        class: "approximation",
        complexity: "O(E log V) plus traversal",
        guarantee: "At most 2× optimum for metric TSP.",
        practicalThrough: "large",
        requires: ["Triangle inequality / metric distances"],
        strength: "Connects spanning-tree lower-bound reasoning to a certified tour quickly.",
        limitation: "The guarantee depends on the metric assumption and is looser than stronger metric-TSP approximations.",
      },
      {
        id: "nearest-neighbor",
        label: "Nearest-neighbor heuristic",
        class: "heuristic",
        complexity: "O(n²) in a straightforward implementation",
        guarantee: "No constant-factor guarantee for arbitrary metric instances from this rule alone.",
        practicalThrough: "large",
        requires: ["Very fast initial tour", "Best-effort quality acceptable"],
        strength: "Simple and useful as a seed for improvement heuristics such as local edge exchanges.",
        limitation: "A locally attractive next city can force a costly final connection.",
      },
    ],
    transferQuestion: "Which guarantee disappears if the distance matrix does not satisfy the triangle inequality?",
  },
  {
    id: "knapsack",
    label: "0/1 knapsack",
    problem: "Choose indivisible items under a weight capacity to maximize total value.",
    objective: "Maximum value with total weight at most C.",
    hardnessNote: "0/1 knapsack is NP-hard, yet pseudo-polynomial dynamic programming is excellent when the numeric capacity is manageable.",
    smallOracle: "Enumerate every item subset and keep the feasible subset with maximum value.",
    stressCase: "Use items where the highest value/weight item blocks a better pair, then increase capacity magnitude without changing item count.",
    strategies: [
      {
        id: "capacity-dp",
        label: "Dynamic programming by capacity",
        class: "exact",
        complexity: "O(nC)",
        guarantee: "Optimal.",
        practicalThrough: "moderate",
        requires: ["Integer capacity C small enough for the state table"],
        strength: "Reuses overlapping subproblems and is often extremely effective despite NP-hardness of the general problem.",
        limitation: "Pseudo-polynomial cost can explode when C is numerically huge.",
      },
      {
        id: "meet-middle",
        label: "Meet in the middle",
        class: "exact",
        complexity: "Roughly O(2^(n/2)) states plus sorting/search",
        guarantee: "Optimal.",
        practicalThrough: "moderate",
        requires: ["Moderate n", "Capacity dimension too large for O(nC) DP"],
        strength: "Trades the capacity dimension for exponential dependence on half the item count.",
        limitation: "Still exponential as n grows.",
      },
      {
        id: "scaled-dp",
        label: "Scaled-value approximation scheme",
        class: "approximation",
        complexity: "Polynomial in n and chosen accuracy after scaling",
        guarantee: "Tunable approximation quality under the standard scheme assumptions.",
        practicalThrough: "large",
        requires: ["Approximation acceptable", "Non-negative values/weights in the standard setting"],
        strength: "Makes the time–quality trade-off explicit instead of silently using an unbounded heuristic.",
        limitation: "Implementation and constants are more involved than a simple greedy rule, and approximation must be part of the product contract.",
      },
      {
        id: "density-greedy",
        label: "Value-density greedy",
        class: "heuristic",
        complexity: "O(n log n)",
        guarantee: "Not exact for 0/1 knapsack; naive density-only selection can be arbitrarily misleading without additional safeguards.",
        practicalThrough: "large",
        requires: ["Fast candidate solution", "No exactness requirement"],
        strength: "Cheap, intuitive, and useful as an initial bound/candidate in larger search systems.",
        limitation: "The fractional-knapsack proof does not transfer to indivisible items.",
      },
    ],
    transferQuestion: "If item values are small integers but capacity is enormous, can you define a DP state over total value instead of total weight?",
  },
];

export function strategyFits(
  strategy: OptimizationStrategy,
  requirement: OptimizationRequirement,
  scale: OptimizationScale,
) {
  const scaleFits = scaleRank[scale] <= scaleRank[strategy.practicalThrough];
  const guaranteeFits = requirement === "best-effort"
    || (requirement === "guaranteed" && (strategy.class === "exact" || strategy.class === "approximation"))
    || (requirement === "exact" && strategy.class === "exact");

  return { scaleFits, guaranteeFits, fits: scaleFits && guaranteeFits };
}

export function getOptimizationScenario(id: string) {
  return optimizationScenarios.find((scenario) => scenario.id === id);
}
