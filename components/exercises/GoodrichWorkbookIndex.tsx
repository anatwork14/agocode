import Link from "next/link";
import {
  goodrichExerciseCount,
  goodrichExerciseIndex,
  goodrichTierLabels,
  type GoodrichExerciseTier,
} from "@/lib/knowledge/goodrich-workbook";

const tierPurpose: Record<GoodrichExerciseTier, string> = {
  R: "Reinforce definitions, mechanics, and direct applications.",
  C: "Design, justify, adapt, or discover a less direct solution.",
  P: "Build a larger implementation or investigation from the chapter ideas.",
};

export function GoodrichWorkbookIndex() {
  return (
    <section className="workbook-index" aria-labelledby="goodrich-workbook-title">
      <div className="workbook-index__intro">
        <div>
          <span className="eyebrow">Complete source workbook index</span>
          <h2 id="goodrich-workbook-title">758 Goodrich exercise references, without copying the statements.</h2>
          <p>
            The book separates chapter exercises into Reinforcement, Creativity, and Projects. AgoCode keeps every source
            identifier so you can use your copy of the book, while the site supplies an original reasoning notebook around it.
          </p>
        </div>
        <div className="workbook-index__legend">
          {(Object.entries(goodrichTierLabels) as [GoodrichExerciseTier, string][]).map(([tier, label]) => (
            <div key={tier}>
              <strong>{tier}</strong>
              <span>{label}</span>
              <small>{tierPurpose[tier]}</small>
            </div>
          ))}
        </div>
      </div>

      <div className="workbook-index__count mono">{goodrichExerciseCount} indexed references · 15 chapters</div>

      <div className="workbook-chapters">
        {goodrichExerciseIndex.map((chapter) => {
          const count = chapter.ranges.reduce((total, [, start, end]) => total + end - start + 1, 0);
          return (
            <details className="workbook-chapter" key={chapter.chapter}>
              <summary>
                <span className="workbook-chapter__number">{String(chapter.chapter).padStart(2, "0")}</span>
                <span>
                  <strong>{chapter.title}</strong>
                  <small>{count} exercises</small>
                </span>
                <span className="workbook-chapter__expand">open</span>
              </summary>

              <div className="workbook-tiers">
                {chapter.ranges.map(([tier, start, end]) => (
                  <div className="workbook-tier" key={tier}>
                    <div className="workbook-tier__head">
                      <strong>{goodrichTierLabels[tier]}</strong>
                      <span className="mono">{end - start + 1}</span>
                    </div>
                    <div className="workbook-exercise-grid">
                      {Array.from({ length: end - start + 1 }, (_, offset) => {
                        const number = start + offset;
                        const sourceId = `${tier}-${chapter.chapter}.${number}`;
                        const id = `goodrich-${tier.toLowerCase()}-${chapter.chapter}-${number}`;
                        return (
                          <Link href={`/exercises/${id}`} key={sourceId} aria-label={`Open ${sourceId} reasoning worksheet`}>
                            {sourceId}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </details>
          );
        })}
      </div>
    </section>
  );
}
