"use client";

import { useState } from "react";
import { mapWords, reduceWordCounts } from "@/lib/algorithms/nextTopics";

const lines = [
  "trace algorithms visually",
  "rebuild algorithms from memory",
  "apply algorithms to problems",
];

export function MapReduceLab() {
  const [stage, setStage] = useState<"input" | "map" | "reduce">("input");
  const pairs = mapWords(lines);
  const reduced = reduceWordCounts(pairs);

  return (
    <div className="mapreduce-lab">
      <div className="next-lab__header">
        <div>
          <div className="eyebrow">MapReduce</div>
          <h3>Map transforms many independent items; reduce combines mapped results into a smaller answer.</h3>
        </div>
        <span className="mono">{stage}</span>
      </div>

      <div className="mapreduce-flow" aria-label="MapReduce word count stages">
        <section className={stage === "input" ? "mapreduce-stage mapreduce-stage--current" : "mapreduce-stage"}>
          <span className="eyebrow">Input shards</span>
          {lines.map((line, index) => <code key={line}>worker {index + 1}: {line}</code>)}
        </section>
        <span className="mapreduce-arrow" aria-hidden="true">→</span>
        <section className={stage === "map" ? "mapreduce-stage mapreduce-stage--current" : "mapreduce-stage"}>
          <span className="eyebrow">Map</span>
          {(stage === "map" || stage === "reduce" ? pairs : pairs.slice(0, 0)).map((pair, index) => (
            <code key={`${pair.key}-${index}`}>({pair.key}, {pair.value})</code>
          ))}
          {stage === "input" ? <small>waiting</small> : null}
        </section>
        <span className="mapreduce-arrow" aria-hidden="true">→</span>
        <section className={stage === "reduce" ? "mapreduce-stage mapreduce-stage--current" : "mapreduce-stage"}>
          <span className="eyebrow">Reduce</span>
          {stage === "reduce"
            ? Object.entries(reduced).map(([word, count]) => <code key={word}>{word}: {count}</code>)
            : <small>waiting</small>}
        </section>
      </div>

      <div className="trace-note" aria-live="polite">
        <strong>{stage === "input" ? "Split the work:" : stage === "map" ? "Independent mapping:" : "Combine by key:"}</strong>{" "}
        {stage === "input"
          ? "Each input chunk can be processed independently, which creates an opportunity to spread work across machines."
          : stage === "map"
            ? "The same mapping rule emits key/value pairs for every word without needing the final global count yet."
            : "Reduction groups equal keys and combines their values into one result per word."}
      </div>

      <div className="lab-toolbar">
        <button className="button" type="button" onClick={() => setStage(stage === "reduce" ? "map" : "input")} disabled={stage === "input"}>← Back</button>
        <button className="button button--primary" type="button" onClick={() => setStage(stage === "input" ? "map" : "reduce")} disabled={stage === "reduce"}>{stage === "reduce" ? "Pipeline complete" : stage === "input" ? "Map in parallel →" : "Reduce by key →"}</button>
        <button className="button button--quiet" type="button" onClick={() => setStage("input")}>Reset</button>
      </div>

      <p className="next-topic-note">
        The small browser demo is sequential. The chapter&apos;s point is architectural: the map step can be distributed across workers, then the partial results are brought together for reduction.
      </p>
    </div>
  );
}
