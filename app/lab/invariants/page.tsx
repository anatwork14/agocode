import Link from "next/link";
import { InvariantWorkbench } from "@/components/lab/InvariantWorkbench";

export const metadata = {
  title: "Invariant Workbench",
  description: "Practice stating, preserving, and stress-testing algorithm invariants across multiple algorithms.",
};

export default function InvariantWorkbenchPage() {
  return (
    <main className="page">
      <div className="site-shell">
        <Link className="back-link" href="/lab">← Lab index</Link>

        <div className="knowledge-hero invariant-hero">
          <div>
            <div className="eyebrow">Correctness lab · invariants</div>
            <h1 className="editorial-title editorial-title--compact">Do not only trace what changes. Prove what must stay true.</h1>
            <p className="lede">
              The same proof shape appears across search, sorting, two-pointer elimination, graph traversal, and optimization:
              state a claim, establish it initially, preserve it through one transition, then use it at termination.
            </p>
          </div>
          <aside className="knowledge-note">
            <span className="eyebrow">Method</span>
            <strong>Initialize → Preserve → Terminate</strong>
            <p>Use counterexamples aggressively. A statement that merely sounds plausible is not enough to justify discarding state.</p>
            <Link href="/blog/invariants">Read the field note →</Link>
          </aside>
        </div>

        <section className="section invariant-lab-section">
          <InvariantWorkbench />
        </section>
      </div>
    </main>
  );
}
