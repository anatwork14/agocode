export type PythonTestCase = {
  label: string;
  args: unknown[];
  expected: unknown;
};

export type PythonTestResult = {
  label: string;
  passed: boolean;
  actual: unknown;
  expected: unknown;
};

export type PythonExerciseReport = {
  tests: PythonTestResult[];
  stdout: string;
  stderr: string;
  error: string | null;
};

export type PythonTestResultGroups = {
  visible: PythonTestResult[];
  hidden: PythonTestResult[];
};

export function preparePythonTestSuite(
  visibleTests: readonly PythonTestCase[],
  hiddenTests: readonly PythonTestCase[] = [],
): PythonTestCase[] {
  return [...visibleTests, ...hiddenTests].map((test) => ({
    label: test.label,
    args: [...test.args],
    expected: test.expected,
  }));
}

export function splitPythonTestResults(
  results: readonly PythonTestResult[],
  visibleTestCount: number,
): PythonTestResultGroups {
  const boundary = Math.max(0, Math.min(Math.trunc(visibleTestCount), results.length));
  return {
    visible: results.slice(0, boundary),
    hidden: results.slice(boundary),
  };
}

export function countPassedTests(results: readonly PythonTestResult[]) {
  return results.reduce((count, result) => count + (result.passed ? 1 : 0), 0);
}

export function didCompletePythonSuite(report: PythonExerciseReport | null, expectedTestCount: number) {
  if (!report || report.error || expectedTestCount <= 0) return false;
  return report.tests.length === expectedTestCount && countPassedTests(report.tests) === expectedTestCount;
}
