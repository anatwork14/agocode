import Link from "next/link";
import { ExerciseCatalog } from "@/components/exercises/ExerciseCatalog";
import { GoodrichWorkbookIndex } from "@/components/exercises/GoodrichWorkbookIndex";
import { canonicalExercises } from "@/lib/knowledge/all-exercises";
import { goodrichExerciseCount } from "@/lib/knowledge/goodrich-workbook";

export const metadata = {
  title: "Exercise Atlas",
  description: "A source-aware catalog of canonical data-structure and algorithm problems with AgoCode problem-solving lenses.",
};

const epiCount = canonicalExercises.filter((item) => item.source === "epi").length;
const skienaCount = canonicalExercises.filter((item) => item.source === "skiena").length;

export default function ExercisesPage() {
  return (
    <main className="page">
      <div className="site-shell">
        <div className="knowledge-hero">
          <div>
            <div className="eyebrow">Canonical problem atlas</div>
            <h1 className="editorial-title editorial-title--compact">Learn the repertoire. Do not memorize the answers.</h1>
            <p className="lede">
              This atlas indexes canonical problem names, structures, and applications surfaced by the source books.
              Every entry adds an original AgoCode lens: start with a tiny case, establish a baseline, identify the structure,
              justify the improvement, then test a variant.
            </p>
          </div>
          <aside className="knowledge-note">
            <span className="eyebrow">Copyright boundary</span>
            <p>
              AgoCode catalogs short problem names, exercise identifiers, and source provenance. It does not reproduce the books&apos;
              full exercise statements, published solutions, or illustrations. Use your copy of the source beside the AgoCode notebook.
            </p>
            <Link href="/patterns">Browse by structural family →</Link>
            <Link href="/blog#repertoire-not-memorization">Why repertoire matters →</Link>
          </aside>
        </div>

        <section className="section" style={{ paddingTop: 22 }}>
          <div className="section-heading">
            <div className="section-heading__index">SOURCE COVERAGE</div>
            <div>
              <h2>Coverage is explicit and test-locked.</h2>
              <p>
                AgoCode distinguishes a source workbook index from a named problem catalog. Counts below are generated from the current source-aware data rather than marketing copy.
              </p>
            </div>
          </div>
          <div className="home-knowledge__grid">
            <article className="home-knowledge__item">
              <span className="mono">Goodrich · Chapters 1–15</span>
              <h3>{goodrichExerciseCount} numbered source-workbook references</h3>
              <p>Every indexed Reinforcement, Creativity, and Project identifier in the supplied edition opens an AgoCode reasoning notebook without republishing the prompt.</p>
            </article>
            <article className="home-knowledge__item">
              <span className="mono">Elements of Programming Interviews</span>
              <h3>{epiCount} named problem and design entries</h3>
              <p>Coverage spans problem chapters 4–24, including the design, language, object-oriented, tools, parallel, and honors sections represented in the supplied edition.</p>
            </article>
            <article className="home-knowledge__item">
              <span className="mono">Algorithm Design Manual · catalog</span>
              <h3>{skienaCount} / 75 catalog problems</h3>
              <p>The complete supplied catalog is represented across data structures, numerical, combinatorial, graph, geometry, set, and string problem families.</p>
            </article>
          </div>
        </section>

        <section className="section" style={{ paddingTop: 38 }}>
          <div className="section-heading">
            <div className="section-heading__index">ATLAS</div>
            <div>
              <h2>Named canonical problems and algorithm families</h2>
              <p>Filter by source or domain, or switch on blind recognition so the structure labels stop giving away the method.</p>
            </div>
          </div>
          <div className="action-row" style={{ marginBottom: 20 }}>
            <Link className="button" href="/patterns">Open 16 structural families</Link>
            <Link className="button" href="/practice/atlas">Run mixed recognition</Link>
          </div>
          <ExerciseCatalog />
        </section>

        <GoodrichWorkbookIndex />
      </div>
    </main>
  );
}
