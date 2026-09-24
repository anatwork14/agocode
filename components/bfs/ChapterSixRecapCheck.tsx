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
    id: "graph",
    prompt: "What do a graph's nodes and edges represent?",
    options: [
      { id: "a", label: "Nodes represent entities or states; edges represent relationships or transitions." },
      { id: "b", label: "Nodes are always cities; edges are always distances." },
      { id: "c", label: "Nodes are array indexes; edges are hash collisions." },
    ],
    answer: "a",
    feedback: "Graphs are a modeling tool. The meaning of a node or edge comes from the problem being represented.",
  },
  {
    id: "questions",
    prompt: "What two questions can BFS answer in an unweighted graph?",
    options: [
      { id: "a", label: "Whether a path exists, and a shortest path by number of edges." },
      { id: "b", label: "Only whether the graph contains a cycle." },
      { id: "c", label: "The minimum weighted travel time for arbitrary edge costs." },
    ],
    answer: "a",
    feedback: "BFS can establish reachability and, when every edge counts equally, find a path with the fewest edges.",
  },
  {
    id: "queue",
    prompt: "Why does BFS use a FIFO queue?",
    options: [
      { id: "a", label: "So earlier-discovered nodes are processed before later, deeper nodes." },
      { id: "b", label: "Because queues sort node names alphabetically." },
      { id: "c", label: "Because a stack cannot store nodes." },
    ],
    answer: "a",
    feedback: "FIFO order preserves layer-by-layer exploration, which is the reason the first target path has minimum edge count.",
  },
  {
    id: "visited",
    prompt: "Why keep a visited/discovered set?",
    options: [
      { id: "a", label: "To avoid repeated work and prevent cycles from re-adding the same nodes forever." },
      { id: "b", label: "To make the graph directed." },
      { id: "c", label: "To sort the queue." },
    ],
    answer: "a",
    feedback: "Shared neighbors and cycles can cause repeated discovery. Remembering seen nodes keeps the search finite and efficient.",
  },
  {
    id: "runtime",
    prompt: "What is the standard BFS runtime with adjacency lists?",
    options: [
      { id: "a", label: "O(V + E)" },
      { id: "b", label: "O(log V)" },
      { id: "c", label: "O(V!)" },
    ],
    answer: "a",
    feedback: "A full BFS can visit every vertex and inspect every edge once, giving O(V + E).",
  },
  {
    id: "boundary",
    prompt: "When is BFS no longer enough for a shortest-path problem?",
    options: [
      { id: "a", label: "When edges have different costs and 'shortest' means minimum total weight rather than fewest edges." },
      { id: "b", label: "When the graph has more than ten nodes." },
      { id: "c", label: "When the graph is stored in a hash table." },
    ],
    answer: "a",
    feedback: "BFS minimizes edge count. Weighted shortest paths require a different model and lead into Dijkstra's algorithm.",
  },
];

export function ChapterSixRecapCheck() {
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
        "agocode.progress.chapter-6.recap",
        JSON.stringify({ completedAt: new Date().toISOString(), exerciseId: "chapter-6-recap" }),
      );
    }
  }

  return (
    <div className="chapter-recap-check">
      <div className="chapter-recap-check__header">
        <div>
          <div className="eyebrow">Cumulative retrieval</div>
          <h2>Can you recover BFS from the graph model and queue invariant?</h2>
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
        <button className="button button--primary" type="button" onClick={check} disabled={!complete}>Check Chapter 6 recall</button>
        {submitted ? (
          <p className={passed ? "explain-result explain-result--mastered" : "explain-result"} aria-live="polite">
            {passed
              ? "Chapter 6 recall is complete. You can now explain graph modeling, FIFO layer order, cycle protection, shortest unweighted paths, and O(V + E)."
              : "Use the feedback to repair the model, then answer again without reopening the lesson."}
          </p>
        ) : null}
      </div>
    </div>
  );
}
