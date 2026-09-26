import Link from "next/link";
import { WeeklyReviewPanel } from "@/components/learning/WeeklyReviewPanel";

export const metadata = { title: "Weekly learning review" };

export default function WeeklyReviewPage() {
  return (
    <main className="page">
      <div className="site-shell">
        <Link className="back-link" href="/plan">← Adaptive curriculum plan</Link>
        <div className="eyebrow">Weekly evidence review</div>
        <h1 className="editorial-title editorial-title--compact">Review the trajectory, not just the streak.</h1>
        <p className="lede">
          AgoCode summarizes this week&apos;s timestamped attempts, support use, blind recognition, curriculum state, and mission progress. Trend history is deliberately prospective so the product never invents week-over-week mastery changes from data it did not actually snapshot.
        </p>
        <section className="section">
          <WeeklyReviewPanel />
        </section>
      </div>
    </main>
  );
}
