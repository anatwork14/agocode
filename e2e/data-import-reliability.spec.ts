import { expect, test } from "@playwright/test";

const RECOVERY_KEY = "agocode.system.storage-recovery.v1";
const HISTORY_KEY = "agocode.progress.next-problem-history";

function exportBundle(entries: Record<string, string>) {
  return JSON.stringify({
    product: "AgoCode",
    version: 1,
    exportedAt: "2026-09-28T01:00:00.000Z",
    entries,
  });
}

test("replace import creates a recoverable transaction before changing learner data", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    localStorage.setItem("agocode.progress.before-import", "before");
    localStorage.setItem("agocode.custom.before-import", "custom-before");
    localStorage.setItem("unrelated", "keep");
  });

  await page.goto("/settings/data");
  await expect(page.getByRole("heading", { level: 2, name: "Restore or merge a prior export." })).toBeVisible();
  await page.getByLabel("Replace existing AgoCode data before import").check();

  await page.locator('input[type="file"]').setInputFiles({
    name: "agocode-import.json",
    mimeType: "application/json",
    buffer: Buffer.from(exportBundle({
      "agocode.progress.after-import": "after",
      "agocode.custom.after-import": "custom-after",
    })),
  });

  await expect(page.getByRole("status").last()).toContainText("complete pre-import recovery point");
  await expect(page.getByRole("status").last()).toContainText("every imported value was verified");

  const imported = await page.evaluate((recoveryKey) => ({
    before: localStorage.getItem("agocode.progress.before-import"),
    customBefore: localStorage.getItem("agocode.custom.before-import"),
    after: localStorage.getItem("agocode.progress.after-import"),
    customAfter: localStorage.getItem("agocode.custom.after-import"),
    unrelated: localStorage.getItem("unrelated"),
    recovery: JSON.parse(localStorage.getItem(recoveryKey) ?? "null"),
  }), RECOVERY_KEY);

  expect(imported.before).toBeNull();
  expect(imported.customBefore).toBeNull();
  expect(imported.after).toBe("after");
  expect(imported.customAfter).toBe("custom-after");
  expect(imported.unrelated).toBe("keep");
  expect(imported.recovery.reason).toBe("pre-import");
  expect(imported.recovery.entries["agocode.progress.before-import"]).toBe("before");
  expect(imported.recovery.entries["agocode.custom.before-import"]).toBe("custom-before");

  page.once("dialog", (dialog) => void dialog.accept());
  await page.getByRole("button", { name: "Restore latest recovery" }).click();
  await expect(page.getByRole("status").last()).toContainText("Restored 2 AgoCode learner-data entries");

  const restored = await page.evaluate(() => ({
    before: localStorage.getItem("agocode.progress.before-import"),
    customBefore: localStorage.getItem("agocode.custom.before-import"),
    after: localStorage.getItem("agocode.progress.after-import"),
    customAfter: localStorage.getItem("agocode.custom.after-import"),
    unrelated: localStorage.getItem("unrelated"),
  }));
  expect(restored.before).toBe("before");
  expect(restored.customBefore).toBe("custom-before");
  expect(restored.after).toBeNull();
  expect(restored.customAfter).toBeNull();
  expect(restored.unrelated).toBe("keep");
});

test("imported critical policy contradiction stays fail-closed and is routed to explicit repair", async ({ page }) => {
  await page.goto("/settings/data");
  const contradictoryHistory = JSON.stringify({
    version: 1,
    entries: [{
      exerciseId: "import-policy-corruption-e2e",
      chosenAt: "2026-09-28T01:30:00.000Z",
      policyVariant: "candidate",
      policyId: "baseline-v1",
      reasons: ["adds source and domain diversity"],
    }],
  });

  await page.locator('input[type="file"]').setInputFiles({
    name: "agocode-policy-corruption.json",
    mimeType: "application/json",
    buffer: Buffer.from(exportBundle({
      [HISTORY_KEY]: contradictoryHistory,
      "agocode.progress.imported-learning-note": "preserve-me",
    })),
  });

  const status = page.getByRole("status").last();
  await expect(status).toContainText("planner remains fail-closed on baseline-v1");
  await expect(status).toContainText("explicit repair control in Progress");
  expect(await page.evaluate(() => localStorage.getItem("agocode.progress.imported-learning-note"))).toBe("preserve-me");

  await page.goto("/progress#policy-consistency");
  const audit = page.locator("#policy-consistency");
  await expect(audit.locator(".system-audit__calibration", { hasText: "Baseline required" })).toBeVisible();
  await expect(audit.getByRole("button", { name: "Repair policy state" })).toBeVisible();

  await page.goto("/practice/next");
  const policy = page.locator("section[aria-label='Recommendation policy version']");
  await expect(policy.getByText("Deterministic baseline", { exact: true })).toBeVisible();
  await expect(policy.getByText("baseline-v1", { exact: true })).toBeVisible();
});
