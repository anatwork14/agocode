import Link from "next/link";
import { CitrusClassificationLab } from "@/components/knn/CitrusClassificationLab";
import { FeatureQualityCheck } from "@/components/knn/FeatureQualityCheck";
import { KnnRebuild } from "@/components/knn/KnnRebuild";
import { RegressionLab } from "@/components/knn/RegressionLab";
import { TasteSimilarityLab } from "@/components/knn/TasteSimilarityLab";
import { MarginNote } from "@/components/ui/MarginNote";

export const metadata = { title: "K-nearest neighbors" };

export default function KNearestNeighborsPage() {
  return (
    <main className="page page--tight">
      <div className="site-shell">
        <div className="reading-layout">
          <nav className="reading-nav" aria-label="K-nearest neighbors sections">
            <a href="#classify">01 · Classification</a>
            <a href="#similarity">02 · Similarity</a>
            <a href="#features">03 · Features</a>
            <a href="#regression">04 · Regression</a>
            <a href="#quality">05 · Good features</a>
            <a href="#limits">06 · Limits</a>
            <a href="#rebuild">07 · Rebuild</a>
          </nav>

          <article className="reading-column">
            <div className="eyebrow">Chapter 10 · K-nearest neighbors</div>
            <h1 className="editorial-title editorial-title--compact">K-nearest neighbors</h1>
            <p className="lede">
              KNN starts from a remarkably visual idea: examples that are close in a useful feature space often behave
              alike. Represent an unknown example as numbers, find nearby known examples, and let those neighbors guide
              the prediction.
            </p>

            <div className="prose-block">
              <section id="classify">
                <h2>Begin with classification you can see.</h2>
                <p>
                  Imagine citrus fruit described by two measurable features such as size and redness. Known examples form
                  labeled points on a plane. For an unknown fruit, look at the k closest labeled points. If most nearby
                  examples belong to one class, that neighborhood gives the new point its predicted category.
                </p>
                <CitrusClassificationLab />
                <p>
                  The important sequence is not “draw a graph.” It is <strong>features → distance → k neighbors → vote</strong>.
                  The graph simply makes that sequence visible in two dimensions.
                </p>
              </section>

              <section id="similarity">
                <h2>The same idea becomes a recommendation system when points represent people.</h2>
                <p>
                  A person cannot be placed on a useful similarity graph until you decide what coordinates describe them.
                  One simple approach is to turn preferences across several content categories into a numeric vector. Then
                  distance between two vectors acts as a measure of how similar those profiles are in the chosen space.
                </p>
                <TasteSimilarityLab />
              </section>

              <section id="features">
                <h2>Feature extraction is what turns the real object into coordinates.</h2>
                <p>
                  A fruit might become two numbers. A viewer might become four, five, or hundreds of preference values.
                  Euclidean distance extends to those higher-dimensional vectors with the same rule: square coordinate
                  differences, add them, and take the square root. You may no longer be able to draw the space, but the
                  comparison still works numerically.
                </p>
                <div className="knn-pipeline" aria-label="KNN conceptual pipeline">
                  <div><span className="mono">01</span><strong>Extract</strong><p>Convert the object into comparable numeric features.</p></div>
                  <div><span className="mono">02</span><strong>Measure</strong><p>Compute distance from the unknown example to known examples.</p></div>
                  <div><span className="mono">03</span><strong>Select</strong><p>Keep the k closest examples.</p></div>
                  <div><span className="mono">04</span><strong>Predict</strong><p>Vote for a class or combine numeric responses.</p></div>
                </div>
              </section>

              <section id="regression">
                <h2>Neighbors can predict numbers as well as categories.</h2>
                <p>
                  Classification asks “which group?” Regression asks “what numeric response?” The nearest-neighbor search
                  can stay the same. Instead of counting class labels, average the numeric responses from the selected
                  neighborhood. Change k and you change which local evidence contributes to the prediction.
                </p>
                <RegressionLab />
              </section>

              <section id="quality">
                <h2>Distance is only meaningful when the features are meaningful.</h2>
                <p>
                  Feature selection is part of the algorithmic reasoning, not a cosmetic preprocessing step. Features
                  should connect directly to the behavior you want to predict and should cover the relevant space without
                  baking in a narrow view of the user or object.
                </p>
                <FeatureQualityCheck />
              </section>

              <section id="limits">
                <h2>KNN is simple, but the chapter does not pretend every similarity problem is easy.</h2>
                <p>
                  Different rating habits can make Euclidean distance exaggerate differences between otherwise similar
                  profiles. The book points to cosine similarity as a practical alternative that compares vector direction
                  rather than raw distance, while leaving that method outside the chapter&apos;s scope. Choosing k is also a
                  modeling choice rather than a magic constant.
                </p>
                <div className="knn-boundary-grid">
                  <div><strong>Feature quality</strong><p>Irrelevant or narrow coordinates create misleading neighborhoods.</p></div>
                  <div><strong>Rating scale</strong><p>Two people can share a preference pattern while using different numeric magnitudes.</p></div>
                  <div><strong>Neighborhood size</strong><p>k decides how local or broad the evidence becomes.</p></div>
                  <div><strong>Prediction limits</strong><p>Similarity cannot guarantee a good forecast when the chosen features do not capture the forces driving the outcome.</p></div>
                </div>
                <p>
                  The broader machine-learning lesson is equally useful: complex applications still depend on training
                  examples and feature extraction. OCR, recommendations, and other classifiers can share this same basic
                  structure even when their real feature engineering is much more sophisticated.
                </p>
              </section>

              <section id="rebuild">
                <h2>Rebuild the classifier from the four-stage mental model.</h2>
                <p>
                  Start with numeric feature vectors. Recover Euclidean distance. Sort or select the closest examples.
                  Keep k of them. Finally, count their labels. If those stages are clear, the implementation is a direct
                  translation of the model rather than something to memorize.
                </p>
                <KnnRebuild />
                <div className="action-row">
                  <Link className="button" href="/learn/chapter-9-recap">← Chapter 9 recap</Link>
                  <Link className="button button--primary" href="/learn/chapter-10-recap">Chapter 10 recap →</Link>
                </div>
              </section>
            </div>
          </article>

          <aside className="margin-column" aria-label="K-nearest neighbors notes">
            <MarginNote label="Classification">Nearby labels vote for a category.</MarginNote>
            <MarginNote label="Regression">Nearby numeric responses can be averaged into a prediction.</MarginNote>
            <MarginNote label="Feature extraction">The object becomes a vector before distance has any meaning.</MarginNote>
            <MarginNote label="Feature quality">A precise distance over poor features is still a poor similarity measure.</MarginNote>
          </aside>
        </div>
      </div>
    </main>
  );
}
