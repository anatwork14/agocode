import { expect, test } from "@playwright/test";

const EXPERIMENT_KEY = "agocode.progress.recommendation-policy-experiment";
const SAFETY_KEY = "agocode.progress.recommendation-policy-safety";
const SNAPSHOT_KEY = "agocode.progress.recommendation-policy-snapshots";
const RECOMMENDATION_HISTORY_KEY = "agocode.progress.next-problem-history";

const candidateId = "candidate-v1-recovery-e2e";
const promotedState = {
  version: 1,
  defaultPolicyId: candidateId,
  candidate: {
    id: candidateId,
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
    id: "experiment-recovery-e2e",
    candidatePolicyId: candidateId,
    status: "completed",
    startedAt: "2026-09-20T00:00:00.000Z",
    completedAt: "2026-09-25T00:00:00.000Z",
    promotedAt: "2026-09-25T00:00:00.000Z",
  },
};

const suspendedState = {
  version: 1,
  candidatePolicyId: candidateId,
  suspension: {
    candidatePolicyId: candidateId,
    suspendedAt: "2026-09-26T00:00:00.000Z",
    reason: "stability",
  },
  events: [{
    version: 1,
    id: "policy-safety-seeded-suspension",
    event: "candidate-suspended",
    occurredAt: "2026-09-26T00:00:00.000Z",
    candidatePolicyId: candidateId,
    reason: "stability",
  }],
};

async function seedRecommendationMarker(page: import("@playwright/test").Page, index: number) {
  await page.evaluate(({ key, index: marker }) => {
    localStorage.setItem(key, JSON.stringify({
      version: 1,
      entries: [{
        exerciseId: `phase12-recovery-marker-${marker}`,
        chosenAt: `2026-09-27T0${marker}:00:00.000Z`,
      }],
    }));
  }, { key: RECOMMENDATION_HISTORY_KEY, index });
}

async function snapshotCount(page: import("@playwright/test").Page) {
  return page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw).entries?.length ?? 0 : 0;
  }, SNAPSHOT_KEY);
}

test("recovered promoted candidate returns through baseline-first probation instead of full traffic", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(({ experimentKey, safetyKey, experiment, safety }) => {
    localStorage.setItem(experimentKey, JSON.stringify(experiment));
    localStorage.setItem(safetyKey, JSON.stringify(safety));
  }, {
    experimentKey: EXPERIMENT_KEY,
    safetyKey: SAFETY_KEY,
    experiment: promotedState,
    safety: suspendedState,
  });

  const frozenExperiment = await page.evaluate((key) => localStorage.getItem(key), EXPERIMENT_KEY);

  for (let index = 1; index <= 6; index += 1) {
    await seedRecommendationMarker(page, index);
    await page.goto("/practice/next");
    const policy = page.locator("section[aria-label='Recommendation policy version']");
    await expect(policy.getByText("Safety baseline", { exact: true })).toBeVisible();
    await expect(policy.getByText("baseline-v1", { exact: true })).toBeVisible();
    await expect(policy.getByText(/latched off after a safety breach/)).toBeVisible();
    await page.waitForFunction(({ key, expected }) => {
      const raw = localStorage.getItem(key);
      return Boolean(raw && (JSON.parse(raw).entries?.length ?? 0) >= expected);
    }, { key: SNAPSHOT_KEY, expected: index });
  }

  expect(await snapshotCount(page)).toBe(6);
  expect(await page.evaluate((key) => localStorage.getItem(key), EXPERIMENT_KEY)).toBe(frozenExperiment);

  await page.goto("/progress#policy-recovery");
  const recovery = page.locator("#policy-recovery");
  await expect(recovery.getByRole("heading", {
    level: 2,
    name: "Can a suspended promoted policy earn its way back without policy flapping?",
  })).toBeVisible();
  await expect(recovery.locator(".system-audit__calibration", { hasText: "Recovery ready" })).toBeVisible();
  await expect(recovery.getByText("6/6", { exact: true })).toBeVisible();
  await expect(recovery.getByText("Canary available", { exact: true })).toBeVisible();

  const safetyBefore = JSON.parse(await page.evaluate((key) => localStorage.getItem(key), SAFETY_KEY) as string);
  expect(safetyBefore.suspension?.candidatePolicyId).toBe(candidateId);
  expect(safetyBefore.probation).toBeUndefined();
  expect(safetyBefore.lastReactivatedAt).toBeUndefined();

  await recovery.getByRole("button", { name: "Start recovery probation" }).click();
  await expect(recovery.locator(".system-audit__calibration", { hasText: "No suspension" })).toBeVisible();
  await expect(recovery.getByText("Baseline-first recovery canary", { exact: true })).toBeVisible();
  await expect(recovery.locator(".system-audit__calibration", { hasText: "Canary collecting evidence" })).toBeVisible();

  const safetyAfter = JSON.parse(await page.evaluate((key) => localStorage.getItem(key), SAFETY_KEY) as string);
  expect(safetyAfter.suspension).toBeUndefined();
  expect(typeof safetyAfter.lastReactivatedAt).toBe("string");
  expect(safetyAfter.probation?.candidatePolicyId).toBe(candidateId);
  expect(safetyAfter.probation?.id).toMatch(/^recovery-probation-/);
  expect(safetyAfter.events.at(-2)?.event).toBe("candidate-reactivated");
  expect(safetyAfter.events.at(-1)?.event).toBe("candidate-probation-started");
  expect(await page.evaluate((key) => localStorage.getItem(key), EXPERIMENT_KEY)).toBe(frozenExperiment);

  await page.goto("/practice/next");
  const policy = page.locator("section[aria-label='Recommendation policy version']");
  await expect(policy.getByText("Baseline recovery probation arm", { exact: true })).toBeVisible();
  await expect(policy.getByText("baseline-v1", { exact: true })).toBeVisible();
  await expect(policy.getByText(/baseline-first alternating recovery/)).toBeVisible();

  const choose = page.getByRole("button", { name: "I'll solve this →" });
  await expect(choose).toBeVisible();
  await choose.click();
  await expect(page).toHaveURL(/\/exercises\//);

  const firstChoice = await page.evaluate(({ historyKey, safetyKey }) => {
    const history = JSON.parse(localStorage.getItem(historyKey) ?? '{"entries":[]}');
    const safety = JSON.parse(localStorage.getItem(safetyKey) ?? '{}');
    return { entry: history.entries.at(-1), probationId: safety.probation?.id };
  }, { historyKey: RECOMMENDATION_HISTORY_KEY, safetyKey: SAFETY_KEY });
  expect(firstChoice.entry?.probationId).toBe(firstChoice.probationId);
  expect(firstChoice.entry?.policyVariant).toBe("baseline");
  expect(firstChoice.entry?.policyId).toBe("baseline-v1");
  expect(firstChoice.entry?.experimentId).toBeUndefined();

  await page.goto("/practice/next");
  const secondPolicy = page.locator("section[aria-label='Recommendation policy version']");
  await expect(secondPolicy.getByText("Candidate recovery probation arm", { exact: true })).toBeVisible();
  await expect(secondPolicy.getByText(candidateId, { exact: true })).toBeVisible();

  await page.goto("/progress#policy-recovery");
  await expect(page.locator("#policy-recovery").getByText("Baseline-first recovery canary", { exact: true })).toBeVisible();
  const safetyBeforeReload = await page.evaluate((key) => localStorage.getItem(key), SAFETY_KEY);
  await page.reload();
  await expect(page.locator("#policy-recovery").getByText("Baseline-first recovery canary", { exact: true })).toBeVisible();
  expect(await page.evaluate((key) => localStorage.getItem(key), SAFETY_KEY)).toBe(safetyBeforeReload);
  expect(await page.evaluate((key) => localStorage.getItem(key), EXPERIMENT_KEY)).toBe(frozenExperiment);
});