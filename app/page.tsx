import Link from "next/link";
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
              AgoCode turns algorithm learning into a visual, hands-on sequence: first build the mental model,
              then trace the state, reconstruct the code, and finally apply the idea to unfamiliar problems.
            </p>
            <div className="action-row">
              <Link className="button button--primary" href="/learn/binary-search">
                Continue Chapter 01 →
              </Link>
              <Link className="button" href="/roadmap">
                Open roadmap
              </Link>
            </div>
          </div>

          <aside className="hero__aside" aria-label="Current lesson">
            <div className="hero__aside-label">Continue reading</div>
            <h2>Binary Search</h2>
            <p>
              Start with a guessing game, discover why halving works, then connect the visual state to code.
            </p>
            <div className="halving-sequence" aria-label="Search space halving example">
              {[100, 50, 25, 13, 7, 4, 2, 1].map((value, index, values) => (
                <div key={value} style={{ display: "contents" }}>
                  <div className="halving-step">{value}</div>
                  {index < values.length - 1 ? <span className="halving-arrow">→</span> : null}
                </div>
              ))}
            </div>
          </aside>
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
              ["01", "Understand", "Build a concrete visual model before formal notation."],
              ["02", "Trace", "Predict and inspect each state transition."],
              ["03", "Rebuild", "Write the algorithm again without copying the finished code."],
              ["04", "Transfer", "Recognize the idea inside an unlabeled problem."],
            ].map(([number, title, description]) => (
              <article className="learning-strip__item" key={number}>
                <div className="learning-strip__number">{number}</div>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="section-heading">
            <div className="section-heading__index">BOOK TRACK</div>
            <div>
              <h2>One coherent path, chapter by chapter.</h2>
              <p>
                The core sequence follows the learning progression of <em>Grokking Algorithms</em>, while AgoCode
                adds interaction, executable traces, recall, and transfer practice around that structure.
              </p>
            </div>
          </div>

          <div className="chapter-list">
            {chapters.slice(0, 6).map((chapter) => (
              <Link
                href={chapter.number === 1 ? "/learn/binary-search" : "/roadmap"}
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
                  {chapter.status === "active" ? "Now learning" : "Planned"}
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
