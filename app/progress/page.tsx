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
          AgoCode tracks reconstruction, recall, transfer, and problem-design evidence produced while you learn. Completion counts are
          useful signals, but they are deliberately kept separate from claims of mastery.
        </p>

        <section className="section" style={{ paddingTop: 44 }}>
          <ProgressDashboard />
          <ProblemSolvingProgress />
        </section>
      </div>
    </main>
  );
}
