import Link from "next/link";
import { OptimizationStrategyWorkbench } from "@/components/lab/OptimizationStrategyWorkbench";

export const metadata = {
  title: "Optimization Strategy Workbench",
  description: "Compare exact, approximation, and heuristic strategies against solution-quality requirements, scale, assumptions, and verification oracles.",
};

export default function OptimizationStrategyPage() {
  return (
    <main className="page">
      <div className="site-shell">
        <Link className="back-link" href="/lab">← Lab index</Link>

        <div className="knowledge-hero optimization-hero">
          <div>
            <div className="eyebrow">Algorithm design lab · hard optimization</div>
            <h1 className="editorial-title editorial-title--compact">When exact is expensive, change the question before pretending the implementation is the problem.</h1>
            <p className="lede">
              Compare exact search, certified approximation, and best-effort heuristics while making the product contract explicit:
              how much quality is required, what scale is realistic, and which assumptions make a guarantee valid.
            </p>
          </div>
          <aside className="knowledge-note">
            <span className="eyebrow">Method</span>
            <strong>Exactness → scale → assumptions → guarantee → verification</strong>
            <p>Keep a tiny exact oracle even when production must use a faster non-exact method. Hard problems still deserve measurable evidence.</p>
            <Link href="/blog/tiny-and-extreme-cases">Why tiny cases matter →</Link>
          </aside>
        </div>

        <section className="section optimization-lab-section">
          <OptimizationStrategyWorkbench />
        </section>
      </div>
    </main>
  );
}
