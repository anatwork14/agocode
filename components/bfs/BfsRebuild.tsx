import { PythonExercise, type PythonTestCase } from "@/components/code/PythonExercise";

const tests: PythonTestCase[] = [
  {
    label: "finds the fewest-edge path",
    args: [
      { A: ["B", "C"], B: ["D"], C: ["E"], D: ["F"], E: ["F"], F: [] },
      "A",
      "F",
    ],
    expected: ["A", "B", "D", "F"],
  },
  {
    label: "returns the start when start equals target",
    args: [{ A: ["B"], B: [] }, "A", "A"],
    expected: ["A"],
  },
  {
    label: "handles a cycle without looping forever",
    args: [{ A: ["B"], B: ["C"], C: ["A", "D"], D: [] }, "A", "D"],
    expected: ["A", "B", "C", "D"],
  },
  {
    label: "returns None when target is unreachable",
    args: [{ A: ["B"], B: [], C: [] }, "A", "C"],
    expected: null,
  },
];

const starterCode = `def shortest_path(graph, start, target):
    # Return a list of nodes on a shortest unweighted path.
    # Return None if target is unreachable.
    pass
`;

const hints = [
  "The search frontier must preserve discovery order, so use a FIFO queue.",
  "A queue item can carry both the current node and the path used to reach it.",
  "Keep a set of discovered/visited nodes so cycles do not add the same work forever.",
  "With collections.deque: enqueue (start, [start]); popleft; when a neighbor is new, enqueue (neighbor, path + [neighbor]).",
];

export function BfsRebuild() {
  return (
    <PythonExercise
      id="bfs-shortest-path-rebuild"
      title="Rebuild breadth-first shortest-path search."
      description="Keep the level-order guarantee visible in your code: FIFO queue order is what makes the first discovered target path use the fewest edges."
      functionName="shortest_path"
      starterCode={starterCode}
      tests={tests}
      hints={hints}
      successMessage="You rebuilt BFS with FIFO order, visited-state protection, and shortest-path reconstruction."
      storageKey="agocode.progress.bfs.rebuild"
    />
  );
}
