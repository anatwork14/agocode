import Link from "next/link";
import { ChapterOneRecapCheck } from "@/components/chapter-one/ChapterOneRecapCheck";

export const metadata = { title: "Chapter 1 Recap" };

const sequence = [
  ["01", "Binary Search", "Use sorted order to discard impossible regions.", "/learn/binary-search"],
  ["02", "Running Time", "Compare how the amount of work changes as n grows.", "/learn/running-time"],
  ["03", "Big O", "Name common growth patterns without tying them to one machine.", "/learn/big-o"],
  ["04", "Traveling Salesperson", "See how a brute-force permutation search can explode factorially.", "/learn/traveling-salesperson"],
] as const;

export default function ChapterOneRecapPage() {
  return (
    <main className="page">
      <div className="site-shell">
        <div className="eyebrow">Chapter 01 · Recap</div>
        <h1 className="editorial-title editorial-title--compact">One chapter, one connected mental model.</h1>
        <p className="lede">
          Do not reread everything first. Reconstruct the sequence: a concrete search algorithm led to a question
          about scaling, which led to growth notation, which led to an example where brute force grows explosively.
        </p>

        <section className="section chapter-recap-map" aria-label="Chapter 1 learning sequence">
          {sequence.map(([number, title, description, href]) => (
            <Link href={href} className="chapter-recap-map__row" key={number}>
              <span className="chapter-recap-map__number mono">{number}</span>
              <div>
                <strong>{title}</strong>
                <p>{description}</p>
              </div>
              <span aria-hidden="true">→</span>
            </Link>
          ))}
        </section>

        <section className="section">
          <ChapterOneRecapCheck />
          <div className="action-row">
            <Link className="button" href="/learn">
              Back to Book
            </Link>
            <Link className="button button--primary" href="/roadmap">
              Preview Chapter 2 →
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
