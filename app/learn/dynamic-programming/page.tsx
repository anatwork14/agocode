import Link from "next/link";
import { KnapsackGridLab } from "@/components/dynamic-programming/KnapsackGridLab";
import { KnapsackRebuild } from "@/components/dynamic-programming/KnapsackRebuild";
import { StringDpLab } from "@/components/dynamic-programming/StringDpLab";
import { MarginNote } from "@/components/ui/MarginNote";

export const metadata = { title: "Dynamic Programming" };

export default function DynamicProgrammingPage() {
  return (
    <main className="page page--tight">
      <div className="site-shell">
        <div className="reading-layout">
          <nav className="reading-nav" aria-label="Dynamic programming sections">
            <a href="#why">01 · Why DP</a>
            <a href="#grid">02 · The grid</a>
            <a href="#cell">03 · Cell recurrence</a>
            <a href="#boundaries">04 · Boundaries</a>
            <a href="#strings">05 · Sequence grids</a>
            <a href="#rebuild">06 · Rebuild</a>
          </nav>

          <article className="reading-column">
            <div className="eyebrow">Chapter 09 · Dynamic programming</div>
            <h1 className="editorial-title editorial-title--compact">Dynamic Programming</h1>
            <p className="lede">
              Dynamic programming turns one intimidating optimization problem into a collection of smaller solved
              subproblems. The hard part is not memorizing a formula. It is deciding what one cell means.
            </p>

            <div className="prose-block">
              <section id="why">
                <h2>Start from the problem that greedy could not solve exactly.</h2>
                <p>
                  A limited-capacity bag gives you a clean optimization problem: maximize value while staying within a
                  capacity constraint. Trying every subset is exact, but the number of combinations doubles as items are
                  added. Dynamic programming avoids recomputing the same smaller capacity questions again and again.
                </p>
                <div className="dp-contrast-grid">
                  <div><span>brute force</span><strong>Try complete combinations</strong><p>Exact, but the candidate set grows explosively.</p></div>
                  <div><span>dynamic programming</span><strong>Reuse solved subproblems</strong><p>Build the final answer from smaller capacities and smaller prefixes of the item list.</p></div>
                </div>
              </section>

              <section id="grid">
                <h2>The grid is a map of subproblems.</h2>
                <p>
                  For 0/1 knapsack, a useful state has two coordinates: which items are currently available and how much
                  capacity is available. Each row adds one more item to the choices. Each column asks for the best value
                  under a particular capacity. Once that meaning is fixed, the grid becomes much less mysterious.
                </p>
                <div className="dp-axis-card">
                  <div><span className="mono">row</span><strong>items seen so far</strong></div>
                  <div><span className="mono">column</span><strong>capacity available</strong></div>
                  <div><span className="mono">cell</span><strong>best value for that subproblem</strong></div>
                </div>
              </section>

              <section id="cell">
                <h2>Fill one cell by comparing two already-understood choices.</h2>
                <p>
                  If the current item does not fit, the cell simply inherits the best value from the row above. If it
                  does fit, compare two possibilities: exclude it and keep the old best, or include it and add its value
                  to the previously solved cell for the leftover capacity.
                </p>
                <KnapsackGridLab />
                <div className="dp-recurrence" aria-label="Knapsack recurrence in words">
                  <span className="mono">best(row, capacity)</span>
                  <strong>= max(previous best, item value + best(previous row, leftover capacity))</strong>
                </div>
              </section>

              <section id="boundaries">
                <h2>The chapter is also about knowing where this grid model stops fitting.</h2>
                <p>
                  Several edge cases are really modeling questions. Adding another item adds another row, so the previous
                  best remains available and a column&apos;s best value does not need to decrease. Fractional weights require a
                  finer capacity scale. Fractional items are a different problem entirely, and a greedy value-per-unit
                  strategy can be more appropriate. Dependencies between choices can also break the assumption that a
                  subproblem is self-contained.
                </p>
                <div className="dp-boundary-grid">
                  <div><strong>New item</strong><p>Add a row. Old solutions remain valid choices.</p></div>
                  <div><strong>Smaller weight unit</strong><p>Refine the column granularity so the leftover states actually exist.</p></div>
                  <div><strong>Fractional item</strong><p>The 0/1 recurrence no longer models the problem.</p></div>
                  <div><strong>Dependent choices</strong><p>If one choice changes the cost of another, the state needs more information or a different formulation.</p></div>
                </div>
              </section>

              <section id="strings">
                <h2>A second example teaches the real skill: inventing the state and recurrence.</h2>
                <p>
                  String comparison uses a different grid. The axes become prefixes of two words. For a longest common
                  substring, matching letters extend the diagonal and mismatches reset the contiguous run. For a longest
                  common subsequence, mismatches can keep the better answer from above or left because skipped characters
                  are allowed.
                </p>
                <StringDpLab />
                <p>
                  Notice the important difference in where the answer lives. A longest common substring can end before
                  the final characters, so the maximum may appear anywhere in the grid. A longest common subsequence for
                  the full two strings is summarized by the bottom-right cell.
                </p>
              </section>

              <section id="rebuild">
                <h2>Now reconstruct the algorithm from the invariant.</h2>
                <p>
                  The target is not to memorize a nested loop. If you can state the cell meaning and the include/exclude
                  comparison, the implementation can be rebuilt from those ideas.
                </p>
                <KnapsackRebuild />
                <div className="action-row">
                  <Link className="button" href="/learn/chapter-8-recap">← Chapter 8 recap</Link>
                  <Link className="button button--primary" href="/learn/chapter-9-recap">Chapter 9 recap →</Link>
                </div>
              </section>
            </div>
          </article>

          <aside className="margin-column" aria-label="Dynamic programming notes">
            <MarginNote label="State first">If you cannot explain what a cell means in one sentence, do not write the recurrence yet.</MarginNote>
            <MarginNote label="Reuse">Dynamic programming earns its power by reusing answers to smaller states instead of solving them repeatedly.</MarginNote>
            <MarginNote label="Constraint">The grid axes often come directly from the constraint and the prefix or subset of choices already considered.</MarginNote>
            <MarginNote label="No universal formula">Knapsack, substring, and subsequence use different recurrences because their subproblems mean different things.</MarginNote>
          </aside>
        </div>
      </div>
    </main>
  );
}
