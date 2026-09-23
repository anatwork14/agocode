import Link from "next/link";
import { chapters } from "@/lib/curriculum";

export const metadata = { title: "Book" };

export default function LearnIndexPage() {
  return (
    <main className="page">
      <div className="site-shell">
        <div className="eyebrow">Read mode</div>
        <h1 className="editorial-title editorial-title--compact">The interactive book.</h1>
        <p className="lede">
          Read in order when you want the full foundation, or jump into a topic when you need a focused refresher.
          Each finished lesson will connect prose, original visuals, traceable state, code, exercises, and recall.
        </p>

        <section className="section">
          <div className="chapter-list">
            {chapters.map((chapter) => (
              <Link
                key={chapter.number}
                href={chapter.number === 1 ? "/learn/binary-search" : "/roadmap"}
                className="chapter-row"
              >
                <div className="chapter-row__number">{String(chapter.number).padStart(2, "0")}</div>
                <div>
                  <h3>{chapter.title}</h3>
                  <p>{chapter.topics.join(" · ")}</p>
                </div>
                <div className={`chapter-row__status ${chapter.status === "active" ? "chapter-row__status--active" : ""}`}>
                  {chapter.status === "active" ? "Open" : "Planned"}
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
