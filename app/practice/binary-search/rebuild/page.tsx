import Link from "next/link";
import { BinarySearchRebuild } from "@/components/binary-search/BinarySearchRebuild";

export const metadata = { title: "Blank Binary Search Recall" };

export default function BlankBinarySearchRecallPage() {
  return (
    <main className="page">
      <div className="site-shell">
        <div className="eyebrow">Practice · Delayed recall</div>
        <h1 className="editorial-title editorial-title--compact">Rebuild it without the reminder.</h1>
        <p className="lede">
          This drill removes the invariant comment from the editor. The goal is to recover the complete control flow
          from memory, then use the tests only as evidence—not as a substitute for reasoning.
        </p>

        <section className="section" style={{ paddingTop: 44 }}>
          <BinarySearchRebuild mode="blank" />
          <div className="action-row">
            <Link className="button" href="/practice">
              ← Practice map
            </Link>
            <Link className="button button--primary" href="/practice/binary-search/bug-repair">
              Next recall drill →
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
