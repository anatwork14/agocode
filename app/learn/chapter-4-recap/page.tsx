import Link from "next/link";
import { ChapterFourRecapCheck } from "@/components/quicksort/ChapterFourRecapCheck";

export const metadata = { title: "Chapter 4 Recap" };

const sequence = [
  ["01", "Divide & Conquer", "Choose a base case, then reduce each harder input to the same problem at a smaller size.", "/learn/divide-and-conquer"],
  ["02", "Partition", "Choose a pivot and use comparisons to create two smaller sorting problems.", "/learn/quicksort#partition"],
  ["03", "Recurse + combine", "Sort both sides recursively, then concatenate sorted-left + pivot + sorted-right.", "/learn/quicksort#recurse"],
  ["04", "Average vs. worst case", "Balanced partitions keep the recursion shallow; lopsided partitions can make it linear in depth.", "/learn/quicksort#runtime"],
] as const;

export default function ChapterFourRecapPage() {
  return (
    <main className="page">
      <div className="site-shell">
        <div className="eyebrow">Chapter 04 · Recap</div>
        <h1 className="editorial-title editorial-title--compact">Reduce, partition, recurse, combine.</h1>
        <p className="lede">
          Reconstruct the chapter without rereading it first. The goal is not to remember one Quicksort listing; it is
          to recover the divide-and-conquer decisions that make the implementation and its runtime shape make sense.
        </p>

        <section className="section chapter-recap-map" aria-label="Chapter 4 learning sequence">
          {sequence.map(([number, title, description, href]) => (
            <Link href={href} className="chapter-recap-map__row" key={number}>
              <span className="chapter-recap-map__number mono">{number}</span>
              <div><strong>{title}</strong><p>{description}</p></div>
              <span aria-hidden="true">→</span>
            </Link>
          ))}
        </section>

        <section className="section">
          <ChapterFourRecapCheck />
          <div className="action-row">
            <Link className="button" href="/learn/quicksort">← Quicksort</Link>
            <Link className="button button--primary" href="/roadmap">Preview Hash Tables →</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
