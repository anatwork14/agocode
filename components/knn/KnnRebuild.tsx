import { PythonExercise, type PythonTestCase } from "@/components/code/PythonExercise";

const tests: PythonTestCase[] = [
  {
    label: "majority among three nearest",
    args: [
      [[1, 1], [2, 1], [8, 8], [9, 8]],
      ["orange", "orange", "grapefruit", "grapefruit"],
      [2.2, 1.4],
      3,
    ],
    expected: "orange",
  },
  {
    label: "far cluster wins near its region",
    args: [
      [[1, 1], [2, 1], [8, 8], [9, 8], [8, 9]],
      ["orange", "orange", "grapefruit", "grapefruit", "grapefruit"],
      [8.4, 8.3],
      3,
    ],
    expected: "grapefruit",
  },
  {
    label: "one nearest neighbor",
    args: [
      [[0, 0], [10, 10], [9, 9]],
      ["a", "b", "b"],
      [1, 1],
      1,
    ],
    expected: "a",
  },
  {
    label: "three dimensions use the same distance idea",
    args: [
      [[4, 1, 4], [1, 5, 1], [5, 1, 5], [2, 4, 2]],
      ["similar", "different", "similar", "different"],
      [4, 2, 5],
      3,
    ],
    expected: "similar",
  },
];

const starterCode = `def knn_classify(points, labels, target, k):
    # points[i] has labels[i].
    # Return the majority label among the k closest points.
    pass
`;

const hints = [
  "For each point, compute Euclidean distance to target: square each coordinate difference, add them, then take the square root (or compare squared distances).",
  "Pair each distance with its label, sort by distance, and keep only the first k pairs.",
  "Count the labels among those k neighbors. A dictionary works well for the vote table.",
  "Return the label with the largest vote count. The supplied tests avoid tied majorities, so you can focus on the core KNN loop.",
];

export function KnnRebuild() {
  return (
    <PythonExercise
      id="knn-classify-rebuild"
      title="Rebuild KNN classification from distance → neighbors → vote."
      description="Recover the algorithm from its three conceptual stages: represent examples as feature vectors, measure their distance to the unknown example, then let the k closest labels vote."
      functionName="knn_classify"
      starterCode={starterCode}
      tests={tests}
      hints={hints}
      successMessage="You rebuilt KNN from the feature-space model rather than memorizing an implementation."
      storageKey="agocode.progress.knn.rebuild"
    />
  );
}
