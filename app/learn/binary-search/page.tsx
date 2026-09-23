import Link from "next/link";
import { BinarySearchExplainCheck } from "@/components/binary-search/BinarySearchExplainCheck";
import { BinarySearchRebuild } from "@/components/binary-search/BinarySearchRebuild";
import { BinarySearchTrace } from "@/components/binary-search/BinarySearchTrace";
import { GuessingLab } from "@/components/binary-search/GuessingLab";
import { OrderedLookupIllustration } from "@/components/binary-search/OrderedLookupIllustration";
import { QuickCheck } from "@/components/binary-search/QuickCheck";
import { MarginNote } from "@/components/ui/MarginNote";

export const metadata = { title: "Binary Search" };

export default function BinarySearchLessonPage() {
  return (
    <main className="page page--tight">
      <div className="site-shell">
        <div className="reading-layout">
          <nav className="reading-nav" aria-label="Binary Search sections">
            <a href="#intuition">01 · Intuition</a>
            <a href="#better-way">02 · Better way</a>
            <a href="#halving">03 · Halving</a>
            <a href="#sorted">04 · Sorted input</a>
            <a href="#code">05 · Code trace</a>
            <a href="#rebuild">06 · Rebuild</a>
            <a href="#explain">07 · Explain</a>
            <a href="#recap">08 · Recap</a>
          </nav>

          <article className="reading-column">
            <div className="eyebrow">Chapter 01 · Introduction to algorithms</div>
            <h1 className="editorial-title editorial-title--compact">Binary Search</h1>
            <p className="lede">
              Before code, build the search instinct: if the data is ordered, every comparison can remove far more
              than one possibility.
            </p>

            <div className="prose-block">
              <section id="intuition">
                <h2>Start from a familiar search.</h2>
                <p>
                  Imagine looking for a name in a sorted directory. Starting at the first entry works, but the order
                  gives you more information than that. You can open near the middle, compare once, and immediately
                  know which side can still contain the answer.
                </p>
                <OrderedLookupIllustration />
                <p>
                  That single idea—<strong>use order to discard impossible regions</strong>—is the mental model we
                  will keep while the representation changes from pages, to numbers, to array indices, and finally to
                  code.
                </p>
              </section>

              <section id="better-way">
                <h2>Feel the difference before naming it.</h2>
                <p>
                  The exercise below keeps one hidden number fixed. First search one number at a time. Then reset and
                  use the midpoint. Watch the remaining candidate interval, not just the attempt counter.
                </p>
                <GuessingLab />
                <p>
                  One-by-one search removes one candidate after a failed guess. Midpoint search can remove roughly
                  half of the remaining candidates. The second strategy is binary search.
                </p>
              </section>

              <section id="halving">
                <h2>The important quantity is what remains.</h2>
                <p>
                  If every decision halves the candidate set, the number of remaining values collapses quickly. For a
                  clean power of two, the progression is especially easy to see:
                </p>
                <div className="halving-sequence" aria-label="Halving 128 repeatedly">
                  {[128, 64, 32, 16, 8, 4, 2, 1].map((value, index, values) => (
                    <div key={value} style={{ display: "contents" }}>
                      <div className="halving-step">{value}</div>
                      {index < values.length - 1 ? <span className="halving-arrow">→</span> : null}
                    </div>
                  ))}
                </div>
                <p>
                  This is why binary search grows logarithmically: the question is not “how many items exist?” but
                  “how many times can the remaining search space be halved?”
                </p>
                <QuickCheck />
              </section>

              <section id="sorted">
                <h2>Sorted input is not a detail.</h2>
                <p>
                  Binary search is only safe when the ordering lets one comparison rule out an entire side. If the
                  values are unsorted, seeing a large midpoint value tells you nothing reliable about where a smaller
                  target might be.
                </p>
                <div className="exercise-panel">
                  <div className="exercise-panel__header">
                    <strong>Counterexample</strong>
                    <span>why the precondition matters</span>
                  </div>
                  <div className="exercise-panel__body">
                    <p className="mono" style={{ marginTop: 0 }}>[31, 7, 44, 3, 26, 78, 11]</p>
                    <p style={{ marginBottom: 0, color: "var(--ink-secondary)" }}>
                      A comparison at the middle cannot tell you which half contains 7. The “discard half” reasoning
                      breaks because position no longer carries ordering information.
                    </p>
                  </div>
                </div>
              </section>

              <section id="code">
                <h2>Now connect the mental model to code.</h2>
                <p>
                  <code className="mono">low</code> and <code className="mono">high</code> describe the current
                  candidate interval. <code className="mono">mid</code> chooses one representative position. Every
                  update must preserve the invariant that the target, if present, still lies inside the interval.
                </p>
                <BinarySearchTrace />
                <p>
                  The trace pauses at each important comparison. Predict the update before advancing; passive
                  playback is deliberately not enough.
                </p>
                <p>
                  The code is short; the invariant is the real knowledge. If you change whether
                  <code className="mono"> high</code> is inclusive or exclusive, the loop condition and updates must
                  change consistently too.
                </p>
              </section>

              <section id="rebuild">
                <h2>Hide the finished code and rebuild it.</h2>
                <p>
                  Recognition is weaker than recall. Write the function again and let the browser run real Python
                  tests against your implementation. Use hints only when the invariant no longer tells you what to do.
                </p>
                <BinarySearchRebuild />
              </section>

              <section id="explain">
                <h2>Then defend why it works.</h2>
                <p>
                  Passing tests is necessary, but implementation alone does not prove that the model is clear. Check
                  the invariant, the sorted-input precondition, and what logarithmic growth actually means.
                </p>
                <BinarySearchExplainCheck />
              </section>

              <section id="recap">
                <h2>Recap without rereading.</h2>
                <div className="exercise-panel">
                  <div className="exercise-panel__header">
                    <strong>Close the loop</strong>
                    <span>say these aloud</span>
                  </div>
                  <div className="exercise-panel__body">
                    <ol style={{ margin: 0, paddingLeft: 22, lineHeight: 1.9 }}>
                      <li>Why must the input be sorted?</li>
                      <li>What do low and high represent?</li>
                      <li>What is removed after a failed midpoint comparison?</li>
                      <li>Why does the running time grow as O(log n)?</li>
                      <li>What bug appears if your interval convention and updates disagree?</li>
                    </ol>
                  </div>
                </div>
                <div className="action-row">
                  <Link className="button" href="/lab/binary-search">
                    Open custom trace lab
                  </Link>
                  <Link className="button" href="/practice/binary-search">
                    Transfer the idea
                  </Link>
                  <Link className="button button--primary" href="/learn/running-time">
                    Continue chapter: Running Time →
                  </Link>
                </div>
              </section>
            </div>
          </article>

          <aside className="margin-column" aria-label="Lesson notes">
            <MarginNote label="Remember">The algorithm is not “pick the middle.” It is “use order to discard a region safely.”</MarginNote>
            <MarginNote label="Watch">The first public implementation uses an inclusive interval: both low and high are valid candidate indices.</MarginNote>
            <MarginNote label="Why?">The visualizer always shows the candidate interval because that is the invariant you need to reason about.</MarginNote>
          </aside>
        </div>
      </div>
    </main>
  );
}
