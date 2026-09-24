import Link from "next/link";

export const metadata = { title: "Practice" };

const ladder = [
  ["01", "Insertion boundary", "Direct", "/practice/binary-search"],
  ["02", "First occurrence boundary", "Variant", "/practice/binary-search/boundary"],
  ["03", "Rotated ordered array", "Pattern", "/practice/binary-search/rotated"],
  ["04", "Monotonic answer space", "Mixed", "/practice/binary-search/answer-space"],
] as const;

const recallDrills = [
  ["R1", "Blank implementation", "Recall", "/practice/binary-search/rebuild"],
  ["R2", "Boundary bug repair", "Debug", "/practice/binary-search/bug-repair"],
] as const;

export default function PracticePage() {
  return (
    <main className="page">
      <div className="site-shell">
        <div className="eyebrow">Transfer mode</div>
        <h1 className="editorial-title editorial-title--compact">Knowing the name is not recognizing the pattern.</h1>
        <p className="lede">
          Practice gradually removes scaffolding. The four-rung Binary Search ladder moves from a direct positional
          variation to an answer space where the candidate values do not appear as a sorted input array at all.
        </p>

        <section className="section">
          <div className="section-heading">
            <div className="section-heading__index">BINARY SEARCH</div>
            <div>
              <h2>Transfer ladder</h2>
              <p>Each rung preserves the deeper rule: one decision must justify discarding an impossible region.</p>
            </div>
          </div>

          <div className="practice-ladder">
            {ladder.map(([number, title, level, href]) => (
              <Link className="practice-ladder__row" href={href} key={number}>
                <span className="practice-ladder__number">{number}</span>
                <div>
                  <strong>{title}</strong>
                  <span>{level}</span>
                </div>
                <span className="practice-ladder__status practice-ladder__status--live">Live</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="section-heading">
            <div className="section-heading__index">RECALL</div>
            <div>
              <h2>Remove support, then debug from evidence.</h2>
              <p>
                These drills test whether the invariant survives after the clean lesson is gone: first rebuild from a
                blank implementation surface, then repair a plausible off-by-one bug from failing edge cases.
              </p>
            </div>
          </div>

          <div className="practice-ladder">
            {recallDrills.map(([number, title, level, href]) => (
              <Link className="practice-ladder__row" href={href} key={number}>
                <span className="practice-ladder__number">{number}</span>
                <div>
                  <strong>{title}</strong>
                  <span>{level}</span>
                </div>
                <span className="practice-ladder__status practice-ladder__status--live">Live</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
