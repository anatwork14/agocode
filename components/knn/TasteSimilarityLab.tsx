"use client";

import { euclideanDistance } from "@/lib/algorithms/knn";

const categories = ["adventure", "comedy", "drama", "mystery"] as const;

const target = { id: "you", name: "You", features: [4, 2, 5, 1] };
const profiles = [
  { id: "mira", name: "Mira", features: [5, 2, 4, 1] },
  { id: "noah", name: "Noah", features: [2, 5, 2, 4] },
  { id: "lin", name: "Lin", features: [4, 1, 5, 2] },
  { id: "sam", name: "Sam", features: [1, 4, 3, 5] },
] as const;

export function TasteSimilarityLab() {
  const ranked = profiles
    .map((profile) => ({ ...profile, distance: euclideanDistance(target.features, profile.features) }))
    .sort((a, b) => a.distance - b.distance);

  return (
    <div className="knn-similarity-lab">
      <div className="knn-lab__header">
        <div>
          <div className="eyebrow">Feature extraction</div>
          <h3>Turn preferences into coordinates, then let distance quantify similarity.</h3>
        </div>
        <span className="mono">4 dimensions</span>
      </div>

      <div className="feature-vector-table" role="table" aria-label="Viewer preference feature vectors">
        <div className="feature-vector-row feature-vector-row--head" role="row">
          <span>profile</span>
          {categories.map((category) => <span key={category}>{category}</span>)}
          <span>distance</span>
        </div>
        {[{ ...target, distance: 0 }, ...ranked].map((profile, index) => (
          <div className={`feature-vector-row ${index === 0 ? "feature-vector-row--target" : index === 1 ? "feature-vector-row--nearest" : ""}`} role="row" key={profile.id}>
            <strong>{profile.name}</strong>
            {profile.features.map((value, featureIndex) => (
              <span className="feature-rating mono" key={`${profile.id}-${categories[featureIndex]}`}>
                <i style={{ width: `${value * 20}%` }} aria-hidden="true" />{value}
              </span>
            ))}
            <span className="mono">{index === 0 ? "—" : profile.distance.toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="distance-breakdown">
        <span className="eyebrow">Nearest profile · {ranked[0].name}</span>
        <div className="distance-equation mono">
          √({target.features.map((value, index) => `(${value}−${ranked[0].features[index]})²`).join(" + ")}) = {ranked[0].distance.toFixed(2)}
        </div>
        <p>
          Each category becomes one coordinate. The same Euclidean-distance idea works when the vector has more than two dimensions; the geometry is harder to draw, but the calculation is unchanged.
        </p>
      </div>
    </div>
  );
}
