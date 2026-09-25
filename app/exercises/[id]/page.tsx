import Link from "next/link";
import { notFound } from "next/navigation";
import { getCanonicalExercise, sourceLabels } from "@/lib/knowledge/exercises";

type ExercisePageProps = { params: Promise<{ id: string }> };

export default async function ExercisePage({ params }: ExercisePageProps) {
  const { id } = await params;
  const exercise = getCanonicalExercise(id);
  if (!exercise) notFound();

  const steps = [
    ["01", "Restate", "Write the input, output, constraints, and objective in your own words. Remove the source story until only the computational structure remains."],
    ["02", "Hand-solve", "Construct one tiny ordinary case and one extreme case. Record the decisions that produce the answer before writing code."],
    ["03", "Baseline", "Describe the simplest obviously correct method. Give its time and space cost even if it is far too slow."],
    ["04", "Find the waste", "Name what the baseline repeatedly rescans, recomputes, compares, or enumerates. Optimization must remove a named source of waste."],
    ["05", "Model / structure", "Ask whether sorting, hashing, a heap, a tree, graph modeling, recursion, dynamic programming, or another representation makes the expensive operation cheaper."],
    ["06", "Invariant", "Write one sentence that must remain true after every important state transition. Try to break it with a counterexample."],
    ["07", "Analyze", "State the final time and space bounds in terms of the real input size. Include hidden storage such as recursion or auxiliary indexes."],
    ["08", "Vary", "Change one assumption and predict what breaks: order, weights, duplicates, streaming input, memory limit, or the required output."],
  ] as const;

  return (
    <main className="page">
      <div className="site-shell">
        <Link className="back-link" href="/exercises">← Canonical Problem Atlas</Link>

        <div className="worksheet-hero">
          <div>
            <div className="eyebrow">Design worksheet · {exercise.source}</div>
            <h1 className="editorial-title editorial-title--compact">{exercise.title}</h1>
            <p className="lede">{exercise.lens}</p>
          </div>
          <dl className="worksheet-facts">
            <div><dt>Source</dt><dd>{sourceLabels[exercise.source]}</dd></div>
            <div><dt>Location</dt><dd>{exercise.sourceChapter}</dd></div>
            <div><dt>Domain</dt><dd>{exercise.domain}</dd></div>
            <div><dt>Level</dt><dd>{exercise.level}</dd></div>
          </dl>
        </div>

        <div className="worksheet-boundary">
          <strong>Use your copy of the source for the original statement.</strong>
          <p>
            This worksheet intentionally does not reproduce copyrighted problem text or its published solution. The title and
            provenance identify the canonical exercise; AgoCode supplies an original reasoning process around it.
          </p>
        </div>

        <section className="section worksheet">
          <div className="section-heading">
            <div className="section-heading__index">WORKSHEET</div>
            <div>
              <h2>Do not ask “which trick?” Ask a sequence of better questions.</h2>
              <p>Write your answers somewhere persistent. A rejected approach only becomes knowledge when you record why it failed.</p>
            </div>
          </div>

          <div className="worksheet-steps">
            {steps.map(([number, title, body]) => (
              <article key={number}>
                <span className="mono">{number}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="worksheet-next">
          <div>
            <span className="eyebrow">After the first solution</span>
            <h2>Transfer is the real completion condition.</h2>
            <p>Return to the atlas and solve a neighboring problem without filtering by technique first.</p>
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
