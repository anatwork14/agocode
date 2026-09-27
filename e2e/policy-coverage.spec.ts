import { expect, test } from "@playwright/test";

const SNAPSHOT_KEY = "agocode.progress.recommendation-policy-snapshots";
const RECOMMENDATION_HISTORY_KEY = "agocode.progress.next-problem-history";
const EXPERIMENT_KEY = "agocode.progress.recommendation-policy-experiment";

async function snapshotCount(page: import("@playwright/test").Page) {
  return page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    if (!raw) return 0;
    return JSON.parse(raw).entries?.length ?? 0;
  }, SNAPSHOT_KEY);
}

test("coverage preflight reuses prospective replay states and does not auto-launch a candidate", async ({ page }) => {
  await page.goto("/practice/next");
  await expect(page.getByRole("heading", { level: 2 }).first()).toBeVisible();
  await page.waitForFunction((key) => {
    const raw = localStorage.getItem(key);
    return Boolean(raw && JSON.parse(raw).entries?.length === 1);
  }, SNAPSHOT_KEY);

  for (let index = 1; index < 6; index += 1) {
    await page.evaluate(({ key, count }) => {
      localStorage.setItem(key, JSON.stringify({
        version: 1,
        entries: Array.from({ length: count }, (_, marker) => ({
          exerciseId: `phase8-history-${marker}`,
          chosenAt: `2026-09-${String(marker + 1).padStart(2, "0")}T00:00:00.000Z`,
        })),
      }));
    }, { key: RECOMMENDATION_HISTORY_KEY, count: index });
    await page.reload();
    await expect(page.getByRole("heading", { level: 2 }).first()).toBeVisible();
    await page.waitForFunction(({ key, count }) => {
      const raw = localStorage.getItem(key);
      return Boolean(raw && JSON.parse(raw).entries?.length === count);
    }, { key: SNAPSHOT_KEY, count: index + 1 });
  }

  expect(await snapshotCount(page)).toBe(6);

  await page.evaluate((key) => {
    localStorage.setItem(key, JSON.stringify({
      version: 1,
      defaultPolicyId: "baseline-v1",
      candidate: {
        id: "candidate-v1-phase8-e2e",
        createdAt: "2026-09-27T00:00:00.000Z",
        baselinePolicyId: "baseline-v1",
        adjustments: { "combined-diversity": 2 },
        source: {
          matureSnapshottedChoices: 20,
          baselineStrongEvidenceRate: 50,
          suggestedChanges: 1,
        },
      },
    }));
  }, EXPERIMENT_KEY);

  await page.goto("/progress#policy-coverage");
  await expect(page.getByRole("heading", {
    level: 2,
    name: "Does a candidate preserve broad learning exposure instead of collapsing onto a narrow slice?",
  })).toBeVisible();

  const coverage = page.locator("#policy-coverage");
  await expect(coverage.getByText("6/6", { exact: true })).toBeVisible();
  await expect(coverage.getByText("Structural family", { exact: true })).toBeVisible();
  await expect(coverage.getByText("Book source", { exact: true })).toBeVisible();
  await expect(coverage.getByText("Problem domain", { exact: true })).toBeVisible();
  await expect(coverage.getByText("Difficulty level", { exact: true })).toBeVisible();
  await expect(coverage.getByText(/Coverage passed|Launch blocked/).first()).toBeVisible();

  const stored = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? "null"), EXPERIMENT_KEY);
  expect(stored.candidate?.id).toBe("candidate-v1-phase8-e2e");
  expect(stored.experiment).toBeUndefined();

  await page.reload();
  await expect(page.locator("#policy-coverage").getByText("6/6", { exact: true })).toBeVisible();
  const afterReload = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? "null"), EXPERIMENT_KEY);
  expect(afterReload.experiment).toBeUndefined();
});
