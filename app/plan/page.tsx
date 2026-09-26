import Link from "next/link";
import { AdaptiveCurriculumPlanner } from "@/components/learning/AdaptiveCurriculumPlanner";

export const metadata = { title: "Adaptive curriculum plan" };

export default function PlanPage() {
  return (
    <main className="page">
      <div className="site-shell">
        <Link className="back-link" href="/progress">← Progress</Link>
        <div className="eyebrow">Adaptive curriculum</div>
        <h1 className="editorial-title editorial-title--compact">What should you learn over the next several weeks?</h1>
        <p className="lede">
          This layer sits above next-problem and daily-session planning. It projects your diagnostic placement and objective reasoning history onto AgoCode&apos;s prerequisite graph, then freezes a small weekly mission so progression stays explainable instead of reactive.
        </p>
        <section className="section">
          <AdaptiveCurriculumPlanner />
        </section>
      </div>
    </main>
  );
}
