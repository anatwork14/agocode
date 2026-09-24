import Link from "next/link";
import { CollisionLoadFactorLab } from "@/components/hash-tables/CollisionLoadFactorLab";
import { DuplicateFilterExercise } from "@/components/hash-tables/DuplicateFilterExercise";
import { HashFunctionLab } from "@/components/hash-tables/HashFunctionLab";
import { HashUseCasesLab } from "@/components/hash-tables/HashUseCasesLab";
import { MarginNote } from "@/components/ui/MarginNote";

export const metadata = { title: "Hash Tables" };

export default function HashTablesPage() {
  return (
    <main className="page page--tight">
      <div className="site-shell">
        <div className="reading-layout">
          <nav className="reading-nav" aria-label="Hash Tables sections">
            <a href="#lookup">01 · Direct lookup</a>
            <a href="#hash-function">02 · Hash function</a>
            <a href="#use-cases">03 · Use cases</a>
            <a href="#collisions">04 · Collisions</a>
            <a href="#performance">05 · Performance</a>
            <a href="#apply">06 · Apply</a>
          </nav>

          <article className="reading-column">
            <div className="eyebrow">Chapter 05 · Hash tables</div>
            <h1 className="editorial-title editorial-title--compact">Hash Tables</h1>
            <p className="lede">
              Arrays give you fast access when you already know an index. A hash table adds a function that turns a
              meaningful key into an array index, letting you store and retrieve values by names such as a product,
              username, route, or cache key.
            </p>

            <div className="prose-block">
              <section id="lookup">
                <h2>What if the key itself could tell you where to look?</h2>
                <p>
                  Imagine a market counter with a large list of item prices. A linear search checks entries one by one;
                  a sorted list enables binary search. A hash table takes a different route: transform the item name into
                  the location where its price is stored, then go directly to that location.
                </p>
                <div className="hash-mental-model" aria-label="Hash table mental model">
                  <span className="hash-mental-model__key">meaningful key</span>
                  <span aria-hidden="true">→</span>
                  <span className="hash-mental-model__function">hash function</span>
                  <span aria-hidden="true">→</span>
                  <span className="hash-mental-model__index mono">array index</span>
                  <span aria-hidden="true">→</span>
                  <span className="hash-mental-model__value">stored value</span>
                </div>
              </section>

              <section id="hash-function">
                <h2>A hash function must be repeatable and must return a valid index.</h2>
                <p>
                  The function used in the lab below is deliberately simple and inspectable. It is not a production
                  hash. What matters for the mental model is that a fixed key and table size always follow the same
                  deterministic computation, and the final index always stays inside the underlying array.
                </p>
                <HashFunctionLab />
                <p>
                  The hash table is therefore a combination of two ideas you already know: an array supplies indexed
                  storage, while the hash function decides which index belongs to a key.
                </p>
              </section>

              <section id="use-cases">
                <h2>The same key→value idea solves several common problems.</h2>
                <p>
                  Hash tables become useful far beyond price lookup. They model relationships from one thing to another,
                  provide fast membership checks for detecting repeats, and remember computed results so repeated work
                  can be skipped.
                </p>
                <HashUseCasesLab />
              </section>

              <section id="collisions">
                <h2>Different keys can still land in the same bucket.</h2>
                <p>
                  A finite array has fewer slots than the number of possible keys, so collisions are unavoidable in
                  general. The lab uses separate chaining: a bucket can hold several key/value entries. Correctness is
                  preserved, but a long bucket means extra local searching after the hash function chooses the slot.
                </p>
                <CollisionLoadFactorLab />
              </section>

              <section id="performance">
                <h2>Fast average behavior depends on avoiding crowded buckets.</h2>
                <p>
                  With keys distributed well, search, insert, and delete are treated as constant-time operations on
                  average. If many keys collapse into the same bucket, that bucket can degrade toward a linear search.
                  Two practical ideas protect the average case: distribute keys well and keep the table from becoming
                  too crowded.
                </p>
                <div className="hash-performance-grid">
                  <div><span>well distributed</span><strong className="mono">average O(1)</strong><p>Short buckets keep local work small.</p></div>
                  <div><span>pathological collisions</span><strong className="mono">worst O(n)</strong><p>One long chain can resemble a plain list.</p></div>
                </div>
                <p>
                  When capacity changes, existing keys must be hashed again because valid bucket indexes depend on the
                  size of the underlying array. Resizing is expensive at that moment, but spreading entries across more
                  slots can restore short chains and strong average behavior.
                </p>
              </section>

              <section id="apply">
                <h2>Use the built-in hash table instead of implementing one from scratch.</h2>
                <p>
                  For normal application code, the important skill is recognizing the data-access pattern. When you need
                  key→value mapping or repeated membership checks, reach for the language's built-in dictionary or set
                  rather than rebuilding the storage internals.
                </p>
                <DuplicateFilterExercise />
                <div className="action-row">
                  <Link className="button" href="/learn/chapter-4-recap">← Chapter 4 recap</Link>
                  <Link className="button button--primary" href="/learn/chapter-5-recap">Chapter 5 recap →</Link>
                </div>
              </section>
            </div>
          </article>

          <aside className="margin-column" aria-label="Hash table notes">
            <MarginNote label="Core model">Hash function + array = key-addressed storage.</MarginNote>
            <MarginNote label="Use cases">Mappings, membership / duplicate filtering, and caching all reuse the same fast key lookup.</MarginNote>
            <MarginNote label="Performance">Collisions are normal; long collision chains are the problem. Distribution and capacity determine whether the average case stays fast.</MarginNote>
          </aside>
        </div>
      </div>
    </main>
  );
}
