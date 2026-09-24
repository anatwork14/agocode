import Link from "next/link";
import { ChapterEightRecapCheck } from "@/components/greedy/ChapterEightRecapCheck";

export const metadata = { title: "Chapter 8 Recap" };

const sequence = [
  ["01", "Greedy choice", "Choose the locally best move according to a simple rule.", "/learn/greedy#local"],
  ["02", "When greedy is optimal", "For interval scheduling, earliest compatible finish leaves the most room for later choices.", "/learn/greedy#schedule"],
  ["03", "Counterexamples", "A locally attractive knapsack choice can lose to a better combination.", "/learn/greedy#knapsack"],
  ["04", "Approximation", "For set cover, repeatedly maximize newly covered requirements instead of enumerating every subset.", "/learn/greedy#set-cover"],
  ["05", "Hard-search warning signs", "All combinations, all orderings, or every possible version can signal an explosive exact search space.", "/learn/greedy#hard"],
] as const;

export default function ChapterEightRecapPage() {
  return (
    <main className="page">
      <div className="site-shell">
        <div className="eyebrow">Chapter 08 · Recap</div>
        <h1 className="editorial-title editorial-title--compact">Choose locally, then ask what guarantee you actually earned.</h1>
        <p className="lede">
          Reconstruct the difference between an optimal greedy rule and a fast approximation. The important skill is not
          merely recognizing “greedy,” but knowing when a local choice has proof behind it and when it is only a practical shortcut.
        </p>

        <section className="section chapter-recap-map" aria-label="Chapter 8 learning sequence">
          {sequence.map(([number, title, description, href]) => (
            <Link href={href} className="chapter-recap-map__row" key={number}>
              <span className="chapter-recap-map__number mono">{number}</span>
              <div><strong>{title}</strong><p>{description}</p></div>
              <span aria-hidden="true">→</span>
            </Link>
          ))}
        </section>

        <section className="section">
          <ChapterEightRecapCheck />
          <div className="action-row">
            <Link className="button" href="/learn/greedy">← Greedy Algorithms</Link>
            <Link className="button button--primary" href="/roadmap">Preview Dynamic Programming →</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
