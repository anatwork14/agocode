import Link from "next/link";
import { DoublingCheck } from "@/components/complexity/DoublingCheck";
import { GrowthComparison } from "@/components/complexity/GrowthComparison";
import { MarginNote } from "@/components/ui/MarginNote";

export const metadata = { title: "Running Time" };

export default function RunningTimePage() {
  return (
    <main className="page page--tight">
      <div className="site-shell">
        <div className="reading-layout">
          <nav className="reading-nav" aria-label="Running Time sections">
            <a href="#work">01 · Count work</a>
            <a href="#growth">02 · Growth</a>
            <a href="#double">03 · Double n</a>
            <a href="#bridge">04 · Big O</a>
          </nav>

          <article className="reading-column">
            <div className="eyebrow">Chapter 01 · Introduction to algorithms</div>
            <h1 className="editorial-title editorial-title--compact">Running Time</h1>
            <p className="lede">
              Binary search feels fast on a small list. Running-time analysis asks the more useful question: what
              happens to the amount of work when the input becomes much larger?
            </p>

            <div className="prose-block">
              <section id="work">
                <h2>Start by counting decisions, not seconds.</h2>
                <p>
                  A simple search may inspect every item. With <span className="mono">n</span> items, its worst case
                  can require <span className="mono">n</span> checks. Binary search behaves differently: every
                  midpoint decision removes about half of the remaining candidates.
                </p>
                <div className="concept-equation" aria-label="Simple search versus binary search growth">
                  <div>
                    <span>Simple search</span>
                    <strong className="mono">n checks</strong>
                  </div>
                  <div className="concept-equation__divider">vs.</div>
                  <div>
                    <span>Binary search</span>
                    <strong className="mono">log₂ n checks</strong>
                  </div>
                </div>
                <p>
                  Wall-clock speed depends on hardware, language, implementation, and many other details. Counting
                  how the work grows lets us compare algorithms more generally.
                </p>
              </section>

              <section id="growth">
                <h2>Small differences become enormous.</h2>
                <p>
                  Move the input-size control. At first, both strategies may look manageable. As the list grows, a
                  linear scan inherits every new item, while binary search pays only for a few extra halvings.
                </p>
                <GrowthComparison />
                <p>
                  The important observation is not a single ratio at one size. It is that the ratio keeps changing as
                  <span className="mono"> n</span> changes because the two algorithms grow at different rates.
                </p>
              </section>

              <section id="double">
                <h2>Predict the shape before learning the notation.</h2>
                <p>
                  If you understand the growth mechanism, you should be able to reason about a larger input without
                  memorizing a complexity label.
                </p>
                <DoublingCheck />
              </section>

              <section id="bridge">
                <h2>We need a compact language for growth.</h2>
                <p>
                  Saying “this took 7 milliseconds on my machine” is too specific. What we want is a notation that
                  describes how the number of operations scales with the input. That is the role of Big O notation.
                </p>
                <div className="action-row">
                  <Link className="button" href="/learn/binary-search">
                    ← Binary Search
                  </Link>
                  <Link className="button button--primary" href="/learn/big-o">
                    Continue to Big O →
                  </Link>
                </div>
              </section>
            </div>
          </article>

          <aside className="margin-column" aria-label="Running time notes">
            <MarginNote label="Measure">For now, compare the growth in operations rather than exact elapsed time.</MarginNote>
            <MarginNote label="Connection">The halving behavior you saw in Binary Search is exactly why its operation count grows logarithmically.</MarginNote>
          </aside>
        </div>
      </div>
    </main>
  );
}
