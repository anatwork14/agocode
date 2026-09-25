import Link from "next/link";
import { PracticeProgression } from "@/components/syllabus/PracticeProgression";
import { sourceLabels } from "@/lib/knowledge/all-exercises";
import { getModuleRoute, moduleLabRoutes } from "@/lib/knowledge/module-lab-routes";
import { getAtlasProblemsForModule } from "@/lib/knowledge/syllabus-atlas";
import { problemSolvingLoop, syllabusModuleCount, syllabusTracks } from "@/lib/knowledge/syllabus";

export const metadata = {
  title: "Syllabus",
  description: "AgoCode's expanded multi-source syllabus for data structures, algorithm design, problem solving, and transfer.",
};

export default function SyllabusPage() {
  return (
    <main className="page">
      <div className="site-shell">
        <div className="knowledge-hero">
          <div>
            <div className="eyebrow">Expanded syllabus · v3</div>
            <h1 className="editorial-title editorial-title--compact">The book track is one path through a larger map.</h1>
            <p className="lede">
              AgoCode keeps the visual-first 11-chapter foundation, then adds the deeper perspectives that make data
              structures and algorithms useful in unfamiliar work: ADT trade-offs, correctness, representation, modeling,
              canonical problem recognition, algorithm design, hardness, engineering constraints, and deliberate practice.
            </p>
          </div>
          <aside className="knowledge-note">
            <span className="eyebrow">Structure</span>
            <strong>{syllabusTracks.length} tracks · {syllabusModuleCount} modules</strong>
            <p>Use this page as a dependency map. Each module now surfaces nearby canonical Atlas problems automatically from its concepts and source perspective.</p>
            <Link href="/learn">Open the visual Book Track →</Link>
          </aside>
        </div>

        <section className="syllabus-loop" aria-label="AgoCode problem-solving loop">
          {problemSolvingLoop.map((step, index) => (
            <div key={step}>
              <span className="mono">{String(index + 1).padStart(2, "0")}</span>
              <strong>{step}</strong>
            </div>
          ))}
        </section>

        <PracticeProgression />

        <section className="section syllabus-tracks">
          {syllabusTracks.map((track) => (
            <article className="syllabus-track" id={track.id} key={track.id}>
              <div className="syllabus-track__head">
                <span className="syllabus-track__number">{track.number}</span>
                <div>
                  <h2>{track.title}</h2>
                  <p>{track.purpose}</p>
                </div>
              </div>

              <div className="syllabus-modules">
                {track.modules.map((module) => {
                  const route = getModuleRoute(module.id, module.route);
                  const opensLab = Boolean(moduleLabRoutes[module.id]);
                  const atlasProblems = getAtlasProblemsForModule(module, 4);

                  return (
                    <div className="syllabus-module" key={module.id}>
                      <div className="syllabus-module__top">
                        <div>
                          <span className="eyebrow">{module.sources.join(" · ")}</span>
                          <h3>{module.title}</h3>
                        </div>
                        {route ? <Link href={route}>{opensLab ? "Open lab" : "Open"} →</Link> : <span className="mono">syllabus</span>}
                      </div>
                      <p className="syllabus-question">{module.question}</p>
                      <div className="syllabus-module__grid">
                        <div>
                          <strong>Outcomes</strong>
                          <ul>{module.outcomes.map((item) => <li key={item}>{item}</li>)}</ul>
                        </div>
                        <div>
                          <strong>Topics</strong>
                          <div className="atlas-tags">{module.topics.map((item) => <span key={item}>{item}</span>)}</div>
                        </div>
                      </div>

                      <div className="syllabus-module__atlas">
                        <div className="syllabus-module__atlas-head">
                          <div>
                            <span className="mono">PRACTICE FROM THE ATLAS</span>
                            <strong>Remove the module label and test the idea on a named problem.</strong>
                          </div>
                          <Link href="/exercises">Full Atlas →</Link>
                        </div>
                        <div className="syllabus-module__atlas-links">
                          {atlasProblems.map(({ exercise, matchedTerms }) => (
                            <Link className="syllabus-module__atlas-link" href={`/exercises/${exercise.id}`} key={exercise.id}>
                              <span className="mono">{sourceLabels[exercise.source]} · {exercise.level}</span>
                              <strong>{exercise.title}</strong>
                              <small>{matchedTerms.length ? `matched: ${matchedTerms.slice(0, 2).join(" · ")}` : exercise.domain}</small>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </article>
          ))}
        </section>

        <section className="worksheet-next">
          <div>
            <span className="eyebrow">Use the syllabus actively</span>
            <h2>Move from topic coverage to problem-solving evidence.</h2>
            <p>Choose a module, use its workbench when available, then test it against the linked canonical problems where the chapter label no longer gives away the method.</p>
          </div>
          <div className="action-row">
            <Link className="button" href="/blog">Read Ways of Solving</Link>
            <Link className="button button--primary" href="/exercises">Open the Problem Atlas →</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
