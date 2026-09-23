"use client";

import { useState } from "react";
import { PythonExercise, type PythonTestCase } from "@/components/code/PythonExercise";

const tests: PythonTestCase[] = [
  { label: "finds a moderate minimum rate", args: [[3, 6, 7, 11], 8], expected: 4 },
  { label: "tight deadline needs the largest workload rate", args: [[30, 11, 23, 4, 20], 5], expected: 30 },
  { label: "one extra hour lowers the minimum", args: [[30, 11, 23, 4, 20], 6], expected: 23 },
  { label: "unit workloads", args: [[1, 1, 1], 3], expected: 1 },
  { label: "single workload", args: [[100], 4], expected: 25 },
];

const starterCode = `def minimum_rate(workloads, hours):
    # At integer rate r, workload x needs ceil(x / r) hours.
    # Find the smallest r that finishes all workloads in time.
    pass
`;

const hints = [
  "Do not search the workloads. Search the set of possible answers.",
  "A useful rate is between 1 and max(workloads). Ask whether feasibility is monotonic across that interval.",
  "If rate r finishes on time, every larger rate also finishes on time. If r is too slow, every smaller rate is also too slow.",
  "Binary-search the rate. Compute total hours with (x + rate - 1) // rate. When a rate works, save it and search left for a smaller feasible rate.",
];

const hypotheses = [
  { id: "linear-rate", label: "Try rates 1, 2, 3, … until one succeeds." },
  { id: "sort-workloads", label: "Sort workloads and binary-search for a special workload." },
  { id: "answer-space", label: "Binary-search possible rates because feasibility changes monotonically." },
  { id: "dynamic", label: "Build a dynamic-programming table over hours and workloads." },
] as const;

export function AnswerSpaceTransferPractice() {
  const [hypothesis, setHypothesis] = useState<string | null>(null);
  const correct = hypothesis === "answer-space";

  return (
    <div className="transfer-practice">
      <section className="transfer-problem" aria-labelledby="answer-space-title">
        <div className="eyebrow">Transfer 04 · abstract answer space</div>
        <h2 id="answer-space-title">Find the smallest processing rate that meets a deadline.</h2>
        <p>
          Work arrives in separate workloads. At an integer processing rate <code className="mono">r</code>, a workload
          of size <code className="mono">x</code> needs <code className="mono">ceil(x / r)</code> hours. Find the minimum
          rate that completes all workloads within the given total number of hours.
        </p>
        <div className="example-strip mono" aria-label="Example">
          <span>workloads = [3, 6, 7, 11]</span>
          <span>hours = 8</span>
          <strong>minimum rate = 4</strong>
        </div>
      </section>

      <section className="hypothesis-gate">
        <div className="hypothesis-gate__heading">
          <div>
            <strong>There is no sorted input array to search.</strong>
            <p>What structure could still make logarithmic search possible?</p>
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
              ? "Exactly. Candidate rates form an ordered answer space. Feasibility is monotonic: once a rate is fast enough, every larger rate is also feasible. That lets one check discard half of the possible answers."
              : "That can produce an answer, but it misses the strongest structure. Ask how the statement ‘finishes within the deadline’ changes as the rate increases. Once it becomes true, can it ever become false again?"}
          </p>
        ) : null}
      </section>

      {correct ? (
        <PythonExercise
          id="binary-search-transfer-answer-space"
          title="Binary-search a value that is not stored in the input."
          description="This is the furthest transfer rung: the midpoint is now a candidate answer. Preserve the same logic—make one monotonic check, then discard an impossible region."
          functionName="minimum_rate"
          starterCode={starterCode}
          tests={tests}
          hints={hints}
          successMessage="You transferred binary search from array indices to a monotonic answer space."
          storageKey="agocode.progress.binary-search.transfer-04"
        />
      ) : (
        <div className="transfer-locked">Identify the monotonic answer-space property to unlock the editor.</div>
      )}
    </div>
  );
}
