import Link from "next/link";
import { DijkstraRebuild } from "@/components/dijkstra/DijkstraRebuild";
import { DijkstraTrace } from "@/components/dijkstra/DijkstraTrace";
import { NegativeWeightLab } from "@/components/dijkstra/NegativeWeightLab";
import { WeightedPathComparison } from "@/components/dijkstra/WeightedPathComparison";
import { MarginNote } from "@/components/ui/MarginNote";

export const metadata = { title: "Dijkstra's Algorithm" };

export default function DijkstraPage() {
  return (
    <main className="page page--tight">
      <div className="site-shell">
        <div className="reading-layout">
          <nav className="reading-nav" aria-label="Dijkstra sections">
            <a href="#weighted">01 · Weighted paths</a>
            <a href="#steps">02 · Four steps</a>
            <a href="#trace">03 · Relax costs</a>
            <a href="#parents">04 · Recover path</a>
            <a href="#negative">05 · Negative weights</a>
            <a href="#rebuild">06 · Rebuild</a>
          </nav>

          <article className="reading-column">
            <div className="eyebrow">Chapter 07 · Dijkstra&apos;s algorithm</div>
            <h1 className="editorial-title editorial-title--compact">Dijkstra&apos;s Algorithm</h1>
            <p className="lede">
              Breadth-first search finds the path with the fewest edges. Once edges carry different costs, the goal changes:
              find the route with the smallest total weight. Dijkstra&apos;s algorithm solves that problem when edge weights
              are non-negative.
            </p>

            <div className="prose-block">
              <section id="weighted">
                <h2>Fewest segments is not always the cheapest route.</h2>
                <p>
                  Give every edge a travel time, price, or other cost. A path with more edges can now beat a path with fewer
                  edges if its total weight is lower. This is the exact boundary between the Chapter 6 BFS problem and the
                  weighted shortest-path problem introduced here.
                </p>
                <WeightedPathComparison />
              </section>

              <section id="steps">
                <h2>The algorithm repeats one greedy decision and one relaxation step.</h2>
                <div className="dijkstra-steps" aria-label="Four conceptual Dijkstra steps">
                  <div><span className="mono">01</span><strong>Choose cheapest unfinished node.</strong><p>Find the unprocessed node with the smallest currently known cost.</p></div>
                  <div><span className="mono">02</span><strong>Relax its neighbors.</strong><p>Ask whether routing through this node gives any neighbor a cheaper total cost.</p></div>
                  <div><span className="mono">03</span><strong>Repeat.</strong><p>Finalize the chosen node and choose the next cheapest unprocessed node.</p></div>
                  <div><span className="mono">04</span><strong>Recover the path.</strong><p>Follow the parent pointers backward from the destination.</p></div>
                </div>
                <p>
                  Unknown costs begin at infinity. Whenever a cheaper route is discovered, both the neighbor&apos;s cost and
                  its parent change. Those two tables evolve together.
                </p>
              </section>

              <section id="trace">
                <h2>Watch costs improve as edges are relaxed.</h2>
                <p>
                  The chapter&apos;s small Start/A/B/Finish graph makes the mechanism visible: B first looks cheapest, then
                  routing through B improves A, and routing through A improves Finish again. The final cheapest route is
                  therefore not necessarily the route suggested by the first direct estimates.
                </p>
                <DijkstraTrace />
              </section>

              <section id="parents">
                <h2>Costs tell you how cheap; parents tell you how you got there.</h2>
                <p>
                  A cost table alone can say that Finish costs 6, but it cannot reconstruct the route. Each time an edge
                  improves a node&apos;s cost, store the current node as that neighbor&apos;s parent. At the end, walk backward from
                  Finish through the parent table, then reverse the chain.
                </p>
                <div className="parent-chain" aria-label="Parent path reconstruction">
                  <span className="mono">Finish</span><span aria-hidden="true">←</span><span className="mono">A</span><span aria-hidden="true">←</span><span className="mono">B</span><span aria-hidden="true">←</span><span className="mono">Start</span>
                </div>
                <p className="parent-chain__result mono">Start → B → A → Finish · total weight 6</p>
              </section>

              <section id="negative">
                <h2>Negative edges break the greedy finalization guarantee.</h2>
                <p>
                  Dijkstra relies on one critical claim: when the cheapest unprocessed node is selected, no later route can
                  make that processed cost smaller. That claim holds with non-negative edge weights. A negative edge can
                  reach backward and reveal a cheaper route after a node was already finalized.
                </p>
                <NegativeWeightLab />
                <p>
                  For graphs with negative edge weights, use an algorithm designed for that case, such as Bellman–Ford.
                  AgoCode deliberately rejects negative input in its Dijkstra engine rather than silently producing an
                  unreliable answer.
                </p>
              </section>

              <section id="rebuild">
                <h2>Rebuild the cost, parent, and processed-state loop.</h2>
                <p>
                  Keep the implementation faithful to the mental model: weighted adjacency data, a best-known cost table,
                  parent pointers, and a set of processed nodes. The exercise uses a simple scan for the cheapest node so
                  the core algorithm stays visible before later optimizing the data structure.
                </p>
                <DijkstraRebuild />
                <div className="action-row">
                  <Link className="button" href="/learn/chapter-6-recap">← Chapter 6 recap</Link>
                  <Link className="button button--primary" href="/learn/chapter-7-recap">Chapter 7 recap →</Link>
                </div>
              </section>
            </div>
          </article>

          <aside className="margin-column" aria-label="Dijkstra notes">
            <MarginNote label="Weighted graph">Edge labels now affect the objective. Shortest means minimum total weight, not fewest edges.</MarginNote>
            <MarginNote label="Greedy invariant">The cheapest unprocessed node can be finalized only because later edges cannot subtract cost.</MarginNote>
            <MarginNote label="Relaxation">Compare old neighbor cost with current cost + edge weight. Update cost and parent together when the new route wins.</MarginNote>
            <MarginNote label="Boundary">Negative edges invalidate Dijkstra&apos;s processed-node assumption.</MarginNote>
          </aside>
        </div>
      </div>
    </main>
  );
}
