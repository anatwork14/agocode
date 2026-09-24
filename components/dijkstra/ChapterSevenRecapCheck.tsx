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
    id: "bfs-vs-dijkstra",
    prompt: "When should you move from BFS to Dijkstra's algorithm?",
    options: [
      { id: "a", label: "When edges carry different non-negative weights and you want minimum total weight." },
      { id: "b", label: "Whenever the graph has more than five nodes." },
      { id: "c", label: "Only when the graph is a tree." },
    ],
    answer: "a",
    feedback: "BFS minimizes edge count in an unweighted graph; Dijkstra minimizes total non-negative edge weight.",
  },
  {
    id: "cheapest",
    prompt: "What node does Dijkstra process next?",
    options: [
      { id: "a", label: "The unprocessed node with the smallest current known cost." },
      { id: "b", label: "The most recently discovered node." },
      { id: "c", label: "The node with the most outgoing edges." },
    ],
    answer: "a",
    feedback: "The greedy step is to finalize the cheapest unprocessed node currently known.",
  },
  {
    id: "relax",
    prompt: "What does relaxing an edge mean?",
    options: [
      { id: "a", label: "Test whether going through the current node gives a cheaper cost to a neighbor, and update it if so." },
      { id: "b", label: "Delete the edge after using it." },
      { id: "c", label: "Sort the graph by node name." },
    ],
    answer: "a",
    feedback: "Relaxation compares the old neighbor cost with current_cost + edge_weight and updates cost/parent when the new route is cheaper.",
  },
  {
    id: "parents",
    prompt: "Why keep a parent table?",
    options: [
      { id: "a", label: "To reconstruct the actual minimum-cost path after the cost table is finished." },
      { id: "b", label: "To count the number of graph nodes." },
      { id: "c", label: "To detect hash collisions." },
    ],
    answer: "a",
    feedback: "Whenever a cheaper route is found, its predecessor becomes the new parent. Following parents backward recovers the path.",
  },
  {
    id: "negative",
    prompt: "Why are negative-weight edges unsafe for Dijkstra?",
    options: [
      { id: "a", label: "A node that looked cheapest and was finalized can later become cheaper through a negative edge." },
      { id: "b", label: "Negative numbers cannot be stored in a graph." },
      { id: "c", label: "They make the queue FIFO instead of LIFO." },
    ],
    answer: "a",
    feedback: "Dijkstra depends on processed costs never improving later. Negative edges can violate that greedy finalization assumption.",
  },
  {
    id: "state",
    prompt: "Which state mirrors the chapter's implementation?",
    options: [
      { id: "a", label: "Weighted graph, costs, parents, and processed nodes." },
      { id: "b", label: "Only one stack of recursive frames." },
      { id: "c", label: "One sorted array and two pointers." },
    ],
    answer: "a",
    feedback: "The implementation keeps the weighted adjacency map plus evolving cost, parent, and processed state.",
  },
];

export function ChapterSevenRecapCheck() {
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
        "agocode.progress.chapter-7.recap",
        JSON.stringify({ completedAt: new Date().toISOString(), exerciseId: "chapter-7-recap" }),
      );
    }
  }

  return (
    <div className="chapter-recap-check">
      <div className="chapter-recap-check__header">
        <div>
          <div className="eyebrow">Cumulative retrieval</div>
          <h2>Can you recover Dijkstra from the cheapest-node invariant?</h2>
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
        <button className="button button--primary" type="button" onClick={check} disabled={!complete}>Check Chapter 7 recall</button>
        {submitted ? (
          <p className={passed ? "explain-result explain-result--mastered" : "explain-result"} aria-live="polite">
            {passed
              ? "Chapter 7 recall is complete. The next delayed review should make you rebuild the relax-and-parent logic without reopening the trace."
              : "Repair the mechanism first: cheapest unprocessed node → relax neighbors → update parents → process node → reconstruct path."}
          </p>
        ) : null}
      </div>
    </div>
  );
}
