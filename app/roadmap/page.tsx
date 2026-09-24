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
};

export default function RoadmapPage() {
  const liveChapters = chapters.filter((chapter) => chapter.status === "active");
  const current = liveChapters.at(-1) ?? chapters[0];

  return (
    <main className="page">
      <div className="site-shell">
        <div className="eyebrow">Book track</div>
        <h1 className="editorial-title editorial-title--compact">The roadmap is a dependency, not a checklist.</h1>
        <p className="lede">
          The core path keeps the book&apos;s chapter order intact. AgoCode adds interactive laboratories, reconstruction,
          cumulative recall, and later transfer practice without replacing the conceptual progression.
        </p>

        <section className="section">
          <div className="roadmap-grid">
            <aside className="roadmap-side">
              <div className="eyebrow">Current frontier</div>
              <h2 style={{ fontFamily: "var(--font-editorial)", fontSize: "2rem", margin: "14px 0 8px" }}>
                Chapter {String(current.number).padStart(2, "0")}
              </h2>
              <p>
                {current.title}. Chapters before this frontier already have live Book Track slices; later chapters remain
                visible so the dependency chain stays understandable.
              </p>
              <Link className="button button--primary" href={activeRoutes[current.number] ?? "/learn"}>
                Continue current chapter →
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
                      <p>
                        {live
                          ? "Interactive lesson content, active exercises, or cumulative recall are available now."
                          : "Planned in book order; implementation starts after the prerequisite chapter has a stable learning slice."}
                      </p>
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
