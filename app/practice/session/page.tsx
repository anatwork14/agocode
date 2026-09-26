import Link from "next/link";
import { AdaptiveMixedSession } from "@/components/practice/AdaptiveMixedSession";

export const metadata = { title: "Daily adaptive practice" };

export default function AdaptiveMixedSessionPage() {
  return (
    <main className="page">
      <div className="site-shell">
        <Link className="back-link" href="/practice/next">← Next-problem planner</Link>
        <div className="eyebrow">Daily adaptive session</div>
        <h1 className="editorial-title editorial-title--compact">A stable practice plan for today, not another random queue.</h1>
        <p className="lede">
          AgoCode combines retrieval debt, support removal, recognition repair, transfer, and current mastery gaps into a bounded six-problem session. The plan persists directly in this browser for the local calendar day, so you can leave, return, and continue without losing your place.
        </p>
        <section className="section">
          <AdaptiveMixedSession />
        </section>
      </div>
    </main>
  );
}
