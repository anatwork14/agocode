"use client";

import { useState } from "react";
import { QueueRenderer } from "@/components/visualization/QueueRenderer";

const arrivals = ["Mira", "Bao", "Chloe", "Noah"] as const;

export function QueueFifoLab() {
  const [queue, setQueue] = useState<string[]>(["Mira", "Bao"]);
  const [nextArrival, setNextArrival] = useState(2);
  const [lastAction, setLastAction] = useState("Mira arrived before Bao, so Mira is at the front.");

  function enqueue() {
    if (nextArrival >= arrivals.length) return;
    const name = arrivals[nextArrival];
    setQueue((current) => [...current, name]);
    setNextArrival((index) => index + 1);
    setLastAction(`${name} joined at the back. Earlier arrivals keep their position.`);
  }

  function dequeue() {
    if (!queue.length) return;
    const [first, ...rest] = queue;
    setQueue(rest);
    setLastAction(`${first} left from the front. The oldest remaining item is now next.`);
  }

  function reset() {
    setQueue(["Mira", "Bao"]);
    setNextArrival(2);
    setLastAction("Mira arrived before Bao, so Mira is at the front.");
  }

  return (
    <div className="queue-lab">
      <div className="queue-lab__header">
        <div>
          <div className="eyebrow">Queue · FIFO</div>
          <h3>First in means first out.</h3>
        </div>
        <span className="mono">{queue.length} waiting</span>
      </div>

      <QueueRenderer
        ariaLabel="First in first out queue"
        items={queue.map((name) => ({ id: name, label: name, state: "queued" }))}
      />

      <div className="trace-note" aria-live="polite"><strong>What changed?</strong> {lastAction}</div>

      <div className="lab-toolbar">
        <button className="button" type="button" onClick={enqueue} disabled={nextArrival >= arrivals.length}>Enqueue next</button>
        <button className="button button--primary" type="button" onClick={dequeue} disabled={!queue.length}>Dequeue front →</button>
        <button className="button button--quiet" type="button" onClick={reset}>Reset</button>
      </div>
    </div>
  );
}
