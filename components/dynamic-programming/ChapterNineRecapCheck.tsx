"use client";

import { useMemo, useState } from "react";

type Question = {
  id: string;
  prompt: string;
  options: { id: string; label: string }[];
  answer: string;
  feedback: string;
};

const questions: Question[] = [
  {
    id: "cell",
    prompt: "What should one dynamic-programming grid cell represent?",
    options: [
      { id: "a", label: "A solved subproblem with a precise state, such as items seen so far and remaining capacity." },
      { id: "b", label: "A random intermediate value that only becomes meaningful after the whole grid is full." },
      { id: "c", label: "A complete brute-force enumeration of every solution." },
    ],
    answer: "a",
    feedback: "The grid works because each cell has a stable subproblem meaning. That meaning determines the axes and the recurrence.",
  },
  {
    id: "knapsack",
    prompt: "When the current 0/1 knapsack item fits, what comparison fills the cell?",
    options: [
      { id: "a", label: "max(previous best, current item value + best previous-row value for the leftover capacity)" },
      { id: "b", label: "Always take the current item." },
      { id: "c", label: "Always copy the cell immediately to the left." },
    ],
    answer: "a",
    feedback: "The recurrence combines two smaller solved choices: exclude the item, or include it and reuse the leftover-capacity subproblem.",
  },
  {
    id: "monotone",
    prompt: "Why does adding another item row never make the best knapsack value worse?",
    options: [
      { id: "a", label: "The old solution is still available, so every new cell can at least carry the previous best forward." },
      { id: "b", label: "Every new item must be selected." },
      { id: "c", label: "Capacity automatically increases on each row." },
    ],
    answer: "a",
    feedback: "A new row adds an option; it does not remove the previous solution. The best-known value therefore cannot decrease.",
  },
  {
    id: "substring",
    prompt: "For longest common substring, what happens when the current letters differ?",
    options: [
      { id: "a", label: "Reset the cell to 0 because the contiguous match is broken." },
      { id: "b", label: "Take max(up, left)." },
      { id: "c", label: "Add one to the diagonal anyway." },
    ],
    answer: "a",
    feedback: "A substring must stay contiguous. A mismatch breaks the run, so the value at that ending position becomes zero.",
  },
  {
    id: "subsequence",
    prompt: "For longest common subsequence, what happens when the current letters differ?",
    options: [
      { id: "a", label: "Keep the better result from above or left." },
      { id: "b", label: "Always reset to 0." },
      { id: "c", label: "Multiply the neighboring cells." },
    ],
    answer: "a",
    feedback: "A subsequence may skip characters, so a mismatch can preserve the best ordered match found by dropping one prefix character from either side.",
  },
  {
    id: "fit",
    prompt: "When is a dynamic-programming formulation a natural fit?",
    options: [
      { id: "a", label: "When a constrained optimization problem can be decomposed into reusable, well-defined subproblems." },
      { id: "b", label: "Whenever the input is sorted." },
      { id: "c", label: "Only when a greedy rule already gives the exact answer." },
    ],
    answer: "a",
    feedback: "The chapter emphasizes constrained optimization, reusable subproblems, and choosing grid axes that make those subproblems explicit.",
  },
];

export function ChapterNineRecapCheck() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const score = useMemo(() => questions.filter((question) => answers[question.id] === question.answer).length, [answers]);
  const complete = questions.every((question) => Boolean(answers[question.id]));
  const passed = submitted && score === questions.length;

  function check() {
    if (!complete) return;
    setSubmitted(true);
    if (score === questions.length) {
      localStorage.setItem(
        "agocode.progress.chapter-9.recap",
        JSON.stringify({ completedAt: new Date().toISOString(), exerciseId: "chapter-9-recap" }),
      );
    }
  }

  return (
    <div className="chapter-recap-check">
      <div className="chapter-recap-check__header">
        <div>
          <div className="eyebrow">Cumulative retrieval</div>
          <h2>Can you recover the grid meaning before the formulas?</h2>
        </div>
        <span className="mono">{submitted ? `${score}/${questions.length}` : `${questions.length} prompts`}</span>
      </div>

      <div className="chapter-recap-check__questions">
        {questions.map((question, index) => {
          const selected = answers[question.id];
          const correct = selected === question.answer;
          return (
            <fieldset className="reasoning-question" key={question.id}>
              <legend><span>{String(index + 1).padStart(2, "0")}</span>{question.prompt}</legend>
              <div className="reasoning-options">
                {question.options.map((option) => (
                  <label className={`reasoning-option ${submitted && selected === option.id ? (correct ? "reasoning-option--correct" : "reasoning-option--wrong") : ""}`} key={option.id}>
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
              {submitted ? <p className={correct ? "reasoning-feedback reasoning-feedback--correct" : "reasoning-feedback"}>{correct ? "✓ " : "Review: "}{question.feedback}</p> : null}
            </fieldset>
          );
        })}
      </div>

      <div className="chapter-recap-check__footer">
        <button className="button button--primary" type="button" onClick={check} disabled={!complete}>Check Chapter 9 recall</button>
        {submitted ? <p className={passed ? "explain-result explain-result--mastered" : "explain-result"} aria-live="polite">{passed ? "Chapter 9 recall is complete. You can reconstruct the subproblem meaning, knapsack recurrence, and the key substring/subsequence distinction." : "Use the feedback to repair the weak point, then answer again without reopening the lesson."}</p> : null}
      </div>
    </div>
  );
}
