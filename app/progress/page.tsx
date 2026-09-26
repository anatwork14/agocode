import Link from "next/link";
import { ProblemIndependenceProgress } from "@/components/progress/ProblemIndependenceProgress";
import { ProblemSolvingFriction } from "@/components/progress/ProblemSolvingFriction";
import { ProgressDashboard } from "@/components/progress/ProgressDashboard";
import { ProblemSolvingProgress } from "@/components/progress/ProblemSolvingProgress";

export const metadata = { title: "Progress" };

export default function ProgressPage() {
  return (
    <main className="page">
      <div className="site-shell">
        <div className="eyebrow">Learning evidence</div>
        <h1 className="editorial-title editorial-title--compact">Progress should show what you can do without support.</h1>
        <p className="lede">
          AgoCode tracks reconstruction, recall, transfer, problem-design evidence, and the places where you explicitly ask for help.
          Completion counts and friction are useful signals, but they are deliberately kept separate from claims of mastery.
        </p>
        <div className="action-row" style={{ marginTop: 22 }}>
          <Link className="button button--primary" href="/practice/next">Choose my next problem →</Link>
          <Link className="button" href="/practice/session">Build a mixed session</Link>
          <Link className="button" href="/review">Open spaced review</Link>
          <Link className="button" href="/settings/data">Export / import learning data</Link>
        </div>

        <section className="section" style={{ paddingTop: 44 }}>
          <ProgressDashboard />
          <ProblemIndependenceProgress />
          <ProblemSolvingProgress />
          <ProblemSolvingFriction />
        </section>
      </div>
    </main>
  );
}
