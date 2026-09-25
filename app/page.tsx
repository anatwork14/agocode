import Link from "next/link";
import { LearningPlan } from "@/components/home/LearningPlan";
import { chapters } from "@/lib/curriculum";

export default function HomePage() {
  return (
    <main>
      <div className="site-shell">
        <section className="hero">
          <div>
            <div className="eyebrow">Interactive algorithm notebook</div>
            <h1 className="editorial-title">See it. Trace it. Write it again.</h1>
            <p className="lede">
              AgoCode turns algorithm learning into a visual, hands-on sequence: build the mental model, model the problem,
              trace the state, reconstruct the mechanism, explain the invariant, and transfer the idea to unfamiliar work.
            </p>
            <div className="action-row">
              <Link className="button button--primary" href="/learn">
                Open the Book →
              </Link>
              <Link className="button" href="/exercises">
                Solve a problem
              </Link>
            </div>
          </div>

          <LearningPlan />
        </section>

        <section className="section">
          <div className="section-heading">
            <div className="section-heading__index">THE LOOP</div>
            <div>
              <h2>Learning is evidence, not familiarity.</h2>
              <p>
                Each concept moves from intuition to independent use. Watching an animation is only the start.
              </p>
            </div>
          </div>

          <div className="learning-strip">
            {[
              ["01", "Understand + Model", "Build a concrete mental model, then translate the story into computational structure."],
              ["02", "Predict + Trace", "Reason about each state transition before it is revealed."],
              ["03", "Rebuild + Explain", "Write the mechanism again and defend why the invariant is safe."],
              ["04", "Transfer + Recall", "Recognize the idea after labels disappear, then return after a delay."],
            ].map(([number, title, description]) => (
              <article className="learning-strip__item" key={number}>
                <div className="learning-strip__number">{number}</div>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section home-knowledge">
          <div className="section-heading">
            <div className="section-heading__index">BEYOND THE BOOK</div>
            <div>
              <h2>Study the mechanism. Learn how to choose it.</h2>
              <p>
                The expanded AgoCode system combines data-structure depth, interview-style solution development, and algorithm-design
                modeling. The result is a path from guided learning to unlabeled, source-grounded problem solving.
              </p>
            </div>
          </div>

          <div className="home-knowledge__grid">
            <Link href="/syllabus" className="home-knowledge__item">
              <span className="mono">01 · MAP</span>
              <h3>Expanded syllabus</h3>
              <p>ADTs, correctness, heaps, trees, strings, graphs, search, optimization, hardness, and algorithm engineering.</p>
              <strong>See the dependency map →</strong>
            </Link>
            <Link href="/exercises" className="home-knowledge__item">
              <span className="mono">02 · PRACTICE</span>
              <h3>Canonical Problem Atlas</h3>
              <p>Named problem families, complete Goodrich workbook references, blind recognition, and persistent reasoning notebooks.</p>
              <strong>Choose a problem →</strong>
            </Link>
            <Link href="/blog" className="home-knowledge__item">
              <span className="mono">03 · THINK</span>
              <h3>Ways of Solving</h3>
              <p>Original field notes on modeling, brute force, invariants, sorting, special cases, variants, complexity, and design logs.</p>
              <strong>Read the field notes →</strong>
            </Link>
          </div>
        </section>

        <section className="section">
          <div className="section-heading">
            <div className="section-heading__index">BOOK TRACK</div>
            <div>
              <h2>One coherent path, chapter by chapter.</h2>
              <p>
                The core sequence follows the learning progression of <em>Grokking Algorithms</em>, while AgoCode
                adds original interactions, executable traces, recall, and transfer practice around that structure.
              </p>
            </div>
          </div>

          <div className="chapter-list">
            {chapters.slice(0, 6).map((chapter) => (
              <Link
                href={chapter.number === 1 ? "/learn" : "/roadmap"}
                className="chapter-row"
                key={chapter.number}
              >
                <div className="chapter-row__number">{String(chapter.number).padStart(2, "0")}</div>
                <div>
                  <h3>{chapter.title}</h3>
                  <p>{chapter.topics.join(" · ")}</p>
                </div>
                <div
                  className={`chapter-row__status ${chapter.status === "active" ? "chapter-row__status--active" : ""}`}
                >
                  {chapter.status === "active" ? "Interactive" : "Planned"}
                </div>
              </Link>
            ))}
          </div>

          <div className="action-row">
            <Link className="button button--quiet" href="/roadmap">
              View all 11 chapters →
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
