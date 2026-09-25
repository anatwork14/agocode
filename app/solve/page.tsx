import Link from "next/link";
import { ProblemDesignCanvas } from "@/components/solve/ProblemDesignCanvas";

export const metadata = {
  title: "Design a Solution",
  description: "An open-ended algorithm design canvas for modeling, baseline reasoning, invariants, trade-offs, and variants.",
};

export default function SolvePage() {
  return (
    <main className="page">
      <div className="site-shell">
        <div className="knowledge-hero">
          <div>
            <div className="eyebrow">Algorithm design workspace</div>
            <h1 className="editorial-title editorial-title--compact">Bring a problem. Do not bring the algorithm name.</h1>
            <p className="lede">
              Use this canvas when the problem is not already in AgoCode. It forces the design work that usually disappears
              between a prompt and finished code: clarify, hand-solve, baseline, model, compare, justify, and vary.
            </p>
          </div>
          <aside className="knowledge-note">
            <span className="eyebrow">How to use it</span>
            <strong>Write before searching.</strong>
            <p>Keep a record of failed ideas. A rejected approach becomes reusable knowledge only when you can say why it fails.</p>
            <Link href="/blog/keep-a-design-log">Read the design-log field note →</Link>
          </aside>
        </div>

        <section className="section" style={{ paddingTop: 38 }}>
          <ProblemDesignCanvas />
        </section>

        <section className="worksheet-next">
          <div>
            <span className="eyebrow">Need repertoire?</span>
            <h2>Compare your model against known problem families.</h2>
            <p>Only after you have written a baseline and candidate model, browse the atlas to see which canonical problems are structurally close.</p>
          </div>
          <div className="action-row">
            <Link className="button" href="/blog">Ways of Solving</Link>
            <Link className="button button--primary" href="/exercises">Open Problem Atlas →</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
