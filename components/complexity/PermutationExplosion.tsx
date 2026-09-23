"use client";

import { useMemo, useState } from "react";

function factorial(n: number) {
  let result = 1;
  for (let value = 2; value <= n; value += 1) result *= value;
  return result;
}

function formatInteger(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

export function PermutationExplosion() {
  const [cities, setCities] = useState(5);
  const routeCount = factorial(cities);

  const points = useMemo(() => {
    const center = 150;
    const radius = 105;
    return Array.from({ length: cities }, (_, index) => {
      const angle = -Math.PI / 2 + (index * Math.PI * 2) / cities;
      return {
        x: center + Math.cos(angle) * radius,
        y: center + Math.sin(angle) * radius,
        label: String.fromCharCode(65 + index),
      };
    });
  }, [cities]);

  const routePoints = [...points, points[0]].map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <div className="permutation-lab">
      <div className="permutation-lab__header">
        <div>
          <div className="eyebrow">Factorial growth</div>
          <h3>What if we try every visiting order?</h3>
        </div>
        <span className="mono">{cities}! = {formatInteger(routeCount)}</span>
      </div>

      <div className="permutation-lab__grid">
        <div className="route-sketch">
          <svg viewBox="0 0 300 300" role="img" aria-label={`A schematic route connecting ${cities} cities`}>
            <polyline points={routePoints} fill="none" stroke="var(--state-candidate)" strokeWidth="2" strokeDasharray="5 5" />
            {points.map((point, index) => (
              <g key={point.label}>
                <circle cx={point.x} cy={point.y} r="17" fill="var(--surface)" stroke={index === 0 ? "var(--accent)" : "var(--ink)"} strokeWidth={index === 0 ? 3 : 1.5} />
                <text x={point.x} y={point.y + 5} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="13" fill="var(--ink)">
                  {point.label}
                </text>
              </g>
            ))}
          </svg>
          <p>One possible route. Brute force asks us to compare it with every other ordering.</p>
        </div>

        <div className="permutation-count">
          <span className="permutation-count__value">{formatInteger(routeCount)}</span>
          <strong>possible orders for {cities} cities</strong>
          <p>Adding one city multiplies the previous count by {cities}.</p>

          <label htmlFor="city-count">Number of cities</label>
          <input
            id="city-count"
            type="range"
            min={3}
            max={9}
            step={1}
            value={cities}
            onChange={(event) => setCities(Number(event.target.value))}
          />
          <div className="permutation-scale" aria-hidden="true">
            {[3, 4, 5, 6, 7, 8, 9].map((value) => <span key={value}>{value}</span>)}
          </div>
        </div>
      </div>

      <div className="permutation-table" aria-label="Permutation counts by city count">
        {[5, 6, 7, 8, 9].map((value) => (
          <div className={value === cities ? "permutation-table__row permutation-table__row--active" : "permutation-table__row"} key={value}>
            <span>{value} cities</span>
            <strong className="mono">{formatInteger(factorial(value))}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
