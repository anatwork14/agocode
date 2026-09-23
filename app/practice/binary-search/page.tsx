import Link from "next/link";
import { BinarySearchTransferPractice } from "@/components/binary-search/BinarySearchTransferPractice";

export const metadata = { title: "Binary Search Transfer Practice" };

export default function BinarySearchPracticePage() {
  return (
    <main className="page">
      <div className="site-shell">
        <div className="eyebrow">Practice · Binary Search</div>
        <h1 className="editorial-title editorial-title--compact">Transfer the invariant to a nearby problem.</h1>
        <p className="lede">
          This first rung is intentionally close to exact search. Later rungs will hide the topic and introduce
          rotated arrays, boundaries, and monotonic answer spaces.
        </p>

        <section className="section" style={{ paddingTop: 44 }}>
          <BinarySearchTransferPractice />
          <div className="action-row">
            <Link className="button" href="/learn/binary-search">
              ← Review the lesson
            </Link>
            <Link className="button" href="/lab/binary-search">
              Open trace lab
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
