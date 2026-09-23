import Link from "next/link";

export const metadata = { title: "Practice" };

export default function PracticePage() {
  return (
    <main className="page">
      <div className="site-shell">
        <div className="eyebrow">Transfer mode</div>
        <h1 className="editorial-title editorial-title--compact">Knowing the name is not recognizing the pattern.</h1>
        <p className="lede">
          Practice will gradually hide topic labels and ask you to record your first hypothesis before solving the
          problem. The goal is recognition, not merely an accepted submission.
        </p>
        <section className="section">
          <div className="empty-state">
            <h2>Binary Search ladder</h2>
            <p>
              Direct search → insertion position → boundary search → rotated arrays → search on a monotonic answer.
              The first transfer problem unlocks after the core lesson.
            </p>
            <div className="action-row">
              <Link className="button button--primary" href="/learn/binary-search">
                Learn Binary Search first →
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
