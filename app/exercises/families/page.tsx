import Link from "next/link";
import { atlasPatterns, classifiedAtlasExercises } from "@/lib/practice/atlas-recognition";

export const metadata = {
  title: "Problem Families",
  description: "Browse AgoCode problems by structural family across Goodrich, EPI, and Skiena rather than by chapter label.",
};

export default function ProblemFamiliesPage() {
  return (
    <main className="page">
      <div className="site-shell">
        <Link className="back-link" href="/exercises">← Problem Atlas</Link>
        <div className="knowledge-hero">
          <div>
            <div className="eyebrow">Structural Atlas · {atlasPatterns.length} families</div>
            <h1 className="editorial-title editorial-title--compact">Group problems by the decision structure that survives the story.</h1>
            <p className="lede">Family pages combine problems from multiple source books and application domains so transfer practice can change the surface while preserving the deep mechanism.</p>
          </div>
          <aside className="knowledge-note">
            <span className="eyebrow">Rule</span>
            <strong>Family ≠ memorized template.</strong>
            <p>A family gives you a first diagnostic question, not a finished solution. You still need to justify representation, invariant, cost, and assumptions.</p>
          </aside>
        </div>

        <div className="problem-family-grid">
          {atlasPatterns.map((family) => {
            const members = classifiedAtlasExercises.filter((item) => item.family.id === family.id);
            const sources = new Set(members.map((item) => item.exercise.source));
            const domains = new Set(members.map((item) => item.exercise.domain));
            return (
              <Link className="problem-family-card" href={`/exercises/families/${family.id}`} key={family.id}>
                <span className="mono">{members.length} problems · {sources.size} sources · {domains.size} domains</span>
                <strong>{family.label}</strong>
                <p>{family.clue}</p>
                <small>First question: {family.firstQuestion}</small>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
