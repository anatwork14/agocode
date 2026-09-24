import { PythonExercise, type PythonTestCase } from "@/components/code/PythonExercise";

const tests: PythonTestCase[] = [
  { label: "three-item teaching case", args: [[[1, 1500], [4, 3000], [3, 2000]], 4], expected: 3500 },
  { label: "single item fits", args: [[[2, 9]], 2], expected: 9 },
  { label: "single item too heavy", args: [[[3, 9]], 2], expected: 0 },
  { label: "combination beats one expensive item", args: [[[2, 6], [2, 7], [4, 12]], 4], expected: 13 },
  { label: "unused capacity can still be optimal", args: [[[3, 100], [2, 40]], 4], expected: 100 },
];

const starterCode = `def knapsack(items, capacity):
    # items is a list of [weight, value] pairs.
    # Return the maximum total value for a 0/1 knapsack.
    pass
`;

const hints = [
  "Make a grid with one row per item and capacities from 0 through capacity. A leading zero row makes the recurrence easier.",
  "For each cell, first carry the value from the row above: the best solution that does not use the current item.",
  "If the item fits, compare that carried value with item_value + the previous row at capacity - item_weight.",
  "Store the larger value. The answer is the final row at the requested capacity.",
];

export function KnapsackRebuild() {
  return (
    <PythonExercise
      id="knapsack-rebuild"
      title="Rebuild 0/1 knapsack from the cell recurrence."
      description="Do not memorize a finished program. Recover the grid from one invariant: every cell stores the best value achievable with the items seen so far and that capacity."
      functionName="knapsack"
      starterCode={starterCode}
      tests={tests}
      hints={hints}
      successMessage="You rebuilt the dynamic-programming recurrence from subproblems rather than copying syntax."
      storageKey="agocode.progress.dynamic-programming.knapsack-rebuild"
    />
  );
}
