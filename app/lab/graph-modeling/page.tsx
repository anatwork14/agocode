import Link from "next/link";
import { GraphModelingWorkbench } from "@/components/lab/GraphModelingWorkbench";

export const metadata = {
  title: "Graph Modeling Workbench",
  description: "Practice turning application stories into graph models before choosing a graph algorithm.",
};

export default function GraphModelingWorkbenchPage() {
  return (
    <main className="page">
      <div className="site-shell">
        <Link className="back-link" href="/lab">← Lab index</Link>

        <div className="knowledge-hero graph-model-hero">
          <div>
            <div className="eyebrow">Modeling lab · graphs</div>
            <h1 className="editorial-title editorial-title--compact">The difficult part is often deciding what the graph means.</h1>
            <p className="lede">
              Turn application entities into vertices, relationships into edges, preserve direction and cost only when they matter,
              and state the objective before an algorithm name is allowed to enter the discussion.
            </p>
          </div>
          <aside className="knowledge-note">
            <span className="eyebrow">Sequence</span>
            <strong>Objects → relationships → graph → objective → algorithm</strong>
            <p>A correct graph algorithm cannot rescue a graph model that encodes the wrong relationship or optimizes the wrong quantity.</p>
            <Link href="/syllabus#graph-modeling">Open the graph-modeling track →</Link>
          </aside>
        </div>

        <section className="section graph-model-lab-section">
          <GraphModelingWorkbench />
        </section>
      </div>
    </main>
  );
}
