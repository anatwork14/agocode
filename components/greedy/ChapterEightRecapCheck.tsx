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
    id: "local",
    prompt: "What defines a greedy step?",
    options: [
      { id: "a", label: "Choose the locally best move available now." },
      { id: "b", label: "Enumerate every complete solution before choosing." },
      { id: "c", label: "Always split the input exactly in half." },
    ],
    answer: "a",
    feedback: "Greedy algorithms commit to a locally attractive choice and continue without exploring every complete alternative.",
  },
  {
    id: "schedule",
    prompt: "Which local rule solves the classroom interval-scheduling example optimally?",
    options: [
      { id: "a", label: "Pick the compatible class that ends earliest." },
      { id: "b", label: "Pick the longest class first." },
      { id: "c", label: "Pick the class with the latest start time." },
    ],
    answer: "a",
    feedback: "Finishing as early as possible preserves the largest remaining time window for later compatible classes.",
  },
  {
    id: "knapsack",
    prompt: "What does the greedy knapsack counterexample teach?",
    options: [
      { id: "a", label: "A plausible local rule can miss the global optimum." },
      { id: "b", label: "Greedy algorithms are never useful." },
      { id: "c", label: "The heaviest item is always optimal." },
    ],
    answer: "a",
    feedback: "Greedy can be optimal for some problems and only approximate for others. The rule must match the problem structure.",
  },
  {
    id: "setcover",
    prompt: "What does the set-cover approximation choose at each step?",
    options: [
      { id: "a", label: "The option covering the most currently uncovered requirements." },
      { id: "b", label: "The first option alphabetically." },
      { id: "c", label: "The option with the most total items, even if they are already covered." },
    ],
    answer: "a",
    feedback: "Only newly covered requirements count toward the next greedy choice.",
  },
  {
    id: "np",
    prompt: "Which clue often signals a hard combinatorial problem?",
    options: [
      { id: "a", label: "You seem forced to consider all combinations or all possible versions." },
      { id: "b", label: "The input contains integers." },
      { id: "c", label: "The problem uses a queue." },
    ],
    answer: "a",
    feedback: "Explosive search over all combinations is a classic warning sign that exact enumeration may become impractical.",
  },
  {
    id: "approx",
    prompt: "How should an approximation algorithm be judged?",
    options: [
      { id: "a", label: "By both runtime and how close the result is to optimal." },
      { id: "b", label: "Only by whether its code is short." },
      { id: "c", label: "Only by asymptotic memory use." },
    ],
    answer: "a",
    feedback: "Approximation is a trade-off: solve the hard problem quickly while staying acceptably close to the best possible answer.",
  },
];

export function ChapterEightRecapCheck() {
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
        "agocode.progress.chapter-8.recap",
        JSON.stringify({ completedAt: new Date().toISOString(), exerciseId: "chapter-8-recap" }),
      );
    }
  }

  return (
    <div className="chapter-recap-check">
      <div className="chapter-recap-check__header">
        <div>
          <div className="eyebrow">Cumulative retrieval</div>
          <h2>Can you separate greedy optimality from greedy approximation?</h2>
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
        <button className="button button--primary" type="button" onClick={check} disabled={!complete}>Check Chapter 8 recall</button>
        {submitted ? <p className={passed ? "explain-result explain-result--mastered" : "explain-result"} aria-live="polite">{passed ? "Chapter 8 recall is complete. You can distinguish greedy choice, counterexamples, approximation, and hard combinatorial search." : "Repair the weak point from feedback, then answer again without reopening the lesson."}</p> : null}
      </div>
    </div>
  );
}
