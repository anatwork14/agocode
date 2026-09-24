import { PythonExercise, type PythonTestCase } from "@/components/code/PythonExercise";

const tests: PythonTestCase[] = [
  { label: "empty array", args: [[]], expected: [] },
  { label: "single value", args: [[7]], expected: [7] },
  { label: "book-sized example", args: [[10, 5, 2, 3]], expected: [2, 3, 5, 10] },
  { label: "duplicates", args: [[4, 1, 4, 2, 4]], expected: [1, 2, 4, 4, 4] },
  { label: "negative values", args: [[3, -1, 8, -5, 0]], expected: [-5, -1, 0, 3, 8] },
];

const starterCode = `def quicksort(nums):
    # Base case + pivot + two smaller recursive sorts.
    pass
`;

const hints = [
  "Which arrays are already sorted without doing any work?",
  "Choose one pivot, then build two smaller lists from the remaining values.",
  "The recursive calls should sort the values on each side of the pivot independently.",
  "One valid shape: len(nums) < 2 → nums; otherwise choose a pivot, recurse on values <= pivot and > pivot, then concatenate left + [pivot] + right.",
];

export function QuicksortRebuild() {
  return (
    <PythonExercise
      id="quicksort-rebuild"
      title="Write Quicksort from the divide-and-conquer structure."
      description="Start from the base case and reduction, not from memorized syntax. The implementation should make two smaller sorting problems and combine their results around a pivot."
      functionName="quicksort"
      starterCode={starterCode}
      tests={tests}
      hints={hints}
      successMessage="You rebuilt Quicksort from its recursive partition structure."
      storageKey="agocode.progress.quicksort.rebuild"
    />
  );
}
