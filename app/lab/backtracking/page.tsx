import Link from "next/link";
import { BacktrackingWorkbench } from "@/components/lab/BacktrackingWorkbench";

export const metadata = { title: "Backtracking & Pruning Workbench" };

export default function BacktrackingWorkbenchPage() {
  return (
    <main className="page"><div className="site-shell">
      <Link className="back-link" href="/lab">← Lab index</Link>
      <div className="knowledge-hero"><div>
        <div className="eyebrow">Search lab · pruning</div>
        <h1 className="editorial-title editorial-title--compact">Prune a branch only when you can prove its future is impossible.</h1>
        <p className="lede">Compare exhaustive include/exclude search with safe pruning rules and see exactly which assumption makes a branch disposable.</p>
      </div><aside className="knowledge-note"><span className="eyebrow">Sequence</span><strong>Search space → constraint → bound → prune → verify</strong><p>Backtracking is disciplined search. Pruning is a correctness claim about all descendants of a state.</p></aside></div>
      <section className="section"><BacktrackingWorkbench /></section>
    </div></main>
  );
}
