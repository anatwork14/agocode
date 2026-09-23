import Link from "next/link";
import { RotatedArrayTransferPractice } from "@/components/binary-search/RotatedArrayTransferPractice";

export const metadata = { title: "Rotated Array Pattern Practice" };

export default function RotatedArrayPracticePage() {
  return (
    <main className="page">
      <div className="site-shell">
        <div className="eyebrow">Practice · Pattern transfer</div>
        <h1 className="editorial-title editorial-title--compact">The array is not globally sorted anymore. Is the idea gone?</h1>
        <p className="lede">
          This rung removes the familiar exact-search shape. The useful technique should come from the structure and
          complexity constraint, not from a topic label in the problem statement.
        </p>

        <section className="section" style={{ paddingTop: 44 }}>
          <RotatedArrayTransferPractice />
          <div className="action-row">
            <Link className="button" href="/practice/binary-search/boundary">
              ← Previous rung
            </Link>
            <Link className="button" href="/practice">
              View transfer ladder
            </Link>
            <Link className="button button--primary" href="/practice/binary-search/answer-space">
              Next: answer-space search →
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
