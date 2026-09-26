import Link from "next/link";
import { AmortizationHysteresis } from "@/components/lab/AmortizationHysteresis";
import { AmortizationWorkbench } from "@/components/lab/AmortizationWorkbench";

export const metadata = {
  title: "Amortization Workbench",
  description: "Explore why occasional expensive dynamic-array resizes can still produce efficient append and grow-shrink sequences.",
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
              allocate a larger array and copy existing values. The growth and shrink rules decide how often those spikes return.
            </p>
          </div>
          <aside className="knowledge-note">
            <span className="eyebrow">Question</span>
            <strong>Worst case ≠ amortized cost</strong>
            <p>Inspect individual costs, cumulative work, resize frequency, hysteresis, and three complementary amortized-analysis viewpoints.</p>
            <Link href="/syllabus/amortization">See the syllabus dependency →</Link>
          </aside>
        </div>

        <section className="section amortization-lab-section">
          <AmortizationWorkbench />
          <AmortizationHysteresis />
        </section>
      </div>
    </main>
  );
}
