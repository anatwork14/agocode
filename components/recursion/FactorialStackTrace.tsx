"use client";

import { FormEvent, useEffect, useMemo, useReducer, useState } from "react";
import { StackRenderer } from "@/components/visualization/StackRenderer";
import { buildFactorialTrace, type FactorialTraceFrame } from "@/lib/algorithms/factorialTrace";
import {
  canAutoplayAdvance,
  initialPlaybackState,
  playbackDelayMs,
  playbackReducer,
  playbackSpeeds,
  type PlaybackSpeedId,
} from "@/lib/visualization/playback";
import { initialTimelineState, timelineReducer } from "@/lib/visualization/timeline";

type PredictionAnswer = {
  selected: string;
  correct: boolean;
};

const predictionOptions = [
  { id: "push", label: "Push another smaller call." },
  { id: "base", label: "Stop at the base case and return 1." },
  { id: "return", label: "Pop/resume a caller and combine the returned value." },
  { id: "complete", label: "Finish because no suspended calls remain." },
] as const;

function predictionFor(frame: FactorialTraceFrame | undefined) {
  if (!frame) return null;
  if (frame.event.type === "CALL") {
    return {
      correct: "push",
      explanation: "The next smaller factorial call is pushed while the current call remains suspended underneath it.",
    };
  }
  if (frame.event.type === "BASE") {
    return {
      correct: "base",
      explanation: "The smallest call returns immediately instead of recursing again. This is what stops the chain.",
    };
  }
  if (frame.event.type === "RETURN") {
    return {
      correct: "return",
      explanation: "A child result is now known, so the waiting caller resumes and combines its local n with that result.",
    };
  }
  return {
    correct: "complete",
    explanation: "The final caller has returned, so the stack is empty and the recursive computation is complete.",
  };
}

export function FactorialStackTrace() {
  const [n, setN] = useState(4);
  const [draft, setDraft] = useState("4");
  const [error, setError] = useState("");
  const [timeline, dispatchTimeline] = useReducer(timelineReducer, initialTimelineState);
  const [playback, dispatchPlayback] = useReducer(playbackReducer, initialPlaybackState);
  const [answers, setAnswers] = useState<Record<number, PredictionAnswer>>({});

  const frames = useMemo(() => buildFactorialTrace(n), [n]);
  const frame = frames[timeline.index];
  const nextFrame = frames[timeline.index + 1];
  const prediction = predictionFor(nextFrame);
  const answer = answers[timeline.index];
  const predictionLocked = Boolean(prediction && !answer?.correct);

  useEffect(() => {
    if (!canAutoplayAdvance({
      state: playback,
      index: timeline.index,
      length: frames.length,
      locked: predictionLocked,
    })) {
      if (playback.playing && frames.length > 0 && timeline.index >= frames.length - 1) {
        dispatchPlayback({ type: "stop" });
      }
      return;
    }

    const timer = window.setTimeout(() => {
      dispatchTimeline({ type: "advance", length: frames.length, locked: predictionLocked });
    }, playbackDelayMs(playback));

    return () => window.clearTimeout(timer);
  }, [frames.length, playback, predictionLocked, timeline.index]);

  if (!frame) return null;

  function resetTrace() {
    dispatchTimeline({ type: "reset" });
    dispatchPlayback({ type: "stop" });
    setAnswers({});
  }

  function apply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = Number(draft);
    if (!Number.isInteger(next) || next < 1 || next > 7) {
      setError("Use an integer from 1 to 7 so the call stack remains readable.");
      return;
    }
    setError("");
    setN(next);
    resetTrace();
  }

  const eventLabel = frame.event.type === "CALL"
    ? `call fact(${frame.event.n - 1})`
    : frame.event.type === "BASE"
      ? "base case"
      : frame.event.type === "RETURN"
        ? `return ${frame.event.result}`
        : `complete = ${frame.event.result}`;

  function answerPrediction(optionId: string) {
    if (!prediction || answer?.correct) return;
    setAnswers((current) => ({
      ...current,
      [timeline.index]: {
        selected: optionId,
        correct: optionId === prediction.correct,
      },
    }));
  }

  function advance() {
    if (predictionLocked) return;
    dispatchTimeline({ type: "advance", length: frames.length });
  }

  function toggleAutoplay() {
    if (playback.playing) {
      dispatchPlayback({ type: "stop" });
      return;
    }
    if (timeline.index >= frames.length - 1) {
      dispatchTimeline({ type: "reset" });
      setAnswers({});
    }
    dispatchPlayback({ type: "play" });
  }

  const stackItems = frame.stack.map((item) => ({
    id: `fact-${item.n}`,
    title: `fact(${item.n})`,
    detail: `local n = ${item.n}`,
    state: item.state,
  }));

  return (
    <div className="factorial-lab">
      <div className="factorial-lab__header">
        <div>
          <div className="eyebrow">Recursive call stack</div>
          <h3>Watch calls accumulate, then unwind in reverse order.</h3>
        </div>
        <span className="mono">{eventLabel}</span>
      </div>

      <form className="scenario-builder" onSubmit={apply}>
        <label className="scenario-builder__target">
          <span>n</span>
          <input value={draft} onChange={(event) => setDraft(event.target.value)} inputMode="numeric" />
        </label>
        <button className="button" type="submit">Trace factorial</button>
        <p className="scenario-builder__help">1 ≤ n ≤ 7</p>
        {error ? <p className="scenario-builder__error" role="alert">{error}</p> : null}
      </form>

      <div className="factorial-grid">
        <section>
          <div className="eyebrow">Call stack · top first</div>
          <StackRenderer items={stackItems} ariaLabel="Factorial call stack" />
        </section>

        <section>
          <div className="eyebrow">State explanation</div>
          <div className="trace-note">
            <strong>What changed?</strong> {frame.note}
          </div>
          <dl className="lab-status">
            <div><dt>stack depth</dt><dd>{frame.stack.length}</dd></div>
            <div><dt>known result</dt><dd>{frame.result ?? "—"}</dd></div>
          </dl>
        </section>
      </div>

      {prediction ? (
        <div className="prediction-gate" aria-live="polite">
          <div className="prediction-gate__label">Predict before advancing</div>
          <p>What should the recursive execution do next?</p>
          <div className="prediction-options">
            {predictionOptions.map((option) => {
              const selected = answer?.selected === option.id;
              const correct = selected && answer?.correct;
              const wrong = selected && answer && !answer.correct;
              return (
                <button
                  type="button"
                  className={`prediction-option ${correct ? "prediction-option--correct" : ""} ${wrong ? "prediction-option--wrong" : ""}`}
                  key={option.id}
                  onClick={() => answerPrediction(option.id)}
                  disabled={Boolean(answer?.correct)}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
          {answer ? (
            <p className={`prediction-feedback ${answer.correct ? "prediction-feedback--correct" : ""}`}>
              {answer.correct
                ? prediction.explanation
                : "Use the current stack and ask whether another smaller call is required, the stopping case has been reached, or a suspended caller can now resume."}
            </p>
          ) : null}
          {playback.playing && predictionLocked ? (
            <p className="prediction-feedback">Autoplay is waiting for your prediction; it never skips a prediction gate.</p>
          ) : null}
        </div>
      ) : null}

      <div className="trace-timeline" aria-label="Visited factorial trace">
        <input
          type="range"
          min={0}
          max={Math.max(timeline.maxUnlocked, 0)}
          value={timeline.index}
          onChange={(event) => {
            dispatchPlayback({ type: "stop" });
            dispatchTimeline({ type: "scrub", index: Number(event.target.value) });
          }}
          disabled={timeline.maxUnlocked === 0}
          aria-label="Scrub through visited recursive-call steps"
        />
      </div>

      <div className="lab-toolbar">
        <button
          className="button"
          type="button"
          onClick={() => {
            dispatchPlayback({ type: "stop" });
            dispatchTimeline({ type: "back" });
          }}
          disabled={timeline.index === 0}
        >
          ← Back
        </button>
        <button
          className="button button--primary"
          type="button"
          onClick={advance}
          disabled={timeline.index === frames.length - 1 || predictionLocked}
        >
          Apply next step →
        </button>
        <button className="button" type="button" onClick={toggleAutoplay}>
          {playback.playing ? "Pause autoplay" : timeline.index === frames.length - 1 ? "Replay automatically" : "Play automatically"}
        </button>
        <label>
          <span className="sr-only">Autoplay speed</span>
          <select
            aria-label="Autoplay speed"
            value={playback.speedId}
            onChange={(event) => dispatchPlayback({ type: "set-speed", speedId: event.target.value as PlaybackSpeedId })}
          >
            {playbackSpeeds.map((speed) => <option value={speed.id} key={speed.id}>{speed.label}</option>)}
          </select>
        </label>
        <button className="button button--quiet" type="button" onClick={resetTrace}>Reset</button>
      </div>
    </div>
  );
}
