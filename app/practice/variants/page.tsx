import Link from "next/link";
import { ModelVariantPractice } from "@/components/practice/ModelVariantPractice";
import { atlasPatterns } from "@/lib/practice/atlas-recognition";
import { modelVariantTemplates } from "@/lib/practice/model-variants";

export const metadata = {
  title: "Model Variants",
  description: "Practice changing assumptions and deciding whether an algorithmic structural family still applies before implementation.",
};

const templateCount = Object.values(modelVariantTemplates).reduce((sum, templates) => sum + templates.length, 0);

export default function ModelVariantsPage() {
  return (
    <main className="page">
      <div className="site-shell">
        <Link className="back-link" href="/practice">← Transfer Track</Link>

        <div className="knowledge-hero">
          <div>
            <div className="eyebrow">Model-first transfer · assumption mutations</div>
            <h1 className="editorial-title editorial-title--compact">Do not memorize the surface. Ask which assumption changed.</h1>
            <p className="lede">
              AgoCode starts from a known structural family, changes one modeling assumption, and makes you decide whether the same
              family survives, a new family should take over, or more constraint information is required. The answer stays hidden
              until you write what property survives or breaks.
            </p>
          </div>
          <aside className="knowledge-note">
            <span className="eyebrow">Mutation library</span>
            <strong>{templateCount} model shifts · {atlasPatterns.length} families</strong>
            <p>Ordering, update patterns, edge costs, objectives, memory limits, proof boundaries, and output guarantees are changed deliberately rather than randomly.</p>
            <Link href="/patterns">Open structural family library →</Link>
          </aside>
        </div>

        <section className="atlas-recognition-principles" aria-label="Model-first variant method">
          <article><span className="mono">01</span><strong>Name the old invariant</strong><p>State what made the original family valid before thinking about replacement code.</p></article>
          <article><span className="mono">02</span><strong>Change one assumption</strong><p>Focus on the mutation: ordering, weights, updates, objective, scale, or resource model.</p></article>
          <article><span className="mono">03</span><strong>Re-model before coding</strong><p>Decide whether the old invariant survives, breaks, or needs more constraint information.</p></article>
          <article><span className="mono">04</span><strong>Then transfer</strong><p>Use the resulting structural question to choose a new problem or revise the current notebook.</p></article>
        </section>

        <section className="section">
          <div className="section-heading">
            <div className="section-heading__index">MIXED MUTATIONS</div>
            <div>
              <h2>Interleave families so the chapter cannot answer for you.</h2>
              <p>First decisions are recorded as transfer-practice history only; they never promote mastery by themselves.</p>
            </div>
          </div>
          <ModelVariantPractice sessionSize={10} />
        </section>

        <section className="worksheet-next">
          <div>
            <span className="eyebrow">After a model shift</span>
            <h2>Turn the changed assumption into solve evidence.</h2>
            <p>Open the source notebook, restate the new model, build a baseline, and prove why the revised structure fits.</p>
          </div>
          <div className="action-row">
            <Link className="button" href="/practice/atlas">Run blind recognition</Link>
            <Link className="button" href="/patterns">Study family boundaries</Link>
            <Link className="button button--primary" href="/practice/next">Choose a solve target →</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
