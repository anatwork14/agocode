import { expect, test } from "@playwright/test";

const EXPERIMENT_KEY = "agocode.progress.recommendation-policy-experiment";
const HISTORY_KEY = "agocode.progress.next-problem-history";
const candidateId = "candidate-v1-consistency-e2e";

const state = {
  version: 1,
  defaultPolicyId: candidateId,
  candidate: {
    id: candidateId,
    createdAt: "2026-09-27T00:00:00.000Z",
    baselinePolicyId: "baseline-v1",
    adjustments: { "combined-diversity": 2 },
    source: { matureSnapshottedChoices: 20, baselineStrongEvidenceRate: 50, suggestedChanges: 1 },
  },
  experiment: {
    id: "experiment-consistency-e2e",
    candidatePolicyId: candidateId,
    status: "completed",
    startedAt: "2026-09-27T00:00:00.000Z",
    completedAt: "2026-09-27T00:30:00.000Z",
    promotedAt: "2026-09-27T00:30:00.000Z",
  },
  lineage: [
    {
      version: 1,
      id: "lineage-start-consistency-e2e",
      event: "experiment-started",
      occurredAt: "2026-09-27T00:00:00.000Z",
      candidatePolicyId: candidateId,
      candidateCreatedAt: "2026-09-27T00:00:00.000Z",
      adjustments: { "combined-diversity": 2 },
      experimentId: "experiment-consistency-e2e",
      experimentStatus: "running",
      defaultPolicyId: "baseline-v1",
    },
    {
      version: 1,
      id: "lineage-promote-consistency-e2e",
      event: "candidate-promoted",
      occurredAt: "2026-09-27T00:30:00.000Z",
      candidatePolicyId: candidateId,
      candidateCreatedAt: "2026-09-27T00:00:00.000Z",
      adjustments: { "combined-diversity": 2 },
      experimentId: "experiment-consistency-e2e",
      experimentStatus: "completed",
      defaultPolicyId: candidateId,
    },
  ],
};

test("critical local policy contradiction fails closed to baseline without mutating frozen state", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(({ experimentKey, historyKey, seededState }) => {
    localStorage.setItem(experimentKey, JSON.stringify(seededState));
    localStorage.setItem(historyKey, JSON.stringify({
      version: 1,
      entries: [{
        exerciseId: "consistency-corrupt-attribution",
        chosenAt: "2026-09-27T01:00:00.000Z",
        policyVariant: "candidate",
        policyId: "baseline-v1",
        experimentId: "experiment-consistency-e2e",
      }],
    }));
  }, { experimentKey: EXPERIMENT_KEY, historyKey: HISTORY_KEY, seededState: state });

  const frozenBefore = await page.evaluate((key) => localStorage.getItem(key), EXPERIMENT_KEY);

  await page.goto("/practice/next");
  const policy = page.locator("section[aria-label='Recommendation policy version']");
  await expect(policy.getByText("Deterministic baseline", { exact: true })).toBeVisible();
  await expect(policy.getByText("baseline-v1", { exact: true })).toBeVisible();
  expect(await page.evaluate((key) => localStorage.getItem(key), EXPERIMENT_KEY)).toBe(frozenBefore);

  await page.goto("/progress#policy-consistency");
  const audit = page.locator("#policy-consistency");
  await expect(audit.getByRole("heading", { level: 2, name: "Do lifecycle, safety, and recommendation-attribution records still agree?" })).toBeVisible();
  await expect(audit.locator(".system-audit__calibration", { hasText: "Baseline required" })).toBeVisible();
  await expect(audit.getByText("candidate attribution policy mismatch", { exact: true })).toBeVisible();
  await expect(audit.getByText(/candidate traffic is not trustworthy/i)).toBeVisible();

  await page.reload();
  await expect(page.locator("#policy-consistency").locator(".system-audit__calibration", { hasText: "Baseline required" })).toBeVisible();
  expect(await page.evaluate((key) => localStorage.getItem(key), EXPERIMENT_KEY)).toBe(frozenBefore);
});
