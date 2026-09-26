import Link from "next/link";
import { patternLibrary } from "@/lib/practice/pattern-library";

export const metadata = {
  title: "Pattern Library",
  description: "Structural algorithm families with recognition clues, first questions, and canonical practice problems.",
};

export default function PatternLibraryPage() {
  return (
    <main className="page">
      <div className="site-shell">
        <div className="knowledge-hero">
          <div>
            <div className="eyebrow">Structural pattern library</div>
            <h1 className="editorial-title editorial-title--compact">Remember the structure, not the chapter label.</h1>
            <p className="lede">
              These families organize the canonical Problem Atlas by the structural question that should come to mind first.
              Use them as retrieval keys after you have attempted a problem, not as a shortcut that replaces modeling.
            </p>
          </div>
          <aside className="knowledge-note">
            <span className="eyebrow">Recognition rule</span>
            <strong>Signal → model → invariant → technique.</strong>
            <p>If the family name is obvious only after someone tells you the chapter, run the mixed Atlas drill instead.</p>
            <Link href="/practice/atlas">Run blind recognition →</Link>
          </aside>
        </div>

        <section className="section pattern-library">
          <div className="section-heading">
            <div className="section-heading__index">16 FAMILIES</div>
            <div>
              <h2>A compact map of recurring algorithmic structure.</h2>
              <p>Each family exposes one diagnostic clue, the first question to ask, and the source-aware canonical problems currently classified under it.</p>
            </div>
          </div>

          <div className="pattern-library__list">
            {patternLibrary.map((pattern, index) => (
              <Link className="pattern-library__row" href={`/patterns/${pattern.id}`} key={pattern.id}>
                <span className="mono">{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h2>{pattern.label}</h2>
                  <p>{pattern.clue}</p>
                  <strong>First question: {pattern.firstQuestion}</strong>
                </div>
                <div className="pattern-library__count">
                  <strong>{pattern.exerciseCount}</strong>
                  <span>canonical problems</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
