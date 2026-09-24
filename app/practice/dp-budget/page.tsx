import Link from "next/link";
import { TransferCodingChallenge } from "@/components/practice/TransferCodingChallenge";
import type { PythonTestCase } from "@/components/code/PythonExercise";

export const metadata = { title: "Study Budget Transfer Practice" };

const tests: PythonTestCase[] = [
  { label: "combination beats one large module", args: [[[1, 1500], [4, 3000], [3, 2000]], 4], expected: 3500 },
  { label: "nothing fits", args: [[[3, 10], [4, 20]], 2], expected: 0 },
  { label: "every module can fit", args: [[[1, 3], [2, 7], [1, 4]], 4], expected: 14 },
  { label: "ratio-greedy can fail", args: [[[3, 5], [2, 4], [2, 4]], 4], expected: 8 },
  { label: "zero budget", args: [[[1, 5]], 0], expected: 0 },
];

const starterCode = `def max_points(modules, hours):
    # modules contains [hours_required, score_points].
    # Each module may be chosen at most once.
    # Return the maximum total score within the hour budget.
    pass
`;

export default function DpBudgetPracticePage() {
  return (
    <main className="page">
      <div className="site-shell transfer-practice">
        <TransferCodingChallenge
          eyebrow="Transfer · reusable constrained subproblems"
          title="Spend a fixed study budget."
          problem="You have a fixed number of study hours before an exam. Each optional module takes a whole number of hours and yields a score boost, and each module can be completed at most once. Return the maximum score boost that fits the time budget."
          examples={[
            '[[1,1500],[4,3000],[3,2000]], 4 → 3500',
            '[[3,5],[2,4],[2,4]], 4 → 8',
          ]}
          constraints={["0/1 choices", "hard hour capacity", "maximize total value"]}
          correctTechnique="dynamic-programming"
          techniqueOptions={["dynamic-programming", "greedy", "binary-search", "recursion"]}
          wrongFeedback="A locally attractive module can block a better combination. Define a smaller state whose answer can be reused after deciding whether to include the current module."
          functionName="max_points"
          starterCode={starterCode}
          tests={tests}
          hints={[
            "Let a state mean the best score possible under a particular hour budget after considering some prefix of modules.",
            "For each module and each budget, compare excluding the module with including it plus the best previous answer for the leftover hours.",
            "You can use a 2D table, or a 1D table updated from high hours down to the module cost so each module is used at most once.",
            "Return the best value stored at the full hour budget.",
          ]}
          successMessage="You transferred the knapsack state model from objects and capacity to modules and study hours."
          storageKey="agocode.progress.transfer.dp-budget"
        />
        <div className="action-row">
          <Link className="button" href="/practice/greedy-schedule">← Greedy scheduling</Link>
          <Link className="button" href="/practice">Transfer Track</Link>
          <Link className="button button--primary" href="/practice/knn-classify">Next: similarity-based prediction →</Link>
        </div>
      </div>
    </main>
  );
}
