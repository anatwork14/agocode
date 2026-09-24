import Link from "next/link";
import { MemoryDrawerLab } from "@/components/selection-sort/MemoryDrawerLab";
import { LessonCompleteLink } from "@/components/progress/LessonCompleteLink";
import { MarginNote } from "@/components/ui/MarginNote";

export const metadata = { title: "How Memory Works" };

export default function MemoryPage() {
  return (
    <main className="page page--tight">
      <div className="site-shell">
        <div className="reading-layout">
          <nav className="reading-nav" aria-label="Memory lesson sections">
            <a href="#slots">01 · Memory slots</a>
            <a href="#addresses">02 · Addresses</a>
            <a href="#multiple">03 · Multiple values</a>
          </nav>

          <article className="reading-column">
            <div className="eyebrow">Chapter 02 · Selection sort</div>
            <h1 className="editorial-title editorial-title--compact">How memory works</h1>
            <p className="lede">
              Before comparing arrays and linked lists, build a physical model of storage: values live in memory
              locations, and each location has an address that lets the program find it again.
            </p>

            <div className="prose-block">
              <section id="slots">
                <h2>Start with one value in one slot.</h2>
                <p>
                  Imagine memory as many small storage locations. Asking the computer to keep a value means obtaining
                  enough space for that value and remembering where it was placed. The address is the coordinate that
                  makes a later read possible.
                </p>
                <MemoryDrawerLab />
              </section>

              <section id="addresses">
                <h2>The address matters more than the drawing.</h2>
                <p>
                  Real memory is not literally a cabinet. The model is useful because it makes one rule concrete:
                  stored data occupies locations, and programs need a way to refer to those locations. Data structures
                  differ partly in how they arrange and connect those locations.
                </p>
                <div className="concept-equation" aria-label="Memory value and address relationship">
                  <div><span>location</span><strong className="mono">0xA8</strong></div>
                  <div className="concept-equation__divider">→</div>
                  <div><span>stored value</span><strong>notebook</strong></div>
                </div>
              </section>

              <section id="multiple">
                <h2>Multiple values create a design choice.</h2>
                <p>
                  When one logical collection contains many values, those values can be placed next to one another or
                  spread across memory with explicit links between them. Those two ideas lead into arrays and linked
                  lists—and into very different read, insert, and delete trade-offs.
                </p>
                <div className="action-row">
                  <Link className="button" href="/learn/chapter-1-recap">← Chapter 1 recap</Link>
                  <LessonCompleteLink
                    storageKey="agocode.progress.chapter-2.memory"
                    lessonId="chapter-2-memory"
                    href="/learn/arrays-linked-lists"
                  >
                    Continue: Arrays & linked lists →
                  </LessonCompleteLink>
                </div>
              </section>
            </div>
          </article>

          <aside className="margin-column" aria-label="Memory lesson notes">
            <MarginNote label="Prerequisite">Chapter 2 assumes the Big O vocabulary from Chapter 1.</MarginNote>
            <MarginNote label="Mental model">Use the drawer picture to reason about placement and addresses, not as a literal description of hardware.</MarginNote>
          </aside>
        </div>
      </div>
    </main>
  );
}
