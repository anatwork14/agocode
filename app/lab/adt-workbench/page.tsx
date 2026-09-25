import Link from "next/link";
import { AdtWorkbench } from "@/components/lab/AdtWorkbench";

export const metadata = {
  title: "ADT Workbench",
  description: "Compare data-structure representations by the operations and workload the application actually needs.",
};

export default function AdtWorkbenchPage() {
  return (
    <main className="page">
      <div className="site-shell">
        <Link className="back-link" href="/syllabus#adt-representation">← ADT syllabus track</Link>

        <div className="knowledge-hero">
          <div>
            <div className="eyebrow">Lab · representation before habit</div>
            <h1 className="editorial-title editorial-title--compact">The same abstraction can deserve a different representation.</h1>
            <p className="lede">
              Choose the contract, describe the workload, and watch the trade-off change. The goal is not to memorize a universal
              “best data structure”; it is to connect the operations an application needs to the costs its representation creates.
            </p>
          </div>
          <aside className="knowledge-note">
            <span className="eyebrow">Mental model</span>
            <strong>ADT ≠ implementation.</strong>
            <p>A queue is a FIFO contract. A circular array and a linked structure are different ways to realize that same contract.</p>
            <Link href="/blog/choose-the-adt-before-the-representation">Read the field note →</Link>
          </aside>
        </div>

        <section className="section" style={{ paddingTop: 38 }}>
          <AdtWorkbench />
        </section>

        <section className="worksheet-next">
          <div>
            <span className="eyebrow">Then remove the labels</span>
            <h2>Can you choose the representation from a real workload description?</h2>
            <p>Use the open design workspace next and justify the structure before writing implementation code.</p>
          </div>
          <div className="action-row">
            <Link className="button" href="/exercises">Problem Atlas</Link>
            <Link className="button button--primary" href="/solve">Design a solution →</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
