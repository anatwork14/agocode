import Link from "next/link";
import { TransferCodingChallenge } from "@/components/practice/TransferCodingChallenge";
import type { PythonTestCase } from "@/components/code/PythonExercise";

export const metadata = { title: "Weighted Route Transfer Practice" };

const tests: PythonTestCase[] = [
  {
    label: "cheaper route uses more edges",
    args: [{ start: { express: 8, local: 2 }, express: { finish: 2 }, local: { mid: 2 }, mid: { finish: 2 }, finish: {} }, "start", "finish"],
    expected: 6,
  },
  {
    label: "direct edge can be optimal",
    args: [{ a: { b: 4, c: 10 }, b: { c: 8 }, c: {} }, "a", "c"],
    expected: 10,
  },
  { label: "start equals target", args: [{ a: { b: 3 }, b: {} }, "a", "a"], expected: 0 },
  { label: "zero-weight edge is valid", args: [{ a: { b: 0, z: 9 }, b: { z: 2 }, z: {} }, "a", "z"], expected: 2 },
  { label: "unreachable", args: [{ a: { b: 1 }, b: {}, z: {} }, "a", "z"], expected: -1 },
];

const starterCode = `def cheapest_route(graph, start, target):
    # graph[node] is a dict of neighbor -> non-negative edge cost.
    # Return the minimum total cost, or -1 if target is unreachable.
    pass
`;

export default function DijkstraRoutePracticePage() {
  return (
    <main className="page">
      <div className="site-shell transfer-practice">
        <TransferCodingChallenge
          eyebrow="Transfer · shortest path with non-negative weights"
          title="Find the cheapest courier route."
          problem="Roads between depots charge different non-negative tolls. Return the minimum total toll from start to target. A route with more roads can still be cheaper than a route with fewer roads."
          examples={[
            'Start → Local → Mid → Finish costs 2 + 2 + 2 = 6',
            'Start → Express → Finish costs 8 + 2 = 10',
          ]}
          constraints={["edge costs differ", "weights are non-negative", "minimize accumulated cost"]}
          correctTechnique="dijkstra"
          techniqueOptions={["dijkstra", "bfs", "greedy", "dynamic-programming"]}
          wrongFeedback="Do not optimize the number of edges. The state you must preserve is the cheapest total cost currently known for each node."
          functionName="cheapest_route"
          starterCode={starterCode}
          tests={tests}
          hints={[
            "Keep a best-known cost for every node, with start initialized to 0 and everything else effectively infinity.",
            "Repeatedly choose the unfinished node with the smallest known cost. A simple O(V²) scan is fine for this exercise; you do not need a heap.",
            "For each outgoing edge, test whether current_cost + edge_cost improves the neighbor's best-known cost.",
            "Track processed nodes so a finalized node is not selected again. Return -1 when the target never receives a finite cost.",
          ]}
          successMessage="You transferred Dijkstra from a fixed graph demo to an arbitrary non-negative weighted network."
          storageKey="agocode.progress.transfer.dijkstra-route"
        />
        <div className="action-row">
          <Link className="button" href="/practice/bfs-handoffs">← BFS handoffs</Link>
          <Link className="button" href="/practice">Transfer Track</Link>
          <Link className="button button--primary" href="/practice/greedy-schedule">Next: scheduling →</Link>
        </div>
      </div>
    </main>
  );
}
