import Link from "next/link";
import { chapters } from "@/lib/curriculum";

export const metadata = { title: "Book" };

const liveTopics: Record<number, readonly (readonly [string, string])[]> = {
  1: [
    ["Binary Search", "/learn/binary-search"],
    ["Running Time", "/learn/running-time"],
    ["Big O", "/learn/big-o"],
    ["Traveling Salesperson", "/learn/traveling-salesperson"],
    ["Chapter 1 Recap", "/learn/chapter-1-recap"],
  ],
  2: [
    ["How Memory Works", "/learn/memory"],
    ["Arrays & Linked Lists", "/learn/arrays-linked-lists"],
    ["Selection Sort", "/learn/selection-sort"],
    ["Chapter 2 Recap", "/learn/chapter-2-recap"],
  ],
  3: [
    ["Recursion", "/learn/recursion"],
  ],
};

export default function LearnIndexPage() {
  return (
    <main className="page">
      <div className="site-shell">
        <div className="eyebrow">Read mode</div>
        <h1 className="editorial-title editorial-title--compact">The interactive book.</h1>
        <p className="lede">
          Read in order when you want the full foundation, or jump into a topic when you need a focused refresher.
          Each finished lesson connects prose, original visuals, traceable state, code, exercises, and recall.
        </p>

        <section className="section">
          <div className="chapter-list">
            {chapters.map((chapter) => {
              const topics = liveTopics[chapter.number];
              if (topics) {
                return (
                  <div className="chapter-row chapter-row--expanded" key={chapter.number}>
                    <div className="chapter-row__number">{String(chapter.number).padStart(2, "0")}</div>
                    <div>
                      <h3>{chapter.title}</h3>
                      <p>{chapter.topics.join(" · ")}</p>
                      <div className="action-row" style={{ marginTop: 16 }}>
                        {topics.map(([title, href]) => (
                          <Link className="button" href={href} key={title}>{title}</Link>
                        ))}
                      </div>
                    </div>
                    <div className="chapter-row__status chapter-row__status--active">Open</div>
                  </div>
                );
              }

              return (
                <Link key={chapter.number} href="/roadmap" className="chapter-row">
                  <div className="chapter-row__number">{String(chapter.number).padStart(2, "0")}</div>
                  <div>
                    <h3>{chapter.title}</h3>
                    <p>{chapter.topics.join(" · ")}</p>
                  </div>
                  <div className="chapter-row__status">Planned</div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
