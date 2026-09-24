import Link from "next/link";
import { PatternRecognitionDrill } from "@/components/practice/PatternRecognitionDrill";

export const metadata = { title: "Mixed Pattern Recognition" };

export default function MixedPracticePage() {
  return (
    <main className="page">
      <div className="site-shell transfer-practice">
        <div className="eyebrow">Transfer Track · Mixed recognition</div>
        <h1 className="editorial-title editorial-title--compact">The problem will not tell you which chapter to use.</h1>
        <p className="lede">
          Coding interviews and unfamiliar engineering problems usually hide the technique label. This set mixes algorithms
          from across the Book Track and scores whether you recognize the underlying invariant before feedback narrows the choice.
        </p>

        <section className="section" style={{ paddingTop: 42 }}>
          <PatternRecognitionDrill />
          <div className="action-row">
            <Link className="button" href="/practice/dp-budget">← Direct transfer challenges</Link>
            <Link className="button" href="/practice">Transfer Track</Link>
            <Link className="button button--primary" href="/review">Review weak patterns later →</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
