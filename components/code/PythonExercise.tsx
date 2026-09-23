"use client";

import { useEffect, useRef, useState } from "react";

export type PythonTestCase = {
  label: string;
  args: unknown[];
  expected: unknown;
};

type TestResult = {
  label: string;
  passed: boolean;
  actual: unknown;
  expected: unknown;
};

type ExerciseReport = {
  tests: TestResult[];
  stdout: string;
  stderr: string;
  error: string | null;
};

type PythonExerciseProps = {
  id: string;
  title: string;
  description: string;
  functionName: string;
  starterCode: string;
  tests: PythonTestCase[];
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
  hints,
  successMessage,
  storageKey,
}: PythonExerciseProps) {
  const [code, setCode] = useState(starterCode);
  const [runtimeStatus, setRuntimeStatus] = useState<RuntimeStatus>("loading");
  const [runtimeMessage, setRuntimeMessage] = useState("Loading Python in an isolated browser worker…");
  const [report, setReport] = useState<ExerciseReport | null>(null);
  const [hintIndex, setHintIndex] = useState(-1);
  const [runtimeNonce, setRuntimeNonce] = useState(0);
  const workerRef = useRef<Worker | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const runIdRef = useRef(0);

  useEffect(() => {
    const worker = new Worker("/workers/python-runner.worker.js");
    workerRef.current = worker;
    setRuntimeStatus("loading");
    setRuntimeMessage("Loading Python in an isolated browser worker…");

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
        const nextReport = message.result as ExerciseReport;
        setReport(nextReport);
        setRuntimeStatus("ready");
        setRuntimeMessage("Python is ready. Edit and run again whenever you want.");

        const passedAll = Boolean(nextReport.tests.length) && nextReport.tests.every((test) => test.passed) && !nextReport.error;
        if (passedAll && storageKey) {
          localStorage.setItem(
            storageKey,
            JSON.stringify({ completedAt: new Date().toISOString(), exerciseId: id }),
          );
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
  }, [id, runtimeNonce, storageKey]);

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
      tests,
    });

    timeoutRef.current = setTimeout(() => {
      workerRef.current?.terminate();
      workerRef.current = null;
      setRuntimeStatus("error");
      setRuntimeMessage("Execution exceeded 3 seconds. The worker was stopped so an infinite loop cannot freeze the page.");
    }, 3000);
  }

  function restartRuntime() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
    setReport(null);
    setRuntimeNonce((value) => value + 1);
  }

  const passedCount = report?.tests.filter((test) => test.passed).length ?? 0;
  const passedAll = Boolean(report?.tests.length) && passedCount === report?.tests.length && !report?.error;

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
              onClick={() => setHintIndex((value) => Math.min(hints.length - 1, value + 1))}
              disabled={hintIndex >= hints.length - 1}
            >
              {hintIndex < 0 ? "Reveal first hint" : "Reveal next hint"}
            </button>
          </div>

          {report ? (
            <div className="test-report" aria-live="polite">
              <div className="test-report__summary">
                <strong>{passedAll ? "All tests passed" : `${passedCount}/${report.tests.length} tests passed`}</strong>
                {passedAll ? <span>{successMessage}</span> : null}
              </div>

              {report.error ? <pre className="runtime-error">{report.error}</pre> : null}

              {report.tests.length ? (
                <ul className="test-list">
                  {report.tests.map((test) => (
                    <li className={test.passed ? "test-row test-row--pass" : "test-row test-row--fail"} key={test.label}>
                      <span>{test.passed ? "✓" : "×"} {test.label}</span>
                      <code>
                        got {formatValue(test.actual)} · expected {formatValue(test.expected)}
                      </code>
                    </li>
                  ))}
                </ul>
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
              <strong>Five checks are waiting.</strong>
              <span>They cover found, missing, boundary, single-item, and empty-array behavior.</span>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
