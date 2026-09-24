"use client";

import { useState } from "react";

type Mode = "lookup" | "duplicates" | "cache";

const directory: Record<string, string> = {
  Mina: "+84 901 555 014",
  Omar: "+84 903 555 227",
  Support: "1900 1008",
};

const arrivals = ["Lan", "Minh", "Lan", "An", "Minh", "Khoa"] as const;
const pages: Record<string, string> = {
  "/algorithms": "Algorithm index rendered",
  "/roadmap": "Roadmap rendered",
  "/review": "Review queue rendered",
};

export function HashUseCasesLab() {
  const [mode, setMode] = useState<Mode>("lookup");
  const [lookupKey, setLookupKey] = useState("Mina");
  const [seen, setSeen] = useState<string[]>([]);
  const [arrivalIndex, setArrivalIndex] = useState(0);
  const [cache, setCache] = useState<Record<string, string>>({});
  const [lastCacheResult, setLastCacheResult] = useState("No request yet.");

  function reset() {
    setSeen([]);
    setArrivalIndex(0);
    setCache({});
    setLastCacheResult("No request yet.");
  }

  function processArrival() {
    if (arrivalIndex >= arrivals.length) return;
    const name = arrivals[arrivalIndex];
    if (!seen.includes(name)) setSeen((current) => [...current, name]);
    setArrivalIndex((index) => index + 1);
  }

  function requestPage(path: string) {
    if (cache[path]) {
      setLastCacheResult(`cache hit · returned ${path} without recomputing`);
      return;
    }
    setCache((current) => ({ ...current, [path]: pages[path] }));
    setLastCacheResult(`cache miss · computed ${path}, then stored it by key`);
  }

  return (
    <div className="hash-use-cases">
      <div className="hash-use-cases__header">
        <div>
          <div className="eyebrow">Use cases</div>
          <h3>One structure, three recurring jobs.</h3>
        </div>
        <button className="button button--quiet" type="button" onClick={reset}>Reset examples</button>
      </div>

      <div className="hash-use-tabs" role="tablist" aria-label="Hash table use cases">
        {[
          ["lookup", "Map + lookup"],
          ["duplicates", "Catch duplicates"],
          ["cache", "Cache results"],
        ].map(([id, label]) => (
          <button
            type="button"
            role="tab"
            aria-selected={mode === id}
            className={`button ${mode === id ? "button--primary" : ""}`}
            onClick={() => setMode(id as Mode)}
            key={id}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === "lookup" ? (
        <div className="hash-use-panel">
          <div>
            <div className="eyebrow">Directory</div>
            <p>Associate one key with one value, then retrieve the value directly from the key.</p>
          </div>
          <div className="hash-use-map">
            {Object.entries(directory).map(([name, phone]) => (
              <button
                className={`hash-map-row ${lookupKey === name ? "hash-map-row--active" : ""}`}
                type="button"
                onClick={() => setLookupKey(name)}
                key={name}
              >
                <span>{name}</span><strong className="mono">{phone}</strong>
              </button>
            ))}
          </div>
          <div className="hash-use-result mono">directory[{JSON.stringify(lookupKey)}] → {directory[lookupKey]}</div>
        </div>
      ) : null}

      {mode === "duplicates" ? (
        <div className="hash-use-panel">
          <div>
            <div className="eyebrow">Registration desk</div>
            <p>Use membership by key to decide whether an arriving name has already been accepted.</p>
          </div>
          <div className="duplicate-stream">
            {arrivals.map((name, index) => {
              const processed = index < arrivalIndex;
              const firstIndex = arrivals.findIndex((candidate) => candidate === name);
              const duplicate = processed && firstIndex < index;
              return (
                <span className={`duplicate-chip ${processed ? (duplicate ? "duplicate-chip--reject" : "duplicate-chip--accept") : ""}`} key={`${name}-${index}`}>
                  {name}{processed ? (duplicate ? " · duplicate" : " · accepted") : ""}
                </span>
              );
            })}
          </div>
          <div className="lab-toolbar">
            <button className="button button--primary" type="button" onClick={processArrival} disabled={arrivalIndex >= arrivals.length}>Process next name →</button>
          </div>
          <div className="hash-use-result mono">seen = {`{${seen.join(", ")}}`}</div>
        </div>
      ) : null}

      {mode === "cache" ? (
        <div className="hash-use-panel">
          <div>
            <div className="eyebrow">Page cache</div>
            <p>The first request computes a result; later requests can retrieve the stored result by the same key.</p>
          </div>
          <div className="cache-request-row">
            {Object.keys(pages).map((path) => (
              <button className="button" type="button" onClick={() => requestPage(path)} key={path}>{path}</button>
            ))}
          </div>
          <div className="hash-use-result mono">{lastCacheResult}</div>
          <div className="cache-contents">
            {Object.keys(cache).length ? Object.keys(cache).map((path) => <span key={path}>{path} cached</span>) : <em>cache empty</em>}
          </div>
        </div>
      ) : null}
    </div>
  );
}
