import Link from "next/link";
import { AdaptiveMixedSession } from "@/components/practice/AdaptiveMixedSession";

export const metadata = { title: "Adaptive mixed practice" };

export default function AdaptiveMixedSessionPage() {
  return (
    <main className="page">
      <div className="site-shell">
        <Link className="back-link" href="/practice/next">← Next-problem planner</Link>
        <div className="eyebrow">Mixed practice</div>
        <h1 className="editorial-title editorial-title--compact">Interleave retrieval, repair, transfer, and new work.</h1>
        <p className="lede">
          AgoCode builds a short session from your current evidence instead of asking you to grind one topic at a time. Due retrieval is prioritized, then the remaining slots are diversified across structural families and sources.
        </p>
        <section className="section">
          <AdaptiveMixedSession />
        </section>
      </div>
    </main>
  );
}
