import Link from "next/link";
import { ChapterFiveRecapCheck } from "@/components/hash-tables/ChapterFiveRecapCheck";

export const metadata = { title: "Chapter 5 Recap" };

const sequence = [
  ["01", "Hash function + array", "Turn a meaningful key into a repeatable valid bucket index.", "/learn/hash-tables#hash-function"],
  ["02", "Use cases", "Use key lookup for mappings, duplicate filtering, and cached results.", "/learn/hash-tables#use-cases"],
  ["03", "Collisions", "Keep multiple entries reachable when different keys share a bucket.", "/learn/hash-tables#collisions"],
  ["04", "Performance", "Good distribution and enough capacity keep bucket work small on average.", "/learn/hash-tables#performance"],
] as const;

export default function ChapterFiveRecapPage() {
  return (
    <main className="page">
      <div className="site-shell">
        <div className="eyebrow">Chapter 05 · Recap</div>
        <h1 className="editorial-title editorial-title--compact">A key becomes useful when it leads you straight to state.</h1>
        <p className="lede">
          Reconstruct the chapter before rereading it. A hash table is more than “a fast dictionary”: its usefulness and
          performance come from the relationship between the key, hash function, underlying array, collisions, and table density.
        </p>

        <section className="section chapter-recap-map" aria-label="Chapter 5 learning sequence">
          {sequence.map(([number, title, description, href]) => (
            <Link href={href} className="chapter-recap-map__row" key={number}>
              <span className="chapter-recap-map__number mono">{number}</span>
              <div><strong>{title}</strong><p>{description}</p></div>
              <span aria-hidden="true">→</span>
            </Link>
          ))}
        </section>

        <section className="section">
          <ChapterFiveRecapCheck />
          <div className="action-row">
            <Link className="button" href="/learn/hash-tables">← Hash Tables</Link>
            <Link className="button button--primary" href="/roadmap">Preview Graphs + BFS →</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
