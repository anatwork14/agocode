"use client";

import { useState } from "react";
import { bloomBitPositions, bloomMightContain, buildBloomFilter } from "@/lib/algorithms/nextTopics";

const inserted = ["agocode.dev", "example.org", "docs.test"];
const candidates = ["agocode.dev", "new.site", "sample.net", "fresh.dev"] as const;
const state = buildBloomFilter(inserted, 7);

export function BloomFilterLab() {
  const [candidate, setCandidate] = useState<(typeof candidates)[number]>("new.site");
  const positions = bloomBitPositions(candidate, state.bits.length);
  const maybe = bloomMightContain(state, candidate);
  const actuallyInserted = inserted.includes(candidate);

  return (
    <div className="bloom-lab">
      <div className="next-lab__header">
        <div>
          <div className="eyebrow">Probabilistic membership</div>
          <h3>A Bloom filter trades exactness for a much smaller memory footprint.</h3>
        </div>
        <span className="mono">7 bits · 2 hashes</span>
      </div>

      <div className="bloom-inserted">
        <span className="eyebrow">Inserted items</span>
        <div>{inserted.map((value) => <code key={value}>{value}</code>)}</div>
      </div>

      <div className="bloom-bits" aria-label="Bloom filter bit array">
        {state.bits.map((bit, index) => (
          <div className={`bloom-bit ${bit ? "bloom-bit--on" : ""} ${positions.includes(index) ? "bloom-bit--probe" : ""}`} key={index}>
            <span className="mono">{index}</span>
            <strong className="mono">{bit ? 1 : 0}</strong>
          </div>
        ))}
      </div>

      <div className="next-topic-switch" role="group" aria-label="Choose membership query">
        {candidates.map((value) => (
          <button className={`button ${candidate === value ? "button--primary" : ""}`} type="button" onClick={() => setCandidate(value)} key={value}>{value}</button>
        ))}
      </div>

      <div className="bloom-result" aria-live="polite">
        <div><span>hash positions</span><strong className="mono">[{positions.join(", ")}]</strong></div>
        <div><span>Bloom answer</span><strong>{maybe ? "possibly present" : "definitely absent"}</strong></div>
        <div><span>Exact set truth</span><strong>{actuallyInserted ? "present" : "absent"}</strong></div>
      </div>

      <p className={maybe && !actuallyInserted ? "bloom-warning" : "next-topic-note"}>
        {maybe && !actuallyInserted
          ? `This is a deliberate false positive: ${candidate} was never inserted, but both hashed bit positions are already on because of other items.`
          : maybe
            ? "The filter says the item might be present. An exact data source would still be needed if certainty matters."
            : "At least one required bit is off, so this item is definitely absent from the inserted set."}
      </p>
    </div>
  );
}
