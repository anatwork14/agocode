import Link from "next/link";
import { BinarySearchBugRepair } from "@/components/binary-search/BinarySearchBugRepair";

export const metadata = { title: "Binary Search Bug Repair" };

export default function BinarySearchBugRepairPage() {
  return (
    <main className="page">
      <div className="site-shell">
        <div className="eyebrow">Practice · Debugging recall</div>
        <h1 className="editorial-title editorial-title--compact">Use the invariant to find the bug.</h1>
        <p className="lede">
          Debugging is a stronger recall test than copying a clean implementation. This version passes a normal case
          but fails when only one candidate remains. Repair the smallest broken assumption you can identify.
        </p>

        <section className="section" style={{ paddingTop: 44 }}>
          <BinarySearchBugRepair />
          <div className="action-row">
            <Link className="button" href="/practice/binary-search/rebuild">
              ← Blank rebuild
            </Link>
            <Link className="button button--primary" href="/review">
              Open review queue →
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
