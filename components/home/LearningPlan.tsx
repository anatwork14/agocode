"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { readLearningEvidence } from "@/lib/learning/evidence";

type PlanStep = {
  key: string;
  title: string;
  description: string;
  href: string;
  label: string;
};

const DAY_MS = 24 * 60 * 60 * 1000;

const learningSteps: readonly PlanStep[] = [
  { key: "agocode.progress.binary-search.rebuild", label: "Build recall", title: "Rebuild Binary Search", description: "Write the algorithm without copying the finished implementation, then pass the edge-case tests.", href: "/learn/binary-search#rebuild" },
  { key: "agocode.progress.binary-search.explain", label: "Explain", title: "Defend the invariant", description: "Explain sorted input, the candidate interval, and logarithmic growth.", href: "/learn/binary-search#explain" },
  { key: "agocode.progress.chapter-1.running-time", label: "Book Track", title: "Continue with Running Time", description: "Move from one fast algorithm to the larger question: how does the work grow with input size?", href: "/learn/running-time" },
  { key: "agocode.progress.chapter-1.big-o", label: "Book Track", title: "Give growth a language", description: "Use Big O to compare common growth classes and reason about worst-case scaling.", href: "/learn/big-o" },
  { key: "agocode.progress.chapter-1.tsp", label: "Book Track", title: "See factorial growth explode", description: "Finish the chapter story with the brute-force Traveling Salesperson search space.", href: "/learn/traveling-salesperson" },
  { key: "agocode.progress.chapter-1.recap", label: "Recall", title: "Reconstruct Chapter 1", description: "Connect search, growth, Big O, and factorial explosion without rereading first.", href: "/learn/chapter-1-recap" },
  { key: "agocode.progress.binary-search.transfer-01", label: "Transfer", title: "Insertion boundary", description: "Apply the invariant where the target may be absent.", href: "/practice/binary-search" },
  { key: "agocode.progress.binary-search.transfer-02", label: "Transfer", title: "First occurrence boundary", description: "Change what equality means and keep searching until the left boundary is proven.", href: "/practice/binary-search/boundary" },
  { key: "agocode.progress.binary-search.transfer-03", label: "Pattern transfer", title: "Rotated ordered array", description: "Recognize the discard-region idea after global sorted order has been disrupted.", href: "/practice/binary-search/rotated" },
  { key: "agocode.progress.binary-search.transfer-04", label: "Mixed transfer", title: "Search the answer space", description: "Use monotonic feasibility when candidates are possible answers rather than input positions.", href: "/practice/binary-search/answer-space" },
  { key: "agocode.progress.binary-search.rebuild-blank", label: "Delayed recall", title: "Rebuild without the reminder", description: "Start from only the function signature and recover binary search from memory.", href: "/practice/binary-search/rebuild" },
  { key: "agocode.progress.binary-search.bug-repair", label: "Debugging recall", title: "Repair a boundary bug", description: "Use failing edge cases and the interval invariant to diagnose an off-by-one error.", href: "/practice/binary-search/bug-repair" },
  { key: "agocode.progress.chapter-2.memory", label: "Chapter 02", title: "Build the memory model", description: "Make addresses, contiguous storage, and relocation concrete.", href: "/learn/memory" },
  { key: "agocode.progress.chapter-2.arrays-lists", label: "Chapter 02", title: "Compare arrays and linked lists", description: "Connect physical layout to read, traversal, insertion, and deletion costs.", href: "/learn/arrays-linked-lists" },
  { key: "agocode.progress.selection-sort.rebuild", label: "Chapter 02", title: "Trace and rebuild Selection Sort", description: "Predict each selected minimum, see the quadratic scan pattern, then write the algorithm yourself.", href: "/learn/selection-sort" },
  { key: "agocode.progress.chapter-2.recap", label: "Recall", title: "Reconstruct Chapter 2", description: "Connect memory layout, structure trade-offs, repeated selection, and O(n²).", href: "/learn/chapter-2-recap" },
  { key: "agocode.progress.recursion.factorial-rebuild", label: "Chapter 03", title: "Make recursion visible", description: "Identify base/recursive cases and watch the call stack grow and unwind.", href: "/learn/recursion" },
  { key: "agocode.progress.chapter-3.recap", label: "Recall", title: "Reconstruct Recursion", description: "Retrieve the base case, progress rule, paused-caller model, and stack unwinding.", href: "/learn/chapter-3-recap" },
  { key: "agocode.progress.divide-conquer.sum-rebuild", label: "Chapter 04", title: "Reduce the problem", description: "Learn divide and conquer as two questions: identify the base case, then make the same problem smaller.", href: "/learn/divide-and-conquer" },
  { key: "agocode.progress.quicksort.rebuild", label: "Chapter 04", title: "Partition with a pivot", description: "Trace Quicksort, compare balanced and lopsided recursion, then rebuild it from the D&C structure.", href: "/learn/quicksort" },
  { key: "agocode.progress.chapter-4.recap", label: "Recall", title: "Reconstruct Chapter 4", description: "Recover divide and conquer, partitioning, recursive combine, and pivot-dependent runtime.", href: "/learn/chapter-4-recap" },
  { key: "agocode.progress.hash-tables.duplicate-filter", label: "Chapter 05", title: "Make keys point directly to state", description: "Learn hash functions, common lookup use cases, collisions, load factor, and then use a built-in hash-backed set for duplicate detection.", href: "/learn/hash-tables" },
  { key: "agocode.progress.chapter-5.recap", label: "Recall", title: "Reconstruct Hash Tables", description: "Connect key→bucket mapping, collisions, use cases, and average-case performance without reopening the lesson.", href: "/learn/chapter-5-recap" },
  { key: "agocode.progress.bfs.rebuild", label: "Chapter 06", title: "Search a graph by layers", description: "Model relationships as a graph, make FIFO queue order visible, trace a shortest unweighted path, and rebuild BFS yourself.", href: "/learn/breadth-first-search" },
  { key: "agocode.progress.chapter-6.recap", label: "Recall", title: "Reconstruct Breadth-First Search", description: "Recover graph modeling, FIFO layer order, visited-state protection, shortest-path reasoning, and O(V + E).", href: "/learn/chapter-6-recap" },
  { key: "agocode.progress.dijkstra.rebuild", label: "Chapter 07", title: "Minimize weighted path cost", description: "Compare BFS with weighted paths, trace cheapest-node selection and edge relaxation, then rebuild Dijkstra from cost and parent tables.", href: "/learn/dijkstra" },
  { key: "agocode.progress.chapter-7.recap", label: "Recall", title: "Reconstruct Dijkstra", description: "Recover weighted-graph reasoning, relaxation, parent reconstruction, and the negative-weight boundary.", href: "/learn/chapter-7-recap" },
  { key: "agocode.progress.greedy.scheduling", label: "Chapter 08", title: "Choose the earliest finish", description: "Trace interval scheduling and see why one local rule can produce an optimal non-overlapping schedule.", href: "/learn/greedy#schedule" },
  { key: "agocode.progress.greedy.set-cover", label: "Chapter 08", title: "Approximate set cover", description: "Choose the option that covers the most still-uncovered requirements and watch a hard exact search become a practical approximation.", href: "/learn/greedy#set-cover" },
  { key: "agocode.progress.chapter-8.recap", label: "Recall", title: "Reconstruct Greedy Algorithms", description: "Separate proven greedy optimality from approximation, counterexamples, and hard combinatorial search.", href: "/learn/chapter-8-recap" },
  { key: "agocode.progress.dynamic-programming.knapsack-grid", label: "Chapter 09", title: "Build the knapsack grid", description: "Give every cell a subproblem meaning, then fill the table by comparing carry-forward and include-item choices.", href: "/learn/dynamic-programming#cell" },
  { key: "agocode.progress.dynamic-programming.knapsack-rebuild", label: "Chapter 09", title: "Rebuild the knapsack recurrence", description: "Write 0/1 knapsack from the cell invariant instead of copying a memorized nested loop.", href: "/learn/dynamic-programming#rebuild" },
  { key: "agocode.progress.dynamic-programming.sequence-grid", label: "Chapter 09", title: "Compare substring and subsequence", description: "Use the same two-word grid to see why mismatch means reset for substrings but max(up, left) for subsequences.", href: "/learn/dynamic-programming#strings" },
  { key: "agocode.progress.chapter-9.recap", label: "Recall", title: "Reconstruct Dynamic Programming", description: "Recover state meaning, grid axes, knapsack recurrence, model boundaries, and sequence-grid rules.", href: "/learn/chapter-9-recap" },
  { key: "agocode.progress.knn.classification", label: "Chapter 10", title: "Classify by neighborhood", description: "Predict before revealing the nearest labeled points, then watch distance turn a feature space into a classification decision.", href: "/learn/k-nearest-neighbors#classify" },
  { key: "agocode.progress.knn.rebuild", label: "Chapter 10", title: "Rebuild KNN classification", description: "Recover the feature → distance → nearest neighbors → vote pipeline in Python.", href: "/learn/k-nearest-neighbors#rebuild" },
  { key: "agocode.progress.chapter-10.recap", label: "Recall", title: "Reconstruct K-nearest neighbors", description: "Retrieve classification, regression, feature extraction, distance, k, and feature quality without rereading first.", href: "/learn/chapter-10-recap" },
];

const reviewSchedule = [
  ["agocode.progress.binary-search.rebuild", 1],
  ["agocode.progress.binary-search.explain", 2],
  ["agocode.progress.binary-search.transfer-01", 3],
  ["agocode.progress.binary-search.transfer-02", 4],
  ["agocode.progress.binary-search.transfer-03", 5],
  ["agocode.progress.binary-search.transfer-04", 6],
  ["agocode.progress.chapter-1.recap", 7],
  ["agocode.progress.binary-search.rebuild-blank", 8],
  ["agocode.progress.binary-search.bug-repair", 9],
  ["agocode.progress.selection-sort.rebuild", 3],
  ["agocode.progress.chapter-2.recap", 7],
  ["agocode.progress.recursion.factorial-rebuild", 3],
  ["agocode.progress.chapter-3.recap", 7],
  ["agocode.progress.divide-conquer.sum-rebuild", 3],
  ["agocode.progress.quicksort.rebuild", 3],
  ["agocode.progress.chapter-4.recap", 7],
  ["agocode.progress.hash-tables.duplicate-filter", 3],
  ["agocode.progress.chapter-5.recap", 7],
  ["agocode.progress.bfs.rebuild", 3],
  ["agocode.progress.chapter-6.recap", 7],
  ["agocode.progress.dijkstra.rebuild", 3],
  ["agocode.progress.chapter-7.recap", 7],
  ["agocode.progress.greedy.scheduling", 3],
  ["agocode.progress.greedy.set-cover", 4],
  ["agocode.progress.chapter-8.recap", 7],
  ["agocode.progress.dynamic-programming.knapsack-rebuild", 3],
  ["agocode.progress.dynamic-programming.sequence-grid", 4],
  ["agocode.progress.chapter-9.recap", 7],
  ["agocode.progress.knn.rebuild", 3],
  ["agocode.progress.chapter-10.recap", 7],
] as const;

const extraEvidenceKeys = [
  "agocode.progress.chapter-1.running-time",
  "agocode.progress.chapter-1.big-o",
  "agocode.progress.chapter-1.tsp",
  "agocode.progress.chapter-2.memory",
  "agocode.progress.chapter-2.arrays-lists",
] as const;

function hasProgress(key: string) {
  return Boolean(readLearningEvidence(localStorage, key)?.completedAt);
}

function getCompletionTime(key: string) {
  const completedAt = readLearningEvidence(localStorage, key)?.completedAt;
  return completedAt ? new Date(completedAt).getTime() : null;
}

function chooseNextStep(): Omit<PlanStep, "key"> {
  const next = learningSteps.find((step) => !hasProgress(step.key));
  if (next) return next;
  return {
    label: "Book finale",
    title: "Explore where to go next",
    description: "Chapter 11 broadens the map beyond the core sequence: trees, search indexes, transforms, parallel and distributed algorithms, probabilistic structures, and more.",
    href: "/roadmap",
  };
}

function countDueReviews(now: number) {
  return reviewSchedule.reduce((count, [key, days]) => {
    const completedAt = getCompletionTime(key);
    return completedAt !== null && completedAt + days * DAY_MS <= now ? count + 1 : count;
  }, 0);
}

function evidenceCount() {
  const keys = new Set<string>([
    ...learningSteps.map((step) => step.key),
    ...extraEvidenceKeys,
  ]);
  return [...keys].filter(hasProgress).length;
}

export function LearningPlan() {
  const [loaded, setLoaded] = useState(false);
  const [step, setStep] = useState<Omit<PlanStep, "key"> | null>(null);
  const [dueReviews, setDueReviews] = useState(0);
  const [evidence, setEvidence] = useState(0);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setStep(chooseNextStep());
      setDueReviews(countDueReviews(Date.now()));
      setEvidence(evidenceCount());
      setLoaded(true);
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  if (!loaded || !step) {
    return (
      <aside className="hero__aside" aria-label="Learning plan">
        <div className="hero__aside-label">Today</div>
        <h2>Preparing your next step…</h2>
        <p>Reading the learning evidence stored in this browser.</p>
      </aside>
    );
  }

  return (
    <aside className="hero__aside home-plan" aria-label="Learning plan">
      <div className="hero__aside-label">Today · {step.label}</div>
      <h2>{step.title}</h2>
      <p>{step.description}</p>
      <div className="home-plan__metrics">
        <div><strong>{evidence}</strong><span>completed evidence items</span></div>
        <div><strong>{dueReviews}</strong><span>reviews due</span></div>
      </div>
      <div className="action-row home-plan__actions">
        <Link className="button button--primary" href={step.href}>Start next step →</Link>
        {dueReviews > 0 ? <Link className="button" href="/review">Review due items</Link> : null}
      </div>
    </aside>
  );
}
