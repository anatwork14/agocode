import assert from "node:assert/strict";
import test from "node:test";
import {
  countPassedTests,
  didCompletePythonSuite,
  preparePythonTestSuite,
  splitPythonTestResults,
} from "../lib/runtime/python-exercise.ts";

const visible = [
  { label: "visible one", args: [[1, 2, 3], 2], expected: 1 },
  { label: "visible two", args: [[], 2], expected: null },
];
const hidden = [
  { label: "hidden boundary", args: [[1, 2, 3], 3], expected: 2 },
];

test("prepared suites preserve visible tests first and append hidden checks", () => {
  const suite = preparePythonTestSuite(visible, hidden);
  assert.equal(suite.length, 3);
  assert.deepEqual(suite.map((item) => item.label), ["visible one", "visible two", "hidden boundary"]);
});

test("worker results can be split without exposing hidden expectations in visible results", () => {
  const reportResults = [
    { label: "visible one", passed: true, actual: 1, expected: 1 },
    { label: "visible two", passed: true, actual: null, expected: null },
    { label: "hidden boundary", passed: false, actual: null, expected: 2 },
  ];
  const grouped = splitPythonTestResults(reportResults, visible.length);

  assert.deepEqual(grouped.visible.map((item) => item.label), ["visible one", "visible two"]);
  assert.deepEqual(grouped.hidden.map((item) => item.label), ["hidden boundary"]);
});

test("completion requires every visible and hidden check", () => {
  const passing = {
    tests: [
      { label: "v1", passed: true, actual: 1, expected: 1 },
      { label: "v2", passed: true, actual: null, expected: null },
      { label: "h1", passed: true, actual: 2, expected: 2 },
    ],
    stdout: "",
    stderr: "",
    error: null,
  };
  const hiddenFailure = {
    ...passing,
    tests: passing.tests.map((item, index) => index === 2 ? { ...item, passed: false } : item),
  };

  assert.equal(countPassedTests(passing.tests), 3);
  assert.equal(didCompletePythonSuite(passing, 3), true);
  assert.equal(didCompletePythonSuite(hiddenFailure, 3), false);
  assert.equal(didCompletePythonSuite({ ...passing, tests: passing.tests.slice(0, 2) }, 3), false);
});
