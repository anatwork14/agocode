import Link from "next/link";
import { TransferCodingChallenge } from "@/components/practice/TransferCodingChallenge";
import type { PythonTestCase } from "@/components/code/PythonExercise";

export const metadata = { title: "KNN Transfer Practice" };

const tests: PythonTestCase[] = [
  {
    label: "nearby citrus majority",
    args: [
      [
        [[2.8, 3.2], "orange"],
        [[3.4, 3.0], "orange"],
        [[4.2, 3.8], "orange"],
        [[7.2, 6.9], "grapefruit"],
        [[7.8, 7.4], "grapefruit"],
      ],
      [4.0, 3.7],
      3,
    ],
    expected: "orange",
  },
  {
    label: "three-dimensional neighborhood",
    args: [
      [
        [[1, 1, 1], "A"],
        [[1, 2, 1], "A"],
        [[2, 1, 2], "A"],
        [[8, 8, 8], "B"],
        [[9, 8, 9], "B"],
      ],
      [1.5, 1.5, 1.2],
      3,
    ],
    expected: "A",
  },
  {
    label: "k equals one",
    args: [
      [
        [[0, 0], "left"],
        [[10, 10], "right"],
      ],
      [9, 9],
      1,
    ],
    expected: "right",
  },
  {
    label: "exact feature match dominates nearby group",
    args: [
      [
        [[5, 5], "red"],
        [[5.2, 5.1], "red"],
        [[4.8, 5.1], "red"],
        [[1, 1], "blue"],
      ],
      [5, 5],
      3,
    ],
    expected: "red",
  },
  {
    label: "local majority can beat globally common class",
    args: [
      [
        [[1.0, 1.0], "near"],
        [[1.1, 1.2], "near"],
        [[1.3, 1.0], "far"],
        [[8, 8], "far"],
        [[9, 9], "far"],
        [[10, 10], "far"],
      ],
      [1.0, 1.1],
      3,
    ],
    expected: "near",
  },
];

const starterCode = `def classify_knn(samples, target, k):
    # Each sample is [feature_vector, label].
    # All tests have a strict majority among the k nearest samples.
    # Return the winning label.
    pass
`;

export default function KnnTransferPracticePage() {
  return (
    <main className="page">
      <div className="site-shell transfer-practice">
        <TransferCodingChallenge
          eyebrow="Transfer · similarity instead of exact rules"
          title="Classify a new plant from nearby examples."
          problem="A plant is represented by numeric measurements such as height, leaf width, and petal length. You have labeled examples and need to predict the species of one new plant. Similar examples should have similar labels, and the decision should come from the k closest feature vectors."
          examples={[
            'nearby labels [A, A, B] → A',
            'k = 1 → inherit the single nearest label',
          ]}
          constraints={["numeric feature vectors", "labeled examples", "local similarity drives the prediction"]}
          correctTechnique="knn"
          techniqueOptions={["knn", "hash-membership", "bfs", "dynamic-programming"]}
          wrongFeedback="The task is not asking for an exact key lookup, a shortest graph path, or an optimum over reusable subproblems. The output should come from similarity to labeled examples in feature space."
          functionName="classify_knn"
          starterCode={starterCode}
          tests={tests}
          hints={[
            "For each sample, compute a distance from its feature vector to target. Squared Euclidean distance is enough because square root does not change the ordering.",
            "Sort or otherwise select the k samples with the smallest distances.",
            "Count the labels among those k neighbors and return the label with the largest vote count.",
            "Do not vote using every sample: KNN is local, so only the selected neighborhood should contribute.",
          ]}
          successMessage="You transferred KNN from the chapter's visual feature space into a generic feature-vector classifier."
          storageKey="agocode.progress.transfer.knn-classify"
        />
        <div className="action-row">
          <Link className="button" href="/practice/dp-budget">← Dynamic programming transfer</Link>
          <Link className="button" href="/practice">Transfer Track</Link>
          <Link className="button button--primary" href="/practice/recursion-folder-size">Next: nested recursive structure →</Link>
        </div>
      </div>
    </main>
  );
}
