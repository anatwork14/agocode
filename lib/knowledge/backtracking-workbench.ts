export type BacktrackingScenario = {
  id: string;
  label: string;
  values: number[];
  target: number;
  story: string;
};

export type PruningRuleId = "none" | "overshoot" | "bound";

export const backtrackingScenarios: BacktrackingScenario[] = [
  {
    id: "subset-8",
    label: "Subset target 8",
    values: [3, 5, 6, 7],
    target: 8,
    story: "Choose a subset whose values sum exactly to 8.",
  },
  {
    id: "subset-14",
    label: "Subset target 14",
    values: [2, 4, 5, 9],
    target: 14,
    story: "Choose a subset whose values sum exactly to 14.",
  },
];

export const pruningRules = [
  { id: "none", label: "No pruning", description: "Explore both include/exclude branches until every leaf or solution is reached." },
  { id: "overshoot", label: "Prune overshoot", description: "If all values are non-negative, stop a branch as soon as the running sum exceeds the target." },
  { id: "bound", label: "Overshoot + remaining bound", description: "Also stop when even taking every remaining value cannot reach the target." },
] as const;

export type BacktrackingAnalysis = {
  rule: PruningRuleId;
  visitedNodes: number;
  leaves: number;
  prunedBranches: number;
  solutions: number[][];
  pruneReasons: Record<string, number>;
};

export function analyzeSubsetBacktracking(
  scenario: BacktrackingScenario,
  rule: PruningRuleId,
): BacktrackingAnalysis {
  let visitedNodes = 0;
  let leaves = 0;
  let prunedBranches = 0;
  const solutions: number[][] = [];
  const pruneReasons: Record<string, number> = { overshoot: 0, "cannot-reach": 0 };

  const suffixSum = new Array(scenario.values.length + 1).fill(0);
  for (let index = scenario.values.length - 1; index >= 0; index -= 1) {
    suffixSum[index] = suffixSum[index + 1] + scenario.values[index];
  }

  function visit(index: number, sum: number, chosen: number[]) {
    visitedNodes += 1;
    if (sum === scenario.target) {
      leaves += 1;
      solutions.push([...chosen]);
      return;
    }
    if (index >= scenario.values.length) {
      leaves += 1;
      return;
    }

    if (rule !== "none" && sum > scenario.target) {
      prunedBranches += 1;
      pruneReasons.overshoot += 1;
      return;
    }
    if (rule === "bound" && sum + suffixSum[index] < scenario.target) {
      prunedBranches += 1;
      pruneReasons["cannot-reach"] += 1;
      return;
    }

    const value = scenario.values[index];
    visit(index + 1, sum + value, [...chosen, value]);
    visit(index + 1, sum, chosen);
  }

  visit(0, 0, []);
  return { rule, visitedNodes, leaves, prunedBranches, solutions, pruneReasons };
}

export function isSafePruningClaim(claim: "sum-exceeds" | "current-smaller" | "remaining-insufficient") {
  return claim === "sum-exceeds" || claim === "remaining-insufficient";
}
