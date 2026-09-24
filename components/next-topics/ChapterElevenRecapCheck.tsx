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
    id: "bst",
    prompt: "What ordering rule makes binary search tree search possible?",
    options: [
      { id: "a", label: "Values smaller than a node are on the left; larger values are on the right." },
      { id: "b", label: "Children are stored in insertion order only." },
      { id: "c", label: "Every node has exactly two children." },
    ],
    answer: "a",
    feedback: "The ordering lets each comparison discard one whole branch, much like binary search discards an interval.",
  },
  {
    id: "index",
    prompt: "What does an inverted index map?",
    options: [
      { id: "a", label: "A term to the documents or locations where it appears." },
      { id: "b", label: "A document to one random word." },
      { id: "c", label: "A graph node to its shortest path cost." },
    ],
    answer: "a",
    feedback: "Search becomes fast because the lookup direction is word → locations rather than rescanning every document.",
  },
  {
    id: "parallel",
    prompt: "Why does doubling the number of cores rarely halve runtime exactly?",
    options: [
      { id: "a", label: "Coordination overhead and uneven load can leave resources waiting." },
      { id: "b", label: "Parallel algorithms cannot split work." },
      { id: "c", label: "Big O forbids all speedups from hardware." },
    ],
    answer: "a",
    feedback: "Parallel work introduces its own costs, including splitting, merging, communication, and load balancing.",
  },
  {
    id: "mapreduce",
    prompt: "What conceptual roles do map and reduce play?",
    options: [
      { id: "a", label: "Map applies work independently to many items; reduce combines results into fewer outputs." },
      { id: "b", label: "Map sorts while reduce performs binary search." },
      { id: "c", label: "Map encrypts while reduce decrypts." },
    ],
    answer: "a",
    feedback: "That separation makes the map phase especially natural to distribute across workers.",
  },
  {
    id: "bloom",
    prompt: "What uncertainty does the chapter highlight for Bloom filters?",
    options: [
      { id: "a", label: "They may report a false positive, while an absent answer is definitive for the standard structure." },
      { id: "b", label: "They can only store integers." },
      { id: "c", label: "They always produce exact membership answers." },
    ],
    answer: "a",
    feedback: "The space saving comes from accepting probabilistic membership rather than storing every original key exactly.",
  },
  {
    id: "linear",
    prompt: "What kind of problem does linear programming frame?",
    options: [
      { id: "a", label: "Maximize or minimize an objective subject to constraints." },
      { id: "b", label: "Find only the nearest neighbor." },
      { id: "c", label: "Store strings in hash buckets." },
    ],
    answer: "a",
    feedback: "Linear programming provides a general optimization framework when objectives and constraints can be expressed appropriately.",
  },
];

export function ChapterElevenRecapCheck() {
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
        "agocode.progress.chapter-11.recap",
        JSON.stringify({ completedAt: new Date().toISOString(), exerciseId: "chapter-11-recap" }),
      );
    }
  }

  return (
    <div className="chapter-recap-check">
      <div className="chapter-recap-check__header">
        <div>
          <div className="eyebrow">Book Track finale</div>
          <h2>Can you connect the next topics to problems they are meant to solve?</h2>
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
        <button className="button button--primary" type="button" onClick={check} disabled={!complete}>Finish Book Track recall</button>
        {submitted ? <p className={passed ? "explain-result explain-result--mastered" : "explain-result"} aria-live="polite">{passed ? "The canonical Book Track is complete. Your next work should shift from chapter coverage toward transfer, mixed practice, and deeper topic branches." : "Use the feedback to reconnect each topic with its purpose, then retrieve the map again."}</p> : null}
      </div>
    </div>
  );
}
