const PYODIDE_BASE = "https://cdn.jsdelivr.net/pyodide/v314.0.7/full/";
let runtimePromise = null;

async function getRuntime() {
  if (!runtimePromise) {
    runtimePromise = (async () => {
      importScripts(`${PYODIDE_BASE}pyodide.js`);
      return await loadPyodide({ indexURL: PYODIDE_BASE });
    })();
  }
  return runtimePromise;
}

async function runExercise(message) {
  const pyodide = await getRuntime();
  pyodide.globals.set("USER_CODE", message.code);
  pyodide.globals.set("FUNCTION_NAME", message.functionName);
  pyodide.globals.set("TESTS_JSON", JSON.stringify(message.tests));

  const harness = `
import contextlib
import io
import json
import traceback

stdout_buffer = io.StringIO()
stderr_buffer = io.StringIO()
report = {"tests": [], "stdout": "", "stderr": "", "error": None}

def safe_value(value):
    try:
        json.dumps(value)
        return value
    except Exception:
        return repr(value)

try:
    namespace = {}
    with contextlib.redirect_stdout(stdout_buffer), contextlib.redirect_stderr(stderr_buffer):
        exec(USER_CODE, namespace)
        fn = namespace.get(FUNCTION_NAME)
        if not callable(fn):
            raise NameError(f"Define a function named {FUNCTION_NAME}.")

        tests = json.loads(TESTS_JSON)
        for test in tests:
            actual = fn(*test["args"])
            expected = test["expected"]
            report["tests"].append({
                "label": test["label"],
                "passed": actual == expected,
                "actual": safe_value(actual),
                "expected": safe_value(expected),
            })
except Exception:
    report["error"] = traceback.format_exc(limit=6)
finally:
    report["stdout"] = stdout_buffer.getvalue()
    report["stderr"] = stderr_buffer.getvalue()

json.dumps(report)
`;

  try {
    const serialized = await pyodide.runPythonAsync(harness);
    return JSON.parse(serialized);
  } finally {
    pyodide.globals.delete("USER_CODE");
    pyodide.globals.delete("FUNCTION_NAME");
    pyodide.globals.delete("TESTS_JSON");
  }
}

self.onmessage = async (event) => {
  const message = event.data;

  if (message.type === "init") {
    try {
      await getRuntime();
      self.postMessage({ type: "ready" });
    } catch (error) {
      self.postMessage({
        type: "runtime-error",
        message: error instanceof Error ? error.message : String(error),
      });
    }
    return;
  }

  if (message.type === "run") {
    try {
      const result = await runExercise(message);
      self.postMessage({ type: "result", runId: message.runId, result });
    } catch (error) {
      self.postMessage({
        type: "result",
        runId: message.runId,
        result: {
          tests: [],
          stdout: "",
          stderr: "",
          error: error instanceof Error ? error.stack || error.message : String(error),
        },
      });
    }
  }
};
