"use client";

import { FormEvent, useMemo, useState } from "react";
import { buildHashTable, educationalHash, type HashEntry } from "@/lib/algorithms/hashTable";

const initialEntries: HashEntry<string>[] = [
  { key: "mango", value: "$2.10" },
  { key: "apple", value: "$1.20" },
  { key: "bread", value: "$3.40" },
  { key: "tofu", value: "$2.80" },
];

const suggestions = ["rice", "tea", "pear", "kiwi", "plum", "corn"] as const;

export function CollisionLoadFactorLab() {
  const [entries, setEntries] = useState<HashEntry<string>[]>(initialEntries);
  const [capacity, setCapacity] = useState(5);
  const [keyDraft, setKeyDraft] = useState("rice");
  const [error, setError] = useState("");
  const snapshot = useMemo(() => buildHashTable(entries, capacity), [entries, capacity]);

  function insert(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const key = keyDraft.trim().toLowerCase();
    if (!key) {
      setError("Enter a key before inserting.");
      return;
    }
    if (entries.some((entry) => entry.key === key)) {
      setError("That key already exists. A real hash table would update its value rather than add a duplicate key.");
      return;
    }
    if (entries.length >= 16) {
      setError("Keep the lab to 16 entries or fewer.");
      return;
    }
    setError("");
    setEntries((current) => [...current, { key, value: `$${(1 + current.length * 0.55).toFixed(2)}` }]);
  }

  function resize() {
    setCapacity((current) => current * 2);
    setError("");
  }

  function reset() {
    setEntries(initialEntries);
    setCapacity(5);
    setKeyDraft("rice");
    setError("");
  }

  return (
    <div className="collision-lab">
      <div className="collision-lab__header">
        <div>
          <div className="eyebrow">Collisions + load factor</div>
          <h3>Two keys can land in one slot. The bucket then has more work to do.</h3>
        </div>
        <span className="mono">α = {snapshot.loadFactor.toFixed(2)}</span>
      </div>

      <form className="scenario-builder" onSubmit={insert}>
        <label>
          <span>New key</span>
          <input value={keyDraft} onChange={(event) => setKeyDraft(event.target.value)} />
        </label>
        <button className="button" type="submit">Insert key</button>
        <p className="scenario-builder__help">slot = educationalHash(key, {capacity})</p>
        {error ? <p className="scenario-builder__error" role="alert">{error}</p> : null}
      </form>

      <div className="hash-sample-row" aria-label="Suggested collision examples">
        {suggestions.map((key) => (
          <button className="button button--quiet" type="button" onClick={() => setKeyDraft(key)} key={key}>
            {key} → {educationalHash(key, capacity)}
          </button>
        ))}
      </div>

      <div className="bucket-table" aria-label={`Hash buckets with capacity ${capacity}`}>
        {snapshot.buckets.map((bucket, index) => (
          <div className={`bucket-row ${bucket.length > 1 ? "bucket-row--collision" : ""}`} key={index}>
            <span className="bucket-row__index mono">{index}</span>
            <div className="bucket-chain">
              {bucket.length ? bucket.map((entry) => (
                <div className="bucket-entry" key={entry.key}>
                  <strong>{entry.key}</strong><span className="mono">{entry.value}</span>
                </div>
              )) : <em>empty</em>}
            </div>
            <span className="bucket-row__meta">{bucket.length > 1 ? `${bucket.length} entries · collision chain` : bucket.length ? "1 entry" : ""}</span>
          </div>
        ))}
      </div>

      <dl className="hash-table-metrics">
        <div><dt>entries</dt><dd>{snapshot.size}</dd></div>
        <div><dt>slots</dt><dd>{snapshot.capacity}</dd></div>
        <div><dt>load factor</dt><dd>{snapshot.loadFactor.toFixed(2)}</dd></div>
        <div><dt>collisions added</dt><dd>{snapshot.collisions}</dd></div>
        <div><dt>longest chain</dt><dd>{snapshot.longestChain}</dd></div>
      </dl>

      <div className="collision-explanation">
        <p>
          A collision does not mean the key is lost. This lab uses separate chaining: entries sharing a slot form a small list. Looking up that bucket is still direct, but a long chain adds local search work.
        </p>
        <p>
          The load factor <span className="mono">α = entries / slots</span> describes how crowded the table is. Resizing creates a larger array and hashes every existing key again because valid bucket indexes depend on the array size.
        </p>
      </div>

      <div className="lab-toolbar">
        <button className="button button--primary" type="button" onClick={resize}>Double slots + rehash</button>
        <button className="button button--quiet" type="button" onClick={reset}>Reset</button>
      </div>
    </div>
  );
}
