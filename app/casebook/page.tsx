import Link from "next/link";
import { caseStudies } from "@/lib/knowledge/casebook";

export const metadata = {
  title: "Algorithm Design Casebook",
  description: "Original AgoCode case studies that trace raw application requests through modeling, baselines, failed approaches, algorithm choices, and verification.",
};

export default function CasebookPage() {
  return (
    <main className="page">
      <div className="site-shell">
        <div className="knowledge-hero casebook-hero">
          <div>
            <div className="eyebrow">Algorithm design casebook</div>
            <h1 className="editorial-title editorial-title--compact">Watch the problem change shape before the final algorithm appears.</h1>
            <p className="lede">
              These original cases focus on the reasoning that finished solutions usually erase: the first wrong model,
              the baseline that clarified the goal, the assumption that made a method valid, and the evidence used to reject alternatives.
            </p>
          </div>
          <aside className="knowledge-note">
            <span className="eyebrow">Reading rule</span>
            <strong>Predict before reveal.</strong>
            <p>Do not skim directly to the algorithm. Each case opens one design decision at a time so the path remains learnable.</p>
            <Link href="/blog/keep-a-design-log">Why preserve failed ideas? →</Link>
          </aside>
        </div>

        <section className="casebook-principles">
          <div><span className="mono">01</span><strong>Raw request</strong><small>Keep the application language long enough to understand the actual objective.</small></div>
          <div><span className="mono">02</span><strong>Model + baseline</strong><small>Make correctness concrete before searching for speed.</small></div>
          <div><span className="mono">03</span><strong>No, because…</strong><small>Rejected approaches become reusable knowledge only when the failure is explicit.</small></div>
          <div><span className="mono">04</span><strong>Verify assumptions</strong><small>Tests should attack the proof conditions, not only the happy path.</small></div>
        </section>

        <section className="section casebook-list">
          <div className="section-heading">
            <div className="section-heading__index">CASES</div>
            <div>
              <h2>Original application stories, designed as reasoning traces.</h2>
              <p>Each case deliberately separates strategy from tactics and ends by changing an assumption so the solution cannot be memorized as a fixed recipe.</p>
            </div>
          </div>

          <div className="casebook-grid">
            {caseStudies.map((caseStudy) => (
              <Link className="casebook-card" href={`/casebook/${caseStudy.slug}`} key={caseStudy.slug}>
                <div className="casebook-card__meta">
                  <span className="mono">{caseStudy.number}</span>
                  <span>{caseStudy.domain}</span>
                </div>
                <h2>{caseStudy.title}</h2>
                <p>{caseStudy.subtitle}</p>
                <div className="casebook-card__facts">
                  <span>{caseStudy.scale}</span>
                  <span>{caseStudy.stages.length} reasoning stages</span>
                </div>
                <div className="atlas-tags">
                  {caseStudy.concepts.slice(0, 4).map((concept) => <span key={concept}>{concept}</span>)}
                </div>
                <strong className="casebook-card__action">Open case →</strong>
              </Link>
            ))}
          </div>
        </section>

        <section className="worksheet-next">
          <div>
            <span className="eyebrow">Apply the casebook method</span>
            <h2>Turn your own problem into a design trace.</h2>
            <p>Use the blank Solve workspace to record the model, baseline, rejected approaches, proof obligations, and transfer variants for a real problem.</p>
          </div>
          <div className="action-row">
            <Link className="button" href="/blog">Ways of Solving</Link>
            <Link className="button button--primary" href="/solve">Design a solution →</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
