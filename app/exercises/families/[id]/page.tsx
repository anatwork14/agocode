import Link from "next/link";
import { notFound } from "next/navigation";
import { sourceLabels } from "@/lib/knowledge/all-exercises";
import { atlasPatterns, classifiedAtlasExercises } from "@/lib/practice/atlas-recognition";

type PageProps = { params: Promise<{ id: string }> };

export default async function ProblemFamilyPage({ params }: PageProps) {
  const { id } = await params;
  const family = atlasPatterns.find((item) => item.id === id);
  if (!family) notFound();

  const members = classifiedAtlasExercises
    .filter((item) => item.family.id === family.id)
    .sort((a, b) => a.exercise.source.localeCompare(b.exercise.source) || a.exercise.level.localeCompare(b.exercise.level) || a.exercise.title.localeCompare(b.exercise.title));
  const bySource = ["goodrich", "epi", "skiena"].map((source) => ({
    source,
    count: members.filter((item) => item.exercise.source === source).length,
  }));

  return (
    <main className="page">
      <div className="site-shell">
        <Link className="back-link" href="/exercises/families">← Structural families</Link>

        <div className="knowledge-hero">
          <div>
            <div className="eyebrow">Structural family · {members.length} classified problems</div>
            <h1 className="editorial-title editorial-title--compact">{family.label}</h1>
            <p className="lede">{family.clue}</p>
          </div>
          <aside className="knowledge-note">
            <span className="eyebrow">First diagnostic question</span>
            <strong>{family.firstQuestion}</strong>
            <p>Use the question before naming a technique. Then verify the assumptions on a fresh problem from another source or domain.</p>
            <Link href="/practice/atlas">Run blind recognition →</Link>
          </aside>
        </div>

        <section className="problem-family-source-grid" aria-label="Source coverage">
          {bySource.map(({ source, count }) => (
            <article key={source}>
              <span className="eyebrow">{sourceLabels[source as keyof typeof sourceLabels]}</span>
              <strong>{count}</strong>
              <small>classified problem{count === 1 ? "" : "s"}</small>
            </article>
          ))}
        </section>

        <section className="section">
          <div className="section-heading">
            <div className="section-heading__index">TRANSFER SET</div>
            <div>
              <h2>Keep the family fixed; change source, domain, and difficulty.</h2>
              <p>These are not copies of one exercise. They are structurally related prompts that let AgoCode test whether recognition survives a changed surface story.</p>
            </div>
          </div>

          <div className="module-problem-grid">
            {members.map(({ exercise, matchedTerms }) => (
              <Link href={`/exercises/${exercise.id}`} key={exercise.id}>
                <span className="mono">{sourceLabels[exercise.source]} · {exercise.level}</span>
                <strong>{exercise.title}</strong>
                <small>{exercise.domain}{matchedTerms.length ? ` · ${matchedTerms.slice(0, 2).join(" · ")}` : ""}</small>
              </Link>
            ))}
          </div>
        </section>

        <section className="worksheet-next">
          <div>
            <span className="eyebrow">Practice rule</span>
            <h2>Do not solve five near-identical problems in a row.</h2>
            <p>Choose one unfamiliar source or domain, solve it independently, then leave the family and retrieve it again later.</p>
          </div>
          <div className="action-row">
            <Link className="button" href="/practice/mixed">Build a mixed session</Link>
            <Link className="button button--primary" href="/practice/next">Let AgoCode choose next →</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
