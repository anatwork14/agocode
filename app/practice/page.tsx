import Link from "next/link";

export const metadata = { title: "Practice" };

const ladder = [
  ["01", "Insertion boundary", "Direct", "Live", "/practice/binary-search"],
  ["02", "First / last occurrence", "Variant", "Next", "#"],
  ["03", "Rotated sorted array", "Pattern", "Planned", "#"],
  ["04", "Monotonic answer search", "Mixed", "Planned", "#"],
] as const;

export default function PracticePage() {
  return (
    <main className="page">
      <div className="site-shell">
        <div className="eyebrow">Transfer mode</div>
        <h1 className="editorial-title editorial-title--compact">Knowing the name is not recognizing the pattern.</h1>
        <p className="lede">
          Practice gradually removes scaffolding. Start with a nearby variation, record your first hypothesis, then
          move toward problems where the useful technique is no longer announced.
        </p>

        <section className="section">
          <div className="section-heading">
            <div className="section-heading__index">BINARY SEARCH</div>
            <div>
              <h2>Transfer ladder</h2>
              <p>Each rung changes what must be recognized while preserving the underlying search invariant.</p>
            </div>
          </div>

          <div className="practice-ladder">
            {ladder.map(([number, title, level, status, href]) => {
              const live = status === "Live";
              const content = (
                <>
                  <span className="practice-ladder__number">{number}</span>
                  <div>
                    <strong>{title}</strong>
                    <span>{level}</span>
                  </div>
                  <span className={live ? "practice-ladder__status practice-ladder__status--live" : "practice-ladder__status"}>
                    {status}
                  </span>
                </>
              );

              return live ? (
                <Link className="practice-ladder__row" href={href} key={number}>
                  {content}
                </Link>
              ) : (
                <div className="practice-ladder__row practice-ladder__row--locked" key={number} aria-disabled="true">
                  {content}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
