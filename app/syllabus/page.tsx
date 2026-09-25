import Link from "next/link";
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
            <div className="eyebrow">Expanded syllabus · v2</div>
            <h1 className="editorial-title editorial-title--compact">The book track is now one path through a larger map.</h1>
            <p className="lede">
              AgoCode keeps the visual-first 11-chapter foundation, then adds the deeper perspectives that make data
              structures and algorithms useful in unfamiliar work: ADT trade-offs, correctness, representation, modeling,
              canonical problem recognition, algorithm design, hardness, and engineering constraints.
            </p>
          </div>
          <aside className="knowledge-note">
            <span className="eyebrow">Structure</span>
            <strong>{syllabusTracks.length} tracks · {syllabusModuleCount} modules</strong>
            <p>Use this page as a dependency map. Use the Book page when you want the original guided reading order.</p>
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
                {track.modules.map((module) => (
                  <div className="syllabus-module" key={module.id}>
                    <div className="syllabus-module__top">
                      <div>
                        <span className="eyebrow">{module.sources.join(" · ")}</span>
                        <h3>{module.title}</h3>
                      </div>
                      {module.route ? <Link href={module.route}>Open →</Link> : <span className="mono">syllabus</span>}
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
                  </div>
                ))}
              </div>
            </article>
          ))}
        </section>

        <section className="worksheet-next">
          <div>
            <span className="eyebrow">Use the syllabus actively</span>
            <h2>Move from topic coverage to problem-solving evidence.</h2>
            <p>Choose a module, then test it against canonical problems where the chapter label does not give away the method.</p>
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
