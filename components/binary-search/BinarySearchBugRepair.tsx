import { PythonExercise, type PythonTestCase } from "@/components/code/PythonExercise";

const tests: PythonTestCase[] = [
  { label: "still finds an interior target", args: [[1, 3, 5, 7, 9], 5], expected: 2 },
  { label: "finds the left boundary", args: [[2, 6, 10, 14], 2], expected: 0 },
  { label: "finds the right boundary", args: [[2, 6, 10, 14], 14], expected: 3 },
  { label: "handles one candidate", args: [[42], 42], expected: 0 },
  { label: "still returns None when missing", args: [[1, 3, 5, 7, 9], 4], expected: null },
];

const starterCode = `def binary_search(nums, target):
    low = 0
    high = len(nums) - 1

    while low < high:
        mid = (low + high) // 2
        guess = nums[mid]

        if guess == target:
            return mid
        if guess > target:
            high = mid - 1
        else:
            low = mid + 1

    return None
`;

const hints = [
  "The implementation succeeds when the target is found before the candidate interval shrinks to one item.",
  "Ask whether an inclusive interval with low == high is empty or still contains one candidate.",
  "The bug is in the loop condition, not the midpoint formula or branch updates.",
  "For inclusive low/high bounds, the loop must continue while low <= high.",
];

export function BinarySearchBugRepair() {
  return (
    <PythonExercise
      id="binary-search-bug-repair"
      title="Repair the boundary bug without rewriting the whole function."
      description="The implementation looks plausible and passes an interior case, but it silently skips the final candidate. Use the failing edge cases to locate the broken invariant."
      functionName="binary_search"
      starterCode={starterCode}
      tests={tests}
      hints={hints}
      successMessage="You repaired an off-by-one loop condition by reasoning about the candidate interval."
      storageKey="agocode.progress.binary-search.bug-repair"
    />
  );
}
