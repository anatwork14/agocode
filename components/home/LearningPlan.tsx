"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { readLearningEvidence } from "@/lib/learning/evidence";

type PlanStep = {
  title: string;
  description: string;
  href: string;
  label: string;
};

const DAY_MS = 24 * 60 * 60 * 1000;

function hasProgress(key: string) {
  return Boolean(readLearningEvidence(localStorage, key)?.completedAt);
}

function getCompletionTime(key: string) {
  const completedAt = readLearningEvidence(localStorage, key)?.completedAt;
  return completedAt ? new Date(completedAt).getTime() : null;
}

function chooseNextStep(): PlanStep {
  if (!hasProgress("agocode.progress.binary-search.rebuild")) return { label: "Build recall", title: "Rebuild Binary Search", description: "Write the algorithm without copying the finished implementation, then pass the edge-case tests.", href: "/learn/binary-search#rebuild" };
  if (!hasProgress("agocode.progress.binary-search.explain")) return { label: "Explain", title: "Defend the invariant", description: "Check whether you can explain sorted input, the candidate interval, and logarithmic growth.", href: "/learn/binary-search#explain" };
  if (!hasProgress("agocode.progress.chapter-1.running-time")) return { label: "Book Track", title: "Continue with Running Time", description: "Move from one fast algorithm to the larger question: how does the amount of work grow with input size?", href: "/learn/running-time" };
  if (!hasProgress("agocode.progress.chapter-1.big-o")) return { label: "Book Track", title: "Give growth a language", description: "Use Big O to compare common growth classes and reason about worst-case scaling.", href: "/learn/big-o" };
  if (!hasProgress("agocode.progress.chapter-1.tsp")) return { label: "Book Track", title: "See factorial growth explode", description: "Finish the chapter story with the brute-force Traveling Salesperson search space.", href: "/learn/traveling-salesperson" };
  if (!hasProgress("agocode.progress.chapter-1.recap")) return { label: "Recall", title: "Reconstruct Chapter 1", description: "Answer cumulative questions before rereading the lessons and connect search, growth, Big O, and factorial explosion.", href: "/learn/chapter-1-recap" };
  if (!hasProgress("agocode.progress.binary-search.transfer-01")) return { label: "Transfer", title: "Insertion boundary", description: "Apply the invariant to a nearby problem where the target may be absent.", href: "/practice/binary-search" };
  if (!hasProgress("agocode.progress.binary-search.transfer-02")) return { label: "Transfer", title: "First occurrence boundary", description: "Change what equality means and keep searching until the left boundary is proven.", href: "/practice/binary-search/boundary" };
  if (!hasProgress("agocode.progress.binary-search.transfer-03")) return { label: "Pattern transfer", title: "Rotated ordered array", description: "Recognize the discard-region idea after global sorted order has been disrupted.", href: "/practice/binary-search/rotated" };
  if (!hasProgress("agocode.progress.binary-search.transfer-04")) return { label: "Mixed transfer", title: "Search the answer space", description: "Use monotonic feasibility when the sorted candidates are possible answers rather than input positions.", href: "/practice/binary-search/answer-space" };
  if (!hasProgress("agocode.progress.binary-search.rebuild-blank")) return { label: "Delayed recall", title: "Rebuild without the reminder", description: "Start from only the function signature and recover the complete binary-search control flow from memory.", href: "/practice/binary-search/rebuild" };
  if (!hasProgress("agocode.progress.binary-search.bug-repair")) return { label: "Debugging recall", title: "Repair a boundary bug", description: "Use failing edge cases and the candidate-interval invariant to locate a one-character loop-condition bug.", href: "/practice/binary-search/bug-repair" };
  if (!hasProgress("agocode.progress.chapter-2.memory")) return { label: "Chapter 02", title: "Build the memory model", description: "Make addresses, contiguous storage, and relocation concrete before comparing data structures.", href: "/learn/memory" };
  if (!hasProgress("agocode.progress.chapter-2.arrays-lists")) return { label: "Chapter 02", title: "Compare arrays and linked lists", description: "Connect physical layout to random reads, traversal, insertion, and deletion costs.", href: "/learn/arrays-linked-lists" };
  if (!hasProgress("agocode.progress.selection-sort.rebuild")) return { label: "Chapter 02", title: "Trace and rebuild Selection Sort", description: "Predict each selected minimum, see the quadratic scan pattern, then write the algorithm yourself.", href: "/learn/selection-sort" };
  if (!hasProgress("agocode.progress.chapter-2.recap")) return { label: "Recall", title: "Reconstruct Chapter 2", description: "Connect memory layout, structure trade-offs, repeated selection, and O(n²) without rereading first.", href: "/learn/chapter-2-recap" };
  if (!hasProgress("agocode.progress.recursion.factorial-rebuild")) return { label: "Chapter 03", title: "Make recursion visible", description: "Compare explicit work with recursive calls, identify base/recursive cases, then watch the call stack grow and unwind.", href: "/learn/recursion" };
  if (!hasProgress("agocode.progress.chapter-3.recap")) return { label: "Recall", title: "Reconstruct Recursion", description: "Retrieve the base case, progress rule, paused-caller model, and stack unwinding before moving into divide and conquer.", href: "/learn/chapter-3-recap" };
  if (!hasProgress("agocode.progress.divide-conquer.sum-rebuild")) return { label: "Chapter 04", title: "Reduce the problem", description: "Learn divide and conquer as two explicit questions: identify the base case, then turn the problem into a smaller version of itself.", href: "/learn/divide-and-conquer" };

  return {
    label: "Chapter 04",
    title: "Next: partition with a pivot",
    description: "The divide-and-conquer model is in place. The next slice will use it to build Quicksort and compare balanced versus unbalanced recursion.",
    href: "/roadmap",
  };
}

function countDueReviews(now: number) {
  const schedule = [
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
  ] as const;

  return schedule.reduce((count, [key, days]) => {
    const completedAt = getCompletionTime(key);
    if (completedAt === null) return count;
    return completedAt + days * DAY_MS <= now ? count + 1 : count;
  }, 0);
}

function evidenceCount() {
  const keys = [
    "agocode.progress.binary-search.rebuild",
    "agocode.progress.binary-search.explain",
    "agocode.progress.chapter-1.running-time",
    "agocode.progress.chapter-1.big-o",
    "agocode.progress.chapter-1.tsp",
    "agocode.progress.chapter-1.recap",
    "agocode.progress.binary-search.transfer-01",
    "agocode.progress.binary-search.transfer-02",
    "agocode.progress.binary-search.transfer-03",
    "agocode.progress.binary-search.transfer-04",
    "agocode.progress.binary-search.rebuild-blank",
    "agocode.progress.binary-search.bug-repair",
    "agocode.progress.chapter-2.memory",
    "agocode.progress.chapter-2.arrays-lists",
    "agocode.progress.selection-sort.rebuild",
    "agocode.progress.chapter-2.recap",
    "agocode.progress.recursion.factorial-rebuild",
    "agocode.progress.chapter-3.recap",
    "agocode.progress.divide-conquer.sum-rebuild",
  ];
  return keys.filter(hasProgress).length;
}

export function LearningPlan() {
  const [loaded, setLoaded] = useState(false);
  const [step, setStep] = useState<PlanStep | null>(null);
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
