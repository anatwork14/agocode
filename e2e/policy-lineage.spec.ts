import { expect, test } from "@playwright/test";

const EXPERIMENT_KEY = "agocode.progress.recommendation-policy-experiment";

const runningState = {
  version: 1,
  defaultPolicyId: "baseline-v1",
  candidate: {
    id: "candidate-v1-lineage-e2e",
    createdAt: "2026-09-20T00:00:00.000Z",
    baselinePolicyId: "baseline-v1",
    adjustments: {
      "retrieval-overdue": 2,
      "combined-diversity": -2,
    },
    source: {
      matureSnapshottedChoices: 20,
      baselineStrongEvidenceRate: 50,
      suggestedChanges: 2,
    },
  },
  experiment: {
    id: "experiment-lineage-e2e",
    candidatePolicyId: "candidate-v1-lineage-e2e",
    status: "running",
    startedAt: "2026-09-21T00:00:00.000Z",
  },
};

test("policy lifecycle actions append a bounded read-only lineage visible after reload", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(({ key, state }) => {
    localStorage.setItem(key, JSON.stringify(state));
  }, { key: EXPERIMENT_KEY, state: runningState });

  await page.goto("/progress#policy-experiment");
  const experiment = page.locator("#policy-experiment");
  const lineage = page.locator("#policy-lineage");
  await expect(lineage.getByRole("heading", {
    level: 2,
    name: "What policy versions have existed locally, and what happened to each cycle?",
  })).toBeVisible();
  await expect(lineage.getByText("No Phase 10 lifecycle event has been recorded yet.", { exact: true })).toBeVisible();

  await expect(experiment.getByRole("button", { name: "Pause experiment" })).toBeVisible();
  await experiment.getByRole("button", { name: "Pause experiment" }).click();

  let stored = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? "{}"), EXPERIMENT_KEY);
  expect(stored.experiment.status).toBe("paused");
  expect(stored.lineage).toHaveLength(1);
  expect(stored.lineage[0].event).toBe("experiment-paused");
  expect(stored.lineage[0].candidatePolicyId).toBe("candidate-v1-lineage-e2e");
  expect(stored.lineage[0].adjustments).toEqual({ "retrieval-overdue": 2, "combined-diversity": -2 });
  await expect(lineage.getByText("Experiment paused", { exact: true })).toBeVisible();

  await expect(experiment.getByRole("button", { name: "Resume experiment" })).toBeVisible();
  await experiment.getByRole("button", { name: "Resume experiment" }).click();

  stored = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? "{}"), EXPERIMENT_KEY);
  expect(stored.experiment.status).toBe("running");
  expect(stored.lineage).toHaveLength(2);
  expect(stored.lineage.map((entry: { event: string }) => entry.event)).toEqual([
    "experiment-paused",
    "experiment-resumed",
  ]);

  await expect(lineage.getByText("Experiment resumed", { exact: true })).toBeVisible();
  await expect(lineage.getByText("Experiment paused", { exact: true })).toBeVisible();
  await expect(lineage.getByText("candidate-v1-lineage-e2e", { exact: true }).first()).toBeVisible();
  await expect(lineage.getByText(/Overdue retrieval \+2/)).toBeVisible();
  await expect(lineage.getByText(/Source \+ domain diversity -2/)).toBeVisible();

  const frozenBeforeReload = await page.evaluate((key) => localStorage.getItem(key), EXPERIMENT_KEY);
  await page.reload();
  await expect(page.locator("#policy-lineage").getByText("Experiment resumed", { exact: true })).toBeVisible();
  expect(await page.evaluate((key) => localStorage.getItem(key), EXPERIMENT_KEY)).toBe(frozenBeforeReload);
});
