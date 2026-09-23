"use client";

import { FormEvent, useMemo, useState } from "react";
import { binarySearchExample, buildBinarySearchTrace } from "@/lib/algorithms/binarySearch";

type BinarySearchTraceProps = {
  allowScenarioEditing?: boolean;
  requirePrediction?: boolean;
};

type PredictionAnswer = {
  attempts: number;
  correct: boolean;
  lastOptionId: string;
};

const code = [
  "def binary_search(nums, target):",
  "    low = 0",
  "    high = len(nums) - 1",
  "    while low <= high:",
  "        mid = (low + high) // 2",
  "        guess = nums[mid]",
  "        if guess == target:",
  "            return mid",
  "        if guess > target:",
  "            high = mid - 1",
  "        else:",
  "            low = mid + 1",
  "    return None",
];

export function BinarySearchTrace({
  allowScenarioEditing = false,
  requirePrediction = true,
}: BinarySearchTraceProps) {
  const [values, setValues] = useState<number[]>(binarySearchExample.values);
  const [target, setTarget] = useState(binarySearchExample.target);
  const [arrayDraft, setArrayDraft] = useState(binarySearchExample.values.join(", "));
  const [targetDraft, setTargetDraft] = useState(String(binarySearchExample.target));
  const [scenarioError, setScenarioError] = useState("");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, PredictionAnswer>>({});

  const steps = useMemo(() => buildBinarySearchTrace(values, target), [values, target]);
  const step = steps[index];

  if (!step) return null;

  const currentAnswer = answers[index];
  const predictionLocked = Boolean(requirePrediction && step.prediction && !currentAnswer?.correct);
  const answeredPredictions = Object.values(answers).filter((answer) => answer.correct);
  const firstTryCorrect = answeredPredictions.filter((answer) => answer.attempts === 1).length;

  function resetTrace() {
    setIndex(0);
    setAnswers({});
  }

  function answerPrediction(optionId: string) {
    const prediction = step.prediction;
    if (!prediction) return;

    setAnswers((current) => {
      const previous = current[index];
      if (previous?.correct) return current;

      const correct = optionId === prediction.correctOptionId;
      return {
        ...current,
        [index]: {
          attempts: (previous?.attempts ?? 0) + 1,
          correct,
          lastOptionId: optionId,
        },
      };
    });
  }

  function applyScenario(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = arrayDraft
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .map(Number);
    const parsedTarget = Number(targetDraft.trim());

    if (!parsed.length || parsed.some((value) => !Number.isInteger(value))) {
      setScenarioError("Enter at least one integer, separated by commas.");
      return;
    }

    if (parsed.length > 24) {
      setScenarioError("Keep the lab to 24 values or fewer so the state remains readable.");
      return;
    }

    if (parsed.some((value, valueIndex) => valueIndex > 0 && value < parsed[valueIndex - 1])) {
      setScenarioError("Binary search needs a sorted array. Put the values in non-decreasing order.");
      return;
    }

    if (!Number.isInteger(parsedTarget)) {
      setScenarioError("Target must be an integer.");
      return;
    }

    setScenarioError("");
    setValues(parsed);
    setTarget(parsedTarget);
    resetTrace();
  }

  const predictionFeedback = step.prediction && currentAnswer
    ? currentAnswer.correct
      ? step.prediction.explanation
      : "That update would discard the wrong region. Use the sorted order and compare the midpoint with the target again."
    : null;

  return (
    <div className="lab-panel">
      <div className="lab-panel__header">
        <strong>Deterministic execution trace</strong>
        <span>
          step {index + 1} / {steps.length}
        </span>
      </div>

      {allowScenarioEditing ? (
        <form className="scenario-builder" onSubmit={applyScenario}>
          <label>
            <span>Sorted array</span>
            <input
              value={arrayDraft}
              onChange={(event) => setArrayDraft(event.target.value)}
              aria-describedby="scenario-help"
            />
          </label>
          <label className="scenario-builder__target">
            <span>Target</span>
            <input value={targetDraft} onChange={(event) => setTargetDraft(event.target.value)} inputMode="numeric" />
          </label>
          <button className="button" type="submit">
            Run scenario
          </button>
          <p id="scenario-help" className="scenario-builder__help">
            Integers only · sorted ascending · max 24 values
          </p>
          {scenarioError ? <p className="scenario-builder__error" role="alert">{scenarioError}</p> : null}
        </form>
      ) : null}

      <div className="algorithm-grid">
        <section aria-label="Binary search visualization">
          <div className="trace-meta-row">
            <div className="eyebrow">Target {target}</div>
            {answeredPredictions.length ? (
              <span className="trace-score">
                first-try predictions {firstTryCorrect}/{answeredPredictions.length}
              </span>
            ) : null}
          </div>

          <div className="array-visual">
            {values.map((value, cellIndex) => {
              const discarded = cellIndex < step.low || cellIndex > step.high;
              const isMid = step.mid === cellIndex;
              const isFound = Boolean(step.found && isMid);
              const classes = [
                "array-cell",
                discarded ? "array-cell--discarded" : "array-cell--candidate",
                isMid ? "array-cell--mid" : "",
                isFound ? "array-cell--found" : "",
              ]
                .filter(Boolean)
                .join(" ");

              const pointers = [
                cellIndex === step.low ? "low" : "",
                cellIndex === step.mid ? "mid" : "",
                cellIndex === step.high ? "high" : "",
              ]
                .filter(Boolean)
                .join(" · ");

              return (
                <div
                  className={classes}
                  key={`${cellIndex}-${value}`}
                  aria-label={`Index ${cellIndex}, value ${value}${discarded ? ", discarded" : ""}`}
                >
                  {pointers ? <span className="array-cell__pointer">{pointers} ↓</span> : null}
                  {value}
                  <span className="array-cell__index">{cellIndex}</span>
                </div>
              );
            })}
          </div>

          <dl className="lab-status">
            <div>
              <dt>low</dt>
              <dd>{step.low}</dd>
            </div>
            <div>
              <dt>mid</dt>
              <dd>{step.mid ?? "—"}</dd>
            </div>
            <div>
              <dt>high</dt>
              <dd>{step.high}</dd>
            </div>
          </dl>

          <div className="trace-note" aria-live="polite">
            {step.comparison ? (
              <p className="mono trace-comparison">{step.comparison}</p>
            ) : null}
            <strong>What changed?</strong> {step.note}
          </div>

          {step.prediction && requirePrediction ? (
            <div className="prediction-gate" aria-live="polite">
              <div className="prediction-gate__label">Predict before advancing</div>
              <p>{step.prediction.prompt}</p>
              <div className="prediction-options">
                {step.prediction.options.map((option) => {
                  const selected = currentAnswer?.lastOptionId === option.id;
                  const correct = selected && currentAnswer?.correct;
                  const wrong = selected && currentAnswer && !currentAnswer.correct;
                  return (
                    <button
                      type="button"
                      className={`prediction-option ${correct ? "prediction-option--correct" : ""} ${wrong ? "prediction-option--wrong" : ""}`}
                      key={option.id}
                      onClick={() => answerPrediction(option.id)}
                      disabled={Boolean(currentAnswer?.correct)}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
              {predictionFeedback ? (
                <p className={`prediction-feedback ${currentAnswer?.correct ? "prediction-feedback--correct" : ""}`}>
                  {predictionFeedback}
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="lab-toolbar">
            <button
              type="button"
              className="button"
              onClick={() => setIndex((value) => Math.max(0, value - 1))}
              disabled={index === 0}
            >
              ← Back
            </button>
            <button
              type="button"
              className="button button--primary"
              onClick={() => setIndex((value) => Math.min(steps.length - 1, value + 1))}
              disabled={index === steps.length - 1 || predictionLocked}
            >
              {step.prediction && requirePrediction ? "Apply update →" : "Step →"}
            </button>
            <button type="button" className="button button--quiet" onClick={resetTrace}>
              Reset
            </button>
          </div>
        </section>

        <section aria-label="Synchronized Python code">
          <div className="eyebrow">Python 3</div>
          <ol className="code-listing code-listing--spaced">
            {code.map((line, lineIndex) => {
              const number = lineIndex + 1;
              return (
                <li className={`code-line ${step.activeLine === number ? "code-line--active" : ""}`} key={`${number}-${line}`}>
                  <span className="code-line__number">{String(number).padStart(2, "0")}</span>
                  <code>{line}</code>
                </li>
              );
            })}
          </ol>
        </section>
      </div>
    </div>
  );
}
