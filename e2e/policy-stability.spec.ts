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

test("planner captures distinct prospective states without counting reloads as new replay evidence", async ({ page }) => {
  await page.goto("/practice/next");
  await expect(page.getByRole("heading", { level: 2 }).first()).toBeVisible();
  await page.waitForFunction((key) => {
    const raw = localStorage.getItem(key);
    return Boolean(raw && JSON.parse(raw).entries?.length === 1);
  }, SNAPSHOT_KEY);

  expect(await snapshotCount(page)).toBe(1);
  const firstRaw = await page.evaluate((key) => localStorage.getItem(key), SNAPSHOT_KEY);

  await page.reload();
  await expect(page.getByRole("heading", { level: 2 }).first()).toBeVisible();
  await page.waitForTimeout(150);
  expect(await snapshotCount(page)).toBe(1);
  expect(await page.evaluate((key) => localStorage.getItem(key), SNAPSHOT_KEY)).toBe(firstRaw);

  await page.evaluate((key) => {
    localStorage.setItem(key, JSON.stringify({
      version: 1,
      entries: [{
        exerciseId: "phase7-noncanonical-history-marker",
        chosenAt: "2026-09-27T01:00:00.000Z",
      }],
    }));
  }, RECOMMENDATION_HISTORY_KEY);

  await page.reload();
  await expect(page.getByRole("heading", { level: 2 }).first()).toBeVisible();
  await page.waitForFunction((key) => {
    const raw = localStorage.getItem(key);
    return Boolean(raw && JSON.parse(raw).entries?.length === 2);
  }, SNAPSHOT_KEY);
  expect(await snapshotCount(page)).toBe(2);

  await page.goto("/progress#policy-stability");
  await expect(page.getByRole("heading", {
    level: 2,
    name: "Will a candidate remain stable across learner states before we test it live?",
  })).toBeVisible();
  const preflight = page.locator("#policy-stability");
  await expect(preflight.getByText("2 stored · 0 invalid", { exact: true })).toBeVisible();
  await expect(preflight.getByText("A new live experiment cannot start yet.", { exact: true })).toBeVisible();
  expect(await page.evaluate((key) => localStorage.getItem(key), EXPERIMENT_KEY)).toBeNull();
});
