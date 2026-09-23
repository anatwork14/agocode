"use client";

import { useState } from "react";
import { PythonExercise, type PythonTestCase } from "@/components/code/PythonExercise";

const tests: PythonTestCase[] = [
  { label: "target already exists", args: [[1, 3, 5, 6], 5], expected: 2 },
  { label: "inserts in the middle", args: [[1, 3, 5, 6], 2], expected: 1 },
  { label: "inserts after all values", args: [[1, 3, 5, 6], 7], expected: 4 },
  { label: "inserts before all values", args: [[1, 3, 5, 6], 0], expected: 0 },
  { label: "handles an empty array", args: [[], 8], expected: 0 },
];

const starterCode = `def search_insert(nums, target):
    # Return target's index if found.
    # Otherwise return the index where target should be inserted.
    pass
`;

const hints = [
  "The input is sorted, and the answer is a position. Ask whether one comparison can eliminate many positions.",
  "If nums[mid] is smaller than target, every index through mid is too early for the insertion point.",
  "A standard inclusive binary-search loop can return low after the candidate interval becomes empty.",
  "Use low = 0, high = len(nums) - 1; move low right when nums[mid] < target, otherwise move high left. Return low if no exact match is returned.",
];

const patternOptions = [
  { id: "linear", label: "Linear scan" },
  { id: "binary", label: "Binary search" },
  { id: "hash", label: "Hash map lookup" },
  { id: "two-pointers", label: "Two pointers" },
] as const;

export function BinarySearchTransferPractice() {
  const [hypothesis, setHypothesis] = useState<string | null>(null);
  const correct = hypothesis === "binary";

  return (
    <div className="transfer-practice">
      <section className="transfer-problem" aria-labelledby="transfer-problem-title">
        <div className="eyebrow">Transfer 01 · direct</div>
        <h2 id="transfer-problem-title">Find the insertion boundary.</h2>
        <p>
          You receive a sorted list of distinct integers and a target. Return the target index when it exists;
          otherwise return the index where it could be inserted while preserving sorted order.
        </p>
        <div className="example-strip mono" aria-label="Example">
          <span>nums = [1, 3, 5, 6]</span>
          <span>target = 2</span>
          <strong>answer = 1</strong>
        </div>
      </section>

      <section className="hypothesis-gate">
        <div className="hypothesis-gate__heading">
          <div>
            <strong>Record your first hypothesis before coding.</strong>
            <p>Which broad technique best matches the structure of this problem?</p>
          </div>
          {hypothesis ? <span className="mono">locked in</span> : null}
        </div>
        <div className="prediction-options">
          {patternOptions.map((option) => (
            <button
              type="button"
              key={option.id}
              className={`prediction-option ${hypothesis === option.id ? (correct ? "prediction-option--correct" : "prediction-option--wrong") : ""}`}
              onClick={() => setHypothesis(option.id)}
              disabled={Boolean(hypothesis)}
            >
              {option.label}
            </button>
          ))}
        </div>
        {hypothesis ? (
          <p className={`prediction-feedback ${correct ? "prediction-feedback--correct" : ""}`} aria-live="polite">
            {correct
              ? "Good signal recognition: sorted order plus a positional boundary lets one midpoint comparison remove many impossible positions."
              : "That technique may solve parts of the task, but it does not exploit the strongest signal: the input is sorted and we need a boundary position. Try solving now, then compare your approach with binary search."}
          </p>
        ) : null}
      </section>

      {hypothesis ? (
        <PythonExercise
          id="binary-search-transfer-insert"
          title="Implement the boundary search."
          description="Do not copy the exact-search implementation mechanically. Decide what low should mean when the target is absent."
          functionName="search_insert"
          starterCode={starterCode}
          tests={tests}
          hints={hints}
          successMessage="You transferred the search invariant to a boundary problem."
          storageKey="agocode.progress.binary-search.transfer-01"
        />
      ) : (
        <div className="transfer-locked">Choose a hypothesis to unlock the editor.</div>
      )}
    </div>
  );
}
