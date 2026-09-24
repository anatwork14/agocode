"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { readLearningEvidence } from "@/lib/learning/evidence";

type ReviewItem = {
  title: string;
  description: string;
  href: string;
  dueAt: Date;
};

const DAY_MS = 24 * 60 * 60 * 1000;

function completedAt(key: string) {
  const value = readLearningEvidence(localStorage, key)?.completedAt;
  return value ? new Date(value).getTime() : null;
}

function addScheduledReview(
  items: ReviewItem[],
  key: string,
  delayDays: number,
  item: Omit<ReviewItem, "dueAt">,
) {
  const completionTime = completedAt(key);
  if (completionTime === null) return;
  items.push({ ...item, dueAt: new Date(completionTime + delayDays * DAY_MS) });
}

function buildReviewItems() {
  const items: ReviewItem[] = [];

  addScheduledReview(items, "agocode.progress.binary-search.rebuild", 1, {
    title: "Rebuild Binary Search",
    description: "Return without rereading the implementation. Reconstruct low, high, mid, and the two interval updates.",
    href: "/learn/binary-search#rebuild",
  });
  addScheduledReview(items, "agocode.progress.binary-search.explain", 2, {
    title: "Explain the invariant",
    description: "Explain why sorted order makes a whole region disposable and what low…high promises after every update.",
    href: "/learn/binary-search#explain",
  });
  addScheduledReview(items, "agocode.progress.binary-search.transfer-01", 3, {
    title: "Insertion boundary transfer",
    description: "Solve the insertion-position variant again and explain why the final low index is meaningful.",
    href: "/practice/binary-search",
  });
  addScheduledReview(items, "agocode.progress.binary-search.transfer-02", 4, {
    title: "First-occurrence boundary",
    description: "Find the first duplicate again. Recall why equality becomes a candidate answer instead of an immediate return.",
    href: "/practice/binary-search/boundary",
  });
  addScheduledReview(items, "agocode.progress.binary-search.transfer-03", 5, {
    title: "Rotated-array pattern recall",
    description: "Recover the structural observation that one side of a distinct rotated array around mid remains sorted.",
    href: "/practice/binary-search/rotated",
  });
  addScheduledReview(items, "agocode.progress.binary-search.transfer-04", 6, {
    title: "Answer-space search recall",
    description: "Reconstruct why a monotonic feasibility predicate makes a range of possible answers searchable by binary search.",
    href: "/practice/binary-search/answer-space",
  });
  addScheduledReview(items, "agocode.progress.chapter-1.recap", 7, {
    title: "Chapter 1 cumulative recall",
    description: "Reconnect Binary Search, running time, Big O, and factorial growth without rereading the chapter first.",
    href: "/learn/chapter-1-recap",
  });
  addScheduledReview(items, "agocode.progress.binary-search.rebuild-blank", 8, {
    title: "Blank implementation recall",
    description: "Start from only the function signature and rebuild the loop, midpoint, and discard rules without embedded reminders.",
    href: "/practice/binary-search/rebuild",
  });
  addScheduledReview(items, "agocode.progress.binary-search.bug-repair", 9, {
    title: "Boundary bug repair",
    description: "Diagnose the off-by-one loop condition again from failing boundary cases rather than from a clean reference solution.",
    href: "/practice/binary-search/bug-repair",
  });
  addScheduledReview(items, "agocode.progress.selection-sort.rebuild", 3, {
    title: "Rebuild Selection Sort",
    description: "Recover the repeated minimum-selection mechanism and explain why the shrinking scans still sum to quadratic work.",
    href: "/learn/selection-sort#rebuild",
  });
  addScheduledReview(items, "agocode.progress.chapter-2.recap", 7, {
    title: "Chapter 2 cumulative recall",
    description: "Reconnect memory addresses, arrays, linked lists, and Selection Sort before opening Chapter 3.",
    href: "/learn/chapter-2-recap",
  });
  addScheduledReview(items, "agocode.progress.recursion.factorial-rebuild", 3, {
    title: "Recursive factorial recall",
    description: "Rebuild the base case and recursive case, then explain what values remain suspended while the call stack grows.",
    href: "/learn/recursion#rebuild",
  });

  return items;
}

function formatWait(ms: number) {
  const hours = Math.max(1, Math.ceil(ms / (60 * 60 * 1000)));
  return hours >= 24 ? `${Math.ceil(hours / 24)} day${hours > 24 ? "s" : ""}` : `${hours} hour${hours > 1 ? "s" : ""}`;
}

export function ReviewQueue() {
  const [loaded, setLoaded] = useState(false);
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [now, setNow] = useState(0);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setItems(buildReviewItems());
      setNow(Date.now());
      setLoaded(true);
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

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
          <article className="review-row" key={item.title}>
            <div>
              <span className={due ? "review-row__status review-row__status--due" : "review-row__status"}>
                {due ? "Due now" : `Due in ${formatWait(remaining)}`}
              </span>
              <h2>{item.title}</h2>
              <p>{item.description}</p>
            </div>
            <Link className={due ? "button button--primary" : "button"} href={item.href}>
              {due ? "Review now →" : "Preview"}
            </Link>
          </article>
        );
      })}
    </div>
  );
}
