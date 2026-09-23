import Link from "next/link";
import { PermutationExplosion } from "@/components/complexity/PermutationExplosion";
import { MarginNote } from "@/components/ui/MarginNote";

export const metadata = { title: "Traveling Salesperson" };

export default function TravelingSalespersonPage() {
  return (
    <main className="page page--tight">
      <div className="site-shell">
        <div className="reading-layout">
          <nav className="reading-nav" aria-label="Traveling Salesperson sections">
            <a href="#problem">01 · The problem</a>
            <a href="#brute-force">02 · Every order</a>
            <a href="#factorial">03 · Factorial growth</a>
            <a href="#chapter-end">04 · Chapter end</a>
          </nav>

          <article className="reading-column">
            <div className="eyebrow">Chapter 01 · Introduction to algorithms</div>
            <h1 className="editorial-title editorial-title--compact">Traveling Salesperson</h1>
            <p className="lede">
              The earlier examples showed fast and manageable growth. This final Chapter 1 example shows what happens
              when a straightforward exact strategy must consider every possible ordering.
            </p>

            <div className="prose-block">
              <section id="problem">
                <h2>Visit every city, but keep the route short.</h2>
                <p>
                  Imagine a route planner that must visit each city once and return a minimum-distance tour. One
                  conceptually simple exact strategy is to generate every possible visiting order, measure every route,
                  and keep the best one.
                </p>
                <p>
                  That strategy is easy to describe. Its running time is the problem: the number of possible orders is
                  tied to the number of permutations.
                </p>
              </section>

              <section id="brute-force">
                <h2>Every new city multiplies the search space.</h2>
                <p>
                  Five cities already have <span className="mono">5! = 120</span> orderings. Six cities have
                  <span className="mono"> 6! = 720</span>. Seven have <span className="mono">7! = 5,040</span>.
                  Explore the growth directly.
                </p>
                <PermutationExplosion />
              </section>

              <section id="factorial">
                <h2>This is what O(n!) feels like.</h2>
                <p>
                  Factorial growth is fundamentally different from adding one more linear scan or one more halving.
                  With the brute-force permutation strategy, increasing <span className="mono">n</span> by one
                  multiplies the previous number of candidate routes by the new <span className="mono">n</span>.
                </p>
                <div className="concept-equation" aria-label="Factorial recurrence">
                  <div>
                    <span>previous search space</span>
                    <strong className="mono">(n - 1)!</strong>
                  </div>
                  <div className="concept-equation__divider">× n</div>
                  <div>
                    <span>new search space</span>
                    <strong className="mono">n!</strong>
                  </div>
                </div>
                <p>
                  The purpose of this example is not to memorize a route-planning implementation. It is to recognize
                  that some natural brute-force strategies explode so quickly that algorithm design must look for
                  stronger structure, better exact methods, or useful approximations. Later chapters return to those
                  problem-solving trade-offs.
                </p>
              </section>

              <section id="chapter-end">
                <h2>Chapter 1 now has one connected story.</h2>
                <p>
                  Binary search introduced an algorithm. Running-time analysis compared how algorithms scale. Big O
                  gave that growth a compact language. Traveling Salesperson shows the other end of the spectrum: a
                  simple-looking strategy whose search space grows explosively.
                </p>
                <div className="action-row">
                  <Link className="button" href="/learn/big-o">
                    ← Big O
                  </Link>
                  <Link className="button button--primary" href="/learn/chapter-1-recap">
                    Chapter 1 recap →
                  </Link>
                </div>
              </section>
            </div>
          </article>

          <aside className="margin-column" aria-label="Traveling Salesperson notes">
            <MarginNote label="Focus">The learning target here is factorial growth and search-space explosion, not a production TSP solver.</MarginNote>
            <MarginNote label="Later">Greedy and approximation ideas become useful once exhaustive search is no longer practical.</MarginNote>
          </aside>
        </div>
      </div>
    </main>
  );
}
