import Link from "next/link";
import { BfsRebuild } from "@/components/bfs/BfsRebuild";
import { BfsTrace } from "@/components/bfs/BfsTrace";
import { GraphBasicsLab } from "@/components/bfs/GraphBasicsLab";
import { QueueFifoLab } from "@/components/bfs/QueueFifoLab";
import { MarginNote } from "@/components/ui/MarginNote";

export const metadata = { title: "Breadth-First Search" };

export default function BreadthFirstSearchPage() {
  return (
    <main className="page page--tight">
      <div className="site-shell">
        <div className="reading-layout">
          <nav className="reading-nav" aria-label="Breadth-First Search sections">
            <a href="#graphs">01 · Graphs</a>
            <a href="#questions">02 · BFS questions</a>
            <a href="#shortest">03 · Shortest path</a>
            <a href="#queue">04 · Queue</a>
            <a href="#trace">05 · Trace</a>
            <a href="#visited">06 · Visited</a>
            <a href="#runtime">07 · Runtime</a>
            <a href="#rebuild">08 · Rebuild</a>
          </nav>

          <article className="reading-column">
            <div className="eyebrow">Chapter 06 · Breadth-first search</div>
            <h1 className="editorial-title editorial-title--compact">Breadth-First Search</h1>
            <p className="lede">
              A graph models things and the relationships between them. Breadth-first search explores that network in
              expanding layers, which lets it answer both reachability and shortest-path questions when every edge has
              the same cost.
            </p>

            <div className="prose-block">
              <section id="graphs">
                <h2>First, turn relationships into a graph.</h2>
                <p>
                  A graph is a collection of nodes connected by edges. The nodes might represent people, webpages,
                  cities, tasks, or states in a puzzle. Edges represent whichever relationship matters to the problem.
                  Some relationships have a direction; others naturally go both ways.
                </p>
                <GraphBasicsLab />
              </section>

              <section id="questions">
                <h2>BFS answers two closely related questions.</h2>
                <div className="bfs-question-grid">
                  <div><span className="mono">01</span><strong>Is there a path?</strong><p>Can the target be reached from the starting node at all?</p></div>
                  <div><span className="mono">02</span><strong>What is the shortest path?</strong><p>If it is reachable, which route uses the fewest edges?</p></div>
                </div>
                <p>
                  The second answer comes from the order of exploration. Nodes one edge away are processed before nodes
                  two edges away; those are processed before nodes three edges away, and so on.
                </p>
              </section>

              <section id="shortest">
                <h2>The search radiates outward one degree at a time.</h2>
                <p>
                  If a target exists among your immediate neighbors, there is no reason to inspect a friend-of-a-friend
                  first. Breadth-first search preserves this layer order, so the first time it reaches a target, no
                  shorter unweighted route can still be waiting deeper in the graph.
                </p>
                <div className="bfs-layer-strip" aria-label="Breadth first layers">
                  <div><span>degree 0</span><strong>start</strong></div>
                  <div><span>degree 1</span><strong>neighbors</strong></div>
                  <div><span>degree 2</span><strong>neighbors of neighbors</strong></div>
                  <div><span>degree 3+</span><strong>keep expanding</strong></div>
                </div>
              </section>

              <section id="queue">
                <h2>A FIFO queue protects that discovery order.</h2>
                <p>
                  The earliest discovered node must be processed before nodes discovered later. That is exactly the
                  behavior of a queue: enqueue at the back, dequeue from the front. Replacing the queue with a LIFO
                  stack would change the traversal order and remove the shortest-path guarantee.
                </p>
                <QueueFifoLab />
              </section>

              <section id="trace">
                <h2>Now connect the graph, queue, visited state, and shortest path.</h2>
                <p>
                  Step through the complete search. AgoCode marks a node discovered when it is first enqueued so the
                  same node is not added repeatedly. This serves the same purpose as keeping a searched list: avoid
                  duplicate work and prevent cycles from making the search loop forever.
                </p>
                <BfsTrace />
              </section>

              <section id="visited">
                <h2>Cycles make remembered state essential.</h2>
                <p>
                  Graphs can contain cycles and shared neighbors. Without a visited or discovered set, the search can
                  revisit the same nodes, repeat work, or continually follow a cycle. Each node only needs to become a
                  search frontier once.
                </p>
                <div className="bfs-cycle-note">
                  <span className="mono">A → B → C → A</span>
                  <p>Remembering A, B, and C turns this cycle into finite work instead of an endless queue.</p>
                </div>
              </section>

              <section id="runtime">
                <h2>Full BFS work is proportional to vertices plus edges.</h2>
                <p>
                  In the worst case, a complete search visits every vertex and examines every outgoing edge. With an
                  adjacency-list graph and constant-time queue operations, that gives the standard running time
                  <span className="mono"> O(V + E)</span>.
                </p>
                <div className="bfs-runtime-grid">
                  <div><span>vertices</span><strong className="mono">V</strong><p>Each node becomes visited at most once.</p></div>
                  <div><span>edges</span><strong className="mono">E</strong><p>Each adjacency relationship is examined during expansion.</p></div>
                </div>
              </section>

              <section id="rebuild">
                <h2>Write shortest-path BFS from the queue invariant.</h2>
                <p>
                  Keep the guarantee explicit while coding: the front of the queue is always the earliest discovered
                  unprocessed state. Carry enough parent/path information to reconstruct how the target was reached.
                </p>
                <BfsRebuild />
                <div className="action-row">
                  <Link className="button" href="/learn/chapter-5-recap">← Chapter 5 recap</Link>
                  <Link className="button button--primary" href="/learn/chapter-6-recap">Chapter 6 recap →</Link>
                </div>
              </section>
            </div>
          </article>

          <aside className="margin-column" aria-label="Breadth-first search notes">
            <MarginNote label="Graph">Nodes are entities; edges are the relationships your problem cares about.</MarginNote>
            <MarginNote label="Queue">FIFO order is not an implementation detail—it is the reason BFS explores by distance in an unweighted graph.</MarginNote>
            <MarginNote label="Visited">Remember discovered/processed nodes so shared neighbors and cycles do not create repeated work.</MarginNote>
            <MarginNote label="Boundary">BFS minimizes edge count. Chapter 7 changes the problem by giving edges different weights.</MarginNote>
          </aside>
        </div>
      </div>
    </main>
  );
}
