import Link from "next/link";
import { notFound } from "next/navigation";
import { ReasoningNotebook } from "@/components/exercises/ReasoningNotebook";
import { getCanonicalExercise, sourceLabels } from "@/lib/knowledge/exercises";
import { getGoodrichExerciseRef } from "@/lib/knowledge/goodrich-workbook";

type ExercisePageProps = { params: Promise<{ id: string }> };

const goodrichLens = {
  R: "Treat this as deliberate reinforcement: make the chapter mechanism explicit, execute it carefully, and justify the cost or invariant instead of relying on recognition alone.",
  C: "Treat this as a design problem: establish a simple baseline, identify the obstruction, then construct and justify a better representation or algorithm.",
  P: "Treat this as an engineering project: define interfaces and invariants first, plan tests and complexity budgets, then implement in small verifiable pieces.",
} as const;

export default async function ExercisePage({ params }: ExercisePageProps) {
  const { id } = await params;
  const exercise = getCanonicalExercise(id);
  const goodrichRef = exercise ? undefined : getGoodrichExerciseRef(id);
  if (!exercise && !goodrichRef) notFound();

  const title = exercise?.title ?? `Exercise ${goodrichRef!.sourceId}`;
  const source = exercise ? sourceLabels[exercise.source] : "Goodrich · Tamassia · Goldwasser";
  const location = exercise?.sourceChapter ?? `${goodrichRef!.chapter} · ${goodrichRef!.chapterTitle}`;
  const domain = exercise?.domain ?? "Source workbook";
  const level = exercise?.level ?? goodrichRef!.tierLabel;
  const lens = exercise?.lens ?? goodrichLens[goodrichRef!.tier];

  return (
    <main className="page">
      <div className="site-shell">
        <Link className="back-link" href="/exercises">← Canonical Problem Atlas</Link>

        <div className="worksheet-hero">
          <div>
            <div className="eyebrow">Problem-solving notebook</div>
            <h1 className="editorial-title editorial-title--compact">{title}</h1>
            <p className="lede">
              Start from the source problem, but keep the algorithm label hidden from yourself. The notebook below turns the
              attempt into reusable reasoning: understand → baseline → remove waste → justify → vary.
            </p>
          </div>
          <dl className="worksheet-facts">
            <div><dt>Source</dt><dd>{source}</dd></div>
            <div><dt>Location</dt><dd>{location}</dd></div>
            <div><dt>Domain</dt><dd>{domain}</dd></div>
            <div><dt>Level</dt><dd>{level}</dd></div>
          </dl>
        </div>

        <div className="worksheet-boundary">
          <strong>Keep the source open beside AgoCode.</strong>
          <p>
            This page intentionally does not reproduce the copyrighted problem statement, published solution, or source
            illustration. AgoCode keeps the problem name or source identifier for navigation and provides an original reasoning
            workflow, progressive hint, and persistent design log around your own attempt.
          </p>
        </div>

        <section className="section worksheet">
          <div className="section-heading">
            <div className="section-heading__index">SOLVE</div>
            <div>
              <h2>Do not ask “which trick?” Build the answer from evidence.</h2>
              <p>
                EPI develops solutions from a baseline toward a better algorithm; Skiena emphasizes explicit design questions
                and a written log; Goodrich repeatedly asks learners to justify correctness and trade-offs. This notebook combines
                those perspectives into one reusable workflow.
              </p>
            </div>
          </div>

          <ReasoningNotebook exerciseId={id} lens={lens} />
        </section>

        <section className="worksheet-next">
          <div>
            <span className="eyebrow">After the first solution</span>
            <h2>Transfer is the real completion condition.</h2>
            <p>Return to the atlas in blind mode and solve a neighboring problem without filtering by technique first.</p>
          </div>
          <div className="action-row">
            <Link className="button" href="/blog">Open Ways of Solving</Link>
            <Link className="button button--primary" href="/exercises">Choose another problem →</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
