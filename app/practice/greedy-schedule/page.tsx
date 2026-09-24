import Link from "next/link";
import { TransferCodingChallenge } from "@/components/practice/TransferCodingChallenge";
import type { PythonTestCase } from "@/components/code/PythonExercise";

export const metadata = { title: "Scheduling Transfer Practice" };

const tests: PythonTestCase[] = [
  { label: "classic overlapping schedule", args: [[[9, 10], [9.5, 11], [10, 11], [10.5, 12], [11, 12]]], expected: 3 },
  { label: "touching sessions are compatible", args: [[[1, 2], [2, 3], [3, 4]]], expected: 3 },
  { label: "one long interval loses to several short ones", args: [[[0, 10], [0, 2], [2, 4], [4, 6], [6, 8]]], expected: 4 },
  { label: "empty input", args: [[]], expected: 0 },
  { label: "unsorted input", args: [[[5, 6], [1, 2], [3, 5], [2, 3]]], expected: 4 },
];

const starterCode = `def max_sessions(intervals):
    # Each interval is [start, end].
    # Return the maximum number of non-overlapping sessions.
    pass
`;

export default function GreedySchedulePracticePage() {
  return (
    <main className="page">
      <div className="site-shell transfer-practice">
        <TransferCodingChallenge
          eyebrow="Transfer · local choice with a proof-friendly ordering"
          title="Fit the most sessions into one studio."
          problem="A recording studio receives requested time intervals. Choose the maximum number of sessions that do not overlap. A session may start exactly when the previous one ends."
          examples={[
            '[[0,10],[0,2],[2,4],[4,6],[6,8]] → 4',
            '[[1,2],[2,3],[3,4]] → 3',
          ]}
          constraints={["one room", "maximize count", "intervals arrive unsorted"]}
          correctTechnique="greedy"
          techniqueOptions={["greedy", "dynamic-programming", "binary-search", "hash-membership"]}
          wrongFeedback="Look for a local choice that preserves the largest possible future opportunity. Starting earliest or choosing shortest duration does not guarantee that property."
          functionName="max_sessions"
          starterCode={starterCode}
          tests={tests}
          hints={[
            "Sort intervals by the quantity that determines how much room remains for all future choices.",
            "The key is finish time: among available compatible sessions, finishing earliest leaves at least as much future room as any later-finishing choice.",
            "Scan the finish-sorted intervals once. Accept an interval when its start is greater than or equal to the end of the last accepted interval.",
          ]}
          successMessage="You transferred the greedy earliest-finish rule to a new interval-scheduling context."
          storageKey="agocode.progress.transfer.greedy-schedule"
        />
        <div className="action-row">
          <Link className="button" href="/practice/dijkstra-route">← Weighted route</Link>
          <Link className="button" href="/practice">Transfer Track</Link>
          <Link className="button button--primary" href="/practice/dp-budget">Next: constrained optimization →</Link>
        </div>
      </div>
    </main>
  );
}
