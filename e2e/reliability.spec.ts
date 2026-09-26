import { expect, test } from "@playwright/test";

const DAILY_SESSION_KEY = "agocode.practice.daily-session";
const LEGACY_EVIDENCE_KEY = "agocode.progress.binary-search.rebuild";
const RECOVERY_KEY = "agocode.system.storage-recovery.v1";
const RECOMMENDATION_HISTORY_KEY = "agocode.progress.next-problem-history";
const REASONING_ATTEMPT_HISTORY_KEY = "agocode.progress.reasoning-attempt-history";
const DIAGNOSTIC_STATE_KEY = "agocode.progress.diagnostic-placement";
const ANALYSIS_EXERCISE_A = "goodrich-1-1-experimental-running-time-study";
const ANALYSIS_EXERCISE_B = "goodrich-1-2-compare-growth-rates";

async function waitForServiceWorkerControl(page: import("@playwright/test").Page) {
  await page.evaluate(async () => {
    if (!("serviceWorker" in navigator)) throw new Error("Service workers are unavailable in this browser context.");
    await navigator.serviceWorker.ready;
  });
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null, undefined, { timeout: 15_000 });
}

async function readAgoCodeStorage(page: import("@playwright/test").Page) {
  return page.evaluate(() => Object.fromEntries(
    Object.keys(localStorage)
      .filter((key) => key.startsWith("agocode."))
      .sort()
      .map((key) => [key, localStorage.getItem(key)]),
  ));
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

  const originalRow = clearManually.locator("xpath=ancestor::article[1]");
  const title = await originalRow.getByRole("heading", { level: 3 }).innerText();
  await clearManually.click();

  const completedRow = page
    .locator("article.mixed-session__row")
    .filter({ has: page.getByRole("heading", { level: 3, name: title }) });
  await expect(completedRow.getByText("Manual done", { exact: true })).toBeVisible();

  const beforeReload = await page.evaluate((key) => localStorage.getItem(key), DAILY_SESSION_KEY);
  expect(beforeReload).not.toBeNull();

  await page.reload();
  await expect(page.getByRole("heading", { level: 2, name: /Resume the same evidence plan all day|Today's queue is cleared/ })).toBeVisible();
  const restoredRow = page
    .locator("article.mixed-session__row")
    .filter({ has: page.getByRole("heading", { level: 3, name: title }) });
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

test("learning-system audit derives recommendation and diagnostic signals without mutating local evidence", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(({ recommendationKey, attemptKey, diagnosticKey, exerciseA, exerciseB }) => {
    localStorage.setItem(recommendationKey, JSON.stringify({
      version: 1,
      entries: [{ exerciseId: exerciseA, chosenAt: "2026-09-24T08:00:00.000Z" }],
    }));
    localStorage.setItem(attemptKey, JSON.stringify({
      version: 1,
      entries: [
        {
          attemptId: "phase4-e2e-a",
          exerciseId: exerciseA,
          startedAt: "2026-09-25T07:55:00.000Z",
          finalizedAt: "2026-09-25T08:00:00.000Z",
          developedStages: 8,
          totalStages: 8,
          lensRevealed: false,
          completedAt: "2026-09-25T08:00:00.000Z",
        },
        {
          attemptId: "phase4-e2e-b",
          exerciseId: exerciseB,
          startedAt: "2026-09-25T08:55:00.000Z",
          finalizedAt: "2026-09-25T09:00:00.000Z",
          developedStages: 8,
          totalStages: 8,
          lensRevealed: false,
          completedAt: "2026-09-25T09:00:00.000Z",
        },
      ],
    }));
    localStorage.setItem(diagnosticKey, JSON.stringify({
      version: 1,
      attempts: [{
        attemptId: "phase4-e2e-diagnostic",
        startedAt: "2026-09-23T07:00:00.000Z",
        updatedAt: "2026-09-23T07:10:00.000Z",
        completedAt: "2026-09-23T07:10:00.000Z",
        answers: {
          "analysis-search-million": "a",
          "analysis-n-log-n": "c",
        },
      }],
    }));
  }, {
    recommendationKey: RECOMMENDATION_HISTORY_KEY,
    attemptKey: REASONING_ATTEMPT_HISTORY_KEY,
    diagnosticKey: DIAGNOSTIC_STATE_KEY,
    exerciseA: ANALYSIS_EXERCISE_A,
    exerciseB: ANALYSIS_EXERCISE_B,
  });

  const seededState = await readAgoCodeStorage(page);
  await page.goto("/progress");

  await expect(page.getByRole("heading", { level: 2, name: "Is AgoCode's guidance actually producing useful evidence?" })).toBeVisible();

  const recommendationPanel = page.locator("article.system-audit__panel").filter({
    has: page.getByRole("heading", { level: 3, name: "Did a chosen next problem lead to objective work?" }),
  });
  await expect(recommendationPanel.getByText("Experimental running-time study", { exact: true })).toBeVisible();
  await expect(recommendationPanel.getByText("Independent", { exact: true })).toBeVisible();
  await expect(recommendationPanel.getByText("100%", { exact: true })).toHaveCount(2);

  const diagnosticPanel = page.locator("article.system-audit__panel").filter({
    has: page.getByRole("heading", { level: 3, name: "Did placement agree with later objective work?" }),
  });
  const analysisRow = diagnosticPanel.locator(".system-audit__skill").filter({ hasText: "Analysis & growth" });
  await expect(analysisRow.getByText("Aligned", { exact: true })).toBeVisible();
  await expect(analysisRow.getByText(/Placement\s*100%/)).toBeVisible();
  await expect(analysisRow.getByText(/Later objective\s*100%/)).toBeVisible();

  expect(await readAgoCodeStorage(page)).toEqual(seededState);

  await page.reload();
  await expect(page.getByRole("heading", { level: 2, name: "Is AgoCode's guidance actually producing useful evidence?" })).toBeVisible();
  await expect(page.getByText("Experimental running-time study", { exact: true }).last()).toBeVisible();
  expect(await readAgoCodeStorage(page)).toEqual(seededState);
});

test("adaptive planner snapshots the visible rationale inside existing recommendation history", async ({ page }) => {
  await page.goto("/practice/next");

  const hero = page.locator(".next-problem__hero");
  const chooseButton = hero.getByRole("button", { name: /I'll solve this/ });
  await expect(chooseButton).toBeVisible();

  const reasons = await hero.locator(".next-problem__reasons li").allTextContents();
  expect(reasons.length).toBeGreaterThan(0);

  await chooseButton.click();
  await expect(page).toHaveURL(/\/exercises\/[^/]+$/);

  const exerciseId = new URL(page.url()).pathname.split("/").pop();
  expect(exerciseId).toBeTruthy();

  const storedBeforeReload = await page.evaluate((key) => localStorage.getItem(key), RECOMMENDATION_HISTORY_KEY);
  expect(storedBeforeReload).not.toBeNull();

  const history = JSON.parse(storedBeforeReload ?? "null");
  const last = history.entries.at(-1);
  expect(last.exerciseId).toBe(exerciseId);
  expect(last.reasons).toEqual(reasons);
  expect(typeof last.targetDimension).toBe("string");
  expect(typeof last.score).toBe("number");
  expect(typeof last.familyId).toBe("string");

  const separatePolicyState = await page.evaluate(() => localStorage.getItem("agocode.progress.recommendation-policy"));
  expect(separatePolicyState).toBeNull();

  await page.reload();
  const storedAfterReload = await page.evaluate((key) => localStorage.getItem(key), RECOMMENDATION_HISTORY_KEY);
  expect(storedAfterReload).toBe(storedBeforeReload);
});
