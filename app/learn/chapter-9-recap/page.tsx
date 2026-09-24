import Link from "next/link";
import { ChapterNineRecapCheck } from "@/components/dynamic-programming/ChapterNineRecapCheck";

export const metadata = { title: "Chapter 9 Recap" };

const sequence = [
  ["01", "Optimization under a constraint", "Recognize when brute-force combinations explode and a reusable subproblem structure is available.", "/learn/dynamic-programming#why"],
  ["02", "State and grid axes", "Define what a row, column, and cell mean before writing any recurrence.", "/learn/dynamic-programming#grid"],
  ["03", "0/1 knapsack recurrence", "Compare carrying the previous best with taking the item plus the best leftover-capacity subproblem.", "/learn/dynamic-programming#cell"],
  ["04", "Model boundaries", "Understand granularity, fractional items, and dependencies as state-modeling questions.", "/learn/dynamic-programming#boundaries"],
  ["05", "String DP", "Contrast contiguous substring resets with subsequence max(up, left) behavior.", "/learn/dynamic-programming#strings"],
] as const;

export default function ChapterNineRecapPage() {
  return (
    <main className="page">
      <div className="site-shell">
        <div className="eyebrow">Chapter 09 · Recap</div>
        <h1 className="editorial-title editorial-title--compact">State meaning first. Recurrence second.</h1>
        <p className="lede">
          Dynamic programming becomes easier to reconstruct when every cell has a precise meaning. Retrieve the state,
          the smaller subproblems it depends on, and only then the formula that combines them.
        </p>

        <section className="section chapter-recap-map" aria-label="Chapter 9 learning sequence">
          {sequence.map(([number, title, description, href]) => (
            <Link href={href} className="chapter-recap-map__row" key={number}>
              <span className="chapter-recap-map__number mono">{number}</span>
              <div><strong>{title}</strong><p>{description}</p></div>
              <span aria-hidden="true">→</span>
            </Link>
          ))}
        </section>

        <section className="section">
          <ChapterNineRecapCheck />
          <div className="action-row">
            <Link className="button" href="/learn/dynamic-programming">← Dynamic Programming</Link>
            <Link className="button button--primary" href="/roadmap">Preview K-nearest neighbors →</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
