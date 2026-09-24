import Link from "next/link";
import { TransferCodingChallenge } from "@/components/practice/TransferCodingChallenge";
import type { PythonTestCase } from "@/components/code/PythonExercise";

export const metadata = { title: "Recursion Transfer Practice" };

const tests: PythonTestCase[] = [
  {
    label: "nested folders combine child totals",
    args: [{ files: [120, 30], folders: [{ files: [50], folders: [] }, { files: [10], folders: [{ files: [5, 5], folders: [] }] }] }],
    expected: 220,
  },
  { label: "empty folder", args: [{ files: [], folders: [] }], expected: 0 },
  { label: "files only", args: [{ files: [4, 7, 9], folders: [] }], expected: 20 },
  {
    label: "deep single branch",
    args: [{ files: [1], folders: [{ files: [2], folders: [{ files: [3], folders: [{ files: [4], folders: [] }] }] }] }],
    expected: 10,
  },
  {
    label: "multiple sibling subtrees",
    args: [{ files: [], folders: [{ files: [8, 2], folders: [] }, { files: [6], folders: [] }, { files: [], folders: [{ files: [9], folders: [] }] }] }],
    expected: 25,
  },
];

const starterCode = `def total_bytes(folder):
    # folder has two keys: "files" (list of byte sizes)
    # and "folders" (list of child folder objects).
    # Return the total bytes under this folder at any depth.
    pass
`;

export default function RecursionFolderSizePracticePage() {
  return (
    <main className="page">
      <div className="site-shell transfer-practice">
        <TransferCodingChallenge
          eyebrow="Transfer · self-similar nested structure"
          title="Compute the size of a folder tree."
          problem="A folder contains direct file sizes and zero or more child folders. Child folders have exactly the same structure and nesting can continue to arbitrary depth. Return the total bytes stored anywhere under the root folder."
          examples={[
            '{ files: [10], folders: [] } → 10',
            'root 1 byte + child 2 bytes + grandchild 3 bytes → 6',
          ]}
          constraints={["arbitrary nesting", "every child repeats the same shape", "combine returned child totals"]}
          correctTechnique="recursion"
          techniqueOptions={["recursion", "bfs", "dynamic-programming", "hash-membership"]}
          wrongFeedback="An explicit stack traversal would also work, but the clearest Book Track mental model is that every child folder is the same smaller problem. Define the stopping case, then combine child results."
          functionName="total_bytes"
          starterCode={starterCode}
          tests={tests}
          hints={[
            "Start with the bytes in folder['files'].",
            "The base case is naturally a folder with no child folders: its total is just the sum of its direct files.",
            "For every child in folder['folders'], call total_bytes(child) and add the returned value.",
            "Each recursive call receives a strictly smaller subtree, so the structure eventually bottoms out at leaf folders.",
          ]}
          successMessage="You transferred recursion from numeric examples to a real self-similar tree structure and combined returned child state correctly."
          storageKey="agocode.progress.transfer.recursion-folder-size"
        />
        <div className="action-row">
          <Link className="button" href="/practice/knn-classify">← KNN transfer</Link>
          <Link className="button" href="/practice">Transfer Track</Link>
          <Link className="button button--primary" href="/practice/mixed">Finish with no-label mixed recognition →</Link>
        </div>
      </div>
    </main>
  );
}
