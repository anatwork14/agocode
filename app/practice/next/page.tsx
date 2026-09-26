import Link from "next/link";
import { NextProblemPlanner } from "@/components/practice/NextProblemPlanner";

export const metadata = {
  title: "Next Problem",
  description: "An explainable adaptive problem recommendation built from mastery gaps, friction, transfer misses, and diversity.",
};

export default function NextProblemPage() {
  return (
    <main className="page">
      <div className="site-shell">
        <Link className="back-link" href="/practice">← Transfer Track</Link>

        <div className="knowledge-hero">
          <div>
            <div className="eyebrow">Adaptive practice</div>
            <h1 className="editorial-title editorial-title--compact">What should you solve next — and why?</h1>
            <p className="lede">
              AgoCode now chooses from the source-aware canonical problem atlas using four signals: the learning dimension with
              the weakest evidence, where your reasoning repeatedly asks for help, what you recently missed in blind recognition,
              and whether the next problem adds a different source, domain, or structural family.
            </p>
          </div>
          <aside className="knowledge-note">
            <span className="eyebrow">Not a black box</span>
            <strong>Every recommendation exposes its reasons.</strong>
            <p>You can always ignore the planner, inspect the structural family, regenerate a different mix, or browse the atlas manually.</p>
            <Link href="/patterns">Browse structural families →</Link>
          </aside>
        </div>

        <section className="section" style={{ paddingTop: 34 }}>
          <NextProblemPlanner />
        </section>
      </div>
    </main>
  );
}
