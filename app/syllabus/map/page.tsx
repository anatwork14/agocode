import Link from "next/link";
import { getModuleRoute } from "@/lib/knowledge/module-lab-routes";
import { getModulePrerequisites, syllabusGraphNodes } from "@/lib/knowledge/syllabus-graph";
import { syllabusTracks } from "@/lib/knowledge/syllabus";

export const metadata = {
  title: "Syllabus Dependency Map",
  description: "AgoCode's prerequisite graph connecting analysis, data structures, design techniques, practice, and systems constraints.",
};

export default function SyllabusMapPage() {
  return (
    <main className="page">
      <div className="site-shell">
        <Link className="back-link" href="/syllabus">← Expanded syllabus</Link>
        <div className="knowledge-hero">
          <div>
            <div className="eyebrow">Knowledge graph · {syllabusGraphNodes.length} modules</div>
            <h1 className="editorial-title editorial-title--compact">Learn dependencies, not isolated chapter names.</h1>
            <p className="lede">
              Each arrow means “this earlier idea makes the next one easier to justify or implement.” The graph is advisory rather than restrictive: evidence can replace sequence.
            </p>
          </div>
          <aside className="knowledge-note">
            <span className="eyebrow">How to read it</span>
            <strong>Prerequisite → dependent idea</strong>
            <p>Open any module for outcomes, source-aware practice, and its concrete lesson or workbench.</p>
          </aside>
        </div>

        <section className="syllabus-graph" aria-label="Syllabus prerequisite graph">
          {syllabusTracks.map((track) => (
            <article className="syllabus-graph__track" key={track.id}>
              <div className="syllabus-graph__track-head">
                <span className="syllabus-track__number">{track.number}</span>
                <div><h2>{track.title}</h2><p>{track.purpose}</p></div>
              </div>
              <div className="syllabus-graph__nodes">
                {track.modules.map((module) => {
                  const prerequisites = getModulePrerequisites(module.id);
                  return (
                    <div className="syllabus-graph__node" key={module.id}>
                      <div className="syllabus-graph__node-prereqs">
                        <span className="mono">DEPENDS ON</span>
                        {prerequisites.length ? prerequisites.map((item) => (
                          <Link href={`/syllabus/${item.id}`} key={item.id}>{item.module.title}</Link>
                        )) : <span className="syllabus-graph__entry">entry point</span>}
                      </div>
                      <Link className="syllabus-graph__node-main" href={`/syllabus/${module.id}`}>
                        <span className="eyebrow">{module.sources.join(" · ")}</span>
                        <strong>{module.title}</strong>
                        <small>{module.question}</small>
                      </Link>
                      <Link className="syllabus-graph__node-action" href={getModuleRoute(module.id, module.route)}>Open learning surface →</Link>
                    </div>
                  );
                })}
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
