import { PythonExercise, type PythonTestCase } from "@/components/code/PythonExercise";

const tests: PythonTestCase[] = [
  {
    label: "chapter-style weighted graph",
    args: [
      { start: { a: 6, b: 2 }, a: { fin: 1 }, b: { a: 3, fin: 5 }, fin: {} },
      "start",
      "fin",
    ],
    expected: [6, ["start", "b", "a", "fin"]],
  },
  {
    label: "direct route is cheapest",
    args: [
      { start: { a: 4, fin: 2 }, a: { fin: 1 }, fin: {} },
      "start",
      "fin",
    ],
    expected: [2, ["start", "fin"]],
  },
  {
    label: "zero-weight edge is allowed",
    args: [
      { start: { a: 0, fin: 5 }, a: { fin: 1 }, fin: {} },
      "start",
      "fin",
    ],
    expected: [1, ["start", "a", "fin"]],
  },
  {
    label: "start is target",
    args: [{ start: {} }, "start", "start"],
    expected: [0, ["start"]],
  },
];

const starterCode = `def dijkstra(graph, start, target):
    # Return [minimum_cost, path].
    # Assume every edge weight is >= 0.
    pass
`;

const hints = [
  "Create a cost table initialized to infinity, except cost[start] = 0. Also create a parent table and a processed set.",
  "Repeatedly choose the unprocessed node with the smallest current cost. A simple loop over costs is enough for this exercise.",
  "For each neighbor, compute new_cost = costs[node] + edge_weight. If it improves the neighbor, update both cost and parent.",
  "After processing all reachable nodes, follow parent pointers backward from target to start, reverse that list, and return [costs[target], path].",
];

export function DijkstraRebuild() {
  return (
    <PythonExercise
      id="dijkstra-rebuild"
      title="Rebuild Dijkstra from the cost-table invariant."
      description="Use three kinds of state from the chapter: the weighted graph, the best-known cost/parent for each node, and the set of nodes whose minimum cost has already been finalized."
      functionName="dijkstra"
      starterCode={starterCode}
      tests={tests}
      hints={hints}
      successMessage="You rebuilt the cheapest-node → relax-neighbors → finalize → reconstruct-path loop."
      storageKey="agocode.progress.dijkstra.rebuild"
    />
  );
}
