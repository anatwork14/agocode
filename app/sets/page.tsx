import Link from "next/link";
import { ProblemSetManager } from "@/components/sets/ProblemSetManager";

export const metadata = { title: "Problem sets" };

export default function ProblemSetsPage() {
  return (
    <main className="page">
      <div className="site-shell">
        <Link className="back-link" href="/exercises">← Problem Atlas</Link>
        <div className="eyebrow">Learner collections</div>
        <h1 className="editorial-title editorial-title--compact">Curate problems without turning collection into mastery.</h1>
        <p className="lede">
          Bookmarks and custom sets are organizational tools only. They never increase mastery by themselves; they make it easier to revisit interview themes, source chapters, weak structures, and due retrieval deliberately.
        </p>
        <section className="section">
          <ProblemSetManager />
        </section>
      </div>
    </main>
  );
}
