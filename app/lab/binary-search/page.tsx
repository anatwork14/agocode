import Link from "next/link";
import { BinarySearchTrace } from "@/components/binary-search/BinarySearchTrace";

export const metadata = { title: "Binary Search Lab" };

export default function BinarySearchLabPage() {
  return (
    <main className="page">
      <div className="site-shell">
        <div className="eyebrow">Lab · Binary Search</div>
        <h1 className="editorial-title editorial-title--compact">Trace the invariant, not the animation.</h1>
        <p className="lede">
          Change the sorted input, predict every branch, then step backward and forward. At every moment, ask which
          indices are still valid candidates and why the rest are safe to discard.
        </p>
        <section className="section" style={{ paddingTop: 44 }}>
          <BinarySearchTrace allowScenarioEditing requirePrediction />
          <div className="action-row">
            <Link className="button" href="/learn/binary-search">
              ← Back to lesson
            </Link>
            <Link className="button button--primary" href="/practice/binary-search">
              Continue to transfer →
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
