import Link from "next/link";
import { TransformationWorkbench } from "@/components/lab/TransformationWorkbench";

export const metadata = {
  title: "Input Transformation Workbench",
  description: "Practice turning hidden global relationships into local or indexed structure through sorting, hashing, heaps, and staged preprocessing.",
};

export default function TransformationWorkbenchPage() {
  return (
    <main className="page">
      <div className="site-shell">
        <Link className="back-link" href="/lab">← Lab index</Link>

        <div className="knowledge-hero transformation-hero">
          <div>
            <div className="eyebrow">Algorithm design lab · transform before solving</div>
            <h1 className="editorial-title editorial-title--compact">Do not optimize the same representation forever. Change what the problem looks like.</h1>
            <p className="lede">
              Sorting, hashing, grouping, and priority structures are not merely implementation choices. They can expose a relation
              that was expensive or invisible in the raw input and turn a global search into a local or indexed decision.
            </p>
          </div>
          <aside className="knowledge-note">
            <span className="eyebrow">Method</span>
            <strong>Baseline → name the waste → transform → exploit the new structure</strong>
            <p>Judge a preprocessing step by what relation it makes cheap, not by whether it resembles a memorized problem template.</p>
            <Link href="/blog/sort-to-see-structure">Read the field note →</Link>
          </aside>
        </div>

        <section className="section transformation-lab-section">
          <TransformationWorkbench />
        </section>
      </div>
    </main>
  );
}
