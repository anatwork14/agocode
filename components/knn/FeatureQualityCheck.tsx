"use client";

import { useState } from "react";

const choices = [
  {
    id: "relevant",
    title: "Preference coverage",
    detail: "Ratings across several content categories the recommendation is actually about.",
  },
  {
    id: "narrow",
    title: "One narrow franchise",
    detail: "Three ratings from nearly identical titles in the same franchise.",
  },
  {
    id: "irrelevant",
    title: "Profile decoration",
    detail: "Favorite avatar color and how often the user changes their profile image.",
  },
] as const;

export function FeatureQualityCheck() {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const correct = selected === "relevant";

  return (
    <div className="feature-quality-check">
      <div className="knn-lab__header">
        <div>
          <div className="eyebrow">Feature judgment</div>
          <h3>Which feature set gives distance the most useful meaning for recommendations?</h3>
        </div>
      </div>

      <div className="feature-quality-options" role="radiogroup" aria-label="Choose the most useful feature set">
        {choices.map((choice) => (
          <label className={`feature-quality-option ${selected === choice.id ? "feature-quality-option--selected" : ""}`} key={choice.id}>
            <input type="radio" name="feature-quality" checked={selected === choice.id} onChange={() => { setSelected(choice.id); setSubmitted(false); }} />
            <strong>{choice.title}</strong>
            <span>{choice.detail}</span>
          </label>
        ))}
      </div>

      <button className="button button--primary" type="button" onClick={() => setSubmitted(true)} disabled={!selected}>Check feature choice</button>

      {submitted ? (
        <p className={correct ? "reasoning-feedback reasoning-feedback--correct" : "reasoning-feedback"} aria-live="polite">
          {correct
            ? "Good. Useful features should connect directly to the behavior you want to predict and cover the space broadly enough to distinguish meaningful tastes."
            : "That feature set can make two users look close for a reason that is too narrow or unrelated to the recommendation target. Distance is only as meaningful as the features that define it."}
        </p>
      ) : null}
    </div>
  );
}
