"use client";

import { useMemo, useState } from "react";
import { greedyIntervalSchedule, type Interval } from "@/lib/algorithms/greedy";

const classes: Interval[] = [
  { id: "Art", start: 9, end: 10 },
  { id: "English", start: 9.5, end: 11 },
  { id: "Math", start: 10, end: 11 },
  { id: "CS", start: 10.5, end: 12 },
  { id: "Music", start: 11, end: 12 },
];

function timeLabel(value: number) {
  const hours = Math.floor(value);
  const minutes = value % 1 === 0 ? "00" : "30";
  return `${hours}:${minutes}`;
}

export function ClassroomSchedulingLab() {
  const result = useMemo(() => greedyIntervalSchedule(classes), []);
  const [step, setStep] = useState(0);
  const visibleDecisions = result.decisions.slice(0, step);
  const accepted = new Set(visibleDecisions.filter((item) => item.accepted).map((item) => item.interval.id));
  const rejected = new Set(visibleDecisions.filter((item) => !item.accepted).map((item) => item.interval.id));
  const next = result.decisions[step];

  return (
    <div className="greedy-schedule-lab">
      <div className="greedy-lab__header">
        <div>
          <div className="eyebrow">Interval scheduling</div>
          <h3>Make one local choice: among compatible classes, keep the one that finishes earliest.</h3>
        </div>
        <span className="mono">{accepted.size}/{result.selected.length} chosen</span>
      </div>

      <div className="schedule-axis" aria-hidden="true">
        {[9, 10, 11, 12].map((hour) => <span key={hour}>{hour}:00</span>)}
      </div>

      <div className="schedule-list" aria-label="Candidate class intervals">
        {classes.map((item) => {
          const left = ((item.start - 9) / 3) * 100;
          const width = ((item.end - item.start) / 3) * 100;
          const state = accepted.has(item.id) ? "accepted" : rejected.has(item.id) ? "rejected" : next?.interval.id === item.id ? "current" : "pending";
          return (
            <div className="schedule-row" key={item.id}>
              <span className="schedule-row__label">{item.id}</span>
              <div className="schedule-row__track">
                <span
                  className={`schedule-block schedule-block--${state}`}
                  style={{ left: `${left}%`, width: `${width}%` }}
                >
                  <strong>{item.id}</strong>
                  <small>{timeLabel(item.start)}–{timeLabel(item.end)}</small>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="trace-note" aria-live="polite">
        <strong>{step === 0 ? "Before choosing:" : `Decision ${step}:`}</strong>{" "}
        {step === 0
          ? "Sort candidates by finish time. The first compatible class to finish is the greedy choice."
          : visibleDecisions[visibleDecisions.length - 1]?.reason}
      </div>

      <div className="lab-toolbar">
        <button className="button" type="button" onClick={() => setStep((value) => Math.max(0, value - 1))} disabled={step === 0}>← Back</button>
        <button className="button button--primary" type="button" onClick={() => setStep((value) => Math.min(result.decisions.length, value + 1))} disabled={step === result.decisions.length}>
          {step === result.decisions.length ? "Schedule complete" : "Evaluate next →"}
        </button>
        <button className="button button--quiet" type="button" onClick={() => setStep(0)}>Reset</button>
      </div>

      {step === result.decisions.length ? (
        <div className="greedy-result mono">Selected: {result.selected.map((item) => item.id).join(" → ")}</div>
      ) : null}
    </div>
  );
}
