import Link from "next/link";
import { ChapterSevenRecapCheck } from "@/components/dijkstra/ChapterSevenRecapCheck";

export const metadata = { title: "Chapter 7 Recap" };

const sequence = [
  ["01", "Weighted graph", "Move from fewest edges to minimum total non-negative weight.", "/learn/dijkstra#weighted"],
  ["02", "Cheapest unfinished node", "Finalize the smallest current cost, then inspect that node's outgoing edges.", "/learn/dijkstra#steps"],
  ["03", "Relaxation", "Replace a neighbor cost and parent when the current route makes it cheaper.", "/learn/dijkstra#trace"],
  ["04", "Parent chain", "Follow parents backward to reconstruct the actual minimum-cost path.", "/learn/dijkstra#parents"],
  ["05", "Negative-edge boundary", "Know why a later negative edge can invalidate a cost that was finalized too early.", "/learn/dijkstra#negative"],
] as const;

export default function ChapterSevenRecapPage() {
  return (
    <main className="page">
      <div className="site-shell">
        <div className="eyebrow">Chapter 07 · Recap</div>
        <h1 className="editorial-title editorial-title--compact">Cheapest node, relax neighbors, remember parents.</h1>
        <p className="lede">
          Reconstruct Dijkstra from the invariant rather than from syntax. Weighted shortest paths become manageable once
          you can explain why the cheapest unfinished cost is safe to finalize and how relaxation propagates improvements.
        </p>

        <section className="section chapter-recap-map" aria-label="Chapter 7 learning sequence">
          {sequence.map(([number, title, description, href]) => (
            <Link href={href} className="chapter-recap-map__row" key={number}>
              <span className="chapter-recap-map__number mono">{number}</span>
              <div><strong>{title}</strong><p>{description}</p></div>
              <span aria-hidden="true">→</span>
            </Link>
          ))}
        </section>

        <section className="section">
          <ChapterSevenRecapCheck />
          <div className="action-row">
            <Link className="button" href="/learn/dijkstra">← Dijkstra</Link>
            <Link className="button button--primary" href="/roadmap">Preview Greedy Algorithms →</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
