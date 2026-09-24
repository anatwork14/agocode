import Link from "next/link";
import { BloomFilterLab } from "@/components/next-topics/BloomFilterLab";
import { BstSearchLab } from "@/components/next-topics/BstSearchLab";
import { InvertedIndexLab } from "@/components/next-topics/InvertedIndexLab";
import { MapReduceLab } from "@/components/next-topics/MapReduceLab";
import { NextPathChooser } from "@/components/next-topics/NextPathChooser";
import { MarginNote } from "@/components/ui/MarginNote";

export const metadata = { title: "Where to go next" };

export default function WhereToGoNextPage() {
  return (
    <main className="page page--tight">
      <div className="site-shell">
        <div className="reading-layout">
          <nav className="reading-nav" aria-label="Where to go next sections">
            <a href="#trees">01 · Trees</a>
            <a href="#indexes">02 · Inverted indexes</a>
            <a href="#signals">03 · Fourier transform</a>
            <a href="#parallel">04 · Parallelism</a>
            <a href="#mapreduce">05 · MapReduce</a>
            <a href="#probability">06 · Probabilistic structures</a>
            <a href="#hashes">07 · Hashing & crypto</a>
            <a href="#optimization">08 · Linear programming</a>
            <a href="#choose">09 · Choose a branch</a>
          </nav>

          <article className="reading-column">
            <div className="eyebrow">Chapter 11 · Where to go next</div>
            <h1 className="editorial-title editorial-title--compact">The book ends by widening the map.</h1>
            <p className="lede">
              The earlier chapters build a foundation. This final chapter is different: it gives short previews of ideas
              that solve new classes of problems and points toward deeper study. AgoCode keeps that survey structure rather
              than pretending each topic can be mastered in one page.
            </p>

            <div className="prose-block">
              <section id="trees">
                <h2>Ordered data can live in a tree instead of a sorted array.</h2>
                <p>
                  A binary search tree keeps smaller values on the left and larger values on the right. A search compares
                  the target with the current node and follows only one branch. Balanced trees can support efficient search,
                  insertion, and deletion, while badly imbalanced trees can collapse toward linear behavior.
                </p>
                <BstSearchLab />
                <p>
                  This is also the bridge from elementary data structures toward database-oriented structures such as
                  B-trees and self-balancing search trees.
                </p>
              </section>

              <section id="indexes">
                <h2>Search engines reverse the lookup direction.</h2>
                <p>
                  An inverted index maps terms to the places where those terms appear. That turns a query from “scan every
                  page for this word” into “look up this word and retrieve its posting list.” The production versions are
                  far richer, but the core representation already connects hash-table thinking to information retrieval.
                </p>
                <InvertedIndexLab />
              </section>

              <section id="signals">
                <h2>The Fourier transform asks what ingredients make up a signal.</h2>
                <p>
                  The chapter introduces the transform as a way to move from a complicated signal to its frequency
                  components. That perspective appears in audio, image processing, compression, scientific analysis, and
                  many other fields. It is a pointer rather than a full derivation: the important takeaway here is that a
                  change of representation can make a difficult problem easier to reason about.
                </p>
                <div className="next-concept-diagram" aria-label="Signal to frequency-components mental model">
                  <div><span>input</span><strong>complex signal</strong><small>time / space domain</small></div>
                  <span aria-hidden="true">→</span>
                  <div><span>transform</span><strong>frequency components</strong><small>how much of each ingredient?</small></div>
                  <span aria-hidden="true">→</span>
                  <div><span>use</span><strong>analyze or modify</strong><small>filter · compress · recognize</small></div>
                </div>
              </section>

              <section id="parallel">
                <h2>More processors do not automatically mean proportional speed.</h2>
                <p>
                  Parallel algorithms split work across cores, but the split itself has costs. Tasks must be divided,
                  partial results may need to be merged, and uneven workloads can leave some workers idle. The chapter uses
                  those two ideas—coordination overhead and load balancing—to explain why doubling hardware rarely halves
                  wall-clock time exactly.
                </p>
                <div className="parallel-tradeoff-grid">
                  <div><span className="mono">overhead</span><strong>split · communicate · merge</strong><p>Parallel management consumes time that the sequential version may not need.</p></div>
                  <div><span className="mono">load balance</span><strong>keep workers equally useful</strong><p>A fast worker waiting for a slow worker still extends total runtime.</p></div>
                </div>
              </section>

              <section id="mapreduce">
                <h2>MapReduce makes one distributed pattern explicit.</h2>
                <p>
                  The map step applies the same transformation independently to many inputs. The reduce step combines
                  mapped values into fewer outputs. At small scale this looks almost trivial; at large scale the separation
                  is useful because independent mapping work can be spread across machines.
                </p>
                <MapReduceLab />
              </section>

              <section id="probability">
                <h2>At enormous scale, approximate answers can be worth more than exact storage.</h2>
                <p>
                  A Bloom filter answers membership queries with a compact bit array and several hashes. It may produce a
                  false positive, but the standard structure does not produce false negatives. HyperLogLog makes a related
                  trade: it estimates the number of unique values using a small amount of memory instead of storing every
                  distinct value exactly.
                </p>
                <BloomFilterLab />
              </section>

              <section id="hashes">
                <h2>Different hash families are designed for different goals.</h2>
                <p>
                  Hash tables want a useful distribution into buckets. Cryptographic hash functions produce compact
                  fingerprints where tiny input changes should strongly change the output. Locality-sensitive hashing wants
                  almost the opposite property: similar inputs should remain comparable after hashing. The chapter then
                  points onward to public-key cryptography and key exchange.
                </p>
                <div className="hash-purpose-grid">
                  <div><strong>Hash table</strong><p>Map a key toward a storage location.</p></div>
                  <div><strong>Cryptographic hash</strong><p>Create a deterministic fingerprint designed to resist reverse engineering and collisions.</p></div>
                  <div><strong>Locality-sensitive hash</strong><p>Preserve enough similarity that near-duplicate items can be compared efficiently.</p></div>
                </div>
                <p className="next-topic-note">
                  Implementation note: these cryptography topics are study pointers, not recipes for production security.
                  Real systems should use current, reviewed cryptographic libraries and guidance rather than hand-written schemes.
                </p>
              </section>

              <section id="optimization">
                <h2>Linear programming generalizes “maximize something under constraints.”</h2>
                <p>
                  Imagine a workshop producing two goods from limited material and labor. Each product earns a different
                  profit and consumes a different amount of each resource. Linear programming expresses the objective and
                  constraints together, then searches for the best feasible combination. The chapter points to the Simplex
                  algorithm rather than teaching it in detail.
                </p>
                <div className="lp-model">
                  <div><span>maximize</span><strong className="mono">profit = 2x + 3y</strong></div>
                  <div><span>subject to</span><strong className="mono">material · labor · x ≥ 0 · y ≥ 0</strong></div>
                  <div><span>idea</span><strong>find the best point inside the feasible region</strong></div>
                </div>
              </section>

              <section id="choose">
                <h2>The final lesson is to choose a direction and go deeper.</h2>
                <p>
                  The chapter closes by emphasizing how much remains beyond the foundation. Instead of ending AgoCode with
                  a generic congratulations screen, choose the branch that should shape the next extension track.
                </p>
                <NextPathChooser />
                <div className="action-row">
                  <Link className="button" href="/learn/chapter-10-recap">← Chapter 10 recap</Link>
                  <Link className="button button--primary" href="/learn/chapter-11-recap">Finish Book Track recall →</Link>
                </div>
              </section>
            </div>
          </article>

          <aside className="margin-column" aria-label="Where to go next notes">
            <MarginNote label="Survey chapter">Treat each section as a doorway, not a complete course.</MarginNote>
            <MarginNote label="Representation">Trees, indexes, transforms, and hashes all change how information is represented so a different operation becomes easier.</MarginNote>
            <MarginNote label="Scale">Parallelism, MapReduce, Bloom filters, and HyperLogLog matter when data or work becomes too large for naive exact approaches.</MarginNote>
            <MarginNote label="Next phase">After the book track, AgoCode should emphasize mixed transfer and deeper branches rather than adding chapters just for coverage.</MarginNote>
          </aside>
        </div>
      </div>
    </main>
  );
}
