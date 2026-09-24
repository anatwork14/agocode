import Link from "next/link";
import { TransferCodingChallenge } from "@/components/practice/TransferCodingChallenge";
import type { PythonTestCase } from "@/components/code/PythonExercise";

export const metadata = { title: "First Repeat Transfer Practice" };

const tests: PythonTestCase[] = [
  { label: "first second-appearance wins", args: [["A", "B", "C", "B", "A"]], expected: "B" },
  { label: "immediate repeat", args: [["X", "X", "Y"]], expected: "X" },
  { label: "no repeat", args: [["A", "B", "C"]], expected: null },
  { label: "empty stream", args: [[]], expected: null },
  { label: "numbers are valid keys", args: [[4, 7, 9, 7, 4]], expected: 7 },
];

const starterCode = `def first_repeat(ids):
    # Return the first value whose second appearance is encountered.
    # Return None when every value is unique.
    pass
`;

export default function HashMembershipPracticePage() {
  return (
    <main className="page">
      <div className="site-shell transfer-practice">
        <TransferCodingChallenge
          eyebrow="Transfer · membership under encounter order"
          title="Which badge repeats first?"
          problem="Badge IDs arrive in encounter order. Return the first ID whose second occurrence you encounter. The stream may contain millions of IDs, so repeatedly rescanning the prefix is too expensive."
          examples={[
            '["A", "B", "C", "B", "A"] → "B"',
            '["X", "Y", "Z"] → None',
          ]}
          constraints={["preserve encounter order", "one pass is desirable", "fast membership matters"]}
          correctTechnique="hash-membership"
          techniqueOptions={["hash-membership", "binary-search", "bfs", "greedy"]}
          wrongFeedback="Focus on the operation repeated for every incoming ID. You need to ask “have I seen this exact key before?” without losing stream order."
          functionName="first_repeat"
          starterCode={starterCode}
          tests={tests}
          hints={[
            "Keep a collection containing every ID already encountered.",
            "Before adding the current ID, test whether it is already in that collection.",
            "A Python set gives average-case direct membership checks while preserving the original stream traversal order.",
          ]}
          successMessage="You transferred hash-table membership from key lookup to streaming duplicate detection."
          storageKey="agocode.progress.transfer.hash-membership"
        />
        <div className="action-row">
          <Link className="button" href="/practice">← Transfer Track</Link>
          <Link className="button button--primary" href="/practice/bfs-handoffs">Next: shortest unweighted path →</Link>
        </div>
      </div>
    </main>
  );
}
