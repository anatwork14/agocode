import Link from "next/link";
import { TransferTrackMap } from "@/components/practice/TransferTrackMap";

export const metadata = { title: "Transfer Track" };

const directChallenges = [
  ["01", "First repeated badge", "Hash membership", "/practice/hash-membership", "Preserve encounter order while replacing repeated scans with direct membership."],
  ["02", "Fewest package handoffs", "BFS", "/practice/bfs-handoffs", "Recognize that all edges cost one and shortest means fewest hops."],
  ["03", "Cheapest courier route", "Dijkstra", "/practice/dijkstra-route", "Switch from edge count to accumulated non-negative path cost."],
  ["04", "Maximum studio schedule", "Greedy", "/practice/greedy-schedule", "Choose the local finish-time rule that preserves the most future room."],
  ["05", "Fixed study budget", "Dynamic programming", "/practice/dp-budget", "Define reusable constrained subproblems when a local ratio rule can fail."],
  ["06", "Classify a new plant", "K-nearest neighbors", "/practice/knn-classify", "Turn feature similarity into a local vote instead of searching for an exact rule."],
  ["07", "Total nested folder size", "Recursion", "/practice/recursion-folder-size", "Solve the same smaller folder problem until the base case is reached."],
] as const;

const binarySearchLadder = [
  ["B1", "Insertion boundary", "Direct", "/practice/binary-search"],
  ["B2", "First occurrence boundary", "Variant", "/practice/binary-search/boundary"],
  ["B3", "Rotated ordered array", "Pattern", "/practice/binary-search/rotated"],
  ["B4", "Monotonic answer space", "Mixed", "/practice/binary-search/answer-space"],
  ["R1", "Blank implementation", "Recall", "/practice/binary-search/rebuild"],
  ["R2", "Boundary bug repair", "Debug", "/practice/binary-search/bug-repair"],
] as const;

export default function PracticePage() {
  return (
    <main className="page">
      <div className="site-shell">
        <div className="eyebrow">Transfer mode</div>
        <h1 className="editorial-title editorial-title--compact">The chapter label is disappearing.</h1>
        <p className="lede">
          Book Track teaches the mental models. Transfer Track tests whether you can recognize those models when the
          surface story changes, justify a technique from constraints, rebuild the code, and eventually solve mixed
          problems without being told which chapter they came from.
        </p>

        <section className="section">
          <TransferTrackMap />
        </section>

        <section className="section">
          <div className="section-heading">
            <div className="section-heading__index">ADAPTIVE</div>
            <div>
              <h2>Do not pick the next problem at random.</h2>
              <p>
                AgoCode combines your weakest learning dimension, repeated problem-solving friction, retrieval debt, recognition
                misses, difficulty calibration, and structural diversity into explainable practice choices.
              </p>
            </div>
          </div>

          <div className="practice-domain-grid">
            <article className="practice-domain-card">
              <div className="practice-domain-card__meta"><span>daily</span><span>local-first</span><span>objective</span></div>
              <h3>Today&apos;s adaptive session</h3>
              <p>Resume one stable six-problem plan for the local day. Fresh retrieval and reasoning evidence clears role-specific rows automatically; manual workflow overrides remain visibly separate.</p>
              <Link className="button button--primary" href="/practice/session">Open today&apos;s session →</Link>
            </article>
            <article className="practice-domain-card">
              <div className="practice-domain-card__meta"><span>personalized</span><span>explainable</span></div>
              <h3>What should I solve next?</h3>
              <p>Get a ranked canonical shortlist with visible reasons instead of a black-box recommendation or a random exercise.</p>
              <Link className="button" href="/practice/next">Choose my next problem →</Link>
            </article>
            <article className="practice-domain-card">
              <div className="practice-domain-card__meta"><span>10 scenarios</span><span>original transfer</span></div>
              <h3>No-label pattern recognition</h3>
              <p>Read the constraints, choose an invariant, see why plausible alternatives fail, then reconnect to the relevant Book Track lesson.</p>
              <Link className="button" href="/practice/mixed">Start mixed recognition →</Link>
            </article>
            <article className="practice-domain-card">
              <div className="practice-domain-card__meta"><span>12 per set</span><span>canonical atlas</span></div>
              <h3>Atlas-wide structural recognition</h3>
              <p>Interleave source-aware canonical problems across data structures, graph families, optimization, correctness, text, and system design without exposing their chapter labels.</p>
              <Link className="button" href="/practice/atlas">Start Atlas recognition →</Link>
            </article>
            <article className="practice-domain-card">
              <div className="practice-domain-card__meta"><span>model first</span><span>assumption shifts</span></div>
              <h3>Structural variant mutations</h3>
              <p>Change one assumption at a time and decide whether the old family survives, a new family takes over, or more constraint information is required.</p>
              <Link className="button" href="/practice/variants">Practice model variants →</Link>
            </article>
            <article className="practice-domain-card">
              <div className="practice-domain-card__meta"><span>7 challenges</span><span>code gated</span></div>
              <h3>Cross-chapter coding transfer</h3>
              <p>Each editor stays locked until you identify the technique from the problem structure. Tests then expose whether the implementation preserves the invariant.</p>
              <Link className="button" href="/practice/hash-membership">Start direct transfer →</Link>
            </article>
          </div>
        </section>

        <section className="section">
          <div className="section-heading">
            <div className="section-heading__index">DIRECT TRANSFER</div>
            <div>
              <h2>Same concept. Different surface story.</h2>
              <p>These challenges deliberately avoid copying examples from the book or external problem sites.</p>
            </div>
          </div>

          <div className="practice-ladder">
            {directChallenges.map(([number, title, technique, href, description]) => (
              <Link className="practice-ladder__row" href={href} key={number}>
                <span className="practice-ladder__number">{number}</span>
                <div>
                  <strong>{title}</strong>
                  <span>{technique} · {description}</span>
                </div>
                <span className="practice-ladder__status practice-ladder__status--live">Live</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="section-heading">
            <div className="section-heading__index">BINARY SEARCH LAB</div>
            <div>
              <h2>Keep the deeper transfer ladder.</h2>
              <p>
                Binary Search already has a mature progression from exact lookup to boundaries, rotated structure,
                monotonic answer spaces, blank reconstruction, and debugging from failed tests.
              </p>
            </div>
          </div>

          <div className="practice-ladder">
            {binarySearchLadder.map(([number, title, level, href]) => (
              <Link className="practice-ladder__row" href={href} key={number}>
                <span className="practice-ladder__number">{number}</span>
                <div><strong>{title}</strong><span>{level}</span></div>
                <span className="practice-ladder__status practice-ladder__status--live">Live</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="section-heading">
            <div className="section-heading__index">RULE</div>
            <div>
              <h2>Do not measure progress only by solved count.</h2>
              <p>
                Strong transfer evidence is: recognize the technique before hints, explain the invariant, implement it
                from a sparse scaffold, pass edge cases, then retrieve the idea again after a delay.
              </p>
            </div>
          </div>
          <div className="action-row">
            <Link className="button" href="/learn">Reconnect to Book Track</Link>
            <Link className="button" href="/review">Open spaced review</Link>
            <Link className="button" href="/practice/atlas">Test the full Atlas</Link>
            <Link className="button" href="/practice/variants">Mutate the model</Link>
            <Link className="button" href="/practice/next">Choose the next problem</Link>
            <Link className="button button--primary" href="/practice/session">Continue today&apos;s session →</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
