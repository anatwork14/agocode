import Link from "next/link";
import { ChapterTenRecapCheck } from "@/components/knn/ChapterTenRecapCheck";

export const metadata = { title: "Chapter 10 Recap" };

const sequence = [
  ["01", "Classification", "Represent examples as feature vectors, find nearby labels, and let the neighborhood vote.", "/learn/k-nearest-neighbors#classify"],
  ["02", "Feature extraction", "Turn objects or people into comparable numeric coordinates before similarity can be measured.", "/learn/k-nearest-neighbors#features"],
  ["03", "Distance", "Use Euclidean distance to rank nearby examples in the chosen feature space.", "/learn/k-nearest-neighbors#similarity"],
  ["04", "Regression", "Reuse the same neighbors but combine numeric responses rather than class labels.", "/learn/k-nearest-neighbors#regression"],
  ["05", "Feature quality and limits", "Know that k, feature choice, and the similarity measure determine what a neighborhood actually means.", "/learn/k-nearest-neighbors#quality"],
] as const;

export default function ChapterTenRecapPage() {
  return (
    <main className="page">
      <div className="site-shell">
        <div className="eyebrow">Chapter 10 · Recap</div>
        <h1 className="editorial-title editorial-title--compact">Features. Distance. Neighbors. Prediction.</h1>
        <p className="lede">
          KNN is short enough to memorize badly. Reconstruct it instead: define a useful feature space, measure closeness,
          select k nearby examples, then decide whether the task needs a category or a numeric response.
        </p>

        <section className="section chapter-recap-map" aria-label="Chapter 10 learning sequence">
          {sequence.map(([number, title, description, href]) => (
            <Link href={href} className="chapter-recap-map__row" key={number}>
              <span className="chapter-recap-map__number mono">{number}</span>
              <div><strong>{title}</strong><p>{description}</p></div>
              <span aria-hidden="true">→</span>
            </Link>
          ))}
        </section>

        <section className="section">
          <ChapterTenRecapCheck />
          <div className="action-row">
            <Link className="button" href="/learn/k-nearest-neighbors">← K-nearest neighbors</Link>
            <Link className="button button--primary" href="/roadmap">Continue to where to go next →</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
