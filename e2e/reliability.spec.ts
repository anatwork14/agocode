import { expect, test } from "@playwright/test";

const DAILY_SESSION_KEY = "agocode.practice.daily-session";
const LEGACY_EVIDENCE_KEY = "agocode.progress.binary-search.rebuild";
const RECOVERY_KEY = "agocode.system.storage-recovery.v1";

async function waitForServiceWorkerControl(page: import("@playwright/test").Page) {
  await page.evaluate(async () => {
    if (!("serviceWorker" in navigator)) throw new Error("Service workers are unavailable in this browser context.");
    await navigator.serviceWorker.ready;
  });
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null, undefined, { timeout: 15_000 });
}

test("primary learner journey connects curriculum, weekly review, and today's practice", async ({ page }) => {
  await page.goto("/");

  const nav = page.getByRole("navigation", { name: "Primary navigation" });
  await nav.getByRole("link", { name: "Plan" }).click();
  await expect(page).toHaveURL(/\/plan$/);
  await expect(page.getByRole("heading", { level: 1, name: "What should you learn over the next several weeks?" })).toBeVisible();

  await page.getByRole("link", { name: /Open weekly evidence review/ }).click();
  await expect(page).toHaveURL(/\/review\/weekly$/);
  await expect(page.getByRole("heading", { level: 1, name: "Review the trajectory, not just the streak." })).toBeVisible();

  await page.goto("/plan");
  await page.getByRole("link", { name: "Continue today's session" }).click();
  await expect(page).toHaveURL(/\/practice\/session$/);
  await expect(page.getByRole("heading", { level: 2, name: /Resume the same evidence plan all day|Today's queue is cleared/ })).toBeVisible();
});

test("daily practice state survives a real browser reload", async ({ page }) => {
  await page.goto("/practice/session");
  const clearManually = page.getByRole("button", { name: "clear manually" }).first();
  await expect(clearManually).toBeVisible();

  const row = clearManually.locator("xpath=ancestor::article[1]");
  const title = await row.getByRole("heading", { level: 3 }).innerText();
  await clearManually.click();
  await expect(row.getByText("Manual done", { exact: true })).toBeVisible();

  const beforeReload = await page.evaluate((key) => localStorage.getItem(key), DAILY_SESSION_KEY);
  expect(beforeReload).not.toBeNull();

  await page.reload();
  await expect(page.getByRole("heading", { level: 2, name: /Resume the same evidence plan all day|Today's queue is cleared/ })).toBeVisible();
  const restoredRow = page.getByRole("heading", { level: 3, name: title }).locator("xpath=ancestor::article[1]");
  await expect(restoredRow.getByText("Manual done", { exact: true })).toBeVisible();

  const afterReload = await page.evaluate((key) => localStorage.getItem(key), DAILY_SESSION_KEY);
  expect(afterReload).toBe(beforeReload);
});

test("storage migration creates a recovery point and rollback preserves unrelated browser state", async ({ page }) => {
  const legacyRaw = JSON.stringify({
    exerciseId: LEGACY_EVIDENCE_KEY,
    completedAt: "2026-09-01T00:00:00.000Z",
    score: 3,
    total: 4,
  });

  await page.goto("/");
  await page.evaluate(({ legacyKey, legacyValue }) => {
    localStorage.setItem(legacyKey, legacyValue);
    localStorage.setItem("agocode.custom.notes", "before");
    localStorage.setItem("unrelated", "keep");
  }, { legacyKey: LEGACY_EVIDENCE_KEY, legacyValue: legacyRaw });

  await page.goto("/settings/data");
  await expect(page.getByRole("heading", { name: /Audit first\. Back up before migration/ })).toBeVisible();
  await expect(page.getByText("Safe legacy", { exact: true }).locator("xpath=ancestor::article[1]").getByText("1", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: /Migrate 1 legacy entry/ }).click();
  await expect(page.getByRole("status").last()).toContainText("Migrated 1 safe legacy evidence entry");

  const migrated = await page.evaluate(({ legacyKey, recoveryKey }) => ({
    evidence: JSON.parse(localStorage.getItem(legacyKey) ?? "null"),
    recovery: localStorage.getItem(recoveryKey),
    unrelated: localStorage.getItem("unrelated"),
  }), { legacyKey: LEGACY_EVIDENCE_KEY, recoveryKey: RECOVERY_KEY });
  expect(migrated.evidence.version).toBe(1);
  expect(migrated.evidence.recognition.lastFirstTryCorrect).toBe(3);
  expect(migrated.recovery).not.toBeNull();
  expect(migrated.unrelated).toBe("keep");

  await page.evaluate(() => {
    localStorage.setItem("agocode.custom.after", "remove-on-restore");
    localStorage.setItem("unrelated", "still-keep");
  });
  page.once("dialog", (dialog) => void dialog.accept());
  await page.getByRole("button", { name: "Restore latest recovery" }).click();
  await expect(page.getByRole("status").last()).toContainText("Restored");

  const restored = await page.evaluate(({ legacyKey }) => ({
    legacy: localStorage.getItem(legacyKey),
    before: localStorage.getItem("agocode.custom.notes"),
    after: localStorage.getItem("agocode.custom.after"),
    unrelated: localStorage.getItem("unrelated"),
  }), { legacyKey: LEGACY_EVIDENCE_KEY });
  expect(restored.legacy).toBe(legacyRaw);
  expect(restored.before).toBe("before");
  expect(restored.after).toBeNull();
  expect(restored.unrelated).toBe("still-keep");
});

test("installed service worker serves cached core navigation and an offline fallback", async ({ page, context, request }) => {
  const manifestResponse = await request.get("/manifest.webmanifest");
  expect(manifestResponse.ok()).toBeTruthy();
  const manifest = await manifestResponse.json();
  expect(manifest.start_url).toBe("/practice/session");
  expect(manifest.display).toBe("standalone");

  const serviceWorkerResponse = await request.get("/sw.js");
  expect(serviceWorkerResponse.ok()).toBeTruthy();
  expect(serviceWorkerResponse.headers()["cache-control"]).toContain("no-store");
  expect(serviceWorkerResponse.headers()["service-worker-allowed"]).toBe("/");

  await page.goto("/practice/session");
  await waitForServiceWorkerControl(page);
  const activeScript = await page.evaluate(async () => (await navigator.serviceWorker.ready).active?.scriptURL ?? "");
  expect(activeScript).toMatch(/\/sw\.js$/);

  await context.setOffline(true);
  await page.goto("/plan", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { level: 1, name: "What should you learn over the next several weeks?" })).toBeVisible();

  await page.goto("/phase3-never-cached-offline-probe", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { level: 1, name: /Your evidence is local/ })).toBeVisible();
  await context.setOffline(false);
});

test("core planning surface does not overflow a narrow mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/plan");
  await expect(page.getByRole("heading", { level: 1, name: "What should you learn over the next several weeks?" })).toBeVisible();

  const dimensions = await page.evaluate(() => ({
    viewport: window.innerWidth,
    document: document.documentElement.scrollWidth,
  }));
  expect(dimensions.document).toBeLessThanOrEqual(dimensions.viewport + 1);
});
