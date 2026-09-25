import Link from "next/link";
import { DpStateWorkbench } from "@/components/lab/DpStateWorkbench";

export const metadata = {
  title: "DP State Design Workbench",
  description: "Practice defining dynamic-programming subproblems, dimensions, dependencies, bases, and evaluation order before seeing a recurrence.",
};

export default function DpStateDesignPage() {
  return (
    <main className="page">
      <div className="site-shell">
        <Link className="back-link" href="/lab">← Lab index</Link>

        <div className="knowledge-hero dp-state-hero">
          <div>
            <div className="eyebrow">Design lab · dynamic programming</div>
            <h1 className="editorial-title editorial-title--compact">Do not start with the table. Start with what one state means.</h1>
            <p className="lede">
              Dynamic programming becomes systematic when the learner can name a smaller instance precisely: which variables
              identify it, which smaller answers it reads, what the base states mean, and in what order those answers become available.
            </p>
          </div>
          <aside className="knowledge-note">
            <span className="eyebrow">Sequence</span>
            <strong>State → dimensions → dependencies → base → order → recurrence</strong>
            <p>The recurrence stays locked until the state design is coherent. This prevents memorizing table formulas without understanding the subproblems they represent.</p>
            <Link href="/syllabus#optimization">Open the optimization track →</Link>
          </aside>
        </div>

        <section className="section dp-state-lab-section">
          <DpStateWorkbench />
        </section>
      </div>
    </main>
  );
}
