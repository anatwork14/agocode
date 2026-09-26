"use client";

import { KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { recordLearningAttempt } from "@/lib/learning/evidence";
import {
  countPassedTests,
  didCompletePythonSuite,
  preparePythonTestSuite,
  splitPythonTestResults,
  type PythonExerciseReport,
  type PythonTestCase,
} from "@/lib/runtime/python-exercise";

export type { PythonTestCase } from "@/lib/runtime/python-exercise";

type PythonExerciseProps = {
  id: string;
  title: string;
  description: string;
  functionName: string;
  starterCode: string;
  tests: PythonTestCase[];
  hiddenTests?: PythonTestCase[];
  hints: string[];
  successMessage: string;
  storageKey?: string;
};

type RuntimeStatus = "loading" | "ready" | "running" | "error";

function formatValue(value: unknown) {
  if (value === null) return "None";
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export function PythonExercise({
  id,
  title,
  description,
  functionName,
  starterCode,
  tests,
  hiddenTests,
  hints,
  successMessage,
  storageKey,
}: PythonExerciseProps) {
  const [code, setCode] = useState(starterCode);
  const [runtimeStatus, setRuntimeStatus] = useState<RuntimeStatus>("loading");
  const [runtimeMessage, setRuntimeMessage] = useState("Loading Python in an isolated browser worker…");
  const [report, setReport] = useState<PythonExerciseReport | null>(null);
  const [hintIndex, setHintIndex] = useState(-1);
  const [runtimeNonce, setRuntimeNonce] = useState(0);
  const workerRef = useRef<Worker | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const runIdRef = useRef(0);
  const hintCountRef = useRef(0);
  const allTests = useMemo(() => preparePythonTestSuite(tests, hiddenTests), [hiddenTests, tests]);
  const hiddenTestCount = hiddenTests?.length ?? 0;

  useEffect(() => {
    const worker = new Worker("/workers/python-runner.worker.js");
    workerRef.current = worker;

    worker.onmessage = (event) => {
      const message = event.data;

      if (message.type === "ready") {
        setRuntimeStatus("ready");
        setRuntimeMessage("Python is ready. Your code runs locally in this browser tab.");
        return;
      }

      if (message.type === "runtime-error") {
        setRuntimeStatus("error");
        setRuntimeMessage(`Python runtime could not start: ${message.message}`);
        return;
      }

      if (message.type === "result" && message.runId === runIdRef.current) {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
        const nextReport = message.result as PythonExerciseReport;
        setReport(nextReport);
        setRuntimeStatus("ready");
        setRuntimeMessage("Python is ready. Edit and run again whenever you want.");

        const passedCount = countPassedTests(nextReport.tests);
        const passedAll = didCompletePythonSuite(nextReport, allTests.length);

        if (storageKey) {
          recordLearningAttempt(localStorage, storageKey, {
            exerciseId: id,
            passed: passedAll,
            passedCount,
            totalTests: allTests.length,
            hintCount: hintCountRef.current,
            runtimeError: Boolean(nextReport.error),
          });
        }
      }
    };

    worker.onerror = () => {
      setRuntimeStatus("error");
      setRuntimeMessage("The Python worker stopped unexpectedly. Restart the runtime and try again.");
    };

    worker.postMessage({ type: "init" });

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      worker.terminate();
      workerRef.current = null;
    };
  }, [allTests, id, runtimeNonce, storageKey]);

  function runCode() {
    if (runtimeStatus !== "ready" || !workerRef.current) return;

    runIdRef.current += 1;
    const runId = runIdRef.current;
    setReport(null);
    setRuntimeStatus("running");
    setRuntimeMessage("Running tests…");

    workerRef.current.postMessage({
      type: "run",
      runId,
      code,
      functionName,
      tests: allTests,
    });

    timeoutRef.current = setTimeout(() => {
      workerRef.current?.terminate();
      workerRef.current = null;
      if (storageKey) {
        recordLearningAttempt(localStorage, storageKey, {
          exerciseId: id,
          passed: false,
          passedCount: 0,
          totalTests: allTests.length,
          hintCount: hintCountRef.current,
          runtimeError: true,
        });
      }
      setRuntimeStatus("error");
      setRuntimeMessage("Execution exceeded 3 seconds. The worker was stopped so an infinite loop cannot freeze the page.");
    }, 3000);
  }

  function restartRuntime() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
    setReport(null);
    setRuntimeStatus("loading");
    setRuntimeMessage("Loading Python in an isolated browser worker…");
    setRuntimeNonce((value) => value + 1);
  }

  function handleEditorKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Tab") return;

    event.preventDefault();
    const editor = event.currentTarget;
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const indentation = "    ";
    const nextCode = `${code.slice(0, start)}${indentation}${code.slice(end)}`;

    setCode(nextCode);
    setReport(null);

    requestAnimationFrame(() => {
      editor.selectionStart = start + indentation.length;
      editor.selectionEnd = start + indentation.length;
    });
  }

  const passedCount = report ? countPassedTests(report.tests) : 0;
  const passedAll = didCompletePythonSuite(report, allTests.length);
  const groupedResults = report ? splitPythonTestResults(report.tests, tests.length) : { visible: [], hidden: [] };
  const visiblePassedCount = countPassedTests(groupedResults.visible);
  const hiddenPassedCount = countPassedTests(groupedResults.hidden);

  return (
    <div className="code-exercise">
      <div className="code-exercise__header">
        <div>
          <div className="eyebrow">Rebuild in Python</div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
        <span className={`runtime-badge runtime-badge--${runtimeStatus}`}>{runtimeStatus}</span>
      </div>

      <div className="code-exercise__grid">
        <div className="code-editor-pane">
          <label htmlFor={`${id}-editor`} className="code-editor-label">
            Your implementation
          </label>
          <textarea
            id={`${id}-editor`}
            className="code-editor"
            value={code}
            onChange={(event) => {
              setCode(event.target.value);
              setReport(null);
            }}
            onKeyDown={handleEditorKeyDown}
            spellCheck={false}
            aria-describedby={`${id}-runtime-status`}
          />

          <div className="lab-toolbar">
            <button
              type="button"
              className="button button--primary"
              onClick={runCode}
              disabled={runtimeStatus !== "ready" || !code.trim()}
            >
              {runtimeStatus === "running" ? "Running…" : "Run tests"}
            </button>
            <button
              type="button"
              className="button button--quiet"
              onClick={() => {
                setCode(starterCode);
                setReport(null);
              }}
            >
              Reset code
            </button>
            {runtimeStatus === "error" ? (
              <button type="button" className="button" onClick={restartRuntime}>
                Restart runtime
              </button>
            ) : null}
          </div>

          <p id={`${id}-runtime-status`} className="runtime-status" aria-live="polite">
            {runtimeMessage}
          </p>
        </div>

        <aside className="exercise-side" aria-label="Hints and test results">
          <div className="hint-ladder">
            <div className="hint-ladder__heading">
              <strong>Hint ladder</strong>
              <span>{Math.max(hintIndex + 1, 0)} / {hints.length}</span>
            </div>
            <p>
              Use the weakest hint that gets you moving. A smaller hint is stronger evidence that you can rebuild the idea yourself.
            </p>
            {hintIndex >= 0 ? (
              <ol className="hint-list">
                {hints.slice(0, hintIndex + 1).map((hint, index) => (
                  <li key={hint}>Hint {index + 1}: {hint}</li>
                ))}
              </ol>
            ) : null}
            <button
              type="button"
              className="button button--quiet"
              onClick={() =>
                setHintIndex((value) => {
                  const next = Math.min(hints.length - 1, value + 1);
                  hintCountRef.current = Math.max(0, next + 1);
                  return next;
                })
              }
              disabled={hintIndex >= hints.length - 1}
            >
              {hintIndex < 0 ? "Reveal first hint" : "Reveal next hint"}
            </button>
          </div>

          {report ? (
            <div className="test-report" aria-live="polite">
              <div className="test-report__summary">
                <strong>
                  {passedAll
                    ? "All checks passed"
                    : `${passedCount}/${allTests.length} checks passed`}
                </strong>
                {passedAll ? <span>{successMessage}</span> : null}
              </div>

              {report.error ? <pre className="runtime-error">{report.error}</pre> : null}

              {groupedResults.visible.length ? (
                <ul className="test-list">
                  {groupedResults.visible.map((test) => (
                    <li className={test.passed ? "test-row test-row--pass" : "test-row test-row--fail"} key={test.label}>
                      <span>{test.passed ? "✓" : "×"} {test.label}</span>
                      <code>
                        got {formatValue(test.actual)} · expected {formatValue(test.expected)}
                      </code>
                    </li>
                  ))}
                </ul>
              ) : null}

              {hiddenTestCount ? (
                <div className="test-report__summary">
                  <strong>{hiddenPassedCount}/{hiddenTestCount} hidden checks passed</strong>
                  <span>
                    Hidden checks affect completion evidence but keep their inputs and expected values out of the normal learner interface.
                  </span>
                </div>
              ) : null}

              {!passedAll && groupedResults.visible.length ? (
                <small>{visiblePassedCount}/{tests.length} visible checks passed.</small>
              ) : null}

              {report.stdout ? (
                <details className="runtime-output">
                  <summary>Program output</summary>
                  <pre>{report.stdout}</pre>
                </details>
              ) : null}
              {report.stderr ? <pre className="runtime-error">{report.stderr}</pre> : null}
            </div>
          ) : (
            <div className="test-report test-report--idle">
              <strong>
                {tests.length} visible check{tests.length === 1 ? "" : "s"}
                {hiddenTestCount ? ` + ${hiddenTestCount} hidden check${hiddenTestCount === 1 ? "" : "s"}` : ""} waiting.
              </strong>
              <span>
                Run the suite to test normal behavior and edge cases without leaving the page. Hidden checks are UI-hidden, not a security boundary in this client-only runtime.
              </span>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
