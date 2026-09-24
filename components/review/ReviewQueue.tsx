"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { readLearningEvidence, recordRecallOutcome } from "@/lib/learning/evidence";

type ReviewItem = {
  key: string;
  exerciseId: string;
  title: string;
  description: string;
  href: string;
  dueAt: Date;
  delayDays: number;
  intervalDays: number | null;
  reviewSessions: number;
};

type ReviewDefinition = Omit<ReviewItem, "dueAt" | "exerciseId" | "intervalDays" | "reviewSessions">;

const DAY_MS = 24 * 60 * 60 * 1000;

const reviewDefinitions: ReviewDefinition[] = [
  { key: "agocode.progress.binary-search.rebuild", delayDays: 1, title: "Rebuild Binary Search", description: "Return without rereading the implementation. Reconstruct low, high, mid, and the two interval updates.", href: "/learn/binary-search#rebuild" },
  { key: "agocode.progress.binary-search.explain", delayDays: 2, title: "Explain the invariant", description: "Explain why sorted order makes a whole region disposable and what low…high promises after every update.", href: "/learn/binary-search#explain" },
  { key: "agocode.progress.binary-search.transfer-01", delayDays: 3, title: "Insertion boundary transfer", description: "Solve the insertion-position variant again and explain why the final low index is meaningful.", href: "/practice/binary-search" },
  { key: "agocode.progress.binary-search.transfer-02", delayDays: 4, title: "First-occurrence boundary", description: "Find the first duplicate again. Recall why equality becomes a candidate answer instead of an immediate return.", href: "/practice/binary-search/boundary" },
  { key: "agocode.progress.binary-search.transfer-03", delayDays: 5, title: "Rotated-array pattern recall", description: "Recover the structural observation that one side of a distinct rotated array around mid remains sorted.", href: "/practice/binary-search/rotated" },
  { key: "agocode.progress.binary-search.transfer-04", delayDays: 6, title: "Answer-space search recall", description: "Reconstruct why a monotonic feasibility predicate makes a range of possible answers searchable by binary search.", href: "/practice/binary-search/answer-space" },
  { key: "agocode.progress.chapter-1.recap", delayDays: 7, title: "Chapter 1 cumulative recall", description: "Reconnect Binary Search, running time, Big O, and factorial growth without rereading the chapter first.", href: "/learn/chapter-1-recap" },
  { key: "agocode.progress.binary-search.rebuild-blank", delayDays: 8, title: "Blank implementation recall", description: "Start from only the function signature and rebuild the loop, midpoint, and discard rules without embedded reminders.", href: "/practice/binary-search/rebuild" },
  { key: "agocode.progress.binary-search.bug-repair", delayDays: 9, title: "Boundary bug repair", description: "Diagnose the off-by-one loop condition again from failing boundary cases rather than from a clean reference solution.", href: "/practice/binary-search/bug-repair" },
  { key: "agocode.progress.selection-sort.rebuild", delayDays: 3, title: "Rebuild Selection Sort", description: "Recover the repeated minimum-selection mechanism and explain why the shrinking scans still sum to quadratic work.", href: "/learn/selection-sort#rebuild" },
  { key: "agocode.progress.chapter-2.recap", delayDays: 7, title: "Chapter 2 cumulative recall", description: "Reconnect memory addresses, arrays, linked lists, and Selection Sort before opening Chapter 3.", href: "/learn/chapter-2-recap" },
  { key: "agocode.progress.recursion.factorial-rebuild", delayDays: 3, title: "Recursive factorial recall", description: "Rebuild the base case and recursive case, then explain what values remain suspended while the call stack grows.", href: "/learn/recursion#rebuild" },
  { key: "agocode.progress.chapter-3.recap", delayDays: 7, title: "Chapter 3 cumulative recall", description: "Recover the stopping case, progress rule, LIFO call-stack model, and recursive unwinding before starting divide and conquer.", href: "/learn/chapter-3-recap" },
  { key: "agocode.progress.divide-conquer.sum-rebuild", delayDays: 3, title: "Divide & Conquer reduction recall", description: "State the base case and the smaller subproblem before rebuilding recursive sum from memory.", href: "/learn/divide-and-conquer#rebuild" },
  { key: "agocode.progress.quicksort.rebuild", delayDays: 3, title: "Rebuild Quicksort", description: "Recover the base case, pivot partition, recursive calls, and combine rule without reopening the finished implementation.", href: "/learn/quicksort#rebuild" },
  { key: "agocode.progress.chapter-4.recap", delayDays: 7, title: "Chapter 4 cumulative recall", description: "Reconnect divide and conquer, partitioning, recursive combine, and balanced-versus-lopsided runtime behavior.", href: "/learn/chapter-4-recap" },
  { key: "agocode.progress.hash-tables.duplicate-filter", delayDays: 3, title: "Hash-backed membership recall", description: "Rebuild the duplicate-filter task and explain why a set or dictionary changes repeated membership checking into key lookup.", href: "/learn/hash-tables#apply" },
  { key: "agocode.progress.chapter-5.recap", delayDays: 7, title: "Chapter 5 cumulative recall", description: "Reconnect hash function, array buckets, use cases, collisions, load factor, resizing, and average-case performance.", href: "/learn/chapter-5-recap" },
  { key: "agocode.progress.bfs.prediction", delayDays: 2, title: "BFS queue prediction", description: "Predict which queued node must leave next and justify the FIFO order before replaying the trace.", href: "/learn/breadth-first-search#trace" },
  { key: "agocode.progress.bfs.rebuild", delayDays: 3, title: "Rebuild Breadth-First Search", description: "Recover the FIFO queue, visited/discovered state, and path information that make shortest unweighted search work.", href: "/learn/breadth-first-search#rebuild" },
  { key: "agocode.progress.chapter-6.recap", delayDays: 7, title: "Chapter 6 cumulative recall", description: "Reconnect graph modeling, FIFO layer order, visited state, shortest paths, and O(V + E) before moving to weighted graphs.", href: "/learn/chapter-6-recap" },
  { key: "agocode.progress.dijkstra.rebuild", delayDays: 3, title: "Rebuild Dijkstra's Algorithm", description: "Recover the cheapest-unprocessed-node rule, edge relaxation, parent updates, and processed-node invariant without reopening the trace.", href: "/learn/dijkstra#rebuild" },
  { key: "agocode.progress.chapter-7.recap", delayDays: 7, title: "Chapter 7 cumulative recall", description: "Reconnect weighted paths, relaxation, parent reconstruction, and the negative-weight limitation.", href: "/learn/chapter-7-recap" },
  { key: "agocode.progress.greedy.scheduling", delayDays: 3, title: "Greedy interval scheduling recall", description: "Recover why earliest compatible finish is the local rule and replay the selected non-overlapping schedule without rereading the explanation.", href: "/learn/greedy#schedule" },
  { key: "agocode.progress.greedy.set-cover", delayDays: 4, title: "Set-cover approximation recall", description: "Rebuild the rule that only newly covered requirements count when choosing the next station.", href: "/learn/greedy#set-cover" },
  { key: "agocode.progress.chapter-8.recap", delayDays: 7, title: "Chapter 8 cumulative recall", description: "Reconnect greedy choice, counterexamples, approximation, set cover, and hard combinatorial search before dynamic programming.", href: "/learn/chapter-8-recap" },
  { key: "agocode.progress.dynamic-programming.knapsack-rebuild", delayDays: 3, title: "0/1 knapsack recurrence recall", description: "Rebuild the grid from the meaning of one cell: best value using the items seen so far under a fixed capacity.", href: "/learn/dynamic-programming#rebuild" },
  { key: "agocode.progress.dynamic-programming.sequence-grid", delayDays: 4, title: "Substring vs. subsequence recall", description: "Recover why a mismatch resets a contiguous substring but preserves max(up, left) for an ordered subsequence.", href: "/learn/dynamic-programming#strings" },
  { key: "agocode.progress.chapter-9.recap", delayDays: 7, title: "Chapter 9 cumulative recall", description: "Reconnect constrained optimization, grid state, the knapsack include/exclude recurrence, model boundaries, and sequence DP.", href: "/learn/chapter-9-recap" },
  { key: "agocode.progress.knn.rebuild", delayDays: 3, title: "KNN classifier recall", description: "Rebuild feature-vector distance, nearest-neighbor selection, and majority voting without reopening the finished solution.", href: "/learn/k-nearest-neighbors#rebuild" },
  { key: "agocode.progress.chapter-10.recap", delayDays: 7, title: "Chapter 10 cumulative recall", description: "Reconnect classification, regression, feature extraction, Euclidean distance, neighborhood size, and feature quality.", href: "/learn/chapter-10-recap" },
  { key: "agocode.progress.chapter-11.recap", delayDays: 10, title: "Book Track map recall", description: "Reconnect advanced data structures, search indexes, representation changes, parallelism, probabilistic structures, and general optimization after some distance from the finale.", href: "/learn/chapter-11-recap" },
  { key: "agocode.progress.transfer.hash-membership", delayDays: 3, title: "Transfer recall · hash membership", description: "Return to the streaming duplicate problem and recover why direct membership preserves encounter order without repeated scans.", href: "/practice/hash-membership" },
  { key: "agocode.progress.transfer.bfs-handoffs", delayDays: 3, title: "Transfer recall · BFS", description: "Re-solve the handoff problem from the all-edges-cost-one clue and justify why FIFO layer order gives the fewest hops.", href: "/practice/bfs-handoffs" },
  { key: "agocode.progress.transfer.dijkstra-route", delayDays: 4, title: "Transfer recall · Dijkstra", description: "Rebuild the cheapest-route solution from accumulated non-negative edge costs rather than from the chapter name.", href: "/practice/dijkstra-route" },
  { key: "agocode.progress.transfer.greedy-schedule", delayDays: 4, title: "Transfer recall · greedy scheduling", description: "Recover the earliest-finish choice and explain why it leaves maximum room for compatible sessions that follow.", href: "/practice/greedy-schedule" },
  { key: "agocode.progress.transfer.dp-budget", delayDays: 5, title: "Transfer recall · dynamic programming", description: "Reconstruct the study-budget state and include/exclude comparison without reopening the knapsack lesson.", href: "/practice/dp-budget" },
  { key: "agocode.progress.transfer.knn-classify", delayDays: 5, title: "Transfer recall · KNN", description: "Recover feature distance, k-neighbor selection, and local voting from the plant-classification story.", href: "/practice/knn-classify" },
  { key: "agocode.progress.transfer.recursion-folder-size", delayDays: 5, title: "Transfer recall · recursion", description: "Rebuild the nested-folder traversal from the base case and same-smaller-problem structure.", href: "/practice/recursion-folder-size" },
  { key: "agocode.progress.transfer.mixed-recognition", delayDays: 7, title: "Mixed transfer recognition", description: "Repeat the no-label scenarios after a delay and try to improve the first-try pattern-recognition score without chapter cues.", href: "/practice/mixed" },
];

function buildReviewItems() {
  return reviewDefinitions.flatMap((definition): ReviewItem[] => {
    const evidence = readLearningEvidence(localStorage, definition.key);
    if (!evidence?.completedAt) return [];

    const initialDueAt = new Date(new Date(evidence.completedAt).getTime() + definition.delayDays * DAY_MS);
    const dueAt = evidence.recall?.nextReviewAt ? new Date(evidence.recall.nextReviewAt) : initialDueAt;

    return [{
      ...definition,
      exerciseId: evidence.exerciseId,
      dueAt,
      intervalDays: evidence.recall?.intervalDays ?? null,
      reviewSessions: evidence.recall?.sessions ?? 0,
    }];
  });
}

function formatWait(ms: number) {
  const hours = Math.max(1, Math.ceil(ms / (60 * 60 * 1000)));
  return hours >= 24 ? `${Math.ceil(hours / 24)} day${hours > 24 ? "s" : ""}` : `${hours} hour${hours > 1 ? "s" : ""}`;
}

export function ReviewQueue() {
  const [loaded, setLoaded] = useState(false);
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [now, setNow] = useState(0);

  function refresh() {
    setItems(buildReviewItems());
    setNow(Date.now());
  }

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      refresh();
      setLoaded(true);
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  function markRecall(item: ReviewItem, outcome: "remembered" | "needs-work") {
    recordRecallOutcome(localStorage, item.key, {
      exerciseId: item.exerciseId,
      outcome,
      baseIntervalDays: item.delayDays,
    });
    refresh();
  }

  if (!loaded) return <div className="review-loading">Reading local learning evidence…</div>;

  if (!items.length) {
    return (
      <div className="empty-state">
        <h2>No review items yet.</h2>
        <p>Pass the Binary Search rebuild exercise to schedule the first recall session.</p>
        <div className="action-row">
          <Link className="button button--primary" href="/learn/binary-search#rebuild">Complete the rebuild →</Link>
        </div>
      </div>
    );
  }

  const sortedItems = [...items].sort((a, b) => a.dueAt.getTime() - b.dueAt.getTime());

  return (
    <div className="review-list">
      {sortedItems.map((item) => {
        const remaining = item.dueAt.getTime() - now;
        const due = remaining <= 0;
        return (
          <article className="review-row" key={item.key}>
            <div>
              <span className={due ? "review-row__status review-row__status--due" : "review-row__status"}>
                {due ? "Due now" : `Due in ${formatWait(remaining)}`}
              </span>
              <h2>{item.title}</h2>
              <p>{item.description}</p>
              {item.reviewSessions ? (
                <small className="review-row__history">{item.reviewSessions} recall session{item.reviewSessions === 1 ? "" : "s"} · current interval {item.intervalDays} day{item.intervalDays === 1 ? "" : "s"}</small>
              ) : null}
            </div>
            <div className="review-row__actions">
              <Link className={due ? "button button--primary" : "button"} href={item.href}>
                {due ? "Review now →" : "Preview"}
              </Link>
              {due ? (
                <div className="review-row__outcome" aria-label={`Record recall outcome for ${item.title}`}>
                  <span>After attempting</span>
                  <button className="button button--quiet" type="button" onClick={() => markRecall(item, "remembered")}>Remembered</button>
                  <button className="button button--quiet" type="button" onClick={() => markRecall(item, "needs-work")}>Needs work</button>
                </div>
              ) : null}
            </div>
          </article>
        );
      })}
    </div>
  );
}
