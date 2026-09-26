import Link from "next/link";
import { PriorityQueueWorkbench } from "@/components/lab/PriorityQueueWorkbench";

export const metadata = { title: "Priority Queue Workbench" };

export default function PriorityQueueWorkbenchPage() {
  return (
    <main className="page"><div className="site-shell">
      <Link className="back-link" href="/lab">← Lab index</Link>
      <div className="knowledge-hero"><div>
        <div className="eyebrow">Representation lab · priority queues</div>
        <h1 className="editorial-title editorial-title--compact">A heap is useful because of the workload it serves, not because “priority queue means heap.”</h1>
        <p className="lede">Keep the priority-queue contract fixed, vary insertion/extraction/update pressure, predict a representation, and inspect why the winner changes.</p>
      </div><aside className="knowledge-note"><span className="eyebrow">Sequence</span><strong>Contract → workload → prediction → cost model → invariant</strong><p>Separate the abstract priority-queue behavior from the representation used to implement it.</p></aside></div>
      <section className="section"><PriorityQueueWorkbench /></section>
    </div></main>
  );
}
