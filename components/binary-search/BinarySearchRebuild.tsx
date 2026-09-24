import { PythonExercise, type PythonTestCase } from "@/components/code/PythonExercise";

const tests: PythonTestCase[] = [
  { label: "finds a middle value", args: [[1, 3, 5, 7, 9], 5], expected: 2 },
  { label: "returns None when missing", args: [[1, 3, 5, 7, 9], 4], expected: null },
  { label: "finds the first boundary", args: [[2, 6, 10, 14], 2], expected: 0 },
  { label: "handles one item", args: [[42], 42], expected: 0 },
  { label: "handles an empty array", args: [[], 9], expected: null },
];

const guidedStarterCode = `def binary_search(nums, target):
    # Rebuild the algorithm from the invariant:
    # if target exists, it must stay inside the candidate interval.
    pass
`;

const blankStarterCode = `def binary_search(nums, target):
    pass
`;

const hints = [
  "Track two boundaries for the current candidate interval.",
  "Continue while that interval still contains at least one candidate.",
  "Compare the midpoint value with target. One comparison should safely discard one side.",
  "With inclusive low/high boundaries: too high → high = mid - 1; too low → low = mid + 1.",
];

type BinarySearchRebuildProps = {
  mode?: "guided" | "blank";
};

export function BinarySearchRebuild({ mode = "guided" }: BinarySearchRebuildProps) {
  const blank = mode === "blank";

  return (
    <PythonExercise
      id={blank ? "binary-search-rebuild-blank" : "binary-search-rebuild"}
      title={
        blank
          ? "Rebuild binary search from only the function signature."
          : "Write binary search again without copying the trace."
      }
      description={
        blank
          ? "No invariant reminder is embedded in the editor. Recover the interval, loop condition, midpoint, and both discard rules from memory."
          : "Keep the finished implementation above out of view if you can. The goal is to reconstruct the invariant, not reproduce formatting."
      }
      functionName="binary_search"
      starterCode={blank ? blankStarterCode : guidedStarterCode}
      tests={tests}
      hints={hints}
      successMessage={
        blank
          ? "You rebuilt the core algorithm from a blank implementation surface."
          : "You rebuilt the core algorithm against edge cases."
      }
      storageKey={
        blank
          ? "agocode.progress.binary-search.rebuild-blank"
          : "agocode.progress.binary-search.rebuild"
      }
    />
  );
}
