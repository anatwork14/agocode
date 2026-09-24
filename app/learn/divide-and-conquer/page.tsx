import Link from "next/link";
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
            <a href="#rebuild">04 · Rebuild</a>
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
                <h2>Make the reduction visible before writing code.</h2>
                <p>
                  Consider covering a rectangle with the largest possible equal square tiles. Once several full squares
                  are removed, the unresolved remainder is another rectangle with the exact same question—only smaller.
                  Eventually one side divides the other exactly, which gives a natural stopping case.
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

              <section id="rebuild">
                <h2>Reconstruct the reduction yourself.</h2>
                <p>
                  Before typing, state the base case and the smaller subproblem in plain language. If either one is
                  vague, the recursion is not designed yet.
                </p>
                <RecursiveSumRebuild />
                <div className="action-row">
                  <Link className="button" href="/learn/chapter-3-recap">← Chapter 3 recap</Link>
                  <Link className="button button--primary" href="/roadmap">Next: Quicksort →</Link>
                </div>
              </section>
            </div>
          </article>

          <aside className="margin-column" aria-label="Divide and conquer notes">
            <MarginNote label="Mindset">D&C is a problem-solving strategy, not one fixed algorithm.</MarginNote>
            <MarginNote label="Progress">A recursive call should receive a problem that is measurably closer to the base case.</MarginNote>
            <MarginNote label="Connection">Chapter 3 gave you the call-stack model. D&C now uses that model to solve successively smaller subproblems.</MarginNote>
          </aside>
        </div>
      </div>
    </main>
  );
}
