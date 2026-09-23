"use client";

import { useState } from "react";
import { PythonExercise, type PythonTestCase } from "@/components/code/PythonExercise";

const tests: PythonTestCase[] = [
  { label: "finds first duplicate", args: [[1, 2, 2, 2, 5, 8], 2], expected: 1 },
  { label: "finds first element", args: [[3, 3, 4, 9], 3], expected: 0 },
  { label: "finds unique target", args: [[1, 4, 7, 10], 7], expected: 2 },
  { label: "returns None when absent", args: [[1, 4, 7, 10], 5], expected: null },
  { label: "handles an empty array", args: [[], 5], expected: null },
];

const starterCode = `def first_occurrence(nums, target):
    # Exact binary search can stop at any matching index.
    # This version must prove that no earlier match exists.
    pass
`;

const hints = [
  "A match is evidence, but it is not yet proof that you found the first match.",
  "Remember the best matching index seen so far, then keep searching the left half.",
  "When nums[mid] >= target, the first occurrence cannot be to the right of mid.",
  "One inclusive-interval approach stores answer = mid on equality, then sets high = mid - 1 and continues.",
];

const decisions = [
  { id: "return", label: "Return mid immediately." },
  { id: "left", label: "Remember mid, then keep searching left." },
  { id: "right", label: "Remember mid, then keep searching right." },
] as const;

export function BinarySearchBoundaryPractice() {
  const [decision, setDecision] = useState<string | null>(null);
  const correct = decision === "left";

  return (
    <div className="transfer-practice">
      <section className="transfer-problem" aria-labelledby="boundary-problem-title">
        <div className="eyebrow">Transfer 02 · variant</div>
        <h2 id="boundary-problem-title">Find the first matching position.</h2>
        <p>
          You receive a sorted list that may contain duplicates. Return the index of the <strong>first</strong>
          occurrence of the target, or <code className="mono">None</code> when the target is absent.
        </p>
        <div className="example-strip mono" aria-label="Example">
          <span>nums = [1, 2, 2, 2, 5, 8]</span>
          <span>target = 2</span>
          <strong>answer = 1</strong>
        </div>
      </section>

      <section className="hypothesis-gate">
        <div className="hypothesis-gate__heading">
          <div>
            <strong>Suppose nums[mid] already equals the target.</strong>
            <p>What should change compared with ordinary exact search?</p>
          </div>
          {decision ? <span className="mono">decision recorded</span> : null}
        </div>
        <div className="prediction-options">
          {decisions.map((option) => (
            <button
              type="button"
              key={option.id}
              className={`prediction-option ${decision === option.id ? (correct ? "prediction-option--correct" : "prediction-option--wrong") : ""}`}
              onClick={() => setDecision(option.id)}
              disabled={Boolean(decision)}
            >
              {option.label}
            </button>
          ))}
        </div>
        {decision ? (
          <p className={`prediction-feedback ${correct ? "prediction-feedback--correct" : ""}`} aria-live="polite">
            {correct
              ? "Exactly. A matching mid is a candidate answer, but duplicates may exist earlier. Preserve mid as the best answer and continue proving the left side."
              : "An exact match no longer ends the proof. The problem asks for a boundary, so you still need to determine whether an earlier equal value exists."}
          </p>
        ) : null}
      </section>

      {decision ? (
        <PythonExercise
          id="binary-search-transfer-boundary"
          title="Turn exact search into a boundary search."
          description="Keep the core discard logic, but change what equality means. A match becomes a candidate answer rather than an immediate return."
          functionName="first_occurrence"
          starterCode={starterCode}
          tests={tests}
          hints={hints}
          successMessage="You adapted binary search from finding a value to proving a boundary."
          storageKey="agocode.progress.binary-search.transfer-02"
        />
      ) : (
        <div className="transfer-locked">Choose what equality should mean to unlock the editor.</div>
      )}
    </div>
  );
}
