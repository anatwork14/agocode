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
    id: "base-case",
    prompt: "What makes a base case different from a recursive case?",
    options: [
      { id: "a", label: "The base case returns without another self-call." },
      { id: "b", label: "The base case always returns zero." },
      { id: "c", label: "The base case runs after every recursive call." },
    ],
    answer: "a",
    feedback: "A stopping case answers a small input directly. The recursive case makes another call on a smaller problem.",
  },
  {
    id: "progress",
    prompt: "A recursive countdown has a stopping condition, but every call increases n. What is still wrong?",
    options: [
      { id: "a", label: "Nothing. A base case is enough by itself." },
      { id: "b", label: "The recursive step is not moving toward the stopping condition." },
      { id: "c", label: "Recursion cannot be used for countdowns." },
    ],
    answer: "b",
    feedback: "A correct recursive design needs both a stopping case and progress toward it on every recursive path.",
  },
  {
    id: "paused-caller",
    prompt: "Function A calls function B before A has finished. Where does A's unfinished state go?",
    options: [
      { id: "a", label: "It is discarded and recomputed later." },
      { id: "b", label: "It remains in A's call frame while B runs on top of it." },
      { id: "c", label: "It is copied into B's local variables." },
    ],
    answer: "b",
    feedback: "The call stack preserves the caller's local state and return position while the child call executes.",
  },
  {
    id: "top-frame",
    prompt: "What does the top frame of the call stack represent?",
    options: [
      { id: "a", label: "The oldest function call." },
      { id: "b", label: "The function call currently executing." },
      { id: "c", label: "The function with the most local variables." },
    ],
    answer: "b",
    feedback: "Calls are pushed and returned in last-in, first-out order, so the most recent unfinished call is on top.",
  },
  {
    id: "unwind",
    prompt: "In factorial(4), why can the multiplication happen while the stack unwinds?",
    options: [
      { id: "a", label: "Each suspended frame kept its own n while waiting for the smaller result." },
      { id: "b", label: "The base case secretly stores every multiplication." },
      { id: "c", label: "Python recalculates all earlier calls from scratch." },
    ],
    answer: "a",
    feedback: "Each waiting frame preserves its local n, so returned child results can be combined as callers resume in reverse order.",
  },
];

export function ChapterThreeRecapCheck() {
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
        "agocode.progress.chapter-3.recap",
        JSON.stringify({ completedAt: new Date().toISOString(), exerciseId: "chapter-3-recap" }),
      );
    }
  }

  return (
    <div className="chapter-recap-check">
      <div className="chapter-recap-check__header">
        <div>
          <div className="eyebrow">Cumulative retrieval</div>
          <h2>Can you reconstruct recursion as a control-flow model, not just a syntax pattern?</h2>
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
          Check Chapter 3 recall
        </button>
        {submitted ? (
          <p className={passed ? "explain-result explain-result--mastered" : "explain-result"} aria-live="polite">
            {passed
              ? "Chapter 3 recall is complete. You now have the stack model needed for divide-and-conquer and Quicksort."
              : "Use the feedback to repair the mental model, then answer again without reopening the lesson."}
          </p>
        ) : null}
      </div>
    </div>
  );
}
