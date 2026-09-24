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
    id: "address",
    prompt: "What does a memory address give a program?",
    options: [
      { id: "a", label: "A way to locate a stored value." },
      { id: "b", label: "A guarantee that values are sorted." },
      { id: "c", label: "A faster CPU instruction." },
    ],
    answer: "a",
    feedback: "The chapter's memory model uses addresses as coordinates for stored values.",
  },
  {
    id: "random-read",
    prompt: "Why can an array read a known index quickly?",
    options: [
      { id: "a", label: "Its elements are contiguous, so the target address can be calculated directly." },
      { id: "b", label: "Every element stores the address of the next one." },
      { id: "c", label: "The array is always sorted." },
    ],
    answer: "a",
    feedback: "Contiguous placement makes direct index-to-address calculation possible.",
  },
  {
    id: "insert",
    prompt: "If the insertion location is already known, why can a linked list insert cheaply?",
    options: [
      { id: "a", label: "Only a small number of links need to change." },
      { id: "b", label: "All later nodes automatically move together." },
      { id: "c", label: "Linked lists use binary search internally." },
    ],
    answer: "a",
    feedback: "Once the position is known, insertion can be pointer rewiring rather than shifting a contiguous tail.",
  },
  {
    id: "selection",
    prompt: "What does one pass of Selection Sort prove?",
    options: [
      { id: "a", label: "Which remaining value is smallest and can occupy the next output position." },
      { id: "b", label: "That the entire list is already sorted." },
      { id: "c", label: "Which midpoint splits the list in half." },
    ],
    answer: "a",
    feedback: "Selection Sort solves one output position per pass by finding one extremal remaining value.",
  },
  {
    id: "runtime",
    prompt: "Why is Selection Sort O(n²) even though the scans get shorter?",
    options: [
      { id: "a", label: "The total work still grows like n + (n−1) + … + 1, which is proportional to n²." },
      { id: "b", label: "Every comparison itself takes O(n)." },
      { id: "c", label: "Moving one value always copies the entire computer memory." },
    ],
    answer: "a",
    feedback: "The shrinking scans sum to a quadratic amount of work; constant factors are omitted in Big O notation.",
  },
];

export function ChapterTwoRecapCheck() {
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
        "agocode.progress.chapter-2.recap",
        JSON.stringify({ completedAt: new Date().toISOString(), exerciseId: "chapter-2-recap" }),
      );
    }
  }

  return (
    <div className="chapter-recap-check">
      <div className="chapter-recap-check__header">
        <div>
          <div className="eyebrow">Cumulative retrieval</div>
          <h2>Can you connect memory layout, structure trade-offs, and sorting cost?</h2>
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
          Check Chapter 2 recall
        </button>
        {submitted ? (
          <p className={passed ? "explain-result explain-result--mastered" : "explain-result"} aria-live="polite">
            {passed
              ? "Chapter 2 recall is complete. You can now move into recursion with a stronger memory and data-structure model."
              : "Use the feedback to repair the mental model, then answer again without memorizing option positions."}
          </p>
        ) : null}
      </div>
    </div>
  );
}
