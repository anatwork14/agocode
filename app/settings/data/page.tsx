import Link from "next/link";
import { DataPortability } from "@/components/settings/DataPortability";

export const metadata = { title: "Learning data" };

export default function LearningDataPage() {
  return (
    <main className="page">
      <div className="site-shell">
        <Link className="back-link" href="/progress">← Progress</Link>
        <div className="eyebrow">Data portability</div>
        <h1 className="editorial-title editorial-title--compact">Your learning evidence should not be trapped in one browser.</h1>
        <p className="lede">
          Export, restore, or reset the local evidence AgoCode uses for mastery, attempts, retrieval scheduling, bookmarks, and custom sets. This comes before any optional account or server-sync layer.
        </p>
        <section className="section">
          <DataPortability />
        </section>
      </div>
    </main>
  );
}
