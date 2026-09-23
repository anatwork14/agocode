"use client";

import { useMemo, useState } from "react";

type Question = {
  id: string;
  prompt: string;
  options: { id: string; label: string }[];
  correctOptionId: string;
  explanation: string;
};

const questions: Question[] = [
  {
    id: "invariant",
    prompt: "Which statement must remain true after every interval update?",
    options: [
      { id: "a", label: "mid always points to the target." },
      { id: "b", label: "If the target exists, its index remains inside low…high." },
      { id: "c", label: "low and high always move by exactly one." },
    ],
    correctOptionId: "b",
    explanation: "That candidate-interval invariant is what makes each discard safe. The target may not exist, but if it does, a correct update never throws its index away.",
  },
  {
    id: "sorted",
    prompt: "Why does binary search require sorted input?",
    options: [
      { id: "a", label: "Sorting makes midpoint arithmetic faster." },
      { id: "b", label: "Order lets one comparison prove that an entire side cannot contain the target." },
      { id: "c", label: "Python indexing only works correctly on sorted lists." },
    ],
    correctOptionId: "b",
    explanation: "Sorted position carries information. If nums[mid] is too small, every earlier candidate is also too small, so that whole region can be discarded.",
  },
  {
    id: "complexity",
    prompt: "What does O(log n) communicate here?",
    options: [
      { id: "a", label: "The search always takes log₂(n) milliseconds." },
      { id: "b", label: "The number of decisions grows with how many halvings are needed as n grows." },
      { id: "c", label: "The algorithm examines every item once, but very quickly." },
    ],
    correctOptionId: "b",
    explanation: "Big O describes growth, not a fixed wall-clock duration. Binary search repeatedly halves the remaining candidate space, so the number of decisions grows logarithmically.",
  },
];

export function BinarySearchExplainCheck() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const score = useMemo(
    () => questions.filter((question) => answers[question.id] === question.correctOptionId).length,
    [answers],
  );
  const complete = questions.every((question) => Boolean(answers[question.id]));
  const mastered = submitted && score === questions.length;

  function submit() {
    if (!complete) return;
    setSubmitted(true);

    if (score === questions.length) {
      localStorage.setItem(
        "agocode.progress.binary-search.explain",
        JSON.stringify({ completedAt: new Date().toISOString(), exerciseId: "binary-search-explain" }),
      );
    }
  }

  return (
    <div className="explain-check">
      <div className="explain-check__header">
        <div>
          <div className="eyebrow">Explain the algorithm</div>
          <h3>Can you defend the search, not just write it?</h3>
          <p>Choose the statement that best captures the reasoning. Feedback appears after you commit all three answers.</p>
        </div>
        <span className="mono">{submitted ? `${score}/${questions.length}` : "3 prompts"}</span>
      </div>

      <div className="explain-check__questions">
        {questions.map((question, questionIndex) => {
          const selected = answers[question.id];
          const correct = selected === question.correctOptionId;
          return (
            <fieldset className="reasoning-question" key={question.id}>
              <legend>
                <span>{String(questionIndex + 1).padStart(2, "0")}</span>
                {question.prompt}
              </legend>
              <div className="reasoning-options">
                {question.options.map((option) => (
                  <label
                    className={`reasoning-option ${
                      submitted && selected === option.id
                        ? correct
                          ? "reasoning-option--correct"
                          : "reasoning-option--wrong"
                        : ""
                    }`}
                    key={option.id}
                  >
                    <input
                      type="radio"
                      name={question.id}
                      value={option.id}
                      checked={selected === option.id}
                      onChange={() => {
                        setAnswers((current) => ({ ...current, [question.id]: option.id }));
                        setSubmitted(false);
                      }}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
              {submitted ? (
                <p className={correct ? "reasoning-feedback reasoning-feedback--correct" : "reasoning-feedback"}>
                  {correct ? "✓ " : "Review: "}{question.explanation}
                </p>
              ) : null}
            </fieldset>
          );
        })}
      </div>

      <div className="explain-check__footer">
        <button type="button" className="button button--primary" onClick={submit} disabled={!complete}>
          Check reasoning
        </button>
        {submitted ? (
          <p aria-live="polite" className={mastered ? "explain-result explain-result--mastered" : "explain-result"}>
            {mastered
              ? "All three explanations are consistent with the binary-search invariant."
              : "Use the feedback above, then choose again. The goal is the reasoning, not the score."}
          </p>
        ) : null}
      </div>
    </div>
  );
}
