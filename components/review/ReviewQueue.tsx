"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type ProgressRecord = {
  completedAt: string;
  exerciseId: string;
};

type ReviewItem = {
  title: string;
  description: string;
  href: string;
  dueAt: Date;
};

const DAY_MS = 24 * 60 * 60 * 1000;

function readProgress(key: string): ProgressRecord | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as ProgressRecord;
  } catch {
    return null;
  }
}

function buildReviewItems() {
  const rebuild = readProgress("agocode.progress.binary-search.rebuild");
  const explain = readProgress("agocode.progress.binary-search.explain");
  const transferInsert = readProgress("agocode.progress.binary-search.transfer-01");
  const transferBoundary = readProgress("agocode.progress.binary-search.transfer-02");
  const chapterRecap = readProgress("agocode.progress.chapter-1.recap");
  const nextItems: ReviewItem[] = [];

  if (rebuild) {
    nextItems.push({
      title: "Rebuild Binary Search",
      description: "Return without rereading the implementation. Reconstruct low, high, mid, and the two interval updates.",
      href: "/learn/binary-search#rebuild",
      dueAt: new Date(new Date(rebuild.completedAt).getTime() + DAY_MS),
    });
  }

  if (explain) {
    nextItems.push({
      title: "Explain the invariant",
      description: "Explain why sorted order makes a whole region disposable and what low…high promises after every update.",
      href: "/learn/binary-search#explain",
      dueAt: new Date(new Date(explain.completedAt).getTime() + 2 * DAY_MS),
    });
  }

  if (transferInsert) {
    nextItems.push({
      title: "Insertion boundary transfer",
      description: "Solve the insertion-position variant again and explain why the final low index is meaningful.",
      href: "/practice/binary-search",
      dueAt: new Date(new Date(transferInsert.completedAt).getTime() + 3 * DAY_MS),
    });
  }

  if (transferBoundary) {
    nextItems.push({
      title: "First-occurrence boundary",
      description: "Find the first duplicate again. Recall why equality becomes a candidate answer instead of an immediate return.",
      href: "/practice/binary-search/boundary",
      dueAt: new Date(new Date(transferBoundary.completedAt).getTime() + 4 * DAY_MS),
    });
  }

  if (chapterRecap) {
    nextItems.push({
      title: "Chapter 1 cumulative recall",
      description: "Reconnect Binary Search, running time, Big O, and factorial growth without rereading the chapter first.",
      href: "/learn/chapter-1-recap",
      dueAt: new Date(new Date(chapterRecap.completedAt).getTime() + 7 * DAY_MS),
    });
  }

  return nextItems;
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

  if (!loaded) {
    return <div className="review-loading">Reading local learning evidence…</div>;
  }

  if (!items.length) {
    return (
      <div className="empty-state">
        <h2>No review items yet.</h2>
        <p>Pass the Binary Search rebuild exercise to schedule the first recall session.</p>
        <div className="action-row">
          <Link className="button button--primary" href="/learn/binary-search#rebuild">
            Complete the rebuild →
          </Link>
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
