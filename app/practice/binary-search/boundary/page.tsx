import Link from "next/link";
import { BinarySearchBoundaryPractice } from "@/components/binary-search/BinarySearchBoundaryPractice";

export const metadata = { title: "Binary Search Boundary Practice" };

export default function BinarySearchBoundaryPage() {
  return (
    <main className="page">
      <div className="site-shell">
        <div className="eyebrow">Practice · Binary Search</div>
        <h1 className="editorial-title editorial-title--compact">A match can be a clue instead of the finish line.</h1>
        <p className="lede">
          Boundary search keeps the binary-search invariant but changes what equality means. This is the first step
          away from memorizing one exact implementation and toward adapting the technique.
        </p>

        <section className="section" style={{ paddingTop: 44 }}>
          <BinarySearchBoundaryPractice />
          <div className="action-row">
            <Link className="button" href="/practice/binary-search">
              ← Previous rung
            </Link>
            <Link className="button" href="/practice">
              View transfer ladder
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
