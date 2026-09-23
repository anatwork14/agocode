"use client";

import { useState } from "react";
import { PythonExercise, type PythonTestCase } from "@/components/code/PythonExercise";

const tests: PythonTestCase[] = [
  { label: "finds a value after the pivot", args: [[4, 5, 6, 7, 0, 1, 2], 0], expected: 4 },
  { label: "returns None when absent", args: [[4, 5, 6, 7, 0, 1, 2], 3], expected: null },
  { label: "handles one item", args: [[1], 1], expected: 0 },
  { label: "finds a value before the pivot", args: [[5, 1, 3], 5], expected: 0 },
  { label: "finds the final value", args: [[3, 4, 5, 1, 2], 2], expected: 4 },
];

const starterCode = `def search_rotated(nums, target):
    # nums was increasing, then rotated at an unknown pivot.
    # Keep O(log n) worst-case time for distinct values.
    pass
`;

const hints = [
  "At a midpoint, the whole array may not be sorted anymore, but ask whether at least one side still is.",
  "Compare nums[low], nums[mid], and nums[high] to identify the sorted half.",
  "Once you know which half is sorted, test whether target lies inside that half's value range.",
  "If nums[low] <= nums[mid], the left half is sorted; otherwise the right half is sorted. Discard the half whose sorted range cannot contain target.",
];

const hypotheses = [
  { id: "linear", label: "Scan every value until the target appears." },
  { id: "resort", label: "Sort the array again, then use ordinary binary search." },
  { id: "sorted-half", label: "Use the midpoint and identify which side is still sorted." },
  { id: "hash", label: "Build a value → index hash map first." },
] as const;

export function RotatedArrayTransferPractice() {
  const [hypothesis, setHypothesis] = useState<string | null>(null);
  const correct = hypothesis === "sorted-half";

  return (
    <div className="transfer-practice">
      <section className="transfer-problem" aria-labelledby="rotated-problem-title">
        <div className="eyebrow">Transfer 03 · pattern hidden</div>
        <h2 id="rotated-problem-title">Search an ordered sequence after its pivot moved.</h2>
        <p>
          An increasing array of distinct integers was rotated at an unknown pivot. Find the target index, or return
          <code className="mono"> None</code>. Your solution should keep worst-case time near
          <code className="mono"> O(log n)</code>.
        </p>
        <div className="example-strip mono" aria-label="Example">
          <span>nums = [4, 5, 6, 7, 0, 1, 2]</span>
          <span>target = 0</span>
          <strong>answer = 4</strong>
        </div>
      </section>

      <section className="hypothesis-gate">
        <div className="hypothesis-gate__heading">
          <div>
            <strong>Record your first structural observation before coding.</strong>
            <p>Which fact gives you the strongest route toward the requested complexity?</p>
          </div>
          {hypothesis ? <span className="mono">hypothesis recorded</span> : null}
        </div>
        <div className="prediction-options">
          {hypotheses.map((option) => (
            <button
              type="button"
              key={option.id}
              className={`prediction-option ${hypothesis === option.id ? (correct ? "prediction-option--correct" : "prediction-option--wrong") : ""}`}
              onClick={() => setHypothesis(option.id)}
              disabled={correct}
            >
              {option.label}
            </button>
          ))}
        </div>
        {hypothesis ? (
          <p className={`prediction-feedback ${correct ? "prediction-feedback--correct" : ""}`} aria-live="polite">
            {correct
              ? "That is the key invariant. Rotation breaks global sorted order, but for distinct values one side of mid is still sorted, so its value range can tell you whether that side is safe to keep or discard."
              : "That approach can find the answer, but it either misses the requested logarithmic goal or throws away useful structure. Look again at the two halves around a midpoint and ask what remains ordered."}
          </p>
        ) : null}
      </section>

      {correct ? (
        <PythonExercise
          id="binary-search-transfer-rotated"
          title="Exploit the half that is still sorted."
          description="This is no longer the exact implementation from the lesson. Preserve the deeper idea: one comparison should justify discarding a region."
          functionName="search_rotated"
          starterCode={starterCode}
          tests={tests}
          hints={hints}
          successMessage="You recognized and adapted the discard-region idea in a less obvious search problem."
          storageKey="agocode.progress.binary-search.transfer-03"
        />
      ) : (
        <div className="transfer-locked">Find the structural observation that supports logarithmic search to unlock the editor.</div>
      )}
    </div>
  );
}
