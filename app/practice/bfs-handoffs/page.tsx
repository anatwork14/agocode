import Link from "next/link";
import { TransferCodingChallenge } from "@/components/practice/TransferCodingChallenge";
import type { PythonTestCase } from "@/components/code/PythonExercise";

export const metadata = { title: "Fewest Handoffs Transfer Practice" };

const tests: PythonTestCase[] = [
  {
    label: "two handoffs",
    args: [{ A: ["B", "C"], B: ["D"], C: ["E"], D: ["Z"], E: ["Z"], Z: [] }, "A", "Z"],
    expected: 3,
  },
  { label: "start equals target", args: [{ A: ["B"], B: [] }, "A", "A"], expected: 0 },
  { label: "direct connection", args: [{ A: ["Z", "B"], B: ["Z"], Z: [] }, "A", "Z"], expected: 1 },
  { label: "cycle does not loop forever", args: [{ A: ["B"], B: ["A", "C"], C: ["Z"], Z: [] }, "A", "Z"], expected: 3 },
  { label: "unreachable", args: [{ A: ["B"], B: [], Z: [] }, "A", "Z"], expected: -1 },
];

const starterCode = `def min_handoffs(graph, start, target):
    # graph maps each node to its direct neighbors.
    # Return the minimum number of edges, or -1 if unreachable.
    pass
`;

export default function BfsHandoffsPracticePage() {
  return (
    <main className="page">
      <div className="site-shell transfer-practice">
        <TransferCodingChallenge
          eyebrow="Transfer · shortest path without weights"
          title="Minimize package handoffs."
          problem="A logistics network connects warehouses with direct handoff links. Every handoff costs exactly one step. Return the minimum number of handoffs needed to move a package from start to target, even when the network contains cycles."
          examples={[
            'A → B → D → Z gives 3 handoffs',
            'if Z is directly connected to A, the answer is 1',
          ]}
          constraints={["all edges have equal cost", "cycles may exist", "fewest edges is the objective"]}
          correctTechnique="bfs"
          techniqueOptions={["bfs", "dijkstra", "recursion", "dynamic-programming"]}
          wrongFeedback="Ask what quantity defines “shortest.” Every edge costs exactly one, so the search should preserve layer order rather than accumulate different path weights."
          functionName="min_handoffs"
          starterCode={starterCode}
          tests={tests}
          hints={[
            "Store both the node and its distance from start in a FIFO queue.",
            "Mark a node discovered when you enqueue it so cycles cannot add it repeatedly.",
            "The first time target is dequeued or discovered, its distance is minimal because BFS processes layers in order.",
          ]}
          successMessage="You transferred BFS from a graph picture to a shortest-handoff problem and preserved the FIFO layer invariant."
          storageKey="agocode.progress.transfer.bfs-handoffs"
        />
        <div className="action-row">
          <Link className="button" href="/practice/hash-membership">← Hash membership</Link>
          <Link className="button" href="/practice">Transfer Track</Link>
          <Link className="button button--primary" href="/practice/dijkstra-route">Next: weighted route →</Link>
        </div>
      </div>
    </main>
  );
}
