import Link from "next/link";
import { notFound } from "next/navigation";
import { sourceLabels } from "@/lib/knowledge/all-exercises";
import { getModulePrimaryRoute } from "@/lib/knowledge/module-lab-routes";
import { getAtlasProblemsForModule } from "@/lib/knowledge/syllabus-atlas";
import { getModuleDependents, getModulePrerequisites, getSyllabusGraphNode } from "@/lib/knowledge/syllabus-graph";

type PageProps = { params: Promise<{ id: string }> };

export default async function SyllabusModulePage({ params }: PageProps) {
  const { id } = await params;
  const node = getSyllabusGraphNode(id);
  if (!node) notFound();

  const { module, track } = node;
  const prerequisites = getModulePrerequisites(id);
  const dependents = getModuleDependents(id);
  const primaryRoute = getModulePrimaryRoute(module.id, module.route);
  const problems = getAtlasProblemsForModule(module, 6);

  return (
    <main className="page">
      <div className="site-shell">
        <Link className="back-link" href="/syllabus">← Expanded syllabus</Link>

        <div className="knowledge-hero">
          <div>
            <div className="eyebrow">Track {track.number} · {track.title}</div>
            <h1 className="editorial-title editorial-title--compact">{module.title}</h1>
            <p className="lede">{module.question}</p>
          </div>
          <aside className="knowledge-note">
            <span className="eyebrow">Sources</span>
            <strong>{module.sources.join(" · ")}</strong>
            <p>This module is a concrete learning surface even when no dedicated lesson exists yet: prerequisites, outcomes, Atlas practice, and the next dependency are explicit.</p>
            {primaryRoute ? <Link href={primaryRoute}>Open primary lesson / lab →</Link> : null}
          </aside>
        </div>

        <section className="module-dependency-grid">
          <div>
            <span className="eyebrow">Prerequisites</span>
            <h2>What should already feel usable?</h2>
            {prerequisites.length ? prerequisites.map((item) => (
              <Link className="module-dependency-link" href={`/syllabus/${item.id}`} key={item.id}>
                <span className="mono">{item.track.number}</span>
                <strong>{item.module.title}</strong>
              </Link>
            )) : <p className="module-dependency-empty">No hard prerequisite in the suggested AgoCode path. This is an entry point.</p>}
          </div>
          <div>
            <span className="eyebrow">Unlocks</span>
            <h2>Where does this idea become useful next?</h2>
            {dependents.length ? dependents.map((item) => (
              <Link className="module-dependency-link" href={`/syllabus/${item.id}`} key={item.id}>
                <span className="mono">{item.track.number}</span>
                <strong>{item.module.title}</strong>
              </Link>
            )) : <p className="module-dependency-empty">This module currently sits near the edge of the explicit prerequisite graph.</p>}
          </div>
        </section>

        <section className="section">
          <div className="section-heading">
            <div className="section-heading__index">OUTCOMES</div>
            <div><h2>Evidence to produce, not vocabulary to recognize.</h2><p>{track.purpose}</p></div>
          </div>
          <div className="module-outcome-grid">
            {module.outcomes.map((outcome, index) => <article key={outcome}><span className="mono">{String(index + 1).padStart(2, "0")}</span><strong>{outcome}</strong></article>)}
          </div>
          <div className="atlas-tags module-topic-tags">{module.topics.map((topic) => <span key={topic}>{topic}</span>)}</div>
        </section>

        <section className="section">
          <div className="section-heading">
            <div className="section-heading__index">TRANSFER</div>
            <div><h2>Test the module on named problems without the chapter label.</h2><p>These are source-aware Atlas matches selected from the concepts above.</p></div>
          </div>
          <div className="module-problem-grid">
            {problems.map(({ exercise, matchedTerms }) => (
              <Link href={`/exercises/${exercise.id}`} key={exercise.id}>
                <span className="mono">{sourceLabels[exercise.source]} · {exercise.level}</span>
                <strong>{exercise.title}</strong>
                <small>{matchedTerms.length ? matchedTerms.join(" · ") : exercise.domain}</small>
              </Link>
            ))}
          </div>
        </section>

        <section className="worksheet-next">
          <div><span className="eyebrow">Map view</span><h2>See this module inside the whole dependency graph.</h2><p>The graph is a suggested reasoning path, not a lock: jump when you have evidence that the prerequisite is already usable.</p></div>
          <div className="action-row">
            <Link className="button" href="/syllabus/map">Open dependency map</Link>
            {primaryRoute ? <Link className="button button--primary" href={primaryRoute}>Open primary surface →</Link> : <Link className="button button--primary" href="/exercises">Practice in Atlas →</Link>}
          </div>
        </section>
      </div>
    </main>
  );
}
