"use client";

import { useMemo, useState } from "react";
import { educationalHash } from "@/lib/algorithms/hashTable";

const produce = [
  { key: "apple", price: 0.67 },
  { key: "avocado", price: 1.49 },
  { key: "banana", price: 0.79 },
  { key: "carrot", price: 0.45 },
  { key: "milk", price: 1.89 },
  { key: "pear", price: 0.92 },
  { key: "tomato", price: 1.15 },
] as const;

function binarySearchChecks(target: string) {
  let low = 0;
  let high = produce.length - 1;
  let checks = 0;

  while (low <= high) {
    checks += 1;
    const mid = Math.floor((low + high) / 2);
    const key = produce[mid].key;
    if (key === target) return checks;
    if (key < target) low = mid + 1;
    else high = mid - 1;
  }

  return checks;
}

export function PriceLookupLab() {
  const [target, setTarget] = useState<(typeof produce)[number]["key"]>("avocado");
  const selected = produce.find((item) => item.key === target) ?? produce[0];
  const simpleChecks = produce.findIndex((item) => item.key === target) + 1;
  const binaryChecks = useMemo(() => binarySearchChecks(target), [target]);
  const hashIndex = educationalHash(target, 11);
  const maxChecks = Math.max(simpleChecks, binaryChecks, 1);

  return (
    <div className="price-lookup-lab">
      <div className="price-lookup-lab__header">
        <div>
          <div className="eyebrow">Grocery price lookup</div>
          <h3>Compare searching for a key with computing where it lives.</h3>
        </div>
        <span className="mono">{selected.key} → ${selected.price.toFixed(2)}</span>
      </div>

      <div className="hash-sample-row" aria-label="Choose produce item">
        {produce.map((item) => (
          <button
            className={`button ${target === item.key ? "button--primary" : "button--quiet"}`}
            type="button"
            onClick={() => setTarget(item.key)}
            key={item.key}
          >
            {item.key}
          </button>
        ))}
      </div>

      <div className="lookup-comparison">
        {[
          { title: "Simple search", detail: `${simpleChecks} line${simpleChecks === 1 ? "" : "s"} inspected`, checks: simpleChecks, note: "Walk from the beginning until the product appears." },
          { title: "Binary search", detail: `${binaryChecks} midpoint check${binaryChecks === 1 ? "" : "s"}`, checks: binaryChecks, note: "Use sorted order to discard half of the remaining names." },
          { title: "Hash lookup", detail: `bucket ${hashIndex}`, checks: 1, note: "Transform the key into an array index, then inspect that bucket." },
        ].map((method) => (
          <section className="lookup-method" key={method.title}>
            <div className="lookup-method__heading"><strong>{method.title}</strong><span className="mono">{method.detail}</span></div>
            <div className="lookup-method__bar" aria-hidden="true"><span style={{ width: `${Math.max(8, (method.checks / maxChecks) * 100)}%` }} /></div>
            <p>{method.note}</p>
          </section>
        ))}
      </div>

      <p className="hash-lab-note">
        The bars show work for this tiny example, not formal runtime. The conceptual shift is the important part: a hash table uses the key to choose an address instead of searching the whole collection.
      </p>
    </div>
  );
}
