"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { readLearningEvidence } from "@/lib/learning/evidence";

const steps = [
  {
    key: "agocode.progress.transfer.hash-membership",
    number: "01",
    title: "Membership under encounter order",
    technique: "Hash tables",
    href: "/practice/hash-membership",
  },
  {
    key: "agocode.progress.transfer.bfs-handoffs",
    number: "02",
    title: "Shortest unweighted handoff path",
    technique: "BFS",
    href: "/practice/bfs-handoffs",
  },
  {
    key: "agocode.progress.transfer.dijkstra-route",
    number: "03",
    title: "Cheapest weighted route",
    technique: "Dijkstra",
    href: "/practice/dijkstra-route",
  },
  {
    key: "agocode.progress.transfer.greedy-schedule",
    number: "04",
    title: "Maximum compatible schedule",
    technique: "Greedy",
    href: "/practice/greedy-schedule",
  },
  {
    key: "agocode.progress.transfer.dp-budget",
    number: "05",
    title: "Optimization under a hard budget",
    technique: "Dynamic programming",
    href: "/practice/dp-budget",
  },
  {
    key: "agocode.progress.transfer.knn-classify",
    number: "06",
    title: "Classification from nearby examples",
    technique: "K-nearest neighbors",
    href: "/practice/knn-classify",
  },
  {
    key: "agocode.progress.transfer.recursion-folder-size",
    number: "07",
    title: "Aggregate a nested folder tree",
    technique: "Recursion",
    href: "/practice/recursion-folder-size",
  },
  {
    key: "agocode.progress.transfer.mixed-recognition",
    number: "08",
    title: "No-label mixed recognition",
    technique: "Interleaved",
    href: "/practice/mixed",
  },
] as const;

export function TransferTrackMap() {
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const next: Record<string, boolean> = {};
      for (const step of steps) {
        next[step.key] = Boolean(readLearningEvidence(localStorage, step.key)?.completedAt);
      }
      setCompleted(next);
      setLoaded(true);
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  const completedCount = steps.filter((step) => completed[step.key]).length;
  const nextStep = steps.find((step) => !completed[step.key]) ?? steps.at(-1);

  return (
    <div className="transfer-track-map">
      <div className="transfer-track-map__summary">
        <div>
          <span className="eyebrow">Transfer Track</span>
          <h2>Remove the chapter label one layer at a time.</h2>
        </div>
        <div className="transfer-track-map__metric">
          <strong>{loaded ? completedCount : "—"}/{steps.length}</strong>
          <span>evidence items complete</span>
        </div>
      </div>

      <div className="transfer-track-steps">
        {steps.map((step) => {
          const done = completed[step.key];
          return (
            <Link className={`transfer-track-step ${done ? "transfer-track-step--done" : ""}`} href={step.href} key={step.key}>
              <span className="transfer-track-step__number mono">{step.number}</span>
              <div>
                <strong>{step.title}</strong>
                <span>{step.technique}</span>
              </div>
              <span className="transfer-track-step__state mono">{done ? "done" : "open"}</span>
            </Link>
          );
        })}
      </div>

      {loaded && nextStep ? (
        <div className="transfer-track-map__next">
          <span>{completedCount === steps.length ? "Transfer baseline complete" : "Next evidence target"}</span>
          <Link href={nextStep.href}>{nextStep.title} →</Link>
        </div>
      ) : null}
    </div>
  );
}
