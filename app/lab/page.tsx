import Link from "next/link";

export const metadata = { title: "Lab" };

export default function LabIndexPage() {
  return (
    <main className="page">
      <div className="site-shell">
        <div className="eyebrow">Lab mode</div>
        <h1 className="editorial-title editorial-title--compact">Inspect the state, one transition at a time.</h1>
        <p className="lede">
          Labs are deliberately denser than reading pages. The visualization, state inspector, and code must always
          agree about what the algorithm is doing.
        </p>
        <section className="section">
          <div className="empty-state">
            <h2>Binary Search Trace Lab</h2>
            <p>The first deterministic trace is live: step through low, mid, high, candidate ranges, and code lines.</p>
            <div className="action-row">
              <Link className="button button--primary" href="/lab/binary-search">
                Open lab →
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
