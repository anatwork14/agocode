import Link from "next/link";
import { notFound } from "next/navigation";
import { sourceLabels } from "@/lib/knowledge/all-exercises";
import { patternLibrary, getPatternExercises, getPatternLibraryEntry } from "@/lib/practice/pattern-library";

type PatternPageProps = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return patternLibrary.map((pattern) => ({ id: pattern.id }));
}

export default async function PatternPage({ params }: PatternPageProps) {
  const { id } = await params;
  const pattern = getPatternLibraryEntry(id);
  if (!pattern) notFound();
  const exercises = getPatternExercises(pattern.id);

  return (
    <main className="page">
      <div className="site-shell">
        <Link className="back-link" href="/patterns">← Structural Pattern Library</Link>

        <div className="knowledge-hero">
          <div>
            <div className="eyebrow">Structural family</div>
            <h1 className="editorial-title editorial-title--compact">{pattern.label}</h1>
            <p className="lede">{pattern.clue}</p>
          </div>
          <aside className="knowledge-note">
            <span className="eyebrow">First question</span>
            <strong>{pattern.firstQuestion}</strong>
            <p>{pattern.exerciseCount} source-aware canonical problems are currently classified into this family.</p>
            <Link href="/practice/atlas">Test recognition without the label →</Link>
          </aside>
        </div>

        <section className="section pattern-family">
          <div className="section-heading">
            <div className="section-heading__index">REPERTOIRE</div>
            <div>
              <h2>Change the surface story while keeping the structural question.</h2>
              <p>
                These entries are navigation keys into the supplied sources. AgoCode keeps the original problem statement and published
                solution out of the page; open your copy of the source beside the reasoning notebook.
              </p>
            </div>
          </div>

          <div className="pattern-family__list">
            {exercises.map((item, index) => (
              <Link className="pattern-family__row" href={`/exercises/${item.exercise.id}`} key={item.exercise.id}>
                <span className="mono">{String(index + 1).padStart(3, "0")}</span>
                <div>
                  <div className="pattern-family__meta mono">
                    <span>{sourceLabels[item.exercise.source]}</span>
                    <span>{item.exercise.sourceChapter}</span>
                    <span>{item.exercise.level}</span>
                  </div>
                  <h2>{item.exercise.title}</h2>
                  <p>{item.exercise.lens}</p>
                  <div className="atlas-tags">
                    <span>{item.exercise.domain}</span>
                    {item.matchedTerms.slice(0, 3).map((term) => <span key={term}>{term}</span>)}
                  </div>
                </div>
                <span className="pattern-family__score mono">fit {item.score}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="worksheet-next">
          <div>
            <span className="eyebrow">Remove the cue again</span>
            <h2>Recognition only counts when the family label disappears.</h2>
            <p>After two or three problems here, return to the mixed drill and identify the structure from the problem name and constraints alone.</p>
          </div>
          <div className="action-row">
            <Link className="button" href="/blog#diagnose">Ways of Solving</Link>
            <Link className="button button--primary" href="/practice/atlas">Run mixed Atlas recognition →</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
