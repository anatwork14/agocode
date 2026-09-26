import Link from "next/link";
import { AtlasPatternRecognitionDrill } from "@/components/practice/AtlasPatternRecognitionDrill";
import { atlasPatterns, classifiedAtlasExercises } from "@/lib/practice/atlas-recognition";

export const metadata = {
  title: "Atlas Recognition",
  description: "Interleaved structural recognition practice across AgoCode's source-aware canonical problem atlas.",
};

export default function AtlasRecognitionPage() {
  return (
    <main className="page">
      <div className="site-shell">
        <Link className="back-link" href="/practice">← Transfer Track</Link>

        <div className="knowledge-hero atlas-recognition-hero">
          <div>
            <div className="eyebrow">Atlas-wide recognition · no chapter labels</div>
            <h1 className="editorial-title editorial-title--compact">Can you recognize structure before the source tells you the technique?</h1>
            <p className="lede">
              This drill interleaves canonical problems from the source-aware Atlas, hides the chapter and domain cues, and asks
              you to identify the structural family that should organize the first useful question. The goal is not title memory;
              it is deciding what matters before implementation begins.
            </p>
          </div>
          <aside className="knowledge-note">
            <span className="eyebrow">Recognition pool</span>
            <strong>{classifiedAtlasExercises.length} classified entries</strong>
            <p>{atlasPatterns.length} structural families feed adaptive mixed sessions. Recent first-try misses are brought forward.</p>
            <Link href="/exercises">Open the full Problem Atlas →</Link>
          </aside>
        </div>

        <section className="atlas-recognition-principles" aria-label="How to use the atlas recognition drill">
          <article>
            <span className="mono">01</span>
            <strong>Restate the objective</strong>
            <p>Ignore the book chapter. Say what must be found, minimized, maintained, proved, or transformed.</p>
          </article>
          <article>
            <span className="mono">02</span>
            <strong>Name the bottleneck</strong>
            <p>Ask what repeated work, ordering constraint, state dependency, representation choice, or proof obligation dominates.</p>
          </article>
          <article>
            <span className="mono">03</span>
            <strong>Choose a structural family</strong>
            <p>Commit only after you can state the invariant or modeling question that makes that family relevant.</p>
          </article>
          <article>
            <span className="mono">04</span>
            <strong>Re-open the source</strong>
            <p>After recognition, use your own source copy and AgoCode notebook to derive and justify the actual solution.</p>
          </article>
        </section>

        <section className="section atlas-recognition-section">
          <div className="section-heading">
            <div className="section-heading__index">INTERLEAVED SET</div>
            <div>
              <h2>One problem at a time. No structural labels until you commit.</h2>
              <p>
                First-try accuracy is recorded separately from eventual recovery. Finishing after a wrong first choice is useful
                learning, but it is not counted as recognition evidence.
              </p>
            </div>
          </div>
          <AtlasPatternRecognitionDrill />
        </section>

        <section className="worksheet-next">
          <div>
            <span className="eyebrow">After recognition</span>
            <h2>Pattern choice is only the beginning.</h2>
            <p>
              Open the reasoning notebook, build a baseline, justify the improvement, then solve a neighboring problem where the
              surface story changes again.
            </p>
          </div>
          <div className="action-row">
            <Link className="button" href="/blog">Read Ways of Solving</Link>
            <Link className="button button--primary" href="/exercises">Browse canonical problems →</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
