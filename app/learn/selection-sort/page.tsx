import Link from "next/link";
import { SelectionSortRebuild } from "@/components/selection-sort/SelectionSortRebuild";
import { SelectionSortTrace } from "@/components/selection-sort/SelectionSortTrace";
import { MarginNote } from "@/components/ui/MarginNote";

export const metadata = { title: "Selection Sort" };

export default function SelectionSortPage() {
  return (
    <main className="page page--tight">
      <div className="site-shell">
        <div className="reading-layout">
          <nav className="reading-nav" aria-label="Selection Sort sections">
            <a href="#idea">01 · Repeated selection</a>
            <a href="#trace">02 · Trace it</a>
            <a href="#runtime">03 · O(n²)</a>
            <a href="#rebuild">04 · Rebuild</a>
          </nav>

          <article className="reading-column">
            <div className="eyebrow">Chapter 02 · Selection sort</div>
            <h1 className="editorial-title editorial-title--compact">Selection Sort</h1>
            <p className="lede">
              Sorting can be built from a simple repeated action: scan the remaining values, identify the smallest one,
              move it into the next output position, and repeat until nothing remains unsorted.
            </p>

            <div className="prose-block">
              <section id="idea">
                <h2>One pass solves only one position.</h2>
                <p>
                  The algorithm does not try to sort the entire list at once. On each pass it proves just one fact:
                  which remaining value is smallest. Once that value is moved to the output, the same question is asked
                  again on a list that is one item shorter.
                </p>
                <div className="concept-equation" aria-label="Selection Sort repeated operation">
                  <div><span>remaining values</span><strong className="mono">scan all</strong></div>
                  <div className="concept-equation__divider">→</div>
                  <div><span>one proven value</span><strong className="mono">append min</strong></div>
                </div>
              </section>

              <section id="trace">
                <h2>Predict the value before the scan is revealed.</h2>
                <p>
                  The visualization follows the chapter mechanism directly: the unsorted list shrinks while the sorted
                  output grows. At the start of each pass, identify the value that must be selected next.
                </p>
                <SelectionSortTrace />
              </section>

              <section id="runtime">
                <h2>Why the runtime is quadratic.</h2>
                <p>
                  Finding one smallest value requires a linear scan of the remaining items. Then the algorithm repeats
                  that kind of scan for each output position. The scans get shorter—roughly n, n−1, n−2, and so on—but
                  their total still grows proportionally to n², so Selection Sort is written as <span className="mono">O(n²)</span>.
                </p>
                <div className="selection-runtime" aria-label="Selection Sort scan lengths">
                  {[5, 4, 3, 2, 1].map((size) => (
                    <div key={size}>
                      <span className="mono">{size}</span>
                      <div style={{ width: `${size * 18}%` }} />
                    </div>
                  ))}
                </div>
                <p>
                  This is intentionally not the sorting method you would usually choose for large production inputs.
                  Its value here is pedagogical: it makes scanning, repeated selection, and quadratic growth concrete
                  before the Book Track moves on to faster divide-and-conquer sorting.
                </p>
              </section>

              <section id="rebuild">
                <h2>Write the mechanism again.</h2>
                <p>
                  Rebuild the same algorithm rather than calling Python&apos;s built-in <span className="mono">sorted()</span>.
                  The exercise is evidence that you can reproduce the repeated-selection idea yourself.
                </p>
                <SelectionSortRebuild />
                <div className="action-row">
                  <Link className="button" href="/learn/arrays-linked-lists">← Arrays & linked lists</Link>
                  <Link className="button button--primary" href="/learn/chapter-2-recap">Chapter 2 recap →</Link>
                </div>
              </section>
            </div>
          </article>

          <aside className="margin-column" aria-label="Selection Sort notes">
            <MarginNote label="Connection">Binary search needs sorted data. Chapter 2 now gives you a first concrete sorting procedure.</MarginNote>
            <MarginNote label="Next">Selection Sort prepares the sorting mental model; Quicksort later changes the strategy and the growth rate.</MarginNote>
          </aside>
        </div>
      </div>
    </main>
  );
}
