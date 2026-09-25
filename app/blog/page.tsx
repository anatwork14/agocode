import Link from "next/link";
import { fieldNotes } from "@/lib/knowledge/blog";
import { problemSolvingLoop } from "@/lib/knowledge/syllabus";

export const metadata = {
  title: "Ways of Solving",
  description: "Original AgoCode field notes on modeling, baselines, invariants, representations, complexity, and transfer.",
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
            <Link href="/exercises">Practice the questions on a canonical problem →</Link>
          </aside>
        </div>

        <section className="blog-loop" aria-label="Problem-solving loop">
          {problemSolvingLoop.map((step) => <span key={step}>{step}</span>)}
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
