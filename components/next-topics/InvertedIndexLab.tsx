"use client";

import { useState } from "react";
import { buildInvertedIndex, searchInvertedIndex } from "@/lib/algorithms/nextTopics";

const documents = {
  A: "algorithms become easier when state becomes visible",
  B: "visible examples make difficult ideas easier to recall",
  C: "practice turns algorithm ideas into problem solving skill",
};

const index = buildInvertedIndex(documents);
const queryTerms = ["visible", "ideas", "algorithm", "easier"] as const;

export function InvertedIndexLab() {
  const [query, setQuery] = useState<(typeof queryTerms)[number]>("visible");
  const matches = searchInvertedIndex(index, query);

  return (
    <div className="inverted-index-lab">
      <div className="next-lab__header">
        <div>
          <div className="eyebrow">Inverted index</div>
          <h3>Instead of scanning every document for a word, map each word directly to the documents that contain it.</h3>
        </div>
        <span className="mono">{Object.keys(index).length} terms</span>
      </div>

      <div className="document-strip" aria-label="Indexed documents">
        {Object.entries(documents).map(([id, text]) => (
          <article className={matches.includes(id) ? "document-card document-card--match" : "document-card"} key={id}>
            <span className="mono">Doc {id}</span>
            <p>{text}</p>
          </article>
        ))}
      </div>

      <div className="next-topic-switch" role="group" aria-label="Search indexed term">
        {queryTerms.map((term) => (
          <button className={`button ${query === term ? "button--primary" : ""}`} type="button" onClick={() => setQuery(term)} key={term}>{term}</button>
        ))}
      </div>

      <div className="index-lookup" aria-live="polite">
        <div><span className="eyebrow">Lookup</span><strong className="mono">{query}</strong></div>
        <span aria-hidden="true">→</span>
        <div><span className="eyebrow">Posting list</span><strong className="mono">[{matches.join(", ") || "∅"}]</strong></div>
      </div>

      <p className="next-topic-note">
        The direction has been inverted: rather than document → words, the index stores word → locations. Search engines build much richer versions of this idea.
      </p>
    </div>
  );
}
