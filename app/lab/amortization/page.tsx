import Link from "next/link";
import { AmortizationWorkbench } from "@/components/lab/AmortizationWorkbench";

export const metadata = {
  title: "Amortization Workbench",
  description: "Explore why occasional expensive dynamic-array resizes can still produce efficient append sequences.",
};

export default function AmortizationWorkbenchPage() {
  return (
    <main className="page">
      <div className="site-shell">
        <Link className="back-link" href="/lab">← Lab index</Link>

        <div className="knowledge-hero amortization-hero">
          <div>
            <div className="eyebrow">Analysis lab · amortization</div>
            <h1 className="editorial-title editorial-title--compact">An expensive operation can still be cheap over the whole sequence.</h1>
            <p className="lede">
              Dynamic arrays make the distinction concrete: most appends write into reserved capacity, while occasional resizes
              allocate a larger array and copy existing values. The growth rule decides how often those spikes return.
            </p>
          </div>
          <aside className="knowledge-note">
            <span className="eyebrow">Question</span>
            <strong>Worst case ≠ amortized cost</strong>
            <p>Inspect individual append costs, cumulative average cost, resize frequency, and the time/memory trade-off of different capacity policies.</p>
            <Link href="/syllabus#proof-analysis">See Measure and justify →</Link>
          </aside>
        </div>

        <section className="section amortization-lab-section">
          <AmortizationWorkbench />
        </section>
      </div>
    </main>
  );
}
