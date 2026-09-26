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

const productRails = [
  {
    label: "Knowledge map",
    title: "Book + syllabus + structural families",
    description: "The 11-chapter Book Track is complete, every expanded syllabus module has a concrete learning surface, and cross-source problems are connected through structural-family pages.",
    links: [["Open syllabus map", "/syllabus/map"], ["Browse problem families", "/exercises/families"]],
  },
  {
    label: "Design judgment",
    title: "Workbenches before algorithm names",
    description: "Representation, invariants, amortization, graph modeling, DP state, priority queues, backtracking, greedy counterexamples, transformations, special cases, and optimization strategy are interactive rather than static notes.",
    links: [["Open the Lab", "/lab"], ["Design a solution", "/solve"]],
  },
  {
    label: "Adaptive practice",
    title: "Choose → vary → retrieve",
    description: "The planner uses mastery gaps, friction, difficulty calibration, attempt history, problem independence, retrieval freshness, blind misses, and diversity. Mixed sessions and model-first variants remove labels progressively.",
    links: [["Choose next problem", "/practice/next"], ["Build mixed session", "/practice/session"], ["Practice variants", "/practice/variants"]],
  },
  {
    label: "Durable evidence",
    title: "Attempts survive; memory gets retested",
    description: "Finalized reasoning attempts create monotonic best-ever evidence. Independence, transfer, delayed recall, and a separate retrieval-freshness clock feed objective review scheduling without letting a weak retry erase prior proof.",
    links: [["Open review", "/review"], ["Inspect progress", "/progress"], ["Manage learning data", "/settings/data"]],
  },
  {
    label: "Learner control",
    title: "Sets, portability, and local ownership",
    description: "Bookmarks and named problem sets support custom study plans. Learning evidence can be exported, imported, or reset without requiring an account or trapping the learner in one browser forever.",
    links: [["Open sets", "/sets"], ["Export / import data", "/settings/data"]],
  },
] as const;

const deferred = [
  "Optional account and cross-device synchronization after the local evidence schema is stable.",
  "Server-backed collaboration or shared sets only when they add learning value beyond local ownership.",
  "A constrained AI tutor only for misconception diagnosis, Socratic prompts, counterexamples, rubric-based explanation feedback, and transfer variants — never as the default solution generator.",
  "Additional production hardening such as automated browser-level accessibility auditing and broader performance budgets as the content surface grows.",
] as const;

export default function RoadmapPage() {
  const liveChapters = chapters.filter((chapter) => chapter.status === "active");
  const current = liveChapters.at(-1) ?? chapters[0];

  return (
    <main className="page">
      <div className="site-shell">
        <div className="eyebrow">Core v1 learning system</div>
        <h1 className="editorial-title editorial-title--compact">The core loop is complete; the roadmap now protects depth, not feature count.</h1>
        <p className="lede">
          AgoCode now connects visual learning, algorithm-design workbenches, source-aware problems, adaptive practice,
          attempt history, independence, transfer, delayed retrieval, custom sets, and portable evidence into one deterministic loop.
          Future work is intentionally separated from the core so infrastructure or AI cannot replace the learning system.
        </p>
        <div className="action-row">
          <Link className="button button--primary" href="/practice/next">Continue from my evidence →</Link>
          <Link className="button" href="/syllabus/map">Open knowledge map</Link>
          <Link className="button" href="/progress">Inspect evidence</Link>
        </div>

        <section className="section">
          <div className="section-heading">
            <div className="section-heading__index">SYSTEM</div>
            <div>
              <h2>Five completed product rails.</h2>
              <p>Each rail has a learner-facing destination and produces or consumes inspectable evidence.</p>
            </div>
          </div>
          <div className="feature-grid">
            {productRails.map((rail) => (
              <article className="feature-card" key={rail.label}>
                <span className="eyebrow">{rail.label}</span>
                <h3>{rail.title}</h3>
                <p>{rail.description}</p>
                <div className="action-row">
                  {rail.links.map(([label, href]) => <Link className="button button--quiet" href={href} key={href}>{label} →</Link>)}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="roadmap-grid">
            <aside className="roadmap-side">
              <div className="eyebrow">Book Track · complete</div>
              <h2 style={{ fontFamily: "var(--font-editorial)", fontSize: "2rem", margin: "14px 0 8px" }}>
                Chapter {String(current.number).padStart(2, "0")}
              </h2>
              <p>
                {current.title}. The original visual-first sequence is live end-to-end and remains the low-friction entry path.
                The expanded syllabus grows around it rather than replacing it.
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
                      <p>{live ? "Interactive lesson content, active exercises, and cumulative recall are available now." : "Planned."}</p>
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

        <section className="section">
          <div className="section-heading">
            <div className="section-heading__index">LATER</div>
            <div>
              <h2>Intentionally deferred, not missing from the core.</h2>
              <p>The deterministic learning system must remain complete without accounts, cloud sync, or an AI model.</p>
            </div>
          </div>
          <div className="callout-list">
            {deferred.map((item) => <div className="callout" key={item}>{item}</div>)}
          </div>
        </section>
      </div>
    </main>
  );
}
