import { PythonExercise, type PythonTestCase } from "@/components/code/PythonExercise";

const tests: PythonTestCase[] = [
  { label: "empty list", args: [[]], expected: 0 },
  { label: "single value", args: [[7]], expected: 7 },
  { label: "several values", args: [[2, 4, 6, 8]], expected: 20 },
  { label: "mixed signs", args: [[5, -2, 9, -4]], expected: 8 },
];

const starterCode = `def recursive_sum(nums):
    # Use divide and conquer: solve a smaller list with the same function.
    pass
`;

const hints = [
  "First choose an input whose answer is known immediately.",
  "Every recursive call should receive a strictly shorter list.",
  "Keep the first value in the current frame, and ask the recursive call for the sum of the rest.",
  "One valid shape is: empty list → 0; otherwise nums[0] + recursive_sum(nums[1:]).",
];

export function RecursiveSumRebuild() {
  return (
    <PythonExercise
      id="recursive-sum-rebuild"
      title="Rebuild a divide-and-conquer sum from the two D&C questions."
      description="Do not start from syntax. Decide the simplest case, then decide how one call reduces the problem before asking the same function to finish it."
      functionName="recursive_sum"
      starterCode={starterCode}
      tests={tests}
      hints={hints}
      successMessage="You reduced the problem to a smaller instance and let the return path combine the answers."
      storageKey="agocode.progress.divide-conquer.sum-rebuild"
    />
  );
}
