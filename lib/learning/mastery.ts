import type { LearningEvidence } from "@/lib/learning/evidence";
import { masteryEvidenceItems, type EvidenceDimension } from "@/lib/learning/progressCatalog";

export type MasteryBand = "no-evidence" | "emerging" | "developing" | "strong";

export type DimensionMastery = {
  id: EvidenceDimension;
  label: string;
  score: number;
  evidenceCount: number;
  completedCount: number;
  band: MasteryBand;
};

export type MasterySnapshot = {
  overall: number;
  dimensions: readonly DimensionMastery[];
  strongest: DimensionMastery;
  weakest: DimensionMastery;
};

const labels: Record<EvidenceDimension, string> = {
  understand: "Understand",
  trace: "Trace",
  predict: "Predict",
  rebuild: "Rebuild",
  explain: "Explain",
  transfer: "Transfer",
  recall: "Recall",
};

const dimensions = Object.keys(labels) as EvidenceDimension[];

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function average(values: number[]) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

function attemptQuality(evidence: LearningEvidence) {
  if (!evidence.totalTests) return evidence.completedAt ? 0.55 : 0;
  const testRatio = clamp01(evidence.bestPassedCount / evidence.totalTests);
  const noHintPass = evidence.lowestHintCountOnPass === 0 ? 0.12 : 0;
  const successfulAttempts = evidence.attempts.filter((attempt) => attempt.passed).length;
  const repeatSignal = Math.min(0.08, successfulAttempts * 0.025);
  return clamp01(0.2 + testRatio * 0.6 + noHintPass + repeatSignal);
}

function recognitionQuality(evidence: LearningEvidence) {
  const recognition = evidence.recognition;
  if (!recognition || !recognition.totalScenarios) return 0;
  const ratio = recognition.bestFirstTryCorrect / recognition.totalScenarios;
  const sessionSignal = Math.min(0.15, recognition.sessions * 0.04);
  return clamp01(ratio * 0.85 + sessionSignal);
}

function predictionQuality(evidence: LearningEvidence) {
  const prediction = evidence.prediction;
  if (!prediction || !prediction.totalQuestions) return 0;
  const ratio = prediction.correctFirstTry / prediction.totalQuestions;
  const sessionSignal = Math.min(0.12, prediction.sessions * 0.03);
  const streakSignal = Math.min(0.08, prediction.bestStreak * 0.02);
  return clamp01(ratio * 0.8 + sessionSignal + streakSignal);
}

function explanationQuality(evidence: LearningEvidence) {
  const explanation = evidence.explanation;
  if (!explanation) return evidence.completedAt ? 0.55 : 0;
  const repetition = Math.min(0.12, explanation.completed * 0.04);
  return clamp01(explanation.bestScore * 0.78 + repetition + (evidence.completedAt ? 0.1 : 0));
}

function recallQuality(evidence: LearningEvidence) {
  const recall = evidence.recall;
  if (!recall || !recall.sessions) return evidence.completedAt ? 0.48 : 0;
  const successRatio = recall.successful / recall.sessions;
  const spacingSignal = Math.min(0.18, Math.log2(recall.intervalDays + 1) * 0.05);
  return clamp01(successRatio * 0.75 + spacingSignal + 0.07);
}

function reasoningQuality(evidence: LearningEvidence) {
  const entries = Object.values(evidence.reasoning?.byExercise ?? {});
  if (!entries.length) return 0;

  const strongest = entries
    .map((entry) => {
      const stageRatio = clamp01(entry.developedStages / Math.max(1, entry.totalStages));
      const completionSignal = entry.completedAt ? 0.12 : 0;
      const confidenceSignal = entry.confidence === "solid" ? 0.045 : entry.confidence === "developing" ? 0.02 : 0;
      const independentSignal = !entry.lensRevealed && entry.developedStages >= Math.min(6, entry.totalStages) ? 0.055 : 0;
      return clamp01(stageRatio * 0.72 + completionSignal + confidenceSignal + independentSignal);
    })
    .sort((a, b) => b - a)
    .slice(0, 5);

  const diversitySignal = Math.min(0.08, Math.max(0, entries.length - 1) * 0.02);
  return clamp01(average(strongest) + diversitySignal);
}

function projectQuality(evidence: LearningEvidence) {
  const entries = Object.values(evidence.project?.byExercise ?? {});
  if (!entries.length) return 0;

  const strongest = entries
    .map((entry) => {
      const sectionRatio = clamp01(entry.developedSections / Math.max(1, entry.totalSections));
      const gateRatio = clamp01(entry.checkedQualityGates / Math.max(1, entry.totalQualityGates));
      const completionSignal = entry.completedAt ? 0.1 : 0;
      return clamp01(sectionRatio * 0.48 + gateRatio * 0.34 + completionSignal);
    })
    .sort((a, b) => b - a)
    .slice(0, 3);

  const diversitySignal = Math.min(0.06, Math.max(0, entries.length - 1) * 0.02);
  return clamp01(average(strongest) + diversitySignal);
}

function evidenceQuality(evidence: LearningEvidence | null, dimension: EvidenceDimension) {
  if (!evidence) return 0;

  const completionBase = evidence.completedAt ? 0.45 : 0;
  const reasoning = reasoningQuality(evidence);
  const project = projectQuality(evidence);

  if (dimension === "predict") {
    return Math.max(completionBase, predictionQuality(evidence), recognitionQuality(evidence));
  }

  if (dimension === "rebuild") {
    return Math.max(completionBase, attemptQuality(evidence), project * 0.78);
  }

  if (dimension === "explain") {
    return Math.max(completionBase, explanationQuality(evidence), reasoning * 0.88, project * 0.75);
  }

  if (dimension === "transfer") {
    return Math.max(completionBase, attemptQuality(evidence), recognitionQuality(evidence), reasoning * 0.8, project * 0.82);
  }

  if (dimension === "recall") {
    return Math.max(completionBase, recallQuality(evidence));
  }

  if (dimension === "trace") {
    return Math.max(completionBase, predictionQuality(evidence), attemptQuality(evidence) * 0.85);
  }

  return Math.max(
    completionBase,
    attemptQuality(evidence) * 0.8,
    explanationQuality(evidence) * 0.85,
    recognitionQuality(evidence) * 0.75,
    reasoning * 0.9,
    project * 0.7,
  );
}

function bandFor(score: number, evidenceCount: number): MasteryBand {
  if (!evidenceCount) return "no-evidence";
  if (score >= 75) return "strong";
  if (score >= 45) return "developing";
  return "emerging";
}

export function buildMasterySnapshot(
  evidenceMap: Record<string, LearningEvidence | null>,
): MasterySnapshot {
  const results = dimensions.map((dimension): DimensionMastery => {
    const signals = masteryEvidenceItems.filter((item) => item.dimensions.includes(dimension));
    let weightedScore = 0;
    let totalWeight = 0;
    let evidenceCount = 0;
    let completedCount = 0;

    for (const signal of signals) {
      const evidence = evidenceMap[signal.key] ?? null;
      if (evidence) evidenceCount += 1;
      if (evidence?.completedAt) completedCount += 1;
      const weight = signal.weight ?? 1;
      weightedScore += evidenceQuality(evidence, dimension) * weight;
      totalWeight += weight;
    }

    const score = totalWeight ? Math.round((weightedScore / totalWeight) * 100) : 0;
    return {
      id: dimension,
      label: labels[dimension],
      score,
      evidenceCount,
      completedCount,
      band: bandFor(score, evidenceCount),
    };
  });

  const overall = Math.round(results.reduce((sum, item) => sum + item.score, 0) / results.length);
  const strongest = [...results].sort((a, b) => b.score - a.score || b.evidenceCount - a.evidenceCount)[0];
  const weakest = [...results].sort((a, b) => a.score - b.score || a.evidenceCount - b.evidenceCount)[0];

  return { overall, dimensions: results, strongest, weakest };
}
