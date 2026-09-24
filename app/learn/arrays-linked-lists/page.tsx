import Link from "next/link";
import { ArrayListTradeoffLab } from "@/components/selection-sort/ArrayListTradeoffLab";
import { LessonCompleteLink } from "@/components/progress/LessonCompleteLink";
import { MarginNote } from "@/components/ui/MarginNote";

export const metadata = { title: "Arrays and Linked Lists" };

export default function ArraysLinkedListsPage() {
  return (
    <main className="page page--tight">
      <div className="site-shell">
        <div className="reading-layout">
          <nav className="reading-nav" aria-label="Arrays and linked lists sections">
            <a href="#array">01 · Arrays</a>
            <a href="#list">02 · Linked lists</a>
            <a href="#tradeoffs">03 · Trade-offs</a>
            <a href="#choice">04 · Choose deliberately</a>
          </nav>

          <article className="reading-column">
            <div className="eyebrow">Chapter 02 · Selection sort</div>
            <h1 className="editorial-title editorial-title--compact">Arrays and linked lists</h1>
            <p className="lede">
              Both structures hold a sequence. Their difference is physical organization: arrays keep elements next
              to one another, while linked lists can place nodes in scattered locations and connect them with pointers.
            </p>

            <div className="prose-block">
              <section id="array">
                <h2>Arrays trade flexibility for direct access.</h2>
                <p>
                  Because array elements are contiguous, the address of an item can be computed from the start address
                  and its index. That makes random reads fast. The cost appears when an insertion or deletion forces
                  later elements to shift—or when the collection must move to a larger contiguous region.
                </p>
              </section>

              <section id="list">
                <h2>Linked lists trade direct access for cheap rewiring.</h2>
                <p>
                  A linked-list node stores its value and a link to another node. The nodes do not need neighboring
                  addresses. Sequential traversal works naturally: read one node, follow the link, repeat. Jumping
                  directly to an arbitrary index is expensive because the path must be followed from the beginning.
                </p>
              </section>

              <section id="tradeoffs">
                <h2>Compare operations, not slogans.</h2>
                <p>
                  Switch between the operations below. The important question is not “which structure is better?” but
                  “which operation dominates this workload?”
                </p>
                <ArrayListTradeoffLab />
              </section>

              <section id="choice">
                <h2>The right structure depends on what you do most often.</h2>
                <p>
                  If a workload frequently jumps to known indices, arrays are attractive. If it frequently inserts or
                  removes elements after their locations are already known, linked structures can avoid shifting a long
                  tail of elements. Real language runtimes add implementation details, but this trade-off is the core
                  model you need for later algorithms.
                </p>
                <div className="exercise-panel">
                  <div className="exercise-panel__header">
                    <strong>Quick reasoning check</strong>
                    <span>say the answer before continuing</span>
                  </div>
                  <div className="exercise-panel__body">
                    <p>
                      A structure will mostly be read by known index and rarely changed. Which representation matches
                      that access pattern, and which operation makes the difference?
                    </p>
                  </div>
                </div>
                <div className="action-row">
                  <Link className="button" href="/learn/memory">← How memory works</Link>
                  <LessonCompleteLink
                    storageKey="agocode.progress.chapter-2.arrays-lists"
                    lessonId="chapter-2-arrays-lists"
                    href="/learn/selection-sort"
                  >
                    Continue: Selection Sort →
                  </LessonCompleteLink>
                </div>
              </section>
            </div>
          </article>

          <aside className="margin-column" aria-label="Arrays and linked lists notes">
            <MarginNote label="Index">Array positions are indexed from 0 in Python and most mainstream programming languages.</MarginNote>
            <MarginNote label="Important caveat">Linked-list insertion/deletion is O(1) only once the relevant node or predecessor is already known. Finding it may still cost O(n).</MarginNote>
          </aside>
        </div>
      </div>
    </main>
  );
}
