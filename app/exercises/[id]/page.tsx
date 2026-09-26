import Link from "next/link";
import { notFound } from "next/navigation";
import { StuckRouter } from "@/components/blog/StuckRouter";
import { DifficultyCalibration } from "@/components/exercises/DifficultyCalibration";
import { ModelVariantPractice } from "@/components/practice/ModelVariantPractice";
import { ProblemSetControl } from "@/components/exercises/ProblemSetControl";
import { ProjectWorkspace } from "@/components/exercises/ProjectWorkspace";
import { ReasoningNotebook } from "@/components/exercises/ReasoningNotebook";
import { RejectedApproaches } from "@/components/exercises/RejectedApproaches";
import { getCanonicalExercise, sourceLabels } from "@/lib/knowledge/all-exercises";
import { getGoodrichExerciseRef } from "@/lib/knowledge/goodrich-workbook";
import { classifyAtlasExercise } from "@/lib/practice/atlas-recognition";
import { getRelatedAtlasProblems } from "@/lib/practice/related-atlas-problems";

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
  const isProjectTier = goodrichRef?.tier === "P";
  const classified = exercise ? classifyAtlasExercise(exercise) : null;
  const relatedProblems = exercise ? getRelatedAtlasProblems(exercise.id, 4) : [];

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

        <ProblemSetControl exerciseId={id} />

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
          <RejectedApproaches exerciseId={id} />
          <DifficultyCalibration exerciseId={id} />
        </section>

        <StuckRouter returnHref={`/exercises/${id}`} returnLabel={`Return to ${title}`} />

        {isProjectTier ? (
          <section className="section worksheet">
            <div className="section-heading">
              <div className="section-heading__index">BUILD</div>
              <div>
                <h2>Project-tier work needs engineering evidence beyond the first algorithm.</h2>
                <p>
                  Keep the source project prompt in your own copy. AgoCode adds a persistent project brief around it so interfaces,
                  invariants, milestones, tests, operation budgets, experiments, and failed designs stay inspectable while you build.
                </p>
              </div>
            </div>
            <ProjectWorkspace exerciseId={id} />
          </section>
        ) : null}

        {relatedProblems.length ? (
          <section className="section worksheet">
            <div className="section-heading">
              <div className="section-heading__index">TRANSFER NEIGHBORS</div>
              <div>
                <h2>Hold the deep structure constant. Change the surface story.</h2>
                <p>
                  These problems share the same strongest structural family, but AgoCode prefers a different source or domain when
                  possible. Solve one without carrying over the previous implementation line by line.
                </p>
              </div>
            </div>

            <div className="practice-ladder">
              {relatedProblems.map(({ item, crossSource, crossDomain }, index) => (
                <Link className="practice-ladder__row" href={`/exercises/${item.exercise.id}`} key={item.exercise.id}>
                  <span className="practice-ladder__number">T{index + 1}</span>
                  <div>
                    <strong>{item.exercise.title}</strong>
                    <span>
                      {sourceLabels[item.exercise.source]} · {item.family.label}
                      {crossSource ? " · new source" : ""}
                      {crossDomain ? " · new domain" : ""}
                    </span>
                  </div>
                  <span className="practice-ladder__status practice-ladder__status--live">Transfer</span>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {classified ? (
          <section className="section worksheet">
            <div className="section-heading">
              <div className="section-heading__index">MODEL VARIANTS</div>
              <div>
                <h2>Now change an assumption, not just the story.</h2>
                <p>
                  Decide whether the current structural family survives a change in ordering, updates, objective, resource model,
                  or guarantee. AgoCode reveals the consequence only after you commit a model explanation.
                </p>
              </div>
            </div>
            <ModelVariantPractice exerciseId={exercise!.id} />
          </section>
        ) : null}

        <section className="worksheet-next">
          <div>
            <span className="eyebrow">After the first solution</span>
            <h2>Transfer is the real completion condition.</h2>
            <p>Try a structural neighbor, mutate an assumption, or return to the Atlas in blind mode so the technique label disappears again.</p>
          </div>
          <div className="action-row">
            <Link className="button" href="/practice/atlas">Run Atlas recognition</Link>
            <Link className="button" href="/practice/variants">Practice model mutations</Link>
            <Link className="button" href="/sets">Open my sets</Link>
            <Link className="button" href="/blog#diagnose">Diagnose another obstacle</Link>
            <Link className="button button--primary" href="/exercises">Choose another problem →</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
