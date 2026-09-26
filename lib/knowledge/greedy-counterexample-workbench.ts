export type GreedyRule = {
  id: string;
  label: string;
  rationale: string;
  valid: boolean;
};

export type GreedyCounterexampleScenario = {
  id: string;
  label: string;
  objective: string;
  instance: string;
  rules: GreedyRule[];
  counterexample: string;
  proofBoundary: string;
};

export const greedyCounterexampleScenarios: GreedyCounterexampleScenario[] = [
  {
    id: "interval-scheduling",
    label: "Interval scheduling",
    objective: "Select the maximum number of pairwise non-overlapping intervals.",
    instance: "Intervals: [1,4], [3,5], [0,6], [5,7], [5,9], [8,9].",
    rules: [
      { id: "earliest-finish", label: "Choose the compatible interval that finishes earliest", rationale: "It leaves the largest remaining suffix for future choices.", valid: true },
      { id: "shortest-duration", label: "Choose the shortest compatible interval", rationale: "Short duration sounds space-efficient, but duration alone ignores where the interval sits.", valid: false },
      { id: "earliest-start", label: "Choose the earliest-starting compatible interval", rationale: "Starting early can occupy a long prefix and block several later choices.", valid: false },
    ],
    counterexample: "A short interval can sit in the middle and block two compatible intervals on either side; earliest-start can choose one very long interval that blocks many short ones.",
    proofBoundary: "Earliest finish has an exchange argument: replace the first interval in any optimal schedule with the earliest-finishing compatible interval without reducing the number that can follow.",
  },
  {
    id: "coin-change",
    label: "Coin change",
    objective: "Use the fewest coins to make an exact amount.",
    instance: "Coins {1, 3, 4}, amount 6.",
    rules: [
      { id: "largest-coin", label: "Always take the largest coin that still fits", rationale: "It minimizes the remaining amount locally.", valid: false },
      { id: "dynamic-state", label: "Do not claim a universal greedy rule; solve overlapping subamounts", rationale: "This coin system lacks the structure needed for the obvious local rule to be globally safe.", valid: true },
    ],
    counterexample: "Largest-first chooses 4 + 1 + 1 = 3 coins, while 3 + 3 = 2 coins.",
    proofBoundary: "Greedy coin change needs a property of the denomination system; a local decrease in remaining amount is not itself a correctness proof.",
  },
  {
    id: "zero-one-knapsack",
    label: "0/1 knapsack",
    objective: "Maximize value under a capacity when each item is indivisible.",
    instance: "Capacity 50; items (value, weight): (60,10), (100,20), (120,30).",
    rules: [
      { id: "ratio", label: "Take the highest value/weight ratio first", rationale: "This is correct for fractional knapsack, but indivisibility changes the feasible exchange structure.", valid: false },
      { id: "highest-value", label: "Take the highest-value item first", rationale: "A single attractive item can prevent a better combination.", valid: false },
      { id: "state-search", label: "Use capacity/item state rather than a local irreversible rule", rationale: "The include/exclude dependency is the important structure here.", valid: true },
    ],
    counterexample: "Ratio-first takes items 60 and 100 for value 160, but items 100 and 120 fit exactly and give value 220.",
    proofBoundary: "A rule that is correct after allowing fractions does not transfer automatically to the 0/1 constraint. Always test which assumption the proof uses.",
  },
];

export function evaluateGreedyRule(scenarioId: string, ruleId: string) {
  const scenario = greedyCounterexampleScenarios.find((item) => item.id === scenarioId);
  if (!scenario) return null;
  const rule = scenario.rules.find((item) => item.id === ruleId);
  if (!rule) return null;
  return {
    scenario,
    rule,
    valid: rule.valid,
    explanation: rule.valid ? scenario.proofBoundary : scenario.counterexample,
  };
}
