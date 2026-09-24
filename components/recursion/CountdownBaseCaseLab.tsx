"use client";

import { useState } from "react";

export function CountdownBaseCaseLab() {
  const [safe, setSafe] = useState(false);

  const values = safe ? [3, 2, 1, 0] : [3, 2, 1, 0, -1, -2, -3];

  return (
    <div className="countdown-lab">
      <div className="countdown-lab__header">
        <div>
          <div className="eyebrow">Base case + recursive case</div>
          <h3>Recursion needs a condition that stops creating new calls.</h3>
        </div>
        <button className={`button ${safe ? "button--primary" : ""}`} type="button" onClick={() => setSafe((value) => !value)}>
          {safe ? "Base case enabled" : "Add base case"}
        </button>
      </div>

      <div className="countdown-code-grid">
        <pre className="recursion-code"><code>{safe
          ? `def countdown(i):\n    print(i)\n    if i <= 0:\n        return\n    countdown(i - 1)`
          : `def countdown(i):\n    print(i)\n    countdown(i - 1)`}</code></pre>
        <div className="countdown-output" aria-label="Countdown output preview">
          {values.map((value) => <span className="mono" key={value}>{value}</span>)}
          {!safe ? <span className="countdown-output__more">… keeps going</span> : <span className="countdown-output__stop">stop</span>}
        </div>
      </div>

      <p>
        {safe
          ? "When i <= 0, the function returns without calling itself again. That is the base case. Every larger value follows the recursive case and moves one step closer to it."
          : "The function keeps generating a smaller integer forever in principle. Nothing tells it when the subproblem is simple enough to stop."}
      </p>
    </div>
  );
}
