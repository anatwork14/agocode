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

function formatWait(ms: number) {
  const hours = Math.max(1, Math.ceil(ms / (60 * 60 * 1000)));
  return hours >= 24 ? `${Math.ceil(hours / 24)} day` : `${hours} hour`;
}

export function ReviewQueue() {
  const [loaded, setLoaded] = useState(false);
  const [items, setItems] = useState<ReviewItem[]>([]);

  useEffect(() => {
    const rebuild = readProgress("agocode.progress.binary-search.rebuild");
    const transfer = readProgress("agocode.progress.binary-search.transfer-01");
    const nextItems: ReviewItem[] = [];

    if (rebuild) {
      nextItems.push({
        title: "Rebuild Binary Search",
        description: "Return without rereading the implementation. Reconstruct low, high, mid, and the two interval updates.",
        href: "/learn/binary-search#rebuild",
        dueAt: new Date(new Date(rebuild.completedAt).getTime() + DAY_MS),
      });
    }

    if (transfer) {
      nextItems.push({
        title: "Insertion boundary transfer",
        description: "Solve the nearby boundary variant again and explain why the final low index is meaningful.",
        href: "/practice/binary-search",
        dueAt: new Date(new Date(transfer.completedAt).getTime() + 2 * DAY_MS),
      });
    }

    setItems(nextItems);
    setLoaded(true);
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

  const now = Date.now();

  return (
    <div className="review-list">
      {items
        .sort((a, b) => a.dueAt.getTime() - b.dueAt.getTime())
        .map((item) => {
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
