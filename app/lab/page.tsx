import Link from "next/link";

export const metadata = { title: "Lab" };

const labs = [
  {
    eyebrow: "Algorithm state",
    title: "Binary Search Trace Lab",
    description: "Step through low, mid, high, the surviving candidate interval, and synchronized code lines.",
    href: "/lab/binary-search",
    action: "Trace binary search",
  },
  {
    eyebrow: "Data-structure design",
    title: "ADT Representation Workbench",
    description: "Keep the abstract contract fixed, change the workload, and compare how arrays, links, heaps, hashes, and trees shift the operation budget.",
    href: "/lab/adt-workbench",
    action: "Compare representations",
  },
  {
    eyebrow: "Correctness reasoning",
    title: "Invariant Workbench",
    description: "Choose a correctness claim, defend initialization, preservation, and termination, then break weaker claims with counterexamples.",
    href: "/lab/invariants",
    action: "Stress-test invariants",
  },
  {
    eyebrow: "Algorithm analysis",
    title: "Amortization Workbench",
    description: "Compare dynamic-array growth rules, inspect resize spikes, and see why occasional expensive appends can still be cheap across a sequence.",
    href: "/lab/amortization",
    action: "Inspect amortized cost",
  },
  {
    eyebrow: "Graph modeling",
    title: "Graph Modeling Workbench",
    description: "Translate application stories into vertices, edges, direction, weights, and objectives before choosing BFS, Dijkstra, topological sort, or MST.",
    href: "/lab/graph-modeling",
    action: "Build the graph first",
  },
] as const;

export default function LabIndexPage() {
  return (
    <main className="page">
      <div className="site-shell">
        <div className="eyebrow">Lab mode</div>
        <h1 className="editorial-title editorial-title--compact">Inspect the state. Change the assumptions.</h1>
        <p className="lede">
          Algorithm labs expose state transitions; design labs expose trade-offs. Both are interactive models whose job is to
          make a reasoning claim inspectable rather than merely animate a finished answer.
        </p>

        <section className="section">
          <div className="home-knowledge__grid">
            {labs.map((lab, index) => (
              <Link className="home-knowledge__item" href={lab.href} key={lab.href}>
                <span className="mono">{String(index + 1).padStart(2, "0")} · {lab.eyebrow}</span>
                <h3>{lab.title}</h3>
                <p>{lab.description}</p>
                <strong>{lab.action} →</strong>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
