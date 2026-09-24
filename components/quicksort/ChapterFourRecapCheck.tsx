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
    id: "dc-strategy",
    prompt: "Which pair of questions best describes divide and conquer?",
    options: [
      { id: "a", label: "Choose a base case, then reduce every harder input toward it." },
      { id: "b", label: "Choose the fastest loop, then remove recursion." },
      { id: "c", label: "Split into exactly two equal halves every time." },
    ],
    answer: "a",
    feedback: "D&C is a recursive problem-solving strategy: identify a simple case, then make the problem smaller until that case is reached.",
  },
  {
    id: "quicksort-base",
    prompt: "What is the natural base case for Quicksort on arrays?",
    options: [
      { id: "a", label: "Any array whose first value is the smallest." },
      { id: "b", label: "Arrays with zero or one item." },
      { id: "c", label: "Only an empty array." },
    ],
    answer: "b",
    feedback: "An empty or one-item array is already sorted, so no partition or recursive call is necessary.",
  },
  {
    id: "partition",
    prompt: "After choosing a pivot, what makes the recursive Quicksort subproblems valid?",
    options: [
      { id: "a", label: "Every remaining value is placed on a side according to its comparison with the pivot." },
      { id: "b", label: "Both sides are guaranteed to have exactly the same length." },
      { id: "c", label: "The pivot must be the smallest value." },
    ],
    answer: "a",
    feedback: "Partitioning establishes order relative to the pivot while producing smaller arrays that can be sorted recursively.",
  },
  {
    id: "combine",
    prompt: "Why is sorted-left + [pivot] + sorted-right sorted?",
    options: [
      { id: "a", label: "The recursive calls randomly produce a correct order." },
      { id: "b", label: "Left and right are sorted recursively, and partitioning already established their relation to the pivot." },
      { id: "c", label: "Concatenation automatically sorts arrays in Python." },
    ],
    answer: "b",
    feedback: "The partition invariant plus recursively sorted sides makes the concatenation correct.",
  },
  {
    id: "runtime",
    prompt: "Which Quicksort shape produces the worst case?",
    options: [
      { id: "a", label: "Repeatedly balanced partitions, giving a shallow call stack." },
      { id: "b", label: "Repeatedly lopsided partitions, where one side is almost the whole array." },
      { id: "c", label: "Any input containing duplicate values." },
    ],
    answer: "b",
    feedback: "Lopsided splits can create O(n) recursion depth and O(n²) total work; balanced splits lead to logarithmic levels and O(n log n) work.",
  },
  {
    id: "growth",
    prompt: "How is Quicksort commonly summarized by growth rate?",
    options: [
      { id: "a", label: "O(n log n) average case; O(n²) worst case." },
      { id: "b", label: "O(log n) average case; O(n) worst case." },
      { id: "c", label: "O(n²) in every case." },
    ],
    answer: "a",
    feedback: "Balanced partitions are common enough for the average behavior to be O(n log n), while pathological pivot choices can produce O(n²).",
  },
];

export function ChapterFourRecapCheck() {
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
        "agocode.progress.chapter-4.recap",
        JSON.stringify({ completedAt: new Date().toISOString(), exerciseId: "chapter-4-recap" }),
      );
    }
  }

  return (
    <div className="chapter-recap-check">
      <div className="chapter-recap-check__header">
        <div>
          <div className="eyebrow">Cumulative retrieval</div>
          <h2>Can you recover Quicksort from the divide-and-conquer structure?</h2>
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
          Check Chapter 4 recall
        </button>
        {submitted ? (
          <p className={passed ? "explain-result explain-result--mastered" : "explain-result"} aria-live="polite">
            {passed
              ? "Chapter 4 recall is complete. You can now explain the reduction, partition invariant, recursive combine, and pivot-dependent runtime shape."
              : "Use the feedback to repair the underlying model, then answer again without reopening the lesson."}
          </p>
        ) : null}
      </div>
    </div>
  );
}
