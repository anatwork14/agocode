import Link from "next/link";
import { PivotBalanceLab } from "@/components/quicksort/PivotBalanceLab";
import { QuicksortRebuild } from "@/components/quicksort/QuicksortRebuild";
import { QuicksortTrace } from "@/components/quicksort/QuicksortTrace";
import { MarginNote } from "@/components/ui/MarginNote";

export const metadata = { title: "Quicksort" };

export default function QuicksortPage() {
  return (
    <main className="page page--tight">
      <div className="site-shell">
        <div className="reading-layout">
          <nav className="reading-nav" aria-label="Quicksort sections">
            <a href="#base">01 · Base case</a>
            <a href="#partition">02 · Partition</a>
            <a href="#recurse">03 · Recurse + combine</a>
            <a href="#runtime">04 · Pivot balance</a>
            <a href="#rebuild">05 · Rebuild</a>
          </nav>

          <article className="reading-column">
            <div className="eyebrow">Chapter 04 · Quicksort</div>
            <h1 className="editorial-title editorial-title--compact">Quicksort</h1>
            <p className="lede">
              Quicksort turns the divide-and-conquer strategy into a sorting algorithm: choose a pivot, partition the
              remaining values into smaller problems, recursively sort those problems, then put the pieces back together.
            </p>

            <div className="prose-block">
              <section id="base">
                <h2>Start with arrays that do not need sorting.</h2>
                <p>
                  An empty array and a one-item array are already sorted. That gives Quicksort a clean base case before
                  any partitioning happens. Every larger call must eventually reduce toward one of those sizes.
                </p>
                <div className="quicksort-base-cases" aria-label="Quicksort base cases">
                  <div><span className="mono">[]</span><strong>already sorted</strong></div>
                  <div><span className="mono">[7]</span><strong>already sorted</strong></div>
                </div>
              </section>

              <section id="partition">
                <h2>A pivot creates two smaller sorting problems.</h2>
                <p>
                  Choose one value as the pivot. Compare every other value with it, placing values less than or equal to
                  the pivot on one side and larger values on the other. The partition itself is not the final answer—it
                  creates smaller arrays that can be solved with the same algorithm.
                </p>
                <QuicksortTrace />
              </section>

              <section id="recurse">
                <h2>Sorted-left + pivot + sorted-right gives the answer.</h2>
                <p>
                  Once both partitions have been recursively sorted, their relationship to the pivot is already known.
                  Every value in the left result is at most the pivot, and every value in the right result is larger, so
                  concatenating those three pieces produces a sorted result for the current call.
                </p>
                <div className="quicksort-combine-equation mono" aria-label="Quicksort combine rule">
                  quicksort(left) + [pivot] + quicksort(right)
                </div>
              </section>

              <section id="runtime">
                <h2>The shape of the recursive splits affects the runtime.</h2>
                <p>
                  Partitioning a call touches its current array, so each recursion level contains linear work overall.
                  If the splits stay balanced, there are only logarithmically many levels. If one side is repeatedly
                  almost the entire array, the call stack can become linear in height and the total work becomes quadratic.
                </p>
                <PivotBalanceLab />
                <p>
                  This is why Quicksort is commonly described as <span className="mono">O(n log n)</span> on average
                  and <span className="mono">O(n²)</span> in the worst case. The pivot strategy influences how often
                  the recursion resembles the balanced or lopsided shape.
                </p>
              </section>

              <section id="rebuild">
                <h2>Rebuild Quicksort from the D&amp;C questions.</h2>
                <p>
                  Name the base case, choose the pivot, explain how the two partitions are smaller, and only then write
                  the recursive calls. If you can reconstruct that structure, the code no longer needs to be memorized.
                </p>
                <QuicksortRebuild />
                <div className="action-row">
                  <Link className="button" href="/learn/divide-and-conquer">← Divide &amp; Conquer</Link>
                  <Link className="button button--primary" href="/roadmap">Chapter 4 recap coming next →</Link>
                </div>
              </section>
            </div>
          </article>

          <aside className="margin-column" aria-label="Quicksort notes">
            <MarginNote label="Base case">Arrays of size 0 or 1 need no sorting work.</MarginNote>
            <MarginNote label="Invariant">After partitioning, every left value belongs before the pivot and every right value belongs after it.</MarginNote>
            <MarginNote label="Runtime">Balanced partitions produce shallow recursion; repeatedly lopsided partitions produce the quadratic worst case.</MarginNote>
          </aside>
        </div>
      </div>
    </main>
  );
}
