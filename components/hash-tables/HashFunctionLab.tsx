"use client";

import { FormEvent, useMemo, useState } from "react";
import { educationalHash, traceEducationalHash } from "@/lib/algorithms/hashTable";

const sampleKeys = ["mango", "rice", "tea", "tofu", "pear"] as const;

export function HashFunctionLab() {
  const [key, setKey] = useState("mango");
  const [draft, setDraft] = useState("mango");
  const [capacity, setCapacity] = useState(7);
  const [error, setError] = useState("");

  const steps = useMemo(() => traceEducationalHash(key, capacity), [key, capacity]);
  const bucket = educationalHash(key, capacity);

  function apply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = draft.trim();
    if (!next) {
      setError("Enter a non-empty key.");
      return;
    }
    if (next.length > 18) {
      setError("Keep the key to 18 characters or fewer so the trace stays readable.");
      return;
    }
    setError("");
    setKey(next);
  }

  return (
    <div className="hash-function-lab">
      <div className="hash-function-lab__header">
        <div>
          <div className="eyebrow">Key → array index</div>
          <h3>The same key must lead to the same valid bucket.</h3>
        </div>
        <span className="mono">bucket {bucket}</span>
      </div>

      <form className="scenario-builder" onSubmit={apply}>
        <label>
          <span>Key</span>
          <input value={draft} onChange={(event) => setDraft(event.target.value)} />
        </label>
        <button className="button" type="submit">Hash key</button>
        <p className="scenario-builder__help">This is an AgoCode teaching hash, not a production hash function.</p>
        {error ? <p className="scenario-builder__error" role="alert">{error}</p> : null}
      </form>

      <div className="hash-capacity-control" aria-label="Array capacity">
        <span>Array size</span>
        {[5, 7, 11].map((value) => (
          <button
            type="button"
            className={`button ${capacity === value ? "button--primary" : ""}`}
            onClick={() => setCapacity(value)}
            key={value}
          >
            {value} slots
          </button>
        ))}
      </div>

      <div className="hash-slots" aria-label={`Hash table with ${capacity} slots`}>
        {Array.from({ length: capacity }, (_, index) => (
          <div className={`hash-slot ${index === bucket ? "hash-slot--active" : ""}`} key={index}>
            <span className="mono">{index}</span>
            {index === bucket ? <strong>{key}</strong> : <em>empty</em>}
          </div>
        ))}
      </div>

      <div className="hash-trace" aria-label="Educational hash trace">
        {steps.map((step, index) => (
          <div className="hash-trace__step" key={`${step.character}-${index}`}>
            <span className="mono">{step.character}</span>
            <code>({step.previous} × 31 + {step.codePoint}) mod {capacity}</code>
            <strong className="mono">{step.next}</strong>
          </div>
        ))}
      </div>

      <div className="hash-sample-row" aria-label="Try sample keys">
        {sampleKeys.map((sample) => (
          <button
            type="button"
            className="button button--quiet"
            key={sample}
            onClick={() => {
              setDraft(sample);
              setKey(sample);
              setError("");
            }}
          >
            {sample} → {educationalHash(sample, capacity)}
          </button>
        ))}
      </div>

      <p className="hash-lab-note">
        Change the array size and the bucket may change, but with a fixed size the function is deterministic: the same key follows the same calculation to the same index, and the modulo keeps that index inside the array.
      </p>
    </div>
  );
}
