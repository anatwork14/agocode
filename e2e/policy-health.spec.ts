import { expect, test } from "@playwright/test";

const EXPERIMENT_KEY = "agocode.progress.recommendation-policy-experiment";
const SNAPSHOT_KEY = "agocode.progress.recommendation-policy-snapshots";

const promotedState = {
  version: 1,
  defaultPolicyId: "candidate-v1-health-e2e",
  candidate: {
    id: "candidate-v1-health-e2e",
    createdAt: "2026-09-20T00:00:00.000Z",
    baselinePolicyId: "baseline-v1",
    adjustments: { "combined-diversity": 2 },
    source: {
      matureSnapshottedChoices: 20,
      baselineStrongEvidenceRate: 50,
      suggestedChanges: 1,
    },
  },
  experiment: {
    id: "experiment-health-e2e",
    candidatePolicyId: "candidate-v1-health-e2e",
    status: "completed",
    startedAt: "2026-09-20T00:00:00.000Z",
    completedAt: "2026-09-26T00:00:00.000Z",
    promotedAt: "2026-09-26T00:00:00.000Z",
  },
};

test("promoted candidate stays active while its promotion health epoch is still observing", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(({ key, state }) => {
    localStorage.setItem(key, JSON.stringify(state));
  }, { key: EXPERIMENT_KEY, state: promotedState });

  const frozenBefore = await page.evaluate((key) => localStorage.getItem(key), EXPERIMENT_KEY);

  await page.goto("/practice/next");
  const policy = page.locator("section[aria-label='Recommendation policy version']");
  await expect(policy.getByText("Candidate local default", { exact: true })).toBeVisible();
  await expect(policy.getByText("candidate-v1-health-e2e", { exact: true })).toBeVisible();

  await page.waitForFunction((key) => {
    const raw = localStorage.getItem(key);
    return Boolean(raw && JSON.parse(raw).entries?.length === 1);
  }, SNAPSHOT_KEY);

  await expect(policy.getByText(/collects 6 distinct states in the current promotion health epoch/)).toBeVisible();
  expect(await page.evaluate((key) => localStorage.getItem(key), EXPERIMENT_KEY)).toBe(frozenBefore);

  await page.goto("/progress#policy-health");
  const health = page.locator("#policy-health");
  await expect(health.getByRole("heading", {
    level: 2,
    name: "Does a promoted candidate remain safe as the learner state changes?",
  })).toBeVisible();
  await expect(health.locator(".system-audit__calibration", { hasText: "Monitoring" })).toBeVisible();
  await expect(health.getByText("1/6", { exact: true })).toBeVisible();
  await expect(health.getByText("Promotion", { exact: true })).toBeVisible();
  await expect(health.getByText("candidate: candidate-v1-health-e2e", { exact: true })).toBeVisible();
  await expect(health.getByText("No", { exact: true })).toBeVisible();

  const snapshotBeforeReload = await page.evaluate((key) => localStorage.getItem(key), SNAPSHOT_KEY);
  const experimentBeforeReload = await page.evaluate((key) => localStorage.getItem(key), EXPERIMENT_KEY);
  await page.reload();
  await expect(page.locator("#policy-health").getByText("1/6", { exact: true })).toBeVisible();
  expect(await page.evaluate((key) => localStorage.getItem(key), SNAPSHOT_KEY)).toBe(snapshotBeforeReload);
  expect(await page.evaluate((key) => localStorage.getItem(key), EXPERIMENT_KEY)).toBe(experimentBeforeReload);
});
