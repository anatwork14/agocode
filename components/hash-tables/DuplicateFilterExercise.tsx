import { PythonExercise, type PythonTestCase } from "@/components/code/PythonExercise";

const tests: PythonTestCase[] = [
  { label: "finds first repeated name", args: [["Lan", "Minh", "An", "Lan", "Khoa"]], expected: "Lan" },
  { label: "returns None when every key is new", args: [["A", "B", "C"]], expected: null },
  { label: "handles immediate duplicate", args: [["x", "x", "y"]], expected: "x" },
  { label: "empty input", args: [[]], expected: null },
];

const starterCode = `def first_duplicate(items):
    # Return the first item that has already appeared.
    # Return None when all items are unique.
    pass
`;

const hints = [
  "You need fast membership: have I seen this key before?",
  "Keep a hash-backed collection named seen.",
  "For each item: check membership first; if it is new, store it before continuing.",
  "A Python set is enough when you only care whether the key exists; a dict would also work.",
];

export function DuplicateFilterExercise() {
  return (
    <PythonExercise
      id="hash-table-first-duplicate"
      title="Use hash-backed membership to catch the first duplicate."
      description="The point is not to implement a hash table. Use the language's built-in hash-backed structure to turn repeated searching into direct membership checks."
      functionName="first_duplicate"
      starterCode={starterCode}
      tests={tests}
      hints={hints}
      successMessage="You used a hash-backed collection for duplicate detection instead of repeatedly scanning earlier items."
      storageKey="agocode.progress.hash-tables.duplicate-filter"
    />
  );
}
