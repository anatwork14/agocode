import Link from "next/link";
import { ChapterElevenRecapCheck } from "@/components/next-topics/ChapterElevenRecapCheck";

export const metadata = { title: "Chapter 11 Recap" };

const sequence = [
  ["01", "Ordered structures", "Use binary search trees to connect comparison-based search with dynamic insertion and deletion.", "/learn/where-to-go-next#trees"],
  ["02", "Search indexes", "Invert document content into term → locations mappings for fast retrieval.", "/learn/where-to-go-next#indexes"],
  ["03", "Representation shifts", "See the Fourier transform as a pointer to solving signal problems in a different representation.", "/learn/where-to-go-next#signals"],
  ["04", "Scale-out computation", "Understand parallel overhead, load balancing, and the map/reduce split.", "/learn/where-to-go-next#parallel"],
  ["05", "Approximate data structures", "Trade exactness for memory with Bloom filters and cardinality estimation.", "/learn/where-to-go-next#probability"],
  ["06", "General optimization", "Frame objectives and constraints through linear programming.", "/learn/where-to-go-next#optimization"],
] as const;

export default function ChapterElevenRecapPage() {
  return (
    <main className="page">
      <div className="site-shell">
        <div className="eyebrow">Chapter 11 · Recap</div>
        <h1 className="editorial-title editorial-title--compact">The foundation is complete. Keep the map.</h1>
        <p className="lede">
          This final chapter is a set of pointers. The retrieval goal is not to implement every advanced topic from memory,
          but to recognize what kind of problem each direction is meant to address and where you want to go deeper.
        </p>

        <section className="section chapter-recap-map" aria-label="Chapter 11 learning sequence">
          {sequence.map(([number, title, description, href]) => (
            <Link href={href} className="chapter-recap-map__row" key={number}>
              <span className="chapter-recap-map__number mono">{number}</span>
              <div><strong>{title}</strong><p>{description}</p></div>
              <span aria-hidden="true">→</span>
            </Link>
          ))}
        </section>

        <section className="section">
          <ChapterElevenRecapCheck />
          <div className="action-row">
            <Link className="button" href="/learn/where-to-go-next">← Where to go next</Link>
            <Link className="button button--primary" href="/practice">Move into transfer practice →</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
