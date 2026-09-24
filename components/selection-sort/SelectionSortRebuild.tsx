import { PythonExercise, type PythonTestCase } from "@/components/code/PythonExercise";

const tests: PythonTestCase[] = [
  { label: "sorts the reference values", args: [[5, 3, 6, 2, 10]], expected: [2, 3, 5, 6, 10] },
  { label: "handles duplicate values", args: [[4, 2, 4, 1, 2]], expected: [1, 2, 2, 4, 4] },
  { label: "handles negative values", args: [[0, -3, 7, -1]], expected: [-3, -1, 0, 7] },
  { label: "handles one value", args: [[8]], expected: [8] },
  { label: "handles an empty list", args: [[]], expected: [] },
];

const starterCode = `def selection_sort(values):
    # Repeatedly find the smallest remaining value
    # and append it to a new output list.
    pass
`;

const hints = [
  "Keep a working copy if you do not want to mutate the caller's list.",
  "Each pass needs the index of the smallest remaining value.",
  "After finding that index, remove exactly that value and append it to the output.",
  "Repeat until the working list is empty, then return the output list.",
];

export function SelectionSortRebuild() {
  return (
    <PythonExercise
      id="selection-sort-rebuild"
      title="Rebuild the repeated-selection idea in Python."
      description="Do not optimize it into a different sorting algorithm. The goal is to make the chapter's mechanism explicit: scan for one smallest value, move it, repeat."
      functionName="selection_sort"
      starterCode={starterCode}
      tests={tests}
      hints={hints}
      successMessage="You rebuilt Selection Sort and preserved its repeated minimum-selection mechanism."
      storageKey="agocode.progress.selection-sort.rebuild"
    />
  );
}
