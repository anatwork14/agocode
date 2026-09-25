import Link from "next/link";
import { SpecialCaseLadder } from "@/components/lab/SpecialCaseLadder";

export const metadata = {
  title: "Special-Case Ladder",
  description: "Practice simplifying an algorithmic problem, solving a restricted case, then identifying exactly what breaks as assumptions are removed.",
};

export default function SpecialCaseLadderPage() {
  return (
    <main className="page">
      <div className="site-shell">
        <Link className="back-link" href="/lab">← Lab index</Link>

        <div className="knowledge-hero special-case-hero">
          <div>
            <div className="eyebrow">Algorithm design lab · special cases</div>
            <h1 className="editorial-title editorial-title--compact">Make the problem easier on purpose—then study what prevents the easy solution from generalizing.</h1>
            <p className="lede">
              Restricted cases are not detours. They isolate the assumption that makes a method work and turn a vague hard problem
              into a sequence of explicit generalization questions.
            </p>
          </div>
          <aside className="knowledge-note">
            <span className="eyebrow">Method</span>
            <strong>Restrict → solve exactly → lift one assumption → name the obstruction</strong>
            <p>A generalization is valid only when the reasoning behind the restricted algorithm survives the broader input class.</p>
            <Link href="/blog/special-cases-ladder">Read the field note →</Link>
          </aside>
        </div>

        <section className="section special-case-lab-section">
          <SpecialCaseLadder />
        </section>
      </div>
    </main>
  );
}
