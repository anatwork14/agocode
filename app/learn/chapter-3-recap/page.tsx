import Link from "next/link";
import { ChapterThreeRecapCheck } from "@/components/recursion/ChapterThreeRecapCheck";

export const metadata = { title: "Chapter 3 Recap" };

const sequence = [
  ["01", "Recursion", "Use the same procedure on a smaller version of the problem.", "/learn/recursion#idea"],
  ["02", "Base + recursive cases", "Stop on a directly solvable input and make every other call move toward it.", "/learn/recursion#cases"],
  ["03", "The call stack", "Preserve suspended callers and resume them in last-in, first-out order.", "/learn/recursion#stack"],
  ["04", "Recursive stack", "Watch repeated calls accumulate state, reach a base case, and unwind with returned values.", "/learn/recursion#recursive-stack"],
] as const;

export default function ChapterThreeRecapPage() {
  return (
    <main className="page">
      <div className="site-shell">
        <div className="eyebrow">Chapter 03 · Recap</div>
        <h1 className="editorial-title editorial-title--compact">A recursive call is suspended work with a way back.</h1>
        <p className="lede">
          Reconstruct the chapter without rereading it first. Recursion only becomes dependable when you can identify
          the stopping case, prove that each recursive call makes progress, and picture what remains on the call stack.
        </p>

        <section className="section chapter-recap-map" aria-label="Chapter 3 learning sequence">
          {sequence.map(([number, title, description, href]) => (
            <Link href={href} className="chapter-recap-map__row" key={number}>
              <span className="chapter-recap-map__number mono">{number}</span>
              <div><strong>{title}</strong><p>{description}</p></div>
              <span aria-hidden="true">→</span>
            </Link>
          ))}
        </section>

        <section className="section">
          <ChapterThreeRecapCheck />
          <div className="action-row">
            <Link className="button" href="/learn/recursion">← Recursion</Link>
            <Link className="button button--primary" href="/roadmap">Preview Divide & Conquer →</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
