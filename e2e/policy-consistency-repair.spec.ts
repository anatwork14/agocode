import { expect, test } from "@playwright/test";

const EXPERIMENT_KEY = "agocode.progress.recommendation-policy-experiment";
const SAFETY_KEY = "agocode.progress.recommendation-policy-safety";
const HISTORY_KEY = "agocode.progress.next-problem-history";
const REPAIR_KEY = "agocode.progress.recommendation-policy-repair";
const candidateId = "candidate-v1-repair-e2e";

const state = {
  version: 1,
  defaultPolicyId: candidateId,
  candidate: {
    id: candidateId,
    createdAt: "2026-09-28T00:00:00.000Z",
    baselinePolicyId: "baseline-v1",
    adjustments: { "combined-diversity": 2 },
    source: { matureSnapshottedChoices: 20, baselineStrongEvidenceRate: 50, suggestedChanges: 1 },
  },
  experiment: {
    id: "experiment-repair-e2e",
    candidatePolicyId: candidateId,
    status: "completed",
    startedAt: "2026-09-28T00:00:00.000Z",
    completedAt: "2026-09-28T00:30:00.000Z",
    promotedAt: "2026-09-28T00:30:00.000Z",
  },
  lineage: [
    {
      version: 1,
      id: "lineage-start-repair-e2e",
      event: "experiment-started",
      occurredAt: "2026-09-28T00:00:00.000Z",
      candidatePolicyId: candidateId,
      candidateCreatedAt: "2026-09-28T00:00:00.000Z",
      adjustments: { "combined-diversity": 2 },
      experimentId: "experiment-repair-e2e",
      experimentStatus: "running",
      defaultPolicyId: "baseline-v1",
    },
    {
      version: 1,
      id: "lineage-promote-repair-e2e",
      event: "candidate-promoted",
      occurredAt: "2026-09-28T00:30:00.000Z",
      candidatePolicyId: candidateId,
      candidateCreatedAt: "2026-09-28T00:00:00.000Z",
      adjustments: { "combined-diversity": 2 },
      experimentId: "experiment-repair-e2e",
      experimentStatus: "completed",
      defaultPolicyId: candidateId,
    },
  ],
};

test("learner can repair critical policy metadata without losing recommendation evidence", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(({ experimentKey, safetyKey, historyKey, seededState }) => {
    localStorage.setItem(experimentKey, JSON.stringify(seededState));
    localStorage.setItem(safetyKey, JSON.stringify({ version: 1, events: [] }));
    localStorage.setItem(historyKey, JSON.stringify({
      version: 1,
      entries: [{
        exerciseId: "repair-e2e-problem",
        chosenAt: "2026-09-28T01:00:00.000Z",
        reasons: ["adds source and domain diversity"],
        targetDimension: "transfer",
        score: 71,
        familyId: "graph-traversal",
        policyVariant: "candidate",
        policyId: "baseline-v1",
        experimentId: "experiment-repair-e2e",
        policyAdjustment: 2,
      }],
    }));
  }, { experimentKey: EXPERIMENT_KEY, safetyKey: SAFETY_KEY, historyKey: HISTORY_KEY, seededState: state });

  await page.goto("/progress#policy-consistency");
  const audit = page.locator("#policy-consistency");
  await expect(audit.locator(".system-audit__calibration", { hasText: "Baseline required" })).toBeVisible();
  await expect(audit.getByRole("button", { name: "Repair policy state" })).toBeVisible();

  await audit.getByRole("button", { name: "Repair policy state" }).click();
  await expect(audit.getByText("Confirm baseline reset?", { exact: true })).toBeVisible();
  await audit.getByRole("button", { name: "Confirm repair" }).click();

  await expect(audit.locator(".system-audit__calibration", { hasText: "Consistent" })).toBeVisible();
  await expect(audit.getByText(/returned to baseline-v1/i)).toBeVisible();
  await expect(audit.getByTestId("policy-repair-receipt")).toContainText("quarantined 1 contradictory attribution record");
  await expect(audit.getByTestId("policy-repair-receipt")).toContainText("preserved 1 recommendation choice");

  const persisted = await page.evaluate(({ experimentKey, safetyKey, historyKey, repairKey }) => ({
    experiment: JSON.parse(localStorage.getItem(experimentKey) ?? "null"),
    safety: JSON.parse(localStorage.getItem(safetyKey) ?? "null"),
    history: JSON.parse(localStorage.getItem(historyKey) ?? "null"),
    repair: JSON.parse(localStorage.getItem(repairKey) ?? "null"),
  }), { experimentKey: EXPERIMENT_KEY, safetyKey: SAFETY_KEY, historyKey: HISTORY_KEY, repairKey: REPAIR_KEY });

  expect(persisted.experiment).toEqual({ version: 1, defaultPolicyId: "baseline-v1" });
  expect(persisted.safety).toEqual({ version: 1, events: [] });
  expect(persisted.history.entries).toHaveLength(1);
  expect(persisted.history.entries[0]).toMatchObject({
    exerciseId: "repair-e2e-problem",
    chosenAt: "2026-09-28T01:00:00.000Z",
    reasons: ["adds source and domain diversity"],
    targetDimension: "transfer",
    score: 71,
    familyId: "graph-traversal",
  });
  expect(persisted.history.entries[0].policyVariant).toBeUndefined();
  expect(persisted.history.entries[0].policyId).toBeUndefined();
  expect(persisted.history.entries[0].experimentId).toBeUndefined();
  expect(persisted.history.entries[0].policyAdjustment).toBeUndefined();
  expect(persisted.repair.previousCandidatePolicyId).toBe(candidateId);

  await page.reload();
  await expect(page.locator("#policy-consistency").locator(".system-audit__calibration", { hasText: "Consistent" })).toBeVisible();
  await expect(page.getByTestId("policy-repair-receipt")).toBeVisible();

  await page.goto("/practice/next");
  const policy = page.locator("section[aria-label='Recommendation policy version']");
  await expect(policy.getByText("Deterministic baseline", { exact: true })).toBeVisible();
  await expect(policy.getByText("baseline-v1", { exact: true })).toBeVisible();
});
