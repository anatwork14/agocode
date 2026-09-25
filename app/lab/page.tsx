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
