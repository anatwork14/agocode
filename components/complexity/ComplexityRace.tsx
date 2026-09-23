"use client";

import { useMemo, useState } from "react";

const sizes = [8, 16, 32, 64, 128];

type ComplexityRow = {
  label: string;
  notation: string;
  operations: number;
  display: string;
};

function compact(value: number) {
  if (value < 1_000) return new Intl.NumberFormat("en-US").format(Math.round(value));
  if (value < 1_000_000) return `${(value / 1_000).toFixed(value < 10_000 ? 1 : 0)}K`;
  if (value < 1_000_000_000) return `${(value / 1_000_000).toFixed(value < 10_000_000 ? 1 : 0)}M`;
  return `${(value / 1_000_000_000).toFixed(1)}B`;
}

function factorialLog10(n: number) {
  let total = 0;
  for (let value = 2; value <= n; value += 1) total += Math.log10(value);
  return total;
}

export function ComplexityRace() {
  const [sizeIndex, setSizeIndex] = useState(1);
  const n = sizes[sizeIndex];

  const rows = useMemo<ComplexityRow[]>(() => {
    const factorialLog = factorialLog10(n);
    return [
      { label: "Binary-style halving", notation: "O(log n)", operations: Math.ceil(Math.log2(n)), display: compact(Math.ceil(Math.log2(n))) },
      { label: "Single pass", notation: "O(n)", operations: n, display: compact(n) },
      { label: "Efficient comparison sort", notation: "O(n log n)", operations: Math.ceil(n * Math.log2(n)), display: compact(Math.ceil(n * Math.log2(n))) },
      { label: "All pairs", notation: "O(n²)", operations: n * n, display: compact(n * n) },
      {
        label: "All permutations",
        notation: "O(n!)",
        operations: 10 ** Math.min(factorialLog, 300),
        display: factorialLog < 9 ? compact(10 ** factorialLog) : `≈ 10^${Math.floor(factorialLog)}`,
      },
    ];
  }, [n]);

  const maxLog = Math.max(...rows.map((row) => Math.log10(Math.max(row.operations, 1))));

  return (
    <div className="complexity-race">
      <div className="complexity-race__header">
        <div>
          <div className="eyebrow">Growth comparison</div>
          <h3>Same input size. Very different work.</h3>
        </div>
        <span className="mono">n = {n}</span>
      </div>

      <div className="complexity-race__control">
        <input
          type="range"
          min={0}
          max={sizes.length - 1}
          value={sizeIndex}
          onChange={(event) => setSizeIndex(Number(event.target.value))}
          aria-label="Input size for complexity comparison"
        />
        <div aria-hidden="true">
          {sizes.map((value) => <span key={value}>{value}</span>)}
        </div>
      </div>

      <div className="complexity-bars">
        {rows.map((row) => {
          const width = maxLog === 0 ? 0 : (Math.log10(Math.max(row.operations, 1)) / maxLog) * 100;
          return (
            <div className="complexity-row" key={row.notation}>
              <div className="complexity-row__label">
                <strong>{row.notation}</strong>
                <span>{row.label}</span>
              </div>
              <div className="complexity-row__track" aria-hidden="true">
                <span style={{ width: `${Math.max(width, 2)}%` }} />
              </div>
              <div className="complexity-row__value mono">{row.display}</div>
            </div>
          );
        })}
      </div>

      <p className="complexity-race__note">
        Bar lengths use a logarithmic visual scale so the slower classes remain drawable. The operation labels carry
        the actual order-of-growth comparison.
      </p>
    </div>
  );
}
