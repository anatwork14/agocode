"use client";

import { useMemo, useState } from "react";

const sizes = [100, 1_000, 10_000, 1_000_000, 1_000_000_000];

function formatInteger(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatRatio(value: number) {
  if (value < 1_000) return `${Math.round(value)}×`;
  if (value < 1_000_000) return `${(value / 1_000).toFixed(1)}k×`;
  return `${(value / 1_000_000).toFixed(1)}M×`;
}

export function GrowthComparison() {
  const [sizeIndex, setSizeIndex] = useState(0);
  const size = sizes[sizeIndex];
  const binarySteps = Math.ceil(Math.log2(size));
  const ratio = size / binarySteps;

  const halvingPath = useMemo(() => {
    const path: number[] = [];
    let remaining = size;

    while (remaining > 1 && path.length < 7) {
      path.push(remaining);
      remaining = Math.ceil(remaining / 2);
    }
    path.push(remaining);
    return path;
  }, [size]);

  return (
    <div className="growth-lab">
      <div className="growth-lab__header">
        <div>
          <div className="eyebrow">Growth lab</div>
          <h3>Change only the input size.</h3>
        </div>
        <span className="mono">n = {formatInteger(size)}</span>
      </div>

      <div className="growth-lab__control">
        <label htmlFor="growth-size">Input size</label>
        <input
          id="growth-size"
          type="range"
          min={0}
          max={sizes.length - 1}
          step={1}
          value={sizeIndex}
          onChange={(event) => setSizeIndex(Number(event.target.value))}
        />
        <div className="growth-lab__scale" aria-hidden="true">
          {sizes.map((value) => <span key={value}>{value >= 1_000_000_000 ? "1B" : value >= 1_000_000 ? "1M" : value >= 1_000 ? `${value / 1_000}K` : value}</span>)}
        </div>
      </div>

      <div className="growth-comparison">
        <article className="growth-method">
          <div className="growth-method__topline">
            <strong>Simple search</strong>
            <span className="mono">O(n)</span>
          </div>
          <div className="growth-method__number">{formatInteger(size)}</div>
          <p>worst-case element checks</p>
          <div className="growth-method__story">
            <span>check</span><span>check</span><span>check</span><span>…</span><span>last item</span>
          </div>
        </article>

        <article className="growth-method growth-method--binary">
          <div className="growth-method__topline">
            <strong>Binary search</strong>
            <span className="mono">O(log n)</span>
          </div>
          <div className="growth-method__number">{binarySteps}</div>
          <p>worst-case midpoint decisions</p>
          <div className="halving-path" aria-label={`Halving path for ${size} candidates`}>
            {halvingPath.map((value, index) => (
              <span key={`${value}-${index}`}>
                {index ? <i>→</i> : null}
                <b>{formatInteger(value)}</b>
              </span>
            ))}
            {halvingPath[halvingPath.length - 1] > 1 ? <span><i>→</i><b>… → 1</b></span> : null}
          </div>
        </article>
      </div>

      <div className="growth-lab__takeaway">
        At this input size, simple search may perform about <strong>{formatRatio(ratio)}</strong> as many checks.
        The important lesson is how that gap changes as <span className="mono">n</span> grows.
      </div>
    </div>
  );
}
