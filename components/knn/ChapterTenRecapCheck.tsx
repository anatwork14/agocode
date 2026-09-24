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
    id: "classification",
    prompt: "What does KNN classification do after finding the k nearest labeled examples?",
    options: [
      { id: "a", label: "Use their labels to decide the category, typically by majority vote." },
      { id: "b", label: "Average their labels as numbers." },
      { id: "c", label: "Ignore the neighbors and use the farthest example." },
    ],
    answer: "a",
    feedback: "Classification predicts a category from nearby labeled examples.",
  },
  {
    id: "features",
    prompt: "What is feature extraction?",
    options: [
      { id: "a", label: "Convert an item into a list of comparable numeric properties." },
      { id: "b", label: "Remove every property except the class label." },
      { id: "c", label: "Sort the training examples alphabetically." },
    ],
    answer: "a",
    feedback: "KNN needs coordinates. Feature extraction turns a fruit, viewer, image, or other item into numbers that distance can compare.",
  },
  {
    id: "distance",
    prompt: "What does Euclidean distance tell KNN?",
    options: [
      { id: "a", label: "How close two feature vectors are in the chosen feature space." },
      { id: "b", label: "Whether the data is already sorted." },
      { id: "c", label: "The asymptotic runtime of the algorithm." },
    ],
    answer: "a",
    feedback: "Distance is a similarity proxy only within the feature space you designed.",
  },
  {
    id: "regression",
    prompt: "How does basic KNN regression differ from classification?",
    options: [
      { id: "a", label: "It combines numeric responses from nearby examples, such as by averaging them." },
      { id: "b", label: "It never computes neighbors." },
      { id: "c", label: "It can only use one feature." },
    ],
    answer: "a",
    feedback: "The neighbor-search step stays the same; regression predicts a number instead of a category.",
  },
  {
    id: "k",
    prompt: "What does the k in k-nearest neighbors control?",
    options: [
      { id: "a", label: "How many nearby examples participate in the prediction." },
      { id: "b", label: "How many features every example must have." },
      { id: "c", label: "How many times the data is sorted." },
    ],
    answer: "a",
    feedback: "There is nothing inherently special about one fixed k; it is the neighborhood size used for the decision.",
  },
  {
    id: "quality",
    prompt: "Why can a perfectly computed distance still produce poor KNN results?",
    options: [
      { id: "a", label: "The selected features may be irrelevant, too narrow, or biased for the prediction target." },
      { id: "b", label: "Distance formulas only work in two dimensions." },
      { id: "c", label: "KNN requires every response to be a string." },
    ],
    answer: "a",
    feedback: "The chapter emphasizes that good features must actually capture the similarity that matters for the task.",
  },
];

export function ChapterTenRecapCheck() {
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
        "agocode.progress.chapter-10.recap",
        JSON.stringify({ completedAt: new Date().toISOString(), exerciseId: "chapter-10-recap" }),
      );
    }
  }

  return (
    <div className="chapter-recap-check">
      <div className="chapter-recap-check__header">
        <div>
          <div className="eyebrow">Cumulative retrieval</div>
          <h2>Can you reconstruct KNN from features, distance, neighbors, and prediction?</h2>
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
        <button className="button button--primary" type="button" onClick={check} disabled={!complete}>Check Chapter 10 recall</button>
        {submitted ? <p className={passed ? "explain-result explain-result--mastered" : "explain-result"} aria-live="polite">{passed ? "Chapter 10 recall is complete. You can rebuild the KNN pipeline and distinguish classification from regression." : "Repair the weak point from feedback, then answer again without reopening the lesson."}</p> : null}
      </div>
    </div>
  );
}
