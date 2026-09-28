import { createHash } from "node:crypto";
import { expect, test } from "@playwright/test";

const RECOVERY_KEY = "agocode.system.storage-recovery.v1";

function sealedExportBundle(entries: Record<string, string>) {
  const payload = {
    product: "AgoCode" as const,
    version: 1 as const,
    exportedAt: "2026-09-28T03:00:00.000Z",
    entries: Object.fromEntries(Object.entries(entries).sort(([left], [right]) => left.localeCompare(right))),
  };
  const digest = createHash("sha256").update(JSON.stringify(payload)).digest("hex");
  return JSON.stringify({
    ...payload,
    integrity: {
      algorithm: "SHA-256",
      digest,
      entryCount: Object.keys(payload.entries).length,
    },
  });
}

test("verified bundle shows its SHA-256 status before any learner data changes", async ({ page }) => {
  await page.goto("/settings/data");
  await page.locator('input[type="file"]').setInputFiles({
    name: "agocode-sealed.json",
    mimeType: "application/json",
    buffer: Buffer.from(sealedExportBundle({
      "agocode.progress.integrity-e2e": "verified-value",
    })),
  });

  const preview = page.getByTestId("import-preflight");
  await expect(preview).toBeVisible();
  await expect(page.getByTestId("import-integrity-status")).toContainText("Verified SHA-256 integrity");
  expect(await page.evaluate(() => localStorage.getItem("agocode.progress.integrity-e2e"))).toBeNull();
  expect(await page.evaluate((key) => localStorage.getItem(key), RECOVERY_KEY)).toBeNull();

  await preview.getByRole("button", { name: "Apply reviewed import" }).click();
  await expect(page.getByRole("status").last()).toContainText("Source bundle SHA-256 integrity was verified before staging");
  expect(await page.evaluate(() => localStorage.getItem("agocode.progress.integrity-e2e"))).toBe("verified-value");
});

test("tampered sealed bundle is rejected before preview without touching browser state", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.setItem("agocode.progress.local-sentinel", "keep-me"));
  await page.goto("/settings/data");

  const sealed = JSON.parse(sealedExportBundle({
    "agocode.progress.integrity-e2e": "original-value",
  }));
  sealed.entries["agocode.progress.integrity-e2e"] = "changed-after-export";

  await page.locator('input[type="file"]').setInputFiles({
    name: "agocode-corrupted.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(sealed)),
  });

  await expect(page.getByTestId("import-preflight")).toHaveCount(0);
  await expect(page.getByRole("status").last()).toContainText("does not match its SHA-256 manifest");

  const state = await page.evaluate((recoveryKey) => ({
    sentinel: localStorage.getItem("agocode.progress.local-sentinel"),
    incoming: localStorage.getItem("agocode.progress.integrity-e2e"),
    recovery: localStorage.getItem(recoveryKey),
  }), RECOVERY_KEY);
  expect(state.sentinel).toBe("keep-me");
  expect(state.incoming).toBeNull();
  expect(state.recovery).toBeNull();
});

test("legacy bundle stays compatible but is labeled unverified", async ({ page }) => {
  await page.goto("/settings/data");
  await page.locator('input[type="file"]').setInputFiles({
    name: "agocode-legacy.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify({
      product: "AgoCode",
      version: 1,
      exportedAt: "2026-09-28T03:30:00.000Z",
      entries: { "agocode.progress.legacy-e2e": "legacy-value" },
    })),
  });

  await expect(page.getByTestId("import-preflight")).toBeVisible();
  await expect(page.getByTestId("import-integrity-status")).toContainText("Legacy bundle — no integrity manifest");
  expect(await page.evaluate(() => localStorage.getItem("agocode.progress.legacy-e2e"))).toBeNull();
});
