import Link from "next/link";
import { GreedyCounterexampleWorkbench } from "@/components/lab/GreedyCounterexampleWorkbench";

export const metadata = { title: "Greedy Counterexample Workbench" };

export default function GreedyCounterexampleWorkbenchPage() {
  return (
    <main className="page"><div className="site-shell">
      <Link className="back-link" href="/lab">← Lab index</Link>
      <div className="knowledge-hero"><div>
        <div className="eyebrow">Correctness lab · greedy choice</div>
        <h1 className="editorial-title editorial-title--compact">Attack the local rule before trusting it.</h1>
        <p className="lede">Choose a plausible greedy rule, test it against a small adversarial instance, and separate “looks locally good” from a choice backed by a structural proof.</p>
      </div><aside className="knowledge-note"><span className="eyebrow">Sequence</span><strong>Objective → local rule → smallest counterexample → proof boundary</strong><p>A failed greedy rule is useful evidence: it reveals exactly which assumption a correct proof would have needed.</p></aside></div>
      <section className="section"><GreedyCounterexampleWorkbench /></section>
    </div></main>
  );
}
