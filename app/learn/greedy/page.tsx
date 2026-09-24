import Link from "next/link";
import { ClassroomSchedulingLab } from "@/components/greedy/ClassroomSchedulingLab";
import { KnapsackGreedyCounterexample } from "@/components/greedy/KnapsackGreedyCounterexample";
import { SetCoverLab } from "@/components/greedy/SetCoverLab";
import { MarginNote } from "@/components/ui/MarginNote";

export const metadata = { title: "Greedy Algorithms" };

export default function GreedyAlgorithmsPage() {
  return (
    <main className="page page--tight">
      <div className="site-shell">
        <div className="reading-layout">
          <nav className="reading-nav" aria-label="Greedy algorithms sections">
            <a href="#schedule">01 · Scheduling</a>
            <a href="#local">02 · Local choice</a>
            <a href="#knapsack">03 · Counterexample</a>
            <a href="#set-cover">04 · Set cover</a>
            <a href="#approximation">05 · Approximation</a>
            <a href="#hard">06 · Hard problems</a>
          </nav>

          <article className="reading-column">
            <div className="eyebrow">Chapter 08 · Greedy algorithms</div>
            <h1 className="editorial-title editorial-title--compact">Greedy Algorithms</h1>
            <p className="lede">
              A greedy algorithm commits to the best-looking move available now. Sometimes that simple local rule is
              exactly right. Sometimes it only gets close. The skill is learning which situation you are in.
            </p>

            <div className="prose-block">
              <section id="schedule">
                <h2>Start with a case where a simple greedy rule is enough.</h2>
                <p>
                  Imagine one classroom and several overlapping classes. The goal is to schedule as many classes as
                  possible. One useful local rule is: among classes that still fit, take the one that finishes earliest.
                  That choice leaves the largest remaining time window for whatever comes next.
                </p>
                <ClassroomSchedulingLab />
              </section>

              <section id="local">
                <h2>Greedy means locally optimal, not globally omniscient.</h2>
                <p>
                  The algorithm does not enumerate every complete schedule. It makes a commitment, updates what remains
                  feasible, and repeats. In interval scheduling, this particular local choice is strong enough to produce
                  an optimal number of non-overlapping intervals.
                </p>
                <div className="greedy-principle-grid">
                  <div><span className="mono">01</span><strong>Choose</strong><p>Pick the best move according to the local rule.</p></div>
                  <div><span className="mono">02</span><strong>Commit</strong><p>Do not keep every alternate branch alive.</p></div>
                  <div><span className="mono">03</span><strong>Repeat</strong><p>Apply the same rule to the reduced problem.</p></div>
                </div>
              </section>

              <section id="knapsack">
                <h2>But a plausible greedy rule can fail.</h2>
                <p>
                  Suppose a bag has limited capacity and you want to maximize value. Taking the most valuable item that
                  fits sounds reasonable, but one early choice can consume capacity that would have supported a better
                  combination. A counterexample is enough to prove that the rule is not always optimal.
                </p>
                <KnapsackGreedyCounterexample />
              </section>

              <section id="set-cover">
                <h2>When exact search explodes, greedy can become an approximation strategy.</h2>
                <p>
                  In set cover, you want a small collection of options whose combined coverage reaches every required
                  item. Enumerating every subset grows exponentially. A practical greedy approximation repeatedly chooses
                  the option that covers the most requirements that are still uncovered.
                </p>
                <SetCoverLab />
              </section>

              <section id="approximation">
                <h2>Approximation trades perfect certainty for useful speed.</h2>
                <p>
                  An approximation algorithm should be judged on two dimensions: how efficiently it runs and how close
                  its result is to the true optimum. Greedy strategies are attractive here because the decision rule is
                  often simple enough to evaluate quickly.
                </p>
                <div className="approximation-balance" aria-label="Approximation trade-off">
                  <div><span>speed</span><strong>How quickly can we obtain a solution?</strong></div>
                  <div><span>quality</span><strong>How far can that solution be from optimal?</strong></div>
                </div>
              </section>

              <section id="hard">
                <h2>Watch for problems that seem to demand every combination.</h2>
                <p>
                  Hard combinatorial problems often reveal themselves through explosive search spaces: all subsets, all
                  orderings, or every possible version of a solution. That does not by itself prove a formal complexity
                  classification, but it is a useful warning that brute-force exact search may become impractical very
                  quickly.
                </p>
                <div className="greedy-hard-signals">
                  <div><strong>Combinations</strong><p>The obvious exact strategy tries every subset.</p></div>
                  <div><strong>Permutations</strong><p>The candidate space grows like all possible orderings.</p></div>
                  <div><strong>No useful reduction</strong><p>You cannot see a way to eliminate large regions of the search space.</p></div>
                  <div><strong>Known hard structure</strong><p>The problem resembles set cover, traveling salesperson, clique, or related families.</p></div>
                </div>
                <div className="action-row">
                  <Link className="button" href="/learn/chapter-7-recap">← Chapter 7 recap</Link>
                  <Link className="button button--primary" href="/learn/chapter-8-recap">Chapter 8 recap →</Link>
                </div>
              </section>
            </div>
          </article>

          <aside className="margin-column" aria-label="Greedy algorithms notes">
            <MarginNote label="Greedy choice">A local choice is only useful when you can justify the rule—or accept that it is an approximation.</MarginNote>
            <MarginNote label="Counterexample">One valid input where the rule loses to another solution is enough to disprove universal optimality.</MarginNote>
            <MarginNote label="Approximation">Fast and close-to-optimal can be more valuable than exact but unusably slow.</MarginNote>
            <MarginNote label="Bridge">The knapsack counterexample deliberately points forward to Chapter 9 and dynamic programming.</MarginNote>
          </aside>
        </div>
      </div>
    </main>
  );
}
