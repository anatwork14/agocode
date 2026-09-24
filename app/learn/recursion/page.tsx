import Link from "next/link";
import { CallStackPauseLab } from "@/components/recursion/CallStackPauseLab";
import { CountdownBaseCaseLab } from "@/components/recursion/CountdownBaseCaseLab";
import { FactorialRebuild } from "@/components/recursion/FactorialRebuild";
import { FactorialStackTrace } from "@/components/recursion/FactorialStackTrace";
import { RecursiveSearchCompare } from "@/components/recursion/RecursiveSearchCompare";
import { MarginNote } from "@/components/ui/MarginNote";

export const metadata = { title: "Recursion" };

export default function RecursionPage() {
  return (
    <main className="page page--tight">
      <div className="site-shell">
        <div className="reading-layout">
          <nav className="reading-nav" aria-label="Recursion sections">
            <a href="#idea">01 · Recursion</a>
            <a href="#cases">02 · Base case</a>
            <a href="#stack">03 · Call stack</a>
            <a href="#recursive-stack">04 · Recursive stack</a>
            <a href="#rebuild">05 · Rebuild</a>
          </nav>

          <article className="reading-column">
            <div className="eyebrow">Chapter 03 · Recursion</div>
            <h1 className="editorial-title editorial-title--compact">Recursion</h1>
            <p className="lede">
              A recursive function solves a problem by calling itself on a smaller version of that problem. The idea
              becomes much easier once you can see what stays paused on the call stack and what makes the recursion stop.
            </p>

            <div className="prose-block">
              <section id="idea">
                <h2>Nested problems can be managed explicitly—or by recursive calls.</h2>
                <p>
                  Imagine searching through folders that may contain more folders. A loop can keep its own stack of
                  locations still waiting to be visited. A recursive version can instead call the same search procedure
                  on each nested folder, letting the runtime remember suspended work.
                </p>
                <RecursiveSearchCompare />
                <p>
                  Recursion is not automatically faster. Its value is often clarity: the program structure can mirror
                  the nested structure of the problem. Later divide-and-conquer algorithms build directly on this idea.
                </p>
              </section>

              <section id="cases">
                <h2>Every recursive function needs progress and a stopping case.</h2>
                <p>
                  A recursive case makes another call. A base case returns without recursing again. The recursive case
                  must also move toward the base case; otherwise the program keeps creating new calls until resources run out.
                </p>
                <CountdownBaseCaseLab />
              </section>

              <section id="stack">
                <h2>A function call pauses its caller instead of erasing it.</h2>
                <p>
                  When one function calls another, the caller may still have unfinished work and local variables. A call
                  frame preserves that state. The newest call sits on top; when it returns, its frame is removed and the
                  caller resumes from where it paused.
                </p>
                <CallStackPauseLab />
              </section>

              <section id="recursive-stack">
                <h2>Recursion uses the same call stack repeatedly.</h2>
                <p>
                  Factorial makes the mechanism visible. Each call stores its own value of <span className="mono">n</span>
                  while it waits for a smaller call to finish. The stack grows until the base case, then unwinds in the
                  opposite order while partial results are combined.
                </p>
                <FactorialStackTrace />
              </section>

              <section id="rebuild">
                <h2>Write the recursive relationship yourself.</h2>
                <p>
                  Keep two questions explicit: what input can be answered immediately, and how does every other input
                  become a smaller instance of the same problem?
                </p>
                <FactorialRebuild />
                <div className="action-row">
                  <Link className="button" href="/learn/chapter-2-recap">← Chapter 2 recap</Link>
                  <Link className="button button--primary" href="/roadmap">Chapter 3 progress →</Link>
                </div>
              </section>
            </div>
          </article>

          <aside className="margin-column" aria-label="Recursion notes">
            <MarginNote label="Practice">Step through at least one recursive function slowly. The stack view matters more than memorizing syntax.</MarginNote>
            <MarginNote label="Two cases">Base case: no more self-call. Recursive case: reduce the problem and call the same function again.</MarginNote>
            <MarginNote label="Trade-off">The stack makes recursive state convenient, but deep recursion consumes memory for every suspended call.</MarginNote>
          </aside>
        </div>
      </div>
    </main>
  );
}
