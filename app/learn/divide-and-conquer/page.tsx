import Link from "next/link";
import { DivideConquerRecursionTreeLab } from "@/components/quicksort/DivideConquerRecursionTreeLab";
import { DivideConquerTilingLab } from "@/components/quicksort/DivideConquerTilingLab";
import { RecursiveSumRebuild } from "@/components/quicksort/RecursiveSumRebuild";
import { RecursiveSumTrace } from "@/components/quicksort/RecursiveSumTrace";
import { MarginNote } from "@/components/ui/MarginNote";

export const metadata = { title: "Divide & Conquer" };

export default function DivideAndConquerPage() {
  return (
    <main className="page page--tight">
      <div className="site-shell">
        <div className="reading-layout">
          <nav className="reading-nav" aria-label="Divide and Conquer sections">
            <a href="#strategy">01 · Strategy</a>
            <a href="#reduce">02 · Reduce</a>
            <a href="#sum">03 · Same problem, smaller input</a>
            <a href="#tree">04 · Recursion tree</a>
            <a href="#rebuild">05 · Rebuild</a>
          </nav>

          <article className="reading-column">
            <div className="eyebrow">Chapter 04 · Quicksort</div>
            <h1 className="editorial-title editorial-title--compact">Divide &amp; Conquer</h1>
            <p className="lede">
              Divide and conquer is a way of thinking with recursion: identify a case you can answer directly, then
              transform every harder case into a smaller version of the same problem until that base case is reached.
            </p>

            <div className="prose-block">
              <section id="strategy">
                <h2>Two questions drive the whole strategy.</h2>
                <div className="dc-principles" aria-label="Divide and conquer questions">
                  <div><span className="mono">01</span><strong>What is the simplest version I can solve immediately?</strong><p>That becomes the base case.</p></div>
                  <div><span className="mono">02</span><strong>How can one step make the problem strictly smaller?</strong><p>That becomes the recursive reduction.</p></div>
                </div>
                <p>
                  The important part is not merely splitting something into pieces. Each recursive call must preserve
                  the meaning of the original problem while moving closer to a case that no longer needs recursion.
                </p>
              </section>

              <section id="reduce">
                <h2>Make the chapter&apos;s farm reduction visible before writing code.</h2>
                <p>
                  Start with a 1680 × 640 rectangle. Remove the largest square plots that fit, then focus only on the
                  leftover rectangle. The remainder is the same kind of problem at a smaller size. Continue until one
                  side divides the other exactly and the largest square is forced.
                </p>
                <DivideConquerTilingLab />
              </section>

              <section id="sum">
                <h2>An array can be reduced the same way.</h2>
                <p>
                  To sum a list recursively, keep one value in the current frame and ask the same function to sum the
                  rest. The input gets shorter on every call. When the empty list is reached, the return path combines
                  the preserved values one frame at a time.
                </p>
                <RecursiveSumTrace />
              </section>

              <section id="tree">
                <h2>A recursion tree explains where divide-and-conquer cost comes from.</h2>
                <p>
                  A single recursive chain shows stack depth, but many divide-and-conquer algorithms branch into more
                  than one subproblem. A recursion tree makes both dimensions visible: how many subproblems exist at a
                  level and how much work each one performs. Track their product instead of counting nodes alone.
                </p>
                <DivideConquerRecursionTreeLab />
              </section>

              <section id="rebuild">
                <h2>Reconstruct the reduction yourself.</h2>
                <p>
                  Before typing, state the base case and the smaller subproblem in plain language. If either one is
                  vague, the recursion is not designed yet.
                </p>
                <RecursiveSumRebuild />
                <div className="action-row">
                  <Link className="button" href="/learn/chapter-3-recap">← Chapter 3 recap</Link>
                  <Link className="button button--primary" href="/learn/quicksort">Next: Quicksort →</Link>
                </div>
              </section>
            </div>
          </article>

          <aside className="margin-column" aria-label="Divide and conquer notes">
            <MarginNote label="Mindset">D&amp;C is a problem-solving strategy, not one fixed algorithm.</MarginNote>
            <MarginNote label="Progress">A recursive call should receive a problem that is measurably closer to the base case.</MarginNote>
            <MarginNote label="Farm example">The rectangle reduction is an instance of Euclid&apos;s algorithm: solving the remainder preserves the greatest common square size.</MarginNote>
            <MarginNote label="Tree cost">When branching grows while each subproblem shrinks, reason about work per level—not only recursion depth.</MarginNote>
          </aside>
        </div>
      </div>
    </main>
  );
}
