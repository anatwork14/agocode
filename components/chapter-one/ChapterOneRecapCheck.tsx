"use client";

import { useMemo, useState } from "react";

type RecapQuestion = {
  id: string;
  prompt: string;
  options: { id: string; label: string }[];
  answer: string;
  feedback: string;
};

const questions: RecapQuestion[] = [
  {
    id: "sorted",
    prompt: "What property makes it safe for binary search to discard an entire side?",
    options: [
      { id: "a", label: "The input is sorted." },
      { id: "b", label: "The input has no duplicates." },
      { id: "c", label: "The target is near the middle." },
    ],
    answer: "a",
    feedback: "Order turns one midpoint comparison into information about many other positions.",
  },
  {
    id: "steps",
    prompt: "A sorted list has 128 candidates. What is the worst-case midpoint-decision count in the chapter's binary-search model?",
    options: [
      { id: "a", label: "7" },
      { id: "b", label: "64" },
      { id: "c", label: "128" },
    ],
    answer: "a",
    feedback: "2⁷ = 128, so seven halvings reduce 128 candidates to one.",
  },
  {
    id: "growth",
    prompt: "If n doubles, which comparison best captures the growth difference?",
    options: [
      { id: "a", label: "O(n) roughly doubles; O(log n) adds about one step." },
      { id: "b", label: "Both roughly double." },
      { id: "c", label: "O(log n) doubles; O(n) adds about one step." },
    ],
    answer: "a",
    feedback: "Linear work follows n directly; logarithmic work follows the number of halvings.",
  },
  {
    id: "factorial",
    prompt: "Trying every visiting order for n cities has which brute-force growth class?",
    options: [
      { id: "a", label: "O(n)" },
      { id: "b", label: "O(n²)" },
      { id: "c", label: "O(n!)" },
    ],
    answer: "c",
    feedback: "The number of orderings is n!, so each added city multiplies the previous search space by n.",
  },
];

export function ChapterOneRecapCheck() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const score = useMemo(
    () => questions.filter((question) => answers[question.id] === question.answer).length,
    [answers],
  );
  const complete = questions.every((question) => Boolean(answers[question.id]));
  const passed = submitted && score === questions.length;

  function check() {
    if (!complete) return;
    setSubmitted(true);
    if (score === questions.length) {
      localStorage.setItem(
        "agocode.progress.chapter-1.recap",
        JSON.stringify({ completedAt: new Date().toISOString(), exerciseId: "chapter-1-recap" }),
      );
    }
  }

  return (
    <div className="chapter-recap-check">
      <div className="chapter-recap-check__header">
        <div>
          <div className="eyebrow">Cumulative retrieval</div>
          <h2>Can you connect the whole chapter without reopening each lesson?</h2>
        </div>
        <span className="mono">{submitted ? `${score}/${questions.length}` : `${questions.length} prompts`}</span>
      </div>

      <div className="chapter-recap-check__questions">
        {questions.map((question, index) => {
          const selected = answers[question.id];
          const correct = selected === question.answer;
          return (
            <fieldset className="reasoning-question" key={question.id}>
              <legend>
                <span>{String(index + 1).padStart(2, "0")}</span>
                {question.prompt}
              </legend>
              <div className="reasoning-options">
                {question.options.map((option) => (
                  <label
                    className={`reasoning-option ${submitted && selected === option.id ? (correct ? "reasoning-option--correct" : "reasoning-option--wrong") : ""}`}
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
                  {correct ? "✓ " : "Review: "}{question.feedback}
                </p>
              ) : null}
            </fieldset>
          );
        })}
      </div>

      <div className="chapter-recap-check__footer">
        <button className="button button--primary" type="button" onClick={check} disabled={!complete}>
          Check chapter recall
        </button>
        {submitted ? (
          <p className={passed ? "explain-result explain-result--mastered" : "explain-result"} aria-live="polite">
            {passed
              ? "Chapter 1 recall is complete. The next review should happen after some delay, not immediately."
              : "Use the feedback above, then answer again from the underlying idea rather than memorizing the option."}
          </p>
        ) : null}
      </div>
    </div>
  );
}
