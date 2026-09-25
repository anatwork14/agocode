import Link from "next/link";
import { ExerciseCatalog } from "@/components/exercises/ExerciseCatalog";

export const metadata = {
  title: "Exercise Atlas",
  description: "A source-aware catalog of canonical data-structure and algorithm problems with AgoCode problem-solving lenses.",
};

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
              AgoCode catalogs short problem names and source provenance. It does not reproduce the books&apos; full exercise
              statements, solution text, or illustrations. Interactive versions use original formulations and visuals.
            </p>
            <Link href="/blog#repertoire-not-memorization">Why repertoire matters →</Link>
          </aside>
        </div>

        <section className="section" style={{ paddingTop: 38 }}>
          <ExerciseCatalog />
        </section>
      </div>
    </main>
  );
}
