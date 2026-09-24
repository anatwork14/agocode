import Link from "next/link";
import { ChapterTwoRecapCheck } from "@/components/selection-sort/ChapterTwoRecapCheck";

export const metadata = { title: "Chapter 2 Recap" };

const sequence = [
  ["01", "How memory works", "Values occupy addressed locations in memory.", "/learn/memory"],
  ["02", "Arrays and linked lists", "Storage layout changes the cost of reads, inserts, and deletes.", "/learn/arrays-linked-lists"],
  ["03", "Selection Sort", "Repeatedly scan for one smallest remaining value and place it next.", "/learn/selection-sort"],
] as const;

export default function ChapterTwoRecapPage() {
  return (
    <main className="page">
      <div className="site-shell">
        <div className="eyebrow">Chapter 02 · Recap</div>
        <h1 className="editorial-title editorial-title--compact">From physical layout to algorithm cost.</h1>
        <p className="lede">
          Reconstruct the chapter without rereading it first: memory placement explains array/list trade-offs, and
          repeated linear scans explain why Selection Sort grows quadratically.
        </p>

        <section className="section chapter-recap-map" aria-label="Chapter 2 learning sequence">
          {sequence.map(([number, title, description, href]) => (
            <Link href={href} className="chapter-recap-map__row" key={number}>
              <span className="chapter-recap-map__number mono">{number}</span>
              <div><strong>{title}</strong><p>{description}</p></div>
              <span aria-hidden="true">→</span>
            </Link>
          ))}
        </section>

        <section className="section">
          <ChapterTwoRecapCheck />
          <div className="action-row">
            <Link className="button" href="/learn/selection-sort">← Selection Sort</Link>
            <Link className="button button--primary" href="/learn/recursion">Continue to Recursion →</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
