import { PythonExercise, type PythonTestCase } from "@/components/code/PythonExercise";

const tests: PythonTestCase[] = [
  { label: "base case", args: [1], expected: 1 },
  { label: "small recursive case", args: [3], expected: 6 },
  { label: "larger recursive case", args: [5], expected: 120 },
  { label: "another value", args: [6], expected: 720 },
];

const starterCode = `def factorial(n):
    # Use one base case and one recursive case.
    pass
`;

const hints = [
  "Choose the smallest valid input whose answer you know immediately.",
  "The recursive case must move n closer to the base case.",
  "Keep the current n while asking factorial(n - 1) for the smaller result.",
  "For positive integers: base case n == 1; recursive case n * factorial(n - 1).",
];

export function FactorialRebuild() {
  return (
    <PythonExercise
      id="factorial-rebuild"
      title="Write factorial from the base case and recursive case."
      description="The goal is not to memorize two lines. Reconstruct why each call gets smaller and why the suspended n values can be multiplied during stack unwinding."
      functionName="factorial"
      starterCode={starterCode}
      tests={tests}
      hints={hints}
      successMessage="You rebuilt a recursive function whose progress and stopping condition are both explicit."
      storageKey="agocode.progress.recursion.factorial-rebuild"
    />
  );
}
