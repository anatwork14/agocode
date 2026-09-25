import Link from "next/link";
import { chapters } from "@/lib/curriculum";

export const metadata = { title: "Roadmap" };

const activeRoutes: Record<number, string> = {
  1: "/learn/binary-search",
  2: "/learn/memory",
  3: "/learn/recursion",
  4: "/learn/divide-and-conquer",
  5: "/learn/hash-tables",
  6: "/learn/breadth-first-search",
  7: "/learn/dijkstra",
  8: "/learn/greedy",
  9: "/learn/dynamic-programming",
  10: "/learn/k-nearest-neighbors",
  11: "/learn/where-to-go-next",
};

export default function RoadmapPage() {
  const liveChapters = chapters.filter((chapter) => chapter.status === "active");
  const current = liveChapters.at(-1) ?? chapters[0];

  return (
    <main className="page">
      <div className="site-shell">
        <div className="eyebrow">Visual-first Book Track</div>
        <h1 className="editorial-title editorial-title--compact">The roadmap is a dependency, not a checklist.</h1>
        <p className="lede">
          This page preserves the original 11-chapter visual path. The expanded syllabus now surrounds it with deeper
          data-structure trade-offs, correctness, modeling, canonical problem families, algorithm-design strategy, and engineering constraints.
        </p>
        <div className="action-row">
          <Link className="button button--primary" href="/syllabus">Open expanded syllabus →</Link>
          <Link className="button" href="/exercises">Browse canonical problems</Link>
        </div>

        <section className="section">
          <div className="roadmap-grid">
            <aside className="roadmap-side">
              <div className="eyebrow">Book Track frontier</div>
              <h2 style={{ fontFamily: "var(--font-editorial)", fontSize: "2rem", margin: "14px 0 8px" }}>
                Chapter {String(current.number).padStart(2, "0")}
              </h2>
              <p>
                {current.title}. The visual-first sequence is live end-to-end. New source material now expands sideways
                into ADTs, trees/heaps, string algorithms, DFS/backtracking, MST, hardness, approximation, and problem-design practice.
              </p>
              <Link className="button button--primary" href={activeRoutes[current.number] ?? "/learn"}>
                Open final Book Track chapter →
              </Link>
            </aside>

            <div>
              {chapters.map((chapter) => {
                const live = chapter.status === "active";
                const route = activeRoutes[chapter.number];
                return (
                  <article className={`roadmap-chapter ${live ? "roadmap-chapter--active" : ""}`} key={chapter.number}>
                    <div className="roadmap-chapter__number">{String(chapter.number).padStart(2, "0")}</div>
                    <div>
                      <div className="roadmap-chapter__heading">
                        <h2>{chapter.title}</h2>
                        <span className={live ? "roadmap-chapter__state roadmap-chapter__state--live" : "roadmap-chapter__state"}>
                          {live ? "Live" : "Planned"}
                        </span>
                      </div>
                      <p>{live ? "Interactive lesson content, active exercises, or cumulative recall are available now." : "Planned."}</p>
                      <div className="roadmap-topics">
                        {chapter.topics.map((topic) => <span className="roadmap-topic" key={topic}>{topic}</span>)}
                      </div>
                      {live && route ? <Link className="roadmap-chapter__link" href={route}>Open chapter →</Link> : null}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
