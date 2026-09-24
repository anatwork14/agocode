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
    id: "composition",
    prompt: "What two pieces form the basic hash-table mental model?",
    options: [
      { id: "a", label: "A hash function and indexed storage such as an array." },
      { id: "b", label: "A sorted linked list and binary search." },
      { id: "c", label: "A recursion stack and a queue." },
    ],
    answer: "a",
    feedback: "The hash function turns a key into an array index; the array provides the underlying storage locations.",
  },
  {
    id: "consistency",
    prompt: "Why must a hash function be consistent for a fixed table size?",
    options: [
      { id: "a", label: "So the same key can be used later to find the location where its value was stored." },
      { id: "b", label: "So every possible key always gets a globally unique index." },
      { id: "c", label: "So keys become alphabetically sorted." },
    ],
    answer: "a",
    feedback: "If a key could hash to a different location each time, a later lookup would not know where the earlier insert placed it.",
  },
  {
    id: "use-cases",
    prompt: "Which set of problems naturally benefits from hash-backed lookup?",
    options: [
      { id: "a", label: "Key→value mapping, duplicate detection, and caching." },
      { id: "b", label: "Only sorting numeric arrays." },
      { id: "c", label: "Only recursive tree traversal." },
    ],
    answer: "a",
    feedback: "All three rely on fast access by a meaningful key: retrieve a value, test membership, or reuse a stored result.",
  },
  {
    id: "collision",
    prompt: "What is a collision?",
    options: [
      { id: "a", label: "Two different keys map to the same bucket." },
      { id: "b", label: "A key is inserted twice with exactly the same value." },
      { id: "c", label: "The array contains an empty slot." },
    ],
    answer: "a",
    feedback: "Collisions are normal because the key space is much larger than the finite set of buckets. The table needs a strategy to keep multiple entries reachable.",
  },
  {
    id: "performance",
    prompt: "Why can poor key distribution hurt hash-table performance?",
    options: [
      { id: "a", label: "Long collision chains add local searching after the bucket is chosen." },
      { id: "b", label: "Hash tables stop using arrays when a collision occurs." },
      { id: "c", label: "A collision forces the entire table to be sorted." },
    ],
    answer: "a",
    feedback: "Average O(1) behavior depends on keeping bucket work small. A pathological bucket can approach linear search.",
  },
  {
    id: "resize",
    prompt: "Why must existing keys be hashed again after the table capacity changes?",
    options: [
      { id: "a", label: "The valid bucket index depends on the array size, so changing capacity can change each key's destination." },
      { id: "b", label: "Resizing changes every key string." },
      { id: "c", label: "Rehashing is only needed for duplicate keys." },
    ],
    answer: "a",
    feedback: "The hash-to-index calculation is bounded by capacity, so a larger array requires redistributing existing entries into their new valid buckets.",
  },
];

export function ChapterFiveRecapCheck() {
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
        "agocode.progress.chapter-5.recap",
        JSON.stringify({ completedAt: new Date().toISOString(), exerciseId: "chapter-5-recap" }),
      );
    }
  }

  return (
    <div className="chapter-recap-check">
      <div className="chapter-recap-check__header">
        <div>
          <div className="eyebrow">Cumulative retrieval</div>
          <h2>Can you connect key lookup, collisions, and performance without reopening the lesson?</h2>
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
        <button className="button button--primary" type="button" onClick={check} disabled={!complete}>Check Chapter 5 recall</button>
        {submitted ? (
          <p className={passed ? "explain-result explain-result--mastered" : "explain-result"} aria-live="polite">
            {passed
              ? "Chapter 5 recall is complete. You can now reason from a key→bucket model through real use cases and the performance cost of collisions."
              : "Repair the mental model from the feedback, then answer again without rereading the chapter."}
          </p>
        ) : null}
      </div>
    </div>
  );
}
