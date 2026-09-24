import Link from "next/link";
import { ChapterSixRecapCheck } from "@/components/bfs/ChapterSixRecapCheck";

export const metadata = { title: "Chapter 6 Recap" };

const sequence = [
  ["01", "Graph model", "Represent entities as nodes and relevant relationships as directed or undirected edges.", "/learn/breadth-first-search#graphs"],
  ["02", "Layer-order search", "Explore all degree-1 nodes before degree-2 nodes, then continue outward.", "/learn/breadth-first-search#shortest"],
  ["03", "FIFO queue", "Process nodes in the same order they were discovered so layer order stays intact.", "/learn/breadth-first-search#queue"],
  ["04", "Visited state", "Prevent shared neighbors and cycles from creating repeated or infinite work.", "/learn/breadth-first-search#visited"],
  ["05", "Runtime", "A full adjacency-list BFS visits vertices and examines edges in O(V + E).", "/learn/breadth-first-search#runtime"],
] as const;

export default function ChapterSixRecapPage() {
  return (
    <main className="page">
      <div className="site-shell">
        <div className="eyebrow">Chapter 06 · Recap</div>
        <h1 className="editorial-title editorial-title--compact">Graph + queue + remembered state = breadth-first search.</h1>
        <p className="lede">
          Reconstruct the chapter before rereading it. The shortest-path guarantee is not magic: it follows from the
          graph model, FIFO discovery order, and the rule that previously discovered nodes do not become fresh work again.
        </p>

        <section className="section chapter-recap-map" aria-label="Chapter 6 learning sequence">
          {sequence.map(([number, title, description, href]) => (
            <Link href={href} className="chapter-recap-map__row" key={number}>
              <span className="chapter-recap-map__number mono">{number}</span>
              <div><strong>{title}</strong><p>{description}</p></div>
              <span aria-hidden="true">→</span>
            </Link>
          ))}
        </section>

        <section className="section">
          <ChapterSixRecapCheck />
          <div className="action-row">
            <Link className="button" href="/learn/breadth-first-search">← Breadth-First Search</Link>
            <Link className="button button--primary" href="/roadmap">Preview Dijkstra →</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
