import Link from "next/link";
import { chapters } from "@/lib/curriculum";

export const metadata = { title: "Roadmap" };

export default function RoadmapPage() {
  return (
    <main className="page">
      <div className="site-shell">
        <div className="eyebrow">Book track</div>
        <h1 className="editorial-title editorial-title--compact">The roadmap is a dependency, not a checklist.</h1>
        <p className="lede">
          The core path keeps the book’s chapter order intact. AgoCode adds interactive laboratories and transfer
          practice without replacing the original conceptual progression.
        </p>

        <section className="section">
          <div className="roadmap-grid">
            <aside className="roadmap-side">
              <div className="eyebrow">Current</div>
              <h2 style={{ fontFamily: "var(--font-editorial)", fontSize: "2rem", margin: "14px 0 8px" }}>
                Chapter 01
              </h2>
              <p>Binary Search is the reference vertical slice. Every later topic must meet the same quality bar.</p>
              <Link className="button button--primary" href="/learn/binary-search">
                Continue →
              </Link>
            </aside>

            <div>
              {chapters.map((chapter) => (
                <article className="roadmap-chapter" key={chapter.number}>
                  <div className="roadmap-chapter__number">{String(chapter.number).padStart(2, "0")}</div>
                  <div>
                    <h2>{chapter.title}</h2>
                    <p>{chapter.status === "active" ? "In implementation now." : "Locked until the reference slice is excellent."}</p>
                    <div className="roadmap-topics">
                      {chapter.topics.map((topic) => (
                        <span className="roadmap-topic" key={topic}>
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
