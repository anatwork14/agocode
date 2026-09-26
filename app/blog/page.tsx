import Link from "next/link";
import { StuckRouter } from "@/components/blog/StuckRouter";
import { fieldNotes } from "@/lib/knowledge/blog";
import { caseStudies } from "@/lib/knowledge/casebook";
import { problemSolvingLoop } from "@/lib/knowledge/syllabus";

export const metadata = {
  title: "Ways of Solving",
  description: "Original AgoCode field notes and contextual help for modeling, baselines, invariants, representations, complexity, and transfer.",
};

export default function BlogPage() {
  return (
    <main className="page">
      <div className="site-shell">
        <div className="knowledge-hero">
          <div>
            <div className="eyebrow">Ways of Solving</div>
            <h1 className="editorial-title editorial-title--compact">What to try when you do not know what to do next.</h1>
            <p className="lede">
              These are not solution recipes. They are reusable questions for the moments before the algorithm is obvious:
              how to model the story, establish a baseline, expose structure, choose a representation, justify correctness,
              and turn one solved problem into transferable knowledge.
            </p>
          </div>
          <aside className="knowledge-note">
            <span className="eyebrow">Field-note rule</span>
            <p>Every dead end should end with a reason. “No” teaches almost nothing; “no, because…” becomes part of your future repertoire.</p>
            <Link href="#diagnose">Diagnose where you are stuck →</Link>
          </aside>
        </div>

        <section className="blog-loop" aria-label="Problem-solving loop">
          {problemSolvingLoop.map((step) => <span key={step}>{step}</span>)}
        </section>

        <StuckRouter />

        <section className="section" style={{ paddingTop: 48 }}>
          <div className="section-heading">
            <div className="section-heading__index">CASEBOOK</div>
            <div>
              <h2>See the questions used inside an application story.</h2>
              <p>
                Field notes describe reusable moves. The Casebook shows those moves unfolding across raw requirements, false starts,
                model changes, proof assumptions, implementation choices, and transfer variants.
              </p>
            </div>
          </div>
          <div className="home-knowledge__grid">
            {caseStudies.slice(0, 3).map((caseStudy) => (
              <Link className="home-knowledge__item" href={`/casebook/${caseStudy.slug}`} key={caseStudy.slug}>
                <span className="mono">Case {caseStudy.number} · {caseStudy.domain}</span>
                <h3>{caseStudy.title}</h3>
                <p>{caseStudy.subtitle}</p>
                <strong>Trace the decisions →</strong>
              </Link>
            ))}
          </div>
          <div className="action-row">
            <Link className="button button--primary" href="/casebook">Open the full Casebook →</Link>
          </div>
        </section>

        <section className="section field-notes">
          <div className="field-notes__intro">
            <span className="eyebrow">12 field notes</span>
            <h2>Read one when you are stuck, then return to the problem.</h2>
          </div>

          <div className="field-note-list">
            {fieldNotes.map((post) => (
              <article className="field-note-row" id={post.slug} key={post.slug}>
                <div className="field-note-row__number">{post.number}</div>
                <div>
                  <div className="field-note-row__meta mono">{post.sources.join(" · ")} · {post.readingMinutes} min</div>
                  <h2>{post.title}</h2>
                  <p>{post.thesis}</p>
                  <Link href={`/blog/${post.slug}`}>Read field note →</Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
