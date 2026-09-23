import Link from "next/link";

export const metadata = { title: "Review" };

export default function ReviewPage() {
  return (
    <main className="page">
      <div className="site-shell">
        <div className="eyebrow">Recall mode</div>
        <h1 className="editorial-title editorial-title--compact">Return after the explanation is gone.</h1>
        <p className="lede">
          Review is where apparent familiarity becomes durable knowledge. Tasks will be short: predict a trace,
          repair a bug, explain a complexity, or rebuild an implementation from memory.
        </p>
        <section className="section">
          <div className="empty-state">
            <h2>No review is due yet.</h2>
            <p>Complete the Binary Search lesson to create the first recall items.</p>
            <div className="action-row">
              <Link className="button button--primary" href="/learn/binary-search">
                Start the lesson →
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
