import Link from "next/link";
import { ComplexityRace } from "@/components/complexity/ComplexityRace";
import { WorstCaseCheck } from "@/components/complexity/WorstCaseCheck";
import { MarginNote } from "@/components/ui/MarginNote";

export const metadata = { title: "Big O Notation" };

const commonClasses = [
  ["O(log n)", "Logarithmic", "Repeatedly discard a constant fraction, such as binary search."],
  ["O(n)", "Linear", "Work grows directly with the number of items, such as a full scan."],
  ["O(n log n)", "Linearithmic", "Common for efficient comparison sorting."],
  ["O(n²)", "Quadratic", "Often appears when each item is paired or compared with many others."],
  ["O(n!)", "Factorial", "Explodes when every ordering/permutation must be considered."],
] as const;

export default function BigOPage() {
  return (
    <main className="page page--tight">
      <div className="site-shell">
        <div className="reading-layout">
          <nav className="reading-nav" aria-label="Big O sections">
            <a href="#notation">01 · Notation</a>
            <a href="#classes">02 · Common classes</a>
            <a href="#worst-case">03 · Worst case</a>
            <a href="#recap">04 · Recap</a>
          </nav>

          <article className="reading-column">
            <div className="eyebrow">Chapter 01 · Introduction to algorithms</div>
            <h1 className="editorial-title editorial-title--compact">Big O Notation</h1>
            <p className="lede">
              Big O gives us a compact way to talk about how an algorithm's work grows as the input grows. It is a
              comparison language for scale, not a stopwatch reading.
            </p>

            <div className="prose-block">
              <section id="notation">
                <h2>Put the growth rule inside O( ).</h2>
                <p>
                  If simple search may inspect <span className="mono">n</span> elements, we describe its growth as
                  <span className="mono"> O(n)</span>. If binary search needs about <span className="mono">log₂ n</span>
                  midpoint decisions, we describe it as <span className="mono">O(log n)</span>.
                </p>
                <div className="big-o-anatomy" aria-label="Anatomy of Big O notation">
                  <span className="big-o-anatomy__symbol mono">O(</span>
                  <strong className="mono">log n</strong>
                  <span className="big-o-anatomy__symbol mono">)</span>
                  <div className="big-o-anatomy__note">growth in the number of operations</div>
                </div>
                <p>
                  Throughout this introductory chapter, we use the notation in the same practical way as the learning
                  sequence: compare how operation counts scale, especially in the worst case. Average-case behavior is
                  revisited later when quicksort makes the distinction important.
                </p>
              </section>

              <section id="classes">
                <h2>Growth classes separate quickly.</h2>
                <p>
                  With tiny inputs, several algorithms can all feel fast. Increase <span className="mono">n</span> and
                  the shape of the growth becomes the dominant story. Use the control below to compare five common
                  classes.
                </p>
                <ComplexityRace />

                <div className="complexity-definitions">
                  {commonClasses.map(([notation, name, description]) => (
                    <div className="complexity-definition" key={notation}>
                      <strong className="mono">{notation}</strong>
                      <div>
                        <b>{name}</b>
                        <p>{description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section id="worst-case">
                <h2>A lucky run does not erase the growth bound.</h2>
                <p>
                  A linear search can sometimes find its target immediately. But when we need a dependable upper view
                  of how its work can grow, we still account for the case where the target is last—or absent—and every
                  item must be checked.
                </p>
                <WorstCaseCheck />
              </section>

              <section id="recap">
                <h2>Keep the distinction clear.</h2>
                <div className="exercise-panel">
                  <div className="exercise-panel__header">
                    <strong>Chapter notes</strong>
                    <span>recall before moving on</span>
                  </div>
                  <div className="exercise-panel__body">
                    <ul className="recap-list">
                      <li>Algorithm growth is compared through operations, not fixed seconds.</li>
                      <li><span className="mono">O(log n)</span> grows much more slowly than <span className="mono">O(n)</span>.</li>
                      <li>Common classes can differ modestly at small <span className="mono">n</span> and dramatically at large <span className="mono">n</span>.</li>
                      <li>In this introductory track, worst-case reasoning gives a useful guarantee about how work can scale.</li>
                    </ul>
                  </div>
                </div>
                <div className="action-row">
                  <Link className="button" href="/learn/running-time">
                    ← Running Time
                  </Link>
                  <Link className="button button--primary" href="/roadmap">
                    Next: Traveling Salesperson (planned) →
                  </Link>
                </div>
              </section>
            </div>
          </article>

          <aside className="margin-column" aria-label="Big O notes">
            <MarginNote label="Not seconds">Big O is useful precisely because it abstracts away one particular machine or benchmark run.</MarginNote>
            <MarginNote label="Later">Average case matters too. The Book Track returns to it when quicksort gives us a concrete reason to compare both.</MarginNote>
          </aside>
        </div>
      </div>
    </main>
  );
}
